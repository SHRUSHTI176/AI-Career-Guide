from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

print("\nAvailable Models:\n")

try:
    pager = client.models.list()

    for model in pager:  # each item is a Model object
        print(" -", model.name)

except Exception as e:
    print("\nError listing models:\n", e)
