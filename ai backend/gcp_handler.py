import os
from google.cloud import firestore, storage
from datetime import datetime
from dotenv import load_dotenv
import uuid

load_dotenv()

GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")

# Initialize Google Cloud Clients
try:
    db = firestore.Client(project=GCP_PROJECT_ID)
    storage_client = storage.Client(project=GCP_PROJECT_ID)
    bucket = storage_client.bucket(GCS_BUCKET_NAME)
    print("✅ Initialization Successful!")
except Exception as e:
    print(f"Error initializing Google Cloud clients: {e}")
    print("Please ensure you've authenticated via 'gcloud auth application-default login'")
    exit()


def upload_to_storage(file_path: str) -> str | None:
    """
    Uploads a local file to the Google Cloud Storage bucket.

    Args:
        file_path (str): The local path to the file to upload.

    Returns:
        str | None: The GCS URI of the uploaded file (e.g., 'gs://bucket/file'), or None if upload fails.
    """
    try:
        # Get the filename from the path
        file_name = os.path.basename(file_path)
        
        # Create a "blob" (the object in GCS)
        blob = bucket.blob(file_name)

        print(f"Uploading file '{file_name}' to bucket '{GCS_BUCKET_NAME}'...")
        blob.upload_from_filename(file_path)
        
        gcs_uri = f"gs://{GCS_BUCKET_NAME}/{file_name}"
        print(f"✅ File uploaded successfully. GCS URI: {gcs_uri}")
        
        return gcs_uri
    except Exception as e:
        print(f"❌ Error uploading file to GCS: {e}")
        return None

def save_prompt_to_firestore(user_prompt: str, document_gcs_uri: str) -> str | None:
    """
    Saves the user's prompt and document location to Firestore.

    Args:
        user_prompt (str): The text prompt from the user.
        document_gcs_uri (str): The GCS URI of the associated document.

    Returns:
        str | None: The ID of the new Firestore document, or None if it fails.
    """
    try:
        # We will store each request in a collection named 'analysis_requests'
        collection_ref = db.collection('analysis_requests')
        
        data = {
            'prompt': user_prompt,
            'document_uri': document_gcs_uri,
            'status': 'pending', # To track the analysis status later
            'timestamp': datetime.utcnow()
        }
        
        print("Saving prompt to Firestore...")
        update_time, doc_ref = collection_ref.add(data)
        
        print(f"✅ Prompt saved successfully to Firestore with Document ID: {doc_ref.id}")
        return doc_ref.id
    except Exception as e:
        print(f"❌ Error saving prompt to Firestore: {e}")
        return None
    
def save_chunks_to_firestore(request_doc_id: str, text_chunks: list[str]) -> dict[str, str]:
    """Saves text chunks to a subcollection in Firestore and returns their IDs."""
    db = firestore.Client(project=GCP_PROJECT_ID)
    batch = db.batch()
    chunks_collection_ref = db.collection('analysis_requests').document(request_doc_id).collection('chunks')
    
    chunk_id_map = {}
    for chunk_text in text_chunks:
        chunk_id = str(uuid.uuid4())
        doc_ref = chunks_collection_ref.document(chunk_id)
        batch.set(doc_ref, {"text": chunk_text, "indexed_time": firestore.SERVER_TIMESTAMP})
        chunk_id_map[chunk_id] = chunk_text
        
    batch.commit()
    print(f"✅ Saved {len(text_chunks)} chunks to Firestore for document {request_doc_id}.")
    return chunk_id_map

def get_chunks_by_ids(request_doc_id: str, chunk_ids: list[str]) -> list[str]:
    """Retrieves text chunks from Firestore based on a list of chunk IDs."""
    db = firestore.Client(project=GCP_PROJECT_ID)
    chunks_collection_ref = db.collection('analysis_requests').document(request_doc_id).collection('chunks')
    
    retrieved_chunks = []
    for chunk_id in chunk_ids:
        doc_ref = chunks_collection_ref.document(chunk_id)
        doc = doc_ref.get()
        if doc.exists:
            retrieved_chunks.append(doc.to_dict().get("text", ""))
            
    print(f"Retrieved {len(retrieved_chunks)} text chunks from Firestore.")
    return retrieved_chunks

def get_request_details(request_doc_id: str) -> dict:
    """Fetches the main request document from Firestore."""
    db = firestore.Client(project=GCP_PROJECT_ID)
    doc_ref = db.collection('analysis_requests').document(request_doc_id)
    doc = doc_ref.get()
    if doc.exists:
        print(f"✅ Fetched request details for doc ID: {request_doc_id}")
        return doc.to_dict()
    else:
        print(f"❌ No request document found with ID: {request_doc_id}")
        return None

def get_all_chunks_for_document(request_doc_id: str) -> str:
    """Retrieves all text chunks for a document and concatenates them."""
    db = firestore.Client(project=GCP_PROJECT_ID)
    chunks_collection_ref = db.collection('analysis_requests').document(request_doc_id).collection('chunks')
    
    all_chunks = []
    for doc in chunks_collection_ref.stream():
        chunk_text = doc.to_dict().get("text")
        if chunk_text:
            all_chunks.append(chunk_text)
    
    if all_chunks:
        print(f"✅ Fetched and concatenated {len(all_chunks)} chunks for doc ID: {request_doc_id}")
        return "\n\n".join(all_chunks)
    else:
        print(f"❌ No text chunks found for doc ID: {request_doc_id}")
        return None
    
def update_conversation_history(request_doc_id: str, user_query: str, model_response: str):
    """Appends a user query and a model response to the chat history array in Firestore."""
    db = firestore.Client(project=GCP_PROJECT_ID)
    doc_ref = db.collection('analysis_requests').document(request_doc_id)
    
    # Structure the conversation turn as objects in an array
    user_message = {"role": "user", "content": user_query, "timestamp": firestore.SERVER_TIMESTAMP}
    model_message = {"role": "model", "content": model_response, "timestamp": firestore.SERVER_TIMESTAMP}
    
    # Use ArrayUnion to append the new messages
    doc_ref.update({
        "chat_history": firestore.ArrayUnion([user_message, model_message])
    })
    print(f"✅ Appended conversation turn to Firestore for doc ID: {request_doc_id}")