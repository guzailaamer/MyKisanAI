"""
Crop Diagnosis Tool
------------------
This module provides functions to analyze crop images using     .
It detects crop diseases and suggests remedies based on the image input.

Main function:
    diagnose_crop(image_bytes: bytes) -> dict
        # Accepts image bytes, returns disease diagnosis and treatment suggestions.
"""
import base64
import requests
import json

def diagnose_crop(image_path, query, api_key):
    # Read and encode image to base64
    with open(image_path, 'rb') as f:
        image_data = f.read()
    image_b64 = base64.b64encode(image_data).decode('utf-8')
    
    # Prepare request payload
    payload = {
        "contents": [{
            "parts": [
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": image_b64
                    }
                },
                {
                    "text": query
                }
            ]
        }]
    }

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {
        "x-goog-api-key": api_key,
        "Content-Type": "application/json"
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error: {response.status_code} - {response.text}")


image_path = r"C:\Users\indra\Documents\Mykisan\MyKisanAI\crop_image.jpg"
query = "What disease is this crop suffering from? The plant is tomato plant. What are the remedies?"
api_key = "AIzaSyA0BlWlDGDhTGQPGl9dVW_PRtePHRWnOWA"
result = diagnose_crop(image_path, query, api_key)
print(result)


