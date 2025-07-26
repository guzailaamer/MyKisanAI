"""
Scheme Navigator Tool (Lightweight Gemini-RAG)
-----------------------------------------------
Answers farmers' subsidy/scheme queries by extracting and searching structured information from PDFs.
Uses Gemini Pro for both extraction and final summarization.
"""

import os
import json
import fitz  # PyMuPDF
from pathlib import Path
import google.generativeai as genai
from typing import Dict, List, Any
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not set in environment")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

# # Paths
# PDF_DIR = 'backend/tools/data/schemes'
# PROCESSED_PATH = 'backend/tools/data/processed_schemes.json'

PDF_DIR = Path(__file__).parent / "data" / "schemes"
PROCESSED_PATH = Path(__file__).parent / "data" / "processed_schemes.json"


def extract_text_from_pdf(pdf_path: Path) -> str:
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            page_text = page.get_text()
            if len(page_text.strip()) > 50:
                text += page_text + "\n"
    return text


def extract_scheme_info(text: str, filename: str) -> Dict[str, Any]:
    prompt = f"""
    Extract the following information as JSON:
    {{
        "title": "name of the scheme",
        "description": "short summary",
        "eligibility": "who can apply",
        "benefits": "what is provided",
        "application_process": "how to apply",
        "documents_required": "list of documents",
        "source_file": "{filename}"
    }}

    Document:
    {text[:3000]}
    """

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:-3]
        elif response_text.startswith('```'):
            response_text = response_text[3:-3]
        return json.loads(response_text)
    except Exception as e:
        return {
            "title": f"Scheme from {filename}",
            "description": text[:500] + "...",
            "source_file": filename,
            "error": str(e)
        }


def process_all_pdfs() -> List[Dict]:
    if not PDF_DIR.exists():
        raise FileNotFoundError(f"PDF directory not found: {PDF_DIR}")

    schemes = []
    for pdf_file in PDF_DIR.glob("*.pdf"):
        print(f"Processing: {pdf_file.name}")
        text = extract_text_from_pdf(pdf_file)
        if text:
            scheme_info = extract_scheme_info(text, pdf_file.name)
            schemes.append(scheme_info)

    PROCESSED_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(PROCESSED_PATH, 'w', encoding='utf-8') as f:
        json.dump({"schemes": schemes}, f, indent=2, ensure_ascii=False)

    return schemes


def load_schemes() -> List[Dict]:
    if PROCESSED_PATH.exists():
        with open(PROCESSED_PATH, 'r', encoding='utf-8') as f:
            return json.load(f).get("schemes", [])
    return process_all_pdfs()


def simple_keyword_match(query: str, schemes: List[Dict], top_k=3) -> List[Dict]:
    query_words = query.lower().split()
    scored = []
    for scheme in schemes:
        text = (scheme.get("title", "") + scheme.get("description", "") +
                scheme.get("eligibility", "") + scheme.get("benefits", "")).lower()
        score = sum(text.count(word) for word in query_words)
        if score > 0:
            scored.append((score, scheme))
    scored.sort(reverse=True, key=lambda x: x[0])
    return [s for _, s in scored[:top_k]]


def answer_scheme_query(question: str) -> str:
    try:
        schemes = load_schemes()
        if not schemes:
            return "Sorry, no scheme data is available right now."

        matched = simple_keyword_match(question, schemes)
        if not matched:
            return "I couldn't find relevant schemes for your question. Please consult a local agriculture officer."

        context = "\n".join([
            f"{i+1}. {s['title']}\n   Description: {s.get('description')}\n   Eligibility: {s.get('eligibility')}\n   Benefits: {s.get('benefits')}\n"
            for i, s in enumerate(matched)
        ])

        prompt = f"""
        A farmer asks: "{question}"

        Based on the following relevant schemes, provide a practical, simple answer:
        {context}

        Your reply should:
        - Mention the most relevant scheme(s)
        - Give simple steps to apply
        - Mention documents needed
        - Be clear and actionable
        """

        reply = model.generate_content(prompt)
        return reply.text.strip()

    except Exception as e:
        return f"Error: {str(e)}"
