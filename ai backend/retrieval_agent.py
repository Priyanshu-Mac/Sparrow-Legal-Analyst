import os
from dotenv import load_dotenv
from google.cloud import aiplatform
import vertexai
from vertexai.language_models import TextEmbeddingModel
from gcp_handler import get_chunks_by_ids

load_dotenv()

# --- Configuration ---
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")  
GCP_REGION = "asia-south1"
VECTOR_SEARCH_INDEX_ID = os.getenv("VECTOR_SEARCH_INDEX_ID")

# ✅ FIXED: Initialize with updated approach
vertexai.init(project=GCP_PROJECT_ID, location=GCP_REGION)
aiplatform.init(project=GCP_PROJECT_ID, location=GCP_REGION)

# ✅ FIXED: Use latest embedding model
embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-004")

# ✅ FIXED: Use streaming-enabled index
streaming_index = aiplatform.MatchingEngineIndex(index_name=VECTOR_SEARCH_INDEX_ID)

def retrieve_context_for_query(query: str, firestore_doc_id: str, num_neighbors: int = 5) -> str:
    """
    ✅ UPDATED: Compatible with new doc_processor.py approach
    """
    print(f"Retrieving context for query: {query}")
    
    try:
        # Generate embedding for query using new model
        embeddings = embedding_model.get_embeddings([query])
        query_embedding = embeddings[0].values
        
        # Query Vector Search using streaming index
        response = streaming_index.find_neighbors(
            queries=[query_embedding],
            num_neighbors=num_neighbors,
            filter={
                "namespace": "firestore_doc_id", 
                "allow_list": [firestore_doc_id]
            }
        )
        
        # Extract neighbor IDs
        neighbor_ids = [neighbor.id for neighbor in response[0]] if response else []
        
        if not neighbor_ids:
            print("No relevant document chunks found in Vector Search.")
            return ""
        
        # Get actual text from Firestore
        context_chunks = get_chunks_by_ids(firestore_doc_id, neighbor_ids)
        return "\n---\n".join(context_chunks)
        
    except Exception as e:
        print(f"❌ Error in retrieve_context_for_query: {e}")
        return ""

if __name__ == "__main__":
    if not VECTOR_SEARCH_INDEX_ID or "YOUR_VECTOR" in str(VECTOR_SEARCH_INDEX_ID):
        print("❌ Please update the VECTOR_SEARCH_INDEX_ID in your .env file.")
    else:
        TEST_FIRESTORE_ID = "Tll9dhfupWZnhljQiQT4"  # Use your working doc ID
        TEST_QUERY = "What is the penalty for late delivery?"
        
        print(f"--- Testing Retrieval for document {TEST_FIRESTORE_ID} ---")
        retrieved_context = retrieve_context_for_query(TEST_QUERY, TEST_FIRESTORE_ID)
        print("--- Retrieved Context ---")
        print(retrieved_context if retrieved_context else "No context was found.")