import os
from dotenv import load_dotenv
from tavily import TavilyClient
import vertexai
from vertexai.generative_models import GenerativeModel, Tool, Part
from gcp_handler import get_request_details, get_all_chunks_for_document

# Load environment variables
load_dotenv()

# Configuration
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
GCP_REGION = "asia-south1"
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

try:
    # Initialize Vertex AI
    vertexai.init(project=GCP_PROJECT_ID, location=GCP_REGION)

    # Initialize Gemini Models
    flash_model = GenerativeModel("gemini-1.5-flash-002")
    pro_model = GenerativeModel("gemini-1.5-pro-002")

    # Initialize Tavily Client
    tavily_client = TavilyClient(api_key=TAVILY_API_KEY)

    print("✅ LLM-orch Initialization Successful!")
except Exception as initialization_error:
    print(f"❌ An error occurred! (LLM-orch) : {initialization_error}")


def run_research_agent(document_context: str) -> str:
    """
    Agent 1: Uses Tavily web search to find relevant legal laws, judgments, and commentaries.
    Extracts key legal concepts from document context and performs targeted web searches.
    """
    print("--- Running Agent 1: Research Agent with Tavily Web Search ---")
    
    # Extract key legal concepts and entities for targeted search
    extraction_prompt = f"""
    Based on the following legal document context, identify and extract:
    1. Key legal concepts, laws, or statutes mentioned
    2. Jurisdictions (courts, states, countries)
    3. Named entities (parties, judges, case names)
    4. Legal areas/domains (contract law, criminal law, etc.)
    
    Return 3-5 focused search queries that would help find relevant legal precedents, 
    laws, judgments, or commentaries. Format as a simple list.
    
    Document Context:
    ---
    {document_context[:2000]}
    ---
    """
    
    try:
        # Get search queries from Gemini
        response = flash_model.generate_content(extraction_prompt)
        search_queries = response.text.strip().split('\n')
        search_queries = [q.strip('- ').strip() for q in search_queries if q.strip()][:5]
        
        print(f"Generated search queries: {search_queries}")
        
        # Perform Tavily searches
        all_research_results = []
        
        for query in search_queries:
            if not query:
                continue
                
            try:
                search_response = tavily_client.search(
                    query=f"legal {query} law judgment precedent",
                    max_results=5,
                    search_depth="basic",
                    topic="general",
                    include_answer=True,
                    include_raw_content=False
                )
                
                # Format each search result
                for result in search_response.get("results", []):
                    formatted_result = f"""
                    **Source**: {result.get('title', 'N/A')}
                    **URL**: {result.get('url', 'N/A')}
                    **Content**: {result.get('content', 'N/A')[:500]}...
                    **Query Context**: {query}
                    ---
                    """
                    all_research_results.append(formatted_result)
                    
            except Exception as search_error:
                print(f"Error searching for '{query}': {search_error}")
                continue
        
        # Combine all research findings
        research_summary = "\n".join(all_research_results[:10])  # Limit to top 10 results
        
        print("Agent 1 finished research using Tavily.")
        return research_summary if research_summary.strip() else "No relevant external research found."
        
    except Exception as e:
        print(f"Error in Agent 1: {e}")
        return "Research failed due to technical issues."

def run_analysis_agent(original_context: str, research_findings: str) -> str:
    """
    Agent 2: Combines original document context with Tavily research to create comprehensive analysis.
    Prioritizes document context but uses research findings as supplementary reference.
    """
    print("--- Running Agent 2: Analysis Agent ---")
    
    # Step 2a: Generate initial analysis
    print("- Step 2a: Generating initial analysis...")
    analysis_prompt = f"""
    You are a comprehensive legal analyst. Create an authoritative legal analysis that:

    1. **Identifies Applicable Legal Framework**: Based on the external research, specify exactly which laws, acts, and regulations apply (e.g., specific state rent control acts, Indian Contract Act provisions, etc.)

    2. **Explains Legal Requirements**: Use the research findings to explain mandatory clauses, notice periods, deposit limits, and other legal requirements

    3. **Provides Legal Context**: Reference specific legal precedents, judgments, or statutory provisions found in the research

    4. **Addresses Compliance Issues**: Identify any gaps between the document and legal requirements

    **PRIMARY SOURCE** (Document Context):
    {original_context}

    **LEGAL RESEARCH FINDINGS** (Use this to provide authoritative legal guidance):
    {research_findings[:4000]}

    Instructions:
    - Be definitive about legal requirements based on research
    - Quote specific laws, sections, or precedents when available  
    - Explain exactly what the law requires vs. what the document provides
    - Identify jurisdiction-specific requirements (state/local laws)
    """
    
    try:
        initial_analysis = pro_model.generate_content(analysis_prompt).text
    except Exception as e:
        print(f"Error in Agent 2a: {e}")
        return "Initial analysis failed."
    
    # Step 2b: Verification
    print("- Step 2b: Verifying the analysis...")
    verifier_prompt = f"""
    Review the following legal analysis for accuracy, completeness, and consistency.
    Focus on verifying that:
    1. Information from the original document is accurate
    2. External research is properly attributed and relevant
    3. No contradictions exist between sources
    4. All key legal issues are addressed
    
    Original Document Context:
    ---
    {original_context[:1500]}
    ---
    
    External Research Findings:
    ---
    {research_findings[:1500]}
    ---
    
    Initial Analysis to Verify:
    ---
    {initial_analysis}
    ---
    
    Provide bulleted feedback on corrections or improvements needed.
    """
    
    try:
        verifier_feedback = flash_model.generate_content(verifier_prompt).text
        print("- Step 2b: Verification feedback received.")
    except Exception as e:
        print(f"Error in Agent 2b: {e}")
        verifier_feedback = "No feedback available."
    
    # Step 2c: Refinement
    print("- Step 2c: Refining analysis based on feedback...")
    refinement_prompt = f"""
    Refine the initial analysis by incorporating the verifier feedback.
    Produce a final, accurate, and comprehensive legal analysis.
    
    Initial Analysis:
    ---
    {initial_analysis}
    ---
    
    Verifier Feedback:
    ---
    {verifier_feedback}
    ---
    
    Provide only the final, refined analysis.
    """
    
    try:
        final_analysis = pro_model.generate_content(refinement_prompt).text
        print("Agent 2 finished analysis and verification.")
        return final_analysis
    except Exception as e:
        print(f"Error in Agent 2c: {e}")
        return initial_analysis  # Fallback to initial analysis

