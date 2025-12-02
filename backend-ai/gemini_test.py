from google import genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print("API Key Loaded:", "Yes" if api_key else "No")

# Initialize client
client = genai.Client(api_key=api_key)

try:
    response = client.models.generate_content(
        model="models/gemini-flash-latest",   # choose from your available list
        contents="Hey Gemini! Please confirm that the API is working successfully."
    )
    print("\nGemini Response:\n", response.text)

except Exception as e:
    print("\nError Occurred:\n", e)
