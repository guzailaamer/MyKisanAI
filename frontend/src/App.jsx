import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { apiService } from "./api";

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

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

  // Conversation history state
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Authentication effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        loadConversations();
      }
    });

    return () => unsubscribe();
  }, []);

  // Load conversation history
  const loadConversations = async () => {
    try {
      const data = await apiService.getUserConversations(20);
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  // Authentication handlers
  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  // Handlers
  const handleDiagnose = async (e) => {
    e.preventDefault();
    if (!cropImage || !query) {
      alert("Please select an image and enter a query.");
      return;
    }

    try {
      const data = await apiService.diagnoseCrop(cropImage, query);
      setCropResult(data);
      loadConversations(); // Refresh conversation history
    } catch (err) {
      console.error("Error during image diagnosis:", err);
      setCropResult({ error: err.message });
    }
  };

  const handleMarket = async (e) => {
    e.preventDefault();
    try {
      const data = await apiService.getMarketAdvice(marketCrop, marketLocation);
      setMarketResult(data);
      loadConversations(); // Refresh conversation history
    } catch (err) {
      console.error("Error during market advice:", err);
      setMarketResult({ error: err.message });
    }
  };

  const handleSubsidy = async (e) => {
    e.preventDefault();
    try {
      const data = await apiService.getSubsidyAnswer(subsidyQuestion);
      setSubsidyResult(data);
      loadConversations(); // Refresh conversation history
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
      console.log("TTS Request:", { ttsText, language, translate, source_lang, target_lang });
      const data = await apiService.textToSpeech(ttsText, language, translate, source_lang, target_lang);
      console.log("TTS Response:", data);
      setTtsResult(data);
      loadConversations(); // Refresh conversation history
    } catch (err) {
      console.error("Error during TTS:", err);
      setTtsResult({ error: err.message });
    }
  };

  const handleSTT = async (e) => {
    e.preventDefault();
    if (!sttAudio) return;
    try {
      const data = await apiService.speechToText(sttAudio);
      setSttResult(data);
      loadConversations(); // Refresh conversation history
    } catch (err) {
      console.error("Error during STT:", err);
      setSttResult({ error: err.message });
    }
  };


  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>MyKisanAI Frontend</h1>

      {/* Authentication Forms */}
      <section>
        <h2>Authentication</h2>
        {loading ? (
          <p>Loading user...</p>
        ) : user ? (
          <div>
            <p>Welcome, {user.email}!</p>
            <button onClick={handleSignOut}>Sign Out</button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              style={{ marginLeft: '10px' }}
            >
              {showHistory ? 'Hide' : 'Show'} Conversation History
            </button>
          </div>
        ) : (
          <div>
            <h3>Sign Up</h3>
            <form onSubmit={handleSignUp}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Sign Up</button>
            </form>
            {authError && <p style={{ color: 'red' }}>{authError}</p>}

            <h3>Sign In</h3>
            <form onSubmit={handleSignIn}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Sign In</button>
            </form>
            {authError && <p style={{ color: 'red' }}>{authError}</p>}
          </div>
        )}
      </section>

      {/* Conversation History */}
      {user && showHistory && (
        <section style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h2>Conversation History</h2>
          {conversations.length === 0 ? (
            <p>No conversations yet. Start using the tools to see your history!</p>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {conversations.map((conv, index) => (
                <div key={conv.id || index} style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #eee', borderRadius: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{conv.tool_name?.replace('_', ' ')}</strong>
                    <small>{conv.timestamp ? new Date(conv.timestamp.toDate ? conv.timestamp.toDate() : conv.timestamp).toLocaleString() : 'Unknown time'}</small>
                  </div>
                  <div style={{ fontSize: '0.9em' }}>
                    {conv.metadata && (
                      <>
                        {conv.metadata.query && <p><strong>Query:</strong> {conv.metadata.query}</p>}
                        {conv.metadata.question && <p><strong>Question:</strong> {conv.metadata.question}</p>}
                        {conv.metadata.crop_name && <p><strong>Crop:</strong> {conv.metadata.crop_name}</p>}
                        {conv.metadata.text && <p><strong>Text:</strong> {conv.metadata.text.substring(0, 100)}...</p>}
                        {conv.metadata.transcript && <p><strong>Transcript:</strong> {conv.metadata.transcript.substring(0, 150)}...</p>}
                        {conv.metadata.response && <p><strong>Response:</strong> {typeof conv.metadata.response === 'string' ? conv.metadata.response.substring(0, 150) + '...' : 'See result below'}</p>}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Protected Content */}
      {user && (
        <>
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
                <pre>{JSON.stringify(ttsResult, null, 2)}</pre>
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
        </>
      )}
      {!user && <p>Please sign in to access the main application features.</p>}
    </div>
  );
}

export default App;