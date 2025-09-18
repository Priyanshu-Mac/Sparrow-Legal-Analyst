import os
from dotenv import load_dotenv
from google.cloud import aiplatform

# Load environment
load_dotenv()
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
GCP_REGION = "asia-south1"

# Initialize Vertex AI
aiplatform.init(project=GCP_PROJECT_ID, location=GCP_REGION)

def create_streaming_index():
    """Create a streaming-enabled Vector Search index"""
    
    print("🚀 Creating streaming-enabled Vector Search index...")
    
    # Create the index with streaming enabled
    new_index = aiplatform.MatchingEngineIndex.create_tree_ah_index(
        display_name="legal-doc-streaming-index",
        dimensions=768,  # For text-embedding-004 model
        approximate_neighbors_count=150,
        leaf_node_embedding_count=500,
        leaf_nodes_to_search_percent=7,
        index_update_method="STREAM_UPDATE",  # ✅ This enables streaming
        distance_measure_type=aiplatform.matching_engine.matching_engine_index_config.DistanceMeasureType.COSINE_DISTANCE,
        description="Legal Document Search Index with Streaming Updates"
    )
    
    print(f"✅ Index created: {new_index.name}")
    
    # Create endpoint
    print("🚀 Creating index endpoint...")
    endpoint = aiplatform.MatchingEngineIndexEndpoint.create(
        display_name="legal-doc-streaming-endpoint",
        public_endpoint_enabled=True
    )
    
    print(f"✅ Endpoint created: {endpoint.name}")
    
    # Deploy the index to the endpoint
    print("🚀 Deploying index to endpoint...")
    deployed_index = endpoint.deploy_index(
        index=new_index,
        deployed_index_id="legal_doc_streaming_deployed",
        display_name="Legal Doc Streaming Deployment"
    )
    
    print("✅ Index deployed successfully!")
    
    # Print the IDs you need for your .env file
    print("\n" + "="*60)
    print("📝 UPDATE YOUR .ENV FILE WITH THESE VALUES:")
    print("="*60)
    print(f"VECTOR_SEARCH_INDEX_ID={new_index.name}")
    print(f"VECTOR_SEARCH_ENDPOINT_ID={endpoint.name}")
    print(f"DEPLOYED_INDEX_ID=legal_doc_streaming_deployed")
    print("="*60)
    
    return new_index.name, endpoint.name

if __name__ == "__main__":
    create_streaming_index()