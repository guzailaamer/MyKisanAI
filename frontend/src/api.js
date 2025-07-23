// src/api.js

const BASE_URL = "http://localhost:8000";
// const BASE_URL = "https://mykisanai-backend-991058585393.us-central1.run.app/"; // Change if your backend runs elsewhere

export async function diagnoseCrop(imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);
  const res = await fetch(`${BASE_URL}/diagnose_crop`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function marketAdvice(crop_name, location) {
  const res = await fetch(`${BASE_URL}/market_advice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ crop_name, location }),
  });
  return res.json();
}

export async function subsidyQuery(question) {
  const res = await fetch(`${BASE_URL}/subsidy_query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return res.json();
}

export async function tts(text, language = "en") {
  const res = await fetch(`${BASE_URL}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });
  return res.json();
}

export async function stt(audioFile) {
  const formData = new FormData();
  formData.append("audio", audioFile);
  const res = await fetch(`${BASE_URL}/stt`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}
