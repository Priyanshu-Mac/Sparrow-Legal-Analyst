import os
from dotenv import load_dotenv
from google.cloud import aiplatform

load_dotenv()
aiplatform.init(project=os.getenv("GCP_PROJECT_ID"), location="asia-south1")

# Your existing endpoint and deployed index ID from the screenshot
endpoint = aiplatform.MatchingEngineIndexEndpoint(
    index_endpoint_name="projects/199471048952/locations/asia-south1/indexEndpoints/7843388186972651520"
)

# Undeploy the old batch index
print("🗑️ Undeploying old batch index...")
endpoint.undeploy_index(deployed_index_id="legal_doc_endpoint_1758010888945")
print("✅ Old index undeployed successfully!")
