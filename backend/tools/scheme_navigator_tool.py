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
    """Process all PDFs with detailed logging"""
    print(f"🔍 Checking PDF directory: {PDF_DIR.absolute()}")
    
    if not PDF_DIR.exists():
        print(f"❌ PDF directory doesn't exist: {PDF_DIR}")
        PDF_DIR.mkdir(parents=True, exist_ok=True)
        return []

    pdf_files = list(PDF_DIR.glob("*.pdf"))
    print(f"📁 Found {len(pdf_files)} PDF files: {[f.name for f in pdf_files]}")
    
    if not pdf_files:
        print("❌ No PDF files found!")
        return []

    schemes = []
    for pdf_file in pdf_files:
        print(f"📄 Processing: {pdf_file.name}")
        try:
            text = extract_text_from_pdf(pdf_file)
            if text and len(text.strip()) > 100:
                print(f"✅ Extracted {len(text)} characters from {pdf_file.name}")
                scheme_info = extract_scheme_info(text, pdf_file.name)
                if scheme_info:
                    schemes.append(scheme_info)
                    print(f"✅ Processed scheme: {scheme_info.get('title', 'Unknown')}")
            else:
                print(f"⚠️ No meaningful text extracted from {pdf_file.name}")
        except Exception as e:
            print(f"❌ Error processing {pdf_file.name}: {e}")

    if schemes:
        PROCESSED_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(PROCESSED_PATH, 'w', encoding='utf-8') as f:
            json.dump({"schemes": schemes, "processed_count": len(schemes)}, f, indent=2, ensure_ascii=False)
        print(f"💾 Saved {len(schemes)} processed schemes")
    
    return schemes


def load_schemes(force_refresh=False) -> List[Dict]:
    """Load schemes with option to force refresh"""
    
    # Check if we should force refresh or if processed file is outdated
    should_refresh = force_refresh
    
    if not should_refresh and PROCESSED_PATH.exists():
        try:
            # Check if any PDF is newer than processed file
            processed_time = PROCESSED_PATH.stat().st_mtime
            for pdf_file in PDF_DIR.glob("*.pdf"):
                if pdf_file.stat().st_mtime > processed_time:
                    print(f"📄 {pdf_file.name} is newer than processed data, refreshing...")
                    should_refresh = True
                    break
        except Exception as e:
            print(f"⚠️ Error checking file times: {e}")
            should_refresh = True
    
    if should_refresh or not PROCESSED_PATH.exists():
        print("🔄 Processing PDFs...")
        return process_all_pdfs()
    
    # Load existing processed data
    try:
        with open(PROCESSED_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            schemes = data.get("schemes", [])
            print(f"📚 Loaded {len(schemes)} schemes from cache")
            return schemes
    except Exception as e:
        print(f"❌ Error loading processed schemes: {e}")
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


def intelligent_scheme_match(query: str, schemes: List[Dict], top_k=3) -> List[Dict]:
    """Enhanced matching with multiple strategies"""
    query_lower = query.lower()
    query_words = [word for word in query_lower.split() if len(word) > 2]  # Skip short words
    
    # Keywords for different scheme types
    scheme_keywords = {
        'rythu': ['rythu', 'bandhu', 'telangana', 'farmer', 'support'],
        'pmkisan': ['pm-kisan', 'kisan', 'income', 'support', '6000'],
        'insurance': ['insurance', 'fasal', 'bima', 'crop', 'coverage'],
        'subsidy': ['subsidy', 'fertilizer', 'seed', 'discount'],
        'loan': ['loan', 'credit', 'kcc', 'agriculture']
    }
    
    scored_schemes = []
    
    for scheme in schemes:
        score = 0
        scheme_text = (
            scheme.get('title', '') + ' ' +
            scheme.get('description', '') + ' ' +
            scheme.get('eligibility', '') + ' ' +
            scheme.get('benefits', '') + ' ' +
            scheme.get('source_file', '')
        ).lower()
        
        # Strategy 1: Exact phrase matching (highest weight)
        for phrase in [query_lower]:
            if phrase in scheme_text:
                score += 10
        
        # Strategy 2: Individual word matching
        for word in query_words:
            count = scheme_text.count(word)
            if count > 0:
                score += count * 3
        
        # Strategy 3: Scheme type detection
        for scheme_type, keywords in scheme_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                if any(keyword in scheme_text for keyword in keywords):
                    score += 5
        
        # Strategy 4: File name matching
        source_file = scheme.get('source_file', '').lower()
        for word in query_words:
            if word in source_file:
                score += 7
        
        if score > 0:
            scored_schemes.append((score, scheme))
    
    # Sort by score (highest first)
    scored_schemes.sort(key=lambda x: x[0], reverse=True)
    
    print(f"🔍 Query: '{query}' matched {len(scored_schemes)} schemes")
    for score, scheme in scored_schemes[:3]:
        print(f"   Score {score}: {scheme.get('title', 'Unknown')} ({scheme.get('source_file', 'Unknown')})")
    
    return [scheme for _, scheme in scored_schemes[:top_k]]


def answer_scheme_query(question: str) -> str:
    """Enhanced scheme query with better processing and matching"""
    try:
        print(f"🤔 Processing query: '{question}'")
        
        # Force fresh processing for debugging (remove in production)
        schemes = load_schemes(force_refresh=False)
        
        if not schemes:
            return "❌ No scheme information is currently available. Please ensure PDF files are in the schemes directory and restart the application."

        print(f"📊 Available schemes: {[s.get('title', 'Unknown') for s in schemes]}")
        
        # Use intelligent matching
        matched = intelligent_scheme_match(question, schemes)
        
        if not matched:
            available_titles = [s.get('title', 'Unknown') for s in schemes[:3]]
            return f"🔍 I couldn't find schemes specifically matching '{question}'.\n\nAvailable schemes include:\n" + \
                   "\n".join([f"• {title}" for title in available_titles]) + \
                   "\n\nTry asking about one of these specific schemes or use different keywords."

        # Build context with matched schemes
        context = "\n\n".join([
            f"**{s['title']}** (Source: {s.get('source_file', 'Unknown')})\n" +
            f"Description: {s.get('description', 'N/A')}\n" +
            f"Eligibility: {s.get('eligibility', 'N/A')}\n" +
            f"Benefits: {s.get('benefits', 'N/A')}\n" +
            f"Application: {s.get('application_process', 'N/A')}\n" +
            f"Documents: {s.get('documents_required', 'N/A')}"
            for s in matched
        ])

        prompt = f"""
        A farmer asks: "{question}"

        Based on the following scheme information from official documents:
        {context}

        Provide a comprehensive, practical answer that:
        1. Directly addresses their question about the specific scheme
        2. Explains key benefits and eligibility clearly
        3. Gives step-by-step application process
        4. Lists required documents
        5. Provides practical tips for successful application
        6. Uses simple, farmer-friendly language

        Be specific and actionable. Reference the exact scheme name(s) found.
        """

        response = model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        print(f"❌ Error in answer_scheme_query: {e}")
        return f"Sorry, I encountered an error while processing your question: {str(e)}"