def run_presentation_agent(case_analysis: str, user_prompt: str) -> str:
    """
    Agent 3: Formats the detailed analysis into a clear, user-friendly response.
    """
    print("--- Running Agent 3: Presentation Agent ---")
    
    system_prompt = """
    You are an AI legal assistant that provides comprehensive, actionable legal guidance. 
    Your role is to be proactive and informative, not to delegate research to users.

    CRITICAL INSTRUCTIONS:
    - Use the research findings already gathered to provide direct legal information
    - DO NOT ask users to "research" or "consult" - YOU provide the answers
    - Include specific legal frameworks, acts, and requirements that apply
    - Be authoritative and comprehensive in explaining applicable laws
    - Provide concrete next steps that users can immediately act upon

    FORMAT REQUIREMENTS:
    1. **Executive Summary** - Direct, actionable summary of the legal situation
    2. **Legal Framework Analysis** - Explain applicable laws, acts, and regulations based on research
    3. **Key Clauses & Rights Analysis** - Detail specific provisions and what they mean legally  
    4. **Direct Legal Guidance** - Address the user's question with specific legal advice based on research
    5. **Immediate Action Items** - Concrete steps the user should take (NOT research tasks)

    TONE: Be confident, informative, and definitive. You are the legal expert providing guidance.
    """
    
    prompt = f"""
    Based on the detailed legal analysis and user question below, generate a 
    user-friendly summary following the format specified in the system prompt.
    
    Detailed Legal Analysis:
    ---
    {case_analysis}
    ---
    
    User's Question:
    ---
    {user_prompt}
    ---
    """
    
    try:
        model_with_system_prompt = GenerativeModel(
            "gemini-1.5-flash-002", 
            system_instruction=system_prompt
        )
        final_response = model_with_system_prompt.generate_content(prompt).text
        print("Agent 3 finished generating the final response.")
        return final_response
    except Exception as e:
        print(f"Error in Agent 3: {e}")
        return "Failed to generate the final presentation."

def orchestrate_legal_analysis(firestore_doc_id: str):
    """
    Main orchestration function - runs the full three-agent workflow.
    """
    print(f"--- Starting Orchestration for Firestore Doc ID: {firestore_doc_id} ---")
    
    # 1. Fetch data from Firestore
    request_data = get_request_details(firestore_doc_id)
    if not request_data:
        return "Error: Could not find the request details in Firestore."
    
    user_prompt = request_data.get("prompt", "Please provide a general summary.")
    full_document_context = get_all_chunks_for_document(firestore_doc_id)
    
    if not full_document_context:
        return "Error: Could not find the document's text chunks in Firestore."
    
    # 2. Run the multi-agent workflow
    research_findings = run_research_agent(full_document_context)
    case_analysis = run_analysis_agent(full_document_context, research_findings)
    final_user_response = run_presentation_agent(case_analysis, user_prompt)
    
    return final_user_response

# Configuration validation
def validate_configuration():
    """Validate that all required configurations are present."""
    issues = []
    
    if not GCP_PROJECT_ID:
        issues.append("GCP_PROJECT_ID not configured")
    
    if not TAVILY_API_KEY:
        issues.append("TAVILY_API_KEY not configured")
    
    if issues:
        print("Configuration issues found:")
        for issue in issues:
            print(f"  ✗ {issue}")
        return False
    
    print("✓ Configuration validated successfully")
    return True

if __name__ == "__main__":
    if not validate_configuration():
        exit(1)
        
    # Example usage
    TEST_FIRESTORE_ID = "Tll9dhfupWZnhljQiQT4"
    if "replace-with" in TEST_FIRESTORE_ID:
        print("Please update the TEST_FIRESTORE_ID variable with a real ID from your database.")
    else:
        final_output = orchestrate_legal_analysis(TEST_FIRESTORE_ID)
        print("\n" + "="*50)
        print("FINAL USER-FACING RESPONSE")
        print("="*50)
        print(final_output)