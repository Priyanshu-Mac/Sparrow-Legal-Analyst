import os
import tempfile
from gcp_handler import upload_to_storage, save_prompt_to_firestore


def process_legal_document(file_name: str, file_content: bytes, prompt: str) -> dict:
    """
    Processes an uploaded document and prompt, simulating a backend endpoint.

    This function takes in-memory file content (as bytes), saves it to a 
    temporary file, uploads it to Google Cloud Storage, saves the prompt
    to Firestore, and then cleans up the temporary file.

    Args:
        file_name (str): The original name of the uploaded file (e.g., "contract.pdf").
        file_content (bytes): The raw content of the file.
        prompt (str): The user's text prompt.

    Returns:
        dict: A dictionary containing the status and results of the operation.
    """

    temp_file_path = None
    try:
        # Create a temporary file to store the uploaded content
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name

        print(f"Temporarily saved uploaded content to: {temp_file_path}")

        # 1. Call the handler function to upload the document to GCS
        print("\nProcessing your request...")
        document_gcs_uri = upload_to_storage(temp_file_path)
        
        # 2. If upload was successful, save the prompt to Firestore
        if document_gcs_uri:
            firestore_doc_id = save_prompt_to_firestore(prompt, document_gcs_uri)
            if firestore_doc_id:
                print("\n--- 🚀 All Done! ---")
                print("Your request has been submitted successfully.")
                # Return a success response
                return {
                    "status": "success",
                    "gcs_uri": document_gcs_uri,
                    "firestore_id": firestore_doc_id
                }
            else:
                return {"status": "error", "message": "Failed to save prompt to Firestore."}
        else:
            return {"status": "error", "message": "Failed to upload document to Cloud Storage."}

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        # 3. Clean up the temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            print(f"Cleaned up temporary file: {temp_file_path}")


# ==============================================================================
# --- EXAMPLE USAGE ---
# This block simulates a call from a UI to test the function above.
# In a real web application (e.g., using Flask or FastAPI), you would get the
# file and prompt from an HTTP request instead of defining them here.
# ==============================================================================
if __name__ == "__main__":
    TEST_FILE_PATH = f"fake_rent_agreement_filled_expanded.pdf"
    
    TEST_PROMPT = "Summarize this sample contract and highlight any clauses related to termination."

    print("--- Running Test Simulation ---")

    # Simulate upload
    try:
        # Get the file's name and content
        original_filename = os.path.basename(TEST_FILE_PATH)
        with open(TEST_FILE_PATH, "rb") as f:
            file_bytes = f.read()

        print(f"Simulating upload of file: '{original_filename}'")
        
        # CALL THE MAIN FUNCTION
        result = process_legal_document(
            file_name=original_filename, 
            file_content=file_bytes, 
            prompt=TEST_PROMPT
        )
        
        # PRINT THE RESULT
        print("\n--- Simulation Result ---")
        if result.get("status") == "success":
            print(f"✅ Success!")
            print(f"   Document stored at: {result.get('gcs_uri')}")
            print(f"   Request stored with ID: {result.get('firestore_id')}")
        else:
            print(f"❌ Error: {result.get('message')}")

    except FileNotFoundError:
        print(f"❌ TEST ERROR: The file was not found at '{TEST_FILE_PATH}'.")
        print("Please update the TEST_FILE_PATH variable in the script.")
    except Exception as e:
        print(f"❌ An unexpected error occurred during the test: {e}")