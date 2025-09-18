import os
from dotenv import load_dotenv
import vertexai
from vertexai.generative_models import GenerativeModel, Tool, Part

# Load environment variables
load_dotenv()

# Configuration & Initialization
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
GCP_REGION = "asia-south1"
vertexai.init(project=GCP_PROJECT_ID, location=GCP_REGION)
model = GenerativeModel("gemini-1.5-flash-002")

# Master Prompt for Conversational Responses
CONVERSATIONAL_PROMPT = """
You are an advanced AI legal assistant. Your goal is to provide helpful, accurate, and context-aware answers to the user's questions.

You have been provided with several sources of information:
1.  **Initial Analysis**: A comprehensive summary and a detailed breakdown of the user's legal document. Use this for broad, foundational knowledge about the case.
2.  **Conversation History**: The ongoing dialogue with the user. Use this to understand the immediate context and what has already been discussed.
3.  **Document Context for Current Query**: Specific text snippets from the original document that are highly relevant to the user's latest question. This is your most important source for grounding your answer.

Follow these rules to construct your response:
- **Prioritize Document Context**: Base your answer on the "Document Context for Current Query" first and foremost.
- **Use Other Context**: Refer to the "Initial Analysis" and "Conversation History" to provide more complete answers and avoid repeating information.
- **Cite Your Sources**: You MUST cite your sources. For information from the document, quote the text.
- **Be Conversational**: Address the user directly and maintain a helpful tone.
"""

def generate_conversational_response(
    query: str,
    doc_context_for_query: str,
    chat_history: list,
    agent_2_analysis: str = None,
    agent_3_summary: str = None
) -> str:
    """
    Generates a conversational response using the full context of the interaction.
    """
        
    # Format the chat history and initial analysis for the prompt
    formatted_history = "\n".join([f"{msg['role']}: {msg['content']}" for msg in chat_history])
    initial_context = ""
    if agent_2_analysis and agent_3_summary:
        initial_context = f"Initial Summary:\n{agent_3_summary}\n\nInitial Detailed Analysis:\n{agent_2_analysis}"

    prompt_parts = [
        CONVERSATIONAL_PROMPT,
        "\n--- Initial Analysis ---\n",
        Part.from_text(initial_context if initial_context else "Not available for this turn."),
        "\n--- Conversation History ---\n",
        Part.from_text(formatted_history if formatted_history else "This is the first question."),
        "\n--- Document Context for Current Query ---\n",
        Part.from_text(doc_context_for_query if doc_context_for_query else "No specific context was retrieved for this query."),
        "\n--- User's Current Question ---\n",
        Part.from_text(query)
    ]
    
    try:
        response = model.generate_content(prompt_parts)
        return response.text
    except Exception as e:
        print(f"❌ Error during Gemini call in llm_response.py: {e}")
        return "Sorry, I encountered an error while generating a response."