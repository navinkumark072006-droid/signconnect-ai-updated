# SIGNCONNECT AI — "Breaking Communication Barriers in Real Time."
Innovators Day prototype: sign gestures → text and speech → text, over a WebRTC video call.

## Run (Windows 11 / PowerShell) — two terminals
**Terminal 1 – backend**
```powershell
cd signconnect-ai\backend
python -m venv venv
.\venv\Scripts\Activate.ps1      # if blocked: Set-ExecutionPolicy -Scope Process Bypass
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
**Terminal 2 – frontend**
```powershell
cd signconnect-ai\frontend
npm install
npm run dev
```
Open http://localhost:5173. Optional `.env`: copy `frontend/.env.example` to `frontend/.env`.

## Test
Open two browser windows (use a different one, or an Incognito window). Window 1: Create Room, copy the ID. Window 2: Join Room with that ID. Show "Hello" (open palm) to the camera in the signing window; text appears in the other. Use Start listening in the other window to send speech.

## Architecture
Browser: webcam → MediaPipe HandLandmarker (local) → rule classifier (`data/gestures.js`) → smoothing/debounce (`hooks/useSign.js`) → WebSocket text.
Backend (FastAPI): rooms (max 2), relays WebRTC offer/answer/ICE and text. No video reaches the server.
Video: WebRTC with public STUN (`stun.l.google.com`). Production needs a TURN server for strict NAT/firewalls.

## Gestures (prototype vocabulary — intended for demonstration)
Hello, Stop, Yes, Bad, No, Help, Water, Please, Thank you, I love you, Goodbye, Okay. Add more by adding an entry to `GESTURES` in `frontend/src/data/gestures.js`.

## Sign output languages
The LIVE SIGN TRANSLATION panel has an **Output Language** dropdown (`id="sign-language"`): English plus Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia. Translations are local (`TRANSLATIONS` in `frontend/src/data/gestures.js`) and cover only the 12 prototype gestures — this is not general sign-language translation. Changing the language does not reload MediaPipe. The LIVE SPEECH dropdown is separate (English / Tamil). The Indian-language text is a prototype dictionary; have a native speaker review it before real use.

## v3 additions
- **37 prototype gestures** (12 static + 25 new). New ones use orientation and motion rules in `frontend/src/data/engine.js`; the original `classify()` is unchanged. Hints for every sign are in the in-app Gesture guide.
- **Sign voice output:** finalized sign text is spoken on the *receiving* device with `speechSynthesis` in the sender's chosen language (sender's Voice Output ON/OFF switch travels with each message). Needs an installed voice for that language.
- **Speech recognition in 11 languages** (browser support varies by device).
- Gestures are arbitrary prototype mappings, not an official sign language.

## Limitations
Not a real sign language; limited rule-based vocabulary; needs good light and an upright hand; no WS auto-reconnect; Tamil speech needs a browser/OS that supports `ta-IN`; 2-person rooms only.

## Privacy
Video is processed for real-time communication and is not permanently stored by the prototype. Transcripts live only in the page.

## Common errors
- *Camera blocked*: use `localhost`, or HTTPS when testing from another device.
- *Server unavailable*: backend not running on port 8000.
- *AI model failed to load*: needs internet (model + WASM load from CDN).
- *Video stuck on "Connecting"*: network blocks peer-to-peer; add a TURN server.
