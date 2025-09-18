from gcp_handler import get_request_details, get_all_chunks_for_document, update_conversation_history, db
from llm_orchestration import run_research_agent, run_analysis_agent, run_presentation_agent
from retrieval_agent import retrieve_context_for_query
from llm_response import generate_conversational_response


def handle_conversation_turn(firestore_doc_id: str, user_query: str):
    """
    Acts as the main router for the application. It fetches the state from Firestore
    and decides whether to run the initial analysis or a follow-up query.
    """
    print(f"\n--- Handling request for doc ID: {firestore_doc_id} ---")
    
    # 1. Fetch the current state of the document analysis from Firestore
    request_data = get_request_details(firestore_doc_id)
    if not request_data:
        return "Error: Could not find the specified document in Firestore."

    # 2. Decide which workflow to run
    is_first_interaction = 'status' not in request_data or request_data['status'] != 'complete'
    doc_ref = db.collection('analysis_requests').document(firestore_doc_id)

    if is_first_interaction:
        print("This is the first interaction. Running the full initial analysis pipeline...")
        
        # A. Set status to 'processing' to inform the UI
        doc_ref.update({"status": "processing"})
        
        # B. Get the full document context from all its chunks in Firestore
        full_document_context = get_all_chunks_for_document(firestore_doc_id)
        if not full_document_context:
            doc_ref.update({"status": "failed", "error_message": "Could not find text chunks."})
            return "Error: Could not find document's text chunks to analyze."

        # C. Run the three-agent orchestration process
        research_findings = run_research_agent(full_document_context)
        agent2_analysis = run_analysis_agent(full_document_context, research_findings)
        # The first query from the user is used to tailor the initial summary
        agent3_summary = run_presentation_agent(agent2_analysis, user_query)
        
        # D. Store all results and set status to 'complete'
        doc_ref.update({
            "status": "complete",
            "agent2_detailed_analysis": agent2_analysis,
            "agent3_initial_summary": agent3_summary,
            "chat_history": []  # Initialize an empty array for the conversation
        })
        print(f"✅ Initial analysis complete. Results stored in Firestore.")
        
        return agent3_summary
    else:
        print("This is a follow-up question. Orchestrating conversational response...")
        
        # A. Get the necessary history and analysis from the fetched data
        chat_history = request_data.get("chat_history", [])
        agent2_analysis = request_data.get("agent2_detailed_analysis")
        agent3_summary = request_data.get("agent3_initial_summary")
        
        # B. Retrieve specific document context relevant to the new query
        doc_context_for_query = retrieve_context_for_query(user_query, firestore_doc_id, num_neighbors=5)
        
        # C. Call the centralized LLM response generator
        is_first_follow_up = len(chat_history) == 0
        new_response = generate_conversational_response(
            query=user_query,
            doc_context_for_query=doc_context_for_query,
            chat_history=chat_history,
            agent_2_analysis=agent2_analysis if is_first_follow_up else None,
            agent_3_summary=agent3_summary if is_first_follow_up else None
        )
        
        # D. Save the new conversation turn back to Firestore
        update_conversation_history(firestore_doc_id, user_query, new_response)
        
        return new_response

# --- Example Usage for Testing ---
if __name__ == "__main__":

    TEST_FIRESTORE_ID = "Tll9dhfupWZnhljQiQT4"
    
    if "replace-with" in TEST_FIRESTORE_ID:
        print("❌ Please update the TEST_FIRESTORE_ID variable with a real ID from your database.")
    else:
        # --- Simulate First Interaction ---
        # To test this, make sure the document in Firestore does NOT have a 'status' of 'complete'
        # You can manually delete the 'status' field in the Firestore console to reset it for testing.
        print("\n=============================================")
        print("      SIMULATING FIRST INTERACTION")
        print("=============================================")
        initial_user_prompt = "Can you give me a full breakdown of this contract? I'm mostly worried about payment deadlines and penalties."
        initial_response = handle_conversation_turn(TEST_FIRESTORE_ID, initial_user_prompt)
        print("\n--- INITIAL ANALYSIS RESULT ---")
        print(initial_response)
        
        # --- Simulate a Follow-up Question ---
        # The next call will automatically trigger the "else" block because the status is now 'complete'
        print("\n\n=============================================")
        print("      SIMULATING FOLLOW-UP QUESTION")
        print("=============================================")
        follow_up_question = "Thanks for the summary. What does 'governing law' mean in the context of California?"
        follow_up_response = handle_conversation_turn(TEST_FIRESTORE_ID, follow_up_question)
        print(f"\n--- RESPONSE to '{follow_up_question}' ---")
        print(follow_up_response)