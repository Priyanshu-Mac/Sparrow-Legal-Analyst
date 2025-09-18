import os
import tempfile
import uuid
import re
from dotenv import load_dotenv
from google.cloud import aiplatform, storage
import pypdf
from vertexai.language_models import TextEmbeddingModel
from gcp_handler import save_chunks_to_firestore

# --- Configuration & Initialization ---

# 1. Load variables from .env file into the environment
load_dotenv()

# 2. Get the Project ID from the environment
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
GCP_REGION = "asia-south1"  # Or your configured region

# 3. **CRUCIAL STEP**: Initialize Vertex AI with the explicit Project ID
# This prevents the "Permission Denied on project google" error.
try:
    aiplatform.init(project=GCP_PROJECT_ID, location=GCP_REGION)
    print(f"✅ Vertex AI initialized successfully for project: {GCP_PROJECT_ID}")
except Exception as e:
    print(f"❌ Error initializing Vertex AI. Your GCP_PROJECT_ID might be missing or incorrect in the .env file.")
    print(f"   Loaded Project ID: '{GCP_PROJECT_ID}'")
    raise e

# 4. Continue with other configurations and clients
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")
VECTOR_SEARCH_INDEX_ID = os.getenv("VECTOR_SEARCH_INDEX_ID")
VECTOR_SEARCH_ENDPOINT_ID = os.getenv("VECTOR_SEARCH_ENDPOINT_ID")

# Initialize other clients
storage_client = storage.Client(project=GCP_PROJECT_ID)

# Use latest embedding model with proper initialization
embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-004")

# Initialize streaming-enabled Vector Search index
streaming_index = aiplatform.MatchingEngineIndex(index_name=VECTOR_SEARCH_INDEX_ID)

def chunk_document_text(text, max_chunk_size=1500, min_chunk_size=100, overlap_size=200):
    """
    Robust text chunking for legal documents
    """
    chunks = []
    current_chunk = ""
    
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    for sentence in sentences:
        # Check if adding this sentence exceeds max size
        if len(current_chunk) + len(sentence) > max_chunk_size and len(current_chunk) > min_chunk_size:
            chunks.append(current_chunk.strip())
            # Start new chunk with overlap
            words = current_chunk.split()
            overlap_words = words[-overlap_size//10:] if len(words) > overlap_size//10 else words
            current_chunk = ' '.join(overlap_words) + ' ' + sentence
        else:
            current_chunk += ' ' + sentence if current_chunk else sentence
    
    # Add the last chunk
    if current_chunk.strip() and len(current_chunk.strip()) > min_chunk_size:
        chunks.append(current_chunk.strip())
    
    return [chunk for chunk in chunks if len(chunk.strip()) > min_chunk_size]

def process_and_index_document(gcs_uri: str, firestore_doc_id: str):
    """
    Downloads, processes, and indexes a document from GCS into Vector Search
    and saves its text chunks to Firestore for retrieval.

    Args:
        gcs_uri (str): The GCS URI of the document (e.g., "gs://bucket/file.pdf").
        firestore_doc_id (str): The ID of the document's record in the 'analysis_requests' collection.
    """
    print(f"Starting processing for document: {gcs_uri}")
    
    temp_path = None
    
    # 1. Download file from GCS with Windows-compatible temp file handling
    try:
        bucket_name, file_name = gcs_uri.replace("gs://", "").split("/", 1)
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(file_name)

        # Windows-safe temp file handling
        temp_file = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
        temp_path = temp_file.name
        temp_file.close()  # Close so Windows can write to it
        
        blob.download_to_filename(temp_path)
        print(f"Downloaded file to: {temp_path}")

        # 2. Parse text from the downloaded PDF
        reader = pypdf.PdfReader(temp_path)
        full_text = "\n".join([
            page.extract_text() for page in reader.pages 
            if page.extract_text()
        ])
        print(f"Extracted {len(full_text)} characters of text.")

    except Exception as e:
        print(f"❌ Error during file download or parsing: {e}")
        return None
    finally:
        # Clean up temp file
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)

    # 3. Chunk the text with improved algorithm
    chunks = chunk_document_text(full_text)
    print(f"Split text into {len(chunks)} chunks.")

    if not chunks:
        print("No suitable text chunks found to process.")
        return None

    # 4. Save chunks to Firestore and get their unique IDs
    try:
        chunk_id_map = save_chunks_to_firestore(firestore_doc_id, chunks)
        print(f"✅ Saved {len(chunks)} chunks to Firestore for document {firestore_doc_id}.")
    except Exception as e:
        print(f"❌ Error saving chunks to Firestore: {e}")
        return None

    # 5. Generate embeddings with correct format
    datapoints = []
    for chunk_id, chunk_text in chunk_id_map.items():
        try:
            # Generate embedding using the latest model
            embeddings = embedding_model.get_embeddings([chunk_text])
            embedding = embeddings[0].values
            
            # Create properly formatted datapoint
            datapoint = aiplatform.gapic.IndexDatapoint(
                datapoint_id=chunk_id,
                feature_vector=embedding,
                restricts=[
                    aiplatform.gapic.IndexDatapoint.Restriction(
                        namespace="firestore_doc_id",
                        allow_list=[firestore_doc_id]
                    )
                ]
            )
            datapoints.append(datapoint)
            
        except Exception as e:
            print(f"❌ Error generating embedding for chunk {chunk_id}: {e}")
            continue

    # 6. Upsert embeddings into Vertex AI Vector Search (streaming)
    if datapoints:
        try:
            streaming_index.upsert_datapoints(datapoints=datapoints)
            print(f"✅ Successfully upserted {len(datapoints)} datapoints to Vector Search.")
        except Exception as e:
            print(f"❌ Error upserting to Vector Search: {e}")
            print("💾 Saving embeddings to Firestore as fallback...")
            
            # Save embeddings within existing chunks as backup
            from google.cloud import firestore
            db = firestore.Client(project=GCP_PROJECT_ID)
            
            for datapoint in datapoints:
                chunk_ref = db.collection('analysis_requests').document(firestore_doc_id).collection('chunks').document(datapoint.datapoint_id)
                
                # Add embedding field to existing chunk document
                chunk_ref.update({
                    'embedding': list(datapoint.feature_vector),
                    'embedding_model': 'text-embedding-004',
                    'embedding_timestamp': firestore.SERVER_TIMESTAMP
                })
            
            print(f"✅ Saved {len(datapoints)} embeddings to Firestore chunks as backup.")
                
    print("✅ Document processing complete!")
    return chunk_id_map

# --- Example Usage for Standalone Testing ---
if __name__ == "__main__":
    # Check if Vector Search IDs are configured
    if not VECTOR_SEARCH_INDEX_ID or "YOUR_VECTOR" in str(VECTOR_SEARCH_INDEX_ID):
        print("❌ Please update the VECTOR_SEARCH_INDEX_ID in your .env file.")
    else:
        # Test with your existing document
        TEST_GCS_URI = "gs://legal_assistant_bucket/tmp6pwhxyvz.pdf"
        TEST_FIRESTORE_ID = "Tll9dhfupWZnhljQiQT4"
        
        process_and_index_document(TEST_GCS_URI, TEST_FIRESTORE_ID)