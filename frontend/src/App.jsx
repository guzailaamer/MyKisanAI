import React, { useState } from "react";

function App() {
  // State for each form and response
  const [cropImage, setCropImage] = useState(null);
  const [cropResult, setCropResult] = useState(null); // This will now store { diagnosis: "..." }

  const [marketCrop, setMarketCrop] = useState("");
  const [marketLocation, setMarketLocation] = useState("");
  const [marketResult, setMarketResult] = useState(null);

  const [subsidyQuestion, setSubsidyQuestion] = useState("");
  const [subsidyResult, setSubsidyResult] = useState(null);

  const [ttsText, setTtsText] = useState("");
  const [ttsLang, setTtsLang] = useState("en");
  const [ttsResult, setTtsResult] = useState(null);
  const [ttsTranslate, setTtsTranslate] = useState(false);
  const [ttsTargetLang, setTtsTargetLang] = useState("");

  const [sttAudio, setSttAudio] = useState(null);
  const [sttResult, setSttResult] = useState(null);

  const [query, setQuery] = useState(""); // Added state for the query input

  // Handlers
  const handleDiagnose = async (e) => {
    e.preventDefault();
    if (!cropImage || !query) {
      alert("Please select an image and enter a query.");
      return;
    }

    const formData = new FormData();
    formData.append("image", cropImage); // Attach the image file to FormData
    formData.append("query", query); // Attach the query to FormData

    try {
      // Send the image and query to the backend API (make sure the URL is correct)
      // For local development, it's often good to use a full URL like:
      // const res = await fetch("http://localhost:8000/diagnose_crop", {
      const res = await fetch("/diagnose_crop", { // This works if Vite is proxying correctly or if backend is on same origin
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to upload image");
      }

      const data = await res.json();
      setCropResult(data); // Set the response from the backend
    } catch (err) {
      console.error("Error during image diagnosis:", err);
      setCropResult({ error: err.message }); // Display error in UI
    }
  };

  const handleMarket = async (e) => {
    e.preventDefault();
    // Assuming you have `marketAdvice` function defined elsewhere or will fetch directly
    // const res = await marketAdvice(marketCrop, marketLocation);
    try {
      const res = await fetch("/market_advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop_name: marketCrop, location: marketLocation }),
      });
      const data = await res.json();
      setMarketResult(data);
    } catch (err) {
      console.error("Error during market advice:", err);
      setMarketResult({ error: err.message });
    }
  };

  const handleSubsidy = async (e) => {
    e.preventDefault();
    // Assuming you have `subsidyQuery` function defined elsewhere or will fetch directly
    // const res = await subsidyQuery(subsidyQuestion);
    try {
      const res = await fetch("/subsidy_query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: subsidyQuestion }),
      });
      const data = await res.json();
      setSubsidyResult(data);
    } catch (err) {
      console.error("Error during subsidy query:", err);
      setSubsidyResult({ error: err.message });
    }
  };

  const handleTTS = async (e) => {
    e.preventDefault();
    let language = "en";
    let translate = false;
    let source_lang = "en";
    let target_lang = null;
    if (ttsTranslate && ttsTargetLang) {
      translate = true;
      target_lang = ttsTargetLang;
      language = ttsTargetLang + "-IN";
    }
    try {
      const res = await fetch("/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: ttsText,
          language,
          translate,
          source_lang,
          target_lang
        }),
      });
      const data = await res.json();
      setTtsResult(data);
    } catch (err) {
      console.error("Error during TTS:", err);
      setTtsResult({ error: err.message });
    }
  };

  const handleSTT = async (e) => {
    e.preventDefault();
    if (!sttAudio) return;
    // Assuming you have `stt` function defined elsewhere or will fetch directly
    // const res = await stt(sttAudio);
    const formData = new FormData();
    formData.append("audio", sttAudio);
    try {
      const res = await fetch("/stt", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setSttResult(data);
    } catch (err) {
      console.error("Error during STT:", err);
      setSttResult({ error: err.message });
    }
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
          <input
            type="text"
            placeholder="Enter query about the crop"
            value={query}
            onChange={(e) => setQuery(e.target.value)} // Bind the query state
            required
          />
          <button type="submit">Diagnose</button>
        </form>
        {/* Display the diagnosis text directly or a JSON string if you prefer */}
        {cropResult && (
          <div>
            <h3>Diagnosis Result:</h3>
            {cropResult.error ? (
              <p style={{ color: 'red' }}>Error: {cropResult.error}</p>
            ) : (
              <p>{cropResult.diagnosis}</p> // Display the extracted diagnosis text
            )}
            {/* Optional: For debugging, you can still stringify the whole object */}
            {/* <pre>{JSON.stringify(cropResult, null, 2)}</pre> */}
          </div>
        )}
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
          <div style={{ margin: '0.5em 0' }}>
            <label>
              <input
                type="checkbox"
                checked={ttsTranslate}
                onChange={e => {
                  setTtsTranslate(e.target.checked);
                  if (!e.target.checked) setTtsTargetLang("");
                }}
              />
              Translate to:
            </label>
            {ttsTranslate && (
              <select
                value={ttsTargetLang}
                onChange={e => setTtsTargetLang(e.target.value)}
                required
                style={{ marginLeft: 8 }}
              >
                <option value="">Select language</option>
                <option value="hi">Hindi</option>
                <option value="te">Telugu</option>
                <option value="kn">Kannada</option>
              </select>
            )}
          </div>
          <button type="submit">Synthesize</button>
        </form>
        {ttsResult && (
          <div>
            {/* Remove debug output: <pre>{JSON.stringify(ttsResult, null, 2)}</pre> */}
            {ttsResult.audio && (
              <audio controls src={`data:audio/wav;base64,${ttsResult.audio}`} />
            )}
            {ttsResult.translated_text && (
              <div style={{ marginTop: '0.5em' }}>
                <strong>Translated Text:</strong> {ttsResult.translated_text}
              </div>
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