# 🌾 My Kisan AI

**My Kisan AI** is a voice-first, multilingual, and multimodal Agentic AI assistant built using Google’s AI stack. Designed specifically for small-scale Indian farmers, it diagnoses crop diseases, offers real-time market analysis, and navigates government subsidies through a simple smartphone web interface.

---

## 🚀 Project Overview

* **Name:** My Kisan AI
* **Type:** Voice-first, multimodal AI assistant (PWA)
* **Problem Solved:** Timely crop diagnosis, market price prediction, subsidy guidance
* **Users:** Small-scale Indian farmers with smartphone access
* **Languages:** Supports Telugu, Hindi, and other local languages

---

## ✅ Features

* 📸 **Crop Disease Diagnosis**: Upload an image of a crop → Gemini Vision analyzes it and suggests remedies
* 📈 **Market Price Advisory**: Asks “Should I sell onions today?” → Fetches mandi data and provides advice
* 💸 **Subsidy Scheme Navigator**: Explains eligibility and steps for relevant schemes using RAG
* 🗣️ **Voice-first Interface**: STT & TTS using Vertex AI in multiple Indian languages
* 🧠 **Contextual Memory**: Stores past diagnoses, user preferences, crop history
* 🌐 **PWA**: Offline-capable, accessible through any smartphone browser

---

## 🔧 Tech Stack

| Layer            | Tool/Service                   | Purpose                               |
| ---------------- | ------------------------------ | ------------------------------------- |
| **Frontend**     | Firebase Hosting + HTML/CSS/JS | PWA for farmers                       |
| **Backend**      | Python (FastAPI)               | Business logic and AI endpoints       |
| **Voice I/O**    | Vertex AI STT & TTS            | Speech recognition + audio playback   |
| **AI Agent**     | Vertex AI Agent Builder        | Manages dialog flow and routing       |
| **Image AI**     | Gemini Multimodal (Vision)     | Detects crop disease from image       |
| **LLM**          | Gemini Pro (Language)          | Query reasoning, summarization        |
| **Storage**      | Firebase Firestore             | Query logs, user memory               |
| **Backend APIs** | Firebase Cloud Functions       | Calls for mandi price and scheme info |
| **Auth**         | Firebase Auth                  | Secure user sessions                  |

---

## 🔁 Agent Loop (AI Reasoning)

```text
📥 Perception → 🧭 Planning → 🎯 Action → 🧠 Memory → 🔁 Feedback
```

Each interaction is:

* Parsed (image/voice)
* Analyzed using Gemini tools
* Responded to with voice + visual advice
* Logged into Firestore for future personalization

---

## 📦 Setup Instructions

### Requirements:

* Node.js & npm (via `nvm` recommended)
* Python 3.10+
* Firebase CLI: `npm install -g firebase-tools`
* Google Cloud CLI (optional for backend deploy)

### Local Run:

```bash
# Frontend
firebase serve

# Backend
cd backend
uvicorn main:app --reload
```

### Deploy Frontend:

```bash
firebase deploy
```

---

## 🏁 Contributors

* Guzail Aamer
* T Indraneel
* Sohan Reddy
* Keerthi T
* Bilal Aamer

---

## 📈 Impact

India’s agriculture sector employs 60% of the rural population and contributes 18% to GDP. Even a **5% yield boost** through timely AI advice can impact millions of lives and livelihoods.

---

## 📬 License

MIT © 2025 My Kisan AI Team
