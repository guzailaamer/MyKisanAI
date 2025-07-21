# 🚀 My Kisan AI – MVP Development Plan

| Phase No. | Task / Feature                         | Description                                                                 | Estimated Time | Owner / Role       |
|-----------|-----------------------------------------|-----------------------------------------------------------------------------|----------------|--------------------|
| 1         | 🔧 Project Setup                         | Initialize Firebase project, hosting, repo setup                           | 0–2 hrs        | All                |
| 2         | 🚀 Backend API Bootstrapping             | Create `main.py` with FastAPI and test routes                              | 2–4 hrs        | Backend            |
| 3         | 🧱 Tool Stubs Setup                      | Scaffold all AI tools: Vision, Market, Schemes, TTS/STT                    | 4–6 hrs        | AI/ML              |
| 4         | 🔁 API Routes for Agent Tasks            | Implement POST routes: `/diagnose_crop`, `/market_advice`, etc.           | 6–8 hrs        | Backend            |
| 5         | 🔗 Frontend ↔ Backend Connection         | Axios/fetch services to call backend endpoints from UI                     | 8–10 hrs       | Frontend           |
| 6         | 🧠 Crop Diagnosis (Gemini Vision)        | Upload image → call Gemini Vision → return disease + remedy                | 10–12 hrs      | AI/ML              |
| 7         | 📉 Market Advisory                       | Query market trend → summarize with Gemini Pro                             | 12–14 hrs      | AI/ML + Backend    |
| 8         | 💸 Subsidy Navigator (RAG)               | Use Gemini Pro + scraped docs to answer subsidy questions                  | 14–16 hrs      | AI/ML              |
| 9         | 🔊 STT/TTS Voice Support                 | Convert voice to text (STT), generate response voice (TTS)                 | 16–18 hrs      | AI/ML              |
| 10        | 🔐 Firestore Memory                      | Save query, crop, response, language, timestamp to Firestore               | 18–20 hrs      | Backend            |
| 11        | 🧑‍🌾 Frontend UI Logic + Timeline        | Display responses, past advice, history cards                              | 20–22 hrs      | Frontend           |
| 12        | 🎨 Polish UX + Feedback + Language Switch| Add thumbs up/down, multi-language switch, cleanup visuals                 | 22–24 hrs      | Frontend           |
| 13        | 🧪 Deploy + E2E Testing                  | Deploy frontend (Firebase), backend (Cloud Run), run full flows            | 24–26 hrs      | All                |
| 14        | 🎥 Demo Recording & PPT Finalization     | Record demo, finalize slide deck, write submission README                  | 26–29 hrs      | All                |
| 15        | 📨 Submit + Backup + Rest                | Upload GitHub link, deployed site, PPT, video — and breathe 🍃              | 29–30 hrs      | All                |

