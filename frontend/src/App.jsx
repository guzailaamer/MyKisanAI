// src/App.jsx
import React, { useState } from "react";
import {
  diagnoseCrop,
  marketAdvice,
  subsidyQuery,
  tts,
  stt,
} from "./api";

function App() {
  // State for each form and response
  const [cropImage, setCropImage] = useState(null);
  const [cropResult, setCropResult] = useState(null);

  const [marketCrop, setMarketCrop] = useState("");
  const [marketLocation, setMarketLocation] = useState("");
  const [marketResult, setMarketResult] = useState(null);

  const [subsidyQuestion, setSubsidyQuestion] = useState("");
  const [subsidyResult, setSubsidyResult] = useState(null);

  const [ttsText, setTtsText] = useState("");
  const [ttsLang, setTtsLang] = useState("en");
  const [ttsResult, setTtsResult] = useState(null);

  const [sttAudio, setSttAudio] = useState(null);
  const [sttResult, setSttResult] = useState(null);

  // Handlers
  const handleDiagnose = async (e) => {
    e.preventDefault();
    if (!cropImage) return;
    const res = await diagnoseCrop(cropImage);
    setCropResult(res);
  };

  const handleMarket = async (e) => {
    e.preventDefault();
    const res = await marketAdvice(marketCrop, marketLocation);
    setMarketResult(res);
  };

  const handleSubsidy = async (e) => {
    e.preventDefault();
    const res = await subsidyQuery(subsidyQuestion);
    setSubsidyResult(res);
  };

  const handleTTS = async (e) => {
    e.preventDefault();
    const res = await tts(ttsText, ttsLang);
    setTtsResult(res);
  };

  const handleSTT = async (e) => {
    e.preventDefault();
    if (!sttAudio) return;
    const res = await stt(sttAudio);
    setSttResult(res);
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>MyKisanAI Frontend</h1>

      {/* Crop Diagnosis */}
      <section>
        <h2>Crop Disease Diagnosis</h2>
        <form onSubmit={handleDiagnose}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCropImage(e.target.files[0])}
          />
          <button type="submit">Diagnose</button>
        </form>
        {cropResult && <pre>{JSON.stringify(cropResult, null, 2)}</pre>}
      </section>

      {/* Market Advisory */}
      <section>
        <h2>Market Advisory</h2>
        <form onSubmit={handleMarket}>
          <input
            type="text"
            placeholder="Crop Name"
            value={marketCrop}
            onChange={(e) => setMarketCrop(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Location (optional)"
            value={marketLocation}
            onChange={(e) => setMarketLocation(e.target.value)}
          />
          <button type="submit">Get Advice</button>
        </form>
        {marketResult && <pre>{JSON.stringify(marketResult, null, 2)}</pre>}
      </section>

      {/* Subsidy Navigator */}
      <section>
        <h2>Subsidy Navigator</h2>
        <form onSubmit={handleSubsidy}>
          <input
            type="text"
            placeholder="Ask about subsidies"
            value={subsidyQuestion}
            onChange={(e) => setSubsidyQuestion(e.target.value)}
            required
          />
          <button type="submit">Ask</button>
        </form>
        {subsidyResult && <pre>{JSON.stringify(subsidyResult, null, 2)}</pre>}
      </section>

      {/* Text-to-Speech */}
      <section>
        <h2>Text-to-Speech</h2>
        <form onSubmit={handleTTS}>
          <input
            type="text"
            placeholder="Text to synthesize"
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Language (default: en)"
            value={ttsLang}
            onChange={(e) => setTtsLang(e.target.value)}
          />
          <button type="submit">Synthesize</button>
        </form>
        {ttsResult && (
          <div>
            <pre>{JSON.stringify(ttsResult, null, 2)}</pre>
            {/* If your backend returns audio as a base64 string, you can play it like this: */}
            {ttsResult.audio && (
              <audio controls src={`data:audio/wav;base64,${ttsResult.audio}`} />
            )}
          </div>
        )}
      </section>

      {/* Speech-to-Text */}
      <section>
        <h2>Speech-to-Text</h2>
        <form onSubmit={handleSTT}>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setSttAudio(e.target.files[0])}
          />
          <button type="submit">Transcribe</button>
        </form>
        {sttResult && <pre>{JSON.stringify(sttResult, null, 2)}</pre>}
      </section>
    </div>
  );
}

export default App;