"""
Voice Support Tool (STT/TTS)
---------------------------
This module provides functions for speech-to-text (STT) and text-to-speech (TTS) using Google Vertex AI Speech Services.
It enables voice input and output for the agent in multiple languages.

Main functions:
    transcribe_audio(audio_bytes: bytes, language: str) -> str
        # Converts audio bytes to text in the specified language.
    synthesize_speech(text: str, language: str) -> bytes
        # Converts text to speech audio in the specified language.
"""
from sarvamai import SarvamAI
import os
import base64
from pydub import AudioSegment
from pydub.utils import which
from pathlib import Path
AudioSegment.converter = os.getenv("FFMPEG_PATH")#"/usr/local/bin/ffmpeg"
import io
import time
from tempfile import NamedTemporaryFile

# Create temp directory in your project
TMP_DIR = Path(__file__).parent.parent / "tmp"
TMP_DIR.mkdir(exist_ok=True)

def transcribe_audio(audio_bytes, language="unknown"):
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        raise ValueError("SARVAM_API_KEY not set in environment variables")
    client = SarvamAI(api_subscription_key=api_key)
    # Save audio_bytes to a temp file (Sarvam SDK expects a file object)
    with NamedTemporaryFile(suffix=".wav", dir=TMP_DIR, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp.flush()
        tmp.close()

        def process_response(response):
            # Extract text from response
            if hasattr(response, "text") and response.text:
                text = str(response.text)
            elif hasattr(response, "transcript") and response.transcript:
                text = str(response.transcript)
            elif hasattr(response, "translated_text"):
                # Handle TranslationResponse objects
                text = str(response.translated_text)
            else:
                text = str(response)
                
            # Detect if text contains non-ASCII characters (likely non-English)
            if any(ord(char) > 127 for char in text):
                print(f"Detected non-English text, translating to English: {text[:100]}...")
                # Translate to English (using your existing translate_text function)
                translated = translate_text(text, source_lang="auto", target_lang="en")
                # Extract string from translation response
                if hasattr(translated, "translated_text"):
                    text = str(translated.translated_text)
                else:
                    text = str(translated)
                
            return text

        try:
            # Check audio duration using pydub
            audio = AudioSegment.from_file(tmp.name)
            duration_sec = audio.duration_seconds
            if duration_sec <= 30:
                with open(tmp.name, "rb") as audio_file:
                    response = client.speech_to_text.transcribe(
                        file=audio_file,
                        model="saarika:v2.5",
                        language_code=language
                    )
                if hasattr(response, "text") and response.text:
                    return process_response(response.text)
                elif hasattr(response, "transcript") and response.transcript:
                    return process_response(response.transcript)
                else:
                    return process_response(response)
            else:
                # Split audio into <=29s chunks and transcribe each
                chunks = []
                for i, chunk in enumerate(audio[::29000]):  # 29s chunks (29000ms)
                    chunk_file = NamedTemporaryFile(suffix=".wav", delete=False)
                    chunk.export(chunk_file.name, format="wav")
                    chunks.append(chunk_file.name)
                full_transcript = []
                for idx, chunk_path in enumerate(chunks):
                    with open(chunk_path, "rb") as audio_file:
                        try:
                            response = client.speech_to_text.transcribe(
                                file=audio_file,
                                model="saarika:v2.5",
                                language_code=language
                            )
                            if hasattr(response, "text") and response.text:
                                full_transcript.append(process_response(response.text))
                            elif hasattr(response, "transcript") and response.transcript:
                                full_transcript.append(process_response(response.transcript))
                            else:
                                full_transcript.append(process_response(response))
                        except Exception as e:
                            print(f"Error with chunk {chunk_path}: {e}")
                return " ".join(full_transcript).strip()
        finally:
            # Clean up temp file
            if os.path.exists(tmp.name):
                os.remove(tmp.name)


def normalize_lang_code(lang):
    # Accepts 'en', 'hi', 'te', 'kn', 'en-IN', etc. Returns BCP-47 code.
    mapping = {
        'en': 'en-IN', 'hi': 'hi-IN', 'te': 'te-IN', 'kn': 'kn-IN',
        'en-IN': 'en-IN', 'hi-IN': 'hi-IN', 'te-IN': 'te-IN', 'kn-IN': 'kn-IN'
    }
    return mapping.get(lang, lang)

def translate_text(text, source_lang="en", target_lang="hi"):
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        raise ValueError("SARVAM_API_KEY not set in environment variables")
    client = SarvamAI(api_subscription_key=api_key)
    source_lang_code = normalize_lang_code(source_lang)
    target_lang_code = normalize_lang_code(target_lang)
    result = client.text.translate(
        input=text,
        source_language_code=source_lang_code,
        target_language_code=target_lang_code
    )
    return result["text"] if isinstance(result, dict) and "text" in result else result

def extract_translated_string(translated):
    # Convert to dict if it's a Pydantic model or custom object
    if hasattr(translated, 'dict'):
        translated = translated.dict()
    elif hasattr(translated, '__dict__'):
        translated = vars(translated)
    # Recursively extract the innermost translated_text string
    while isinstance(translated, dict) and "translated_text" in translated:
        translated = translated["translated_text"]
        # If it's still a custom object, convert again
        if hasattr(translated, 'dict'):
            translated = translated.dict()
        elif hasattr(translated, '__dict__'):
            translated = vars(translated)
    return translated

def chunk_text(text, max_length=500):
    # Split text into <=max_length character chunks, preserving word boundaries
    words = text.split()
    chunks = []
    current = ""
    for word in words:
        if len(current) + len(word) + 1 > max_length:
            if current:
                chunks.append(current)
            current = word
        else:
            if current:
                current += " "
            current += word
    if current:
        chunks.append(current)
    return chunks

def translate_long_text(text, source_lang="en", target_lang="hi", max_length=1000):
    chunks = chunk_text(text, max_length)
    translated_chunks = []
    for i, chunk in enumerate(chunks):
        print(f"Translating chunk {i+1}/{len(chunks)}: {repr(chunk[:60])}... ({len(chunk)} chars)")
        translated = translate_text(chunk, source_lang, target_lang)
        translated_chunks.append(extract_translated_string(translated))
        time.sleep(1)  # To avoid rate limiting
    return " ".join(translated_chunks)

# Update synthesize_speech to use translate_long_text for long inputs

def synthesize_speech(response_text, language="en-IN", translate=False, source_lang="en", target_lang=None):
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        raise ValueError("SARVAM_API_KEY not set in environment variables")
    client = SarvamAI(api_subscription_key=api_key)
    translated_text = None
    if translate and target_lang:
        translated_text = translate_long_text(response_text, source_lang=source_lang, target_lang=target_lang)
        response_text = translated_text
        language = normalize_lang_code(target_lang)
    # Ensure response_text is a string
    if not isinstance(response_text, str):
        response_text = str(response_text)
    # Chunk text for TTS
    text_chunks = chunk_text(response_text, 500)
    audio_segments = []
    # Set your desired output parameters
    TARGET_SAMPLE_RATE = 16000
    TARGET_CHANNELS = 1
    TARGET_SAMPLE_WIDTH = 2  # 2 bytes = 16 bits

    for i, chunk in enumerate(text_chunks):
        print(f"Chunk {i+1}/{len(text_chunks)}: {repr(chunk[:60])}... ({len(chunk)} chars)")
        audio_response = client.text_to_speech.convert(
            target_language_code=normalize_lang_code(language),
            text=chunk,
            model="bulbul:v2",
            speaker="anushka"
        )
        print(f"  TTS API response for chunk {i+1}: {audio_response}")
        audio_data = audio_response.audios[0]
        if isinstance(audio_data, bytes):
            audio_bytes = audio_data
        elif isinstance(audio_data, str) and os.path.isfile(audio_data):
            with open(audio_data, "rb") as f:
                audio_bytes = f.read()
        else:
            try:
                audio_bytes = base64.b64decode(audio_data)
            except Exception as e:
                raise TypeError(f"audio_data is neither bytes, a valid file path, nor valid base64: {type(audio_data)}")
        print(f"  Chunk {i+1} audio_bytes length: {len(audio_bytes)}")
        seg = AudioSegment.from_file(io.BytesIO(audio_bytes), format="wav")
        seg = seg.set_frame_rate(TARGET_SAMPLE_RATE).set_channels(TARGET_CHANNELS).set_sample_width(TARGET_SAMPLE_WIDTH)
        print(f"  Audio segment {i+1} duration: {seg.duration_seconds:.2f}s, frame_rate: {seg.frame_rate}, channels: {seg.channels}, sample_width: {seg.sample_width}")
        seg.export(f"debug_chunk_{i+1}.wav", format="wav")
        print(f"  Saved debug_chunk_{i+1}.wav")
        audio_segments.append(seg)
        time.sleep(5)  # Add a 5-second delay between requests (increased from 1s)
    # Concatenate all audio segments
    if audio_segments:
        combined = audio_segments[0]
        for seg in audio_segments[1:]:
            combined += seg
        print(f"Total concatenated audio duration: {combined.duration_seconds:.2f} seconds")
        out_io = io.BytesIO()
        combined.export(out_io, format="wav")
        out_io.seek(0)
        final_audio = out_io.read()
    else:
        final_audio = b""
    return {"audio": final_audio, "translated_text": translated_text, "response_text": response_text}


