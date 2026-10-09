import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Captions, Copy, Hand, Mic, MicOff, MonitorUp, PhoneOff, Siren, Trash2, Video, VideoOff } from 'lucide-react';
import { useSign } from '../hooks/useSign';
import { byId, EMERGENCY, LANGUAGES, SPEECH_LANGUAGES, BCP, GESTURES, getText } from '../data/gestures';
import { Access } from '../App.jsx';

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const TTS = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
// Speaks a finalized sign message on THIS (receiving) device using the browser's built-in voices. Never throws.
function speak(text, lang, warn) {
  if (!TTS || !text) return;
  try {
    const u = new SpeechSynthesisUtterance(text); u.lang = lang || 'en-US';
    const vs = window.speechSynthesis.getVoices(), base = u.lang.split('-')[0].toLowerCase();
    const v = vs.find((x) => x.lang.replace('_', '-') === u.lang) || vs.find((x) => x.lang.toLowerCase().startsWith(base));
    if (!v && vs.length) { warn && warn(`No ${u.lang} voice installed on this device — showing text only.`); return; }
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {}
}
const LABEL = { ok: 'Connected', connecting: 'Connecting', off: 'Disconnected', error: 'Error' };
const Pill = ({ label, s }) => <span className="pill" role="status"><span className={`dot ${s}`} />{label}: {LABEL[s]}</span>;

export default function Call() {
  const { room } = useParams();
  const [sp] = useSearchParams();
  const name = sp.get('name') || 'Guest', create = sp.get('create') ? 1 : 0;
  const nav = useNavigate();
  const localRef = useRef(null), remoteRef = useRef(null), pcRef = useRef(null), wsRef = useRef(null);
  const streamRef = useRef(null), shareRef = useRef(null), recRef = useRef(null), listenRef = useRef(false), restartT = useRef(null);
  const [st, setSt] = useState({ cam: 'connecting', mic: 'connecting', ws: 'connecting', rtc: 'connecting' });
  const [stream, setStream] = useState(null), [msgs, setMsgs] = useState([]), [toast, setToast] = useState(''), [fatal, setFatal] = useState('');
  const [micOn, setMicOn] = useState(true), [camOn, setCamOn] = useState(true), [sharing, setSharing] = useState(false);
  const [signOn, setSignOn] = useState(sp.get('mode') !== 'speak'), [caps, setCaps] = useState(true);
  const [signLang, setSignLang] = useState('en'), [voiceOn, setVoiceOn] = useState(true);
  const [listening, setListening] = useState(false), [lang, setLang] = useState('en-US'), [interim, setInterim] = useState(''), [peer, setPeer] = useState('');

  const say = (m) => { setToast(m); setTimeout(() => setToast(''), 4500); };
  const send = (o) => { const w = wsRef.current; if (w && w.readyState === 1) w.send(JSON.stringify(o)); };
  const sendText = (text, source, extra = {}) => {
    send({ type: 'text', source, text, ...extra });
    setMsgs((p) => [...p, { who: 'You', source, text, me: true }]);
  };

  useEffect(() => {
    let closed = false;
    const pid = Math.random().toString(36).slice(2, 10);
    const set = (k, v) => setSt((x) => ({ ...x, [k]: v }));

    const makePc = () => {
      if (pcRef.current) return pcRef.current;
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      const s = streamRef.current;
      if (s) s.getTracks().forEach((t) => pc.addTrack(t, s));
      if (!s || !s.getVideoTracks().length) pc.addTransceiver('video', { direction: 'recvonly' });
      if (!s || !s.getAudioTracks().length) pc.addTransceiver('audio', { direction: 'recvonly' });
      pc.onicecandidate = (e) => e.candidate && send({ type: 'ice', candidate: e.candidate });
      pc.ontrack = (e) => { if (remoteRef.current) remoteRef.current.srcObject = e.streams[0]; };
      pc.onconnectionstatechange = () => {
        const c = pc.connectionState;
        set('rtc', c === 'connected' ? 'ok' : c === 'failed' ? 'error' : c === 'disconnected' || c === 'closed' ? 'off' : 'connecting');
        if (c === 'failed') say('Video connection failed. Restrictive networks may need a TURN server.');
      };
      pcRef.current = pc;
      return pc;
    };

    (async () => {
      let s = null;
      try { s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); set('cam', 'ok'); set('mic', 'ok'); }
      catch {
        try { s = await navigator.mediaDevices.getUserMedia({ video: true }); set('cam', 'ok'); set('mic', 'error'); say('Microphone unavailable or permission denied.'); }
        catch { set('cam', 'error'); set('mic', 'error'); say('Camera/microphone permission denied. You can still read the other person’s text.'); }
      }
      if (closed) { s && s.getTracks().forEach((t) => t.stop()); return; }
      streamRef.current = s; setStream(s);

      const base = import.meta.env.VITE_WS_URL || `ws://${location.hostname}:8000`;
      let ws;
      try { ws = new WebSocket(`${base}/ws/${room}/${pid}?name=${encodeURIComponent(name)}&create=${create}`); }
      catch { set('ws', 'error'); setFatal('Invalid server address.'); return; }
      wsRef.current = ws;
      ws.onopen = () => set('ws', 'ok');
      ws.onerror = () => { set('ws', 'error'); say('Server unavailable. Is the backend running on port 8000?'); };
      ws.onclose = () => { if (!closed) setSt((x) => ({ ...x, ws: x.ws === 'error' ? 'error' : 'off' })); };
      ws.onmessage = async (ev) => {
        let m; try { m = JSON.parse(ev.data); } catch { return; }
        try {
          if (m.type === 'error') { setFatal(m.message); set('ws', 'error'); }
          else if (m.type === 'peer-joined') {
            setPeer(m.name); const pc = makePc();
            await pc.setLocalDescription(await pc.createOffer());
            send({ type: 'offer', sdp: pc.localDescription });
          } else if (m.type === 'offer') {
            setPeer(m.name); const pc = makePc();
            await pc.setRemoteDescription(m.sdp);
            await pc.setLocalDescription(await pc.createAnswer());
            send({ type: 'answer', sdp: pc.localDescription });
          } else if (m.type === 'answer') await pcRef.current?.setRemoteDescription(m.sdp);
          else if (m.type === 'ice') { try { await pcRef.current?.addIceCandidate(m.candidate); } catch {} }
          else if (m.type === 'peer-left') {
            pcRef.current?.close(); pcRef.current = null;
            if (remoteRef.current) remoteRef.current.srcObject = null;
            setPeer(''); set('rtc', 'connecting'); say('The other participant left the call.');
          } else if (m.type === 'text') { setMsgs((p) => [...p, { who: m.name, source: m.source, text: m.text }]); if (m.speak && m.source === 'sign') speak(m.text, m.lang, say); }
        } catch { say('Connection hiccup — rejoin the room if video does not appear.'); }
      };
    })();

    return () => {
      closed = true; listenRef.current = false; clearTimeout(restartT.current); try { window.speechSynthesis?.cancel(); } catch {}
      try { recRef.current?.stop(); } catch {}
      wsRef.current?.close(); pcRef.current?.close(); pcRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop()); shareRef.current?.stop();
    };
    // eslint-disable-next-line
  }, [room]);

  useEffect(() => { if (localRef.current && stream) localRef.current.srcObject = stream; }, [stream]);

  const sign = useSign(localRef, signOn && st.cam === 'ok', (t, l) => sendText(t, 'sign', { lang: BCP[l] || 'en-US', speak: voiceOn }), signLang);

  const toggleMic = () => { const t = streamRef.current?.getAudioTracks()[0]; if (!t) return say('No microphone available.'); t.enabled = !micOn; setMicOn(!micOn); };
  const toggleCam = () => { const t = streamRef.current?.getVideoTracks()[0]; if (!t) return say('No camera available.'); t.enabled = !camOn; setCamOn(!camOn); };
  const videoSender = () => pcRef.current?.getSenders().find((x) => x.track?.kind === 'video');
  const stopShare = async () => {
    shareRef.current?.stop(); shareRef.current = null;
    const cam = streamRef.current?.getVideoTracks()[0];
    if (cam) await videoSender()?.replaceTrack(cam);
    setSharing(false);
  };
  const toggleShare = async () => {
    if (sharing) return stopShare();
    if (!navigator.mediaDevices?.getDisplayMedia) return say('Screen sharing is not supported in this browser.');
    if (!videoSender()) return say('Screen sharing works once the other person has joined.');
    try {
      const d = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const tr = d.getVideoTracks()[0];
      await videoSender()?.replaceTrack(tr);
      tr.onended = stopShare; shareRef.current = tr; setSharing(true);
    } catch { say('Screen sharing cancelled.'); }
  };

  const startSpeech = (l = lang) => {
    if (!SR) return say('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    const r = new SR(); r.lang = l; r.continuous = true; r.interimResults = true;
    r.onresult = (e) => {
      let it = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) { const t = res[0].transcript.trim(); if (t) sendText(t, 'speech'); } else it += res[0].transcript;
      }
      setInterim(it);
    };
    r.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { say('Microphone permission denied for speech recognition.'); listenRef.current = false; setListening(false); }
      else if (e.error === 'language-not-supported') { say('This language is not supported by your browser.'); listenRef.current = false; setListening(false); }
      else if (e.error !== 'no-speech' && e.error !== 'aborted') say('Speech recognition error: ' + e.error);
    };
    r.onend = () => { if (listenRef.current) { try { r.start(); } catch {} } else setListening(false); };
    recRef.current = r; listenRef.current = true; setListening(true);
    try { r.start(); } catch {}
  };
  const changeSpeechLang = (v) => {            // switch language: stop safely, then start a fresh session
    setLang(v);
    if (!listenRef.current) return;
    const old = recRef.current; listenRef.current = false;
    if (old) { old.onend = null; old.onresult = null; old.onerror = null; try { old.abort(); } catch {} }
    setInterim(''); clearTimeout(restartT.current);
    restartT.current = setTimeout(() => startSpeech(v), 250);
  };
  const stopSpeech = () => { clearTimeout(restartT.current); listenRef.current = false; try { recRef.current?.stop(); } catch {} setListening(false); setInterim(''); };

  const status = !signOn ? 'Sign recognition is OFF' : st.cam !== 'ok' ? 'Camera not available' : sign.status === 'loading' ? 'Loading AI model…'
    : sign.status === 'error' ? sign.error : !sign.hand ? 'No hand detected' : sign.current ? 'Gesture recognized' : 'Gesture not recognized — please try again.';
  const lastWord = sign.words[sign.words.length - 1];
  const suggestions = lastWord && signLang === 'en' ? byId(lastWord).suggest || [] : []; // suggestion phrases are English-only
  const lastRemote = [...msgs].reverse().find((m) => !m.me);
  const aiState = !signOn ? 'off' : sign.status === 'ready' ? 'ok' : sign.status === 'error' ? 'error' : sign.status === 'loading' ? 'connecting' : 'off';
  const copyId = async () => { try { await navigator.clipboard.writeText(room); say('Room ID copied.'); } catch { say('Copy failed.'); } };

  return (
    <div>
      {toast && <div className="toast" role="alert">{toast}</div>}
      {fatal && <div className="overlay"><div className="card" role="alertdialog"><h2>Cannot join this room</h2><p>{fatal}</p><button className="btn pri" onClick={() => nav('/join')}>Back</button></div></div>}
      <div className="wrap"><nav className="nav">
        <Link to="/" className="logo">SIGN<b>CONNECT</b> AI</Link>
        <div className="row"><span>Room <b>{room}</b></span><button className="btn sm" onClick={copyId} aria-label="Copy room ID"><Copy size={14} /> Copy</button><Access /></div>
      </nav>
        <div className="row"><Pill label="Camera" s={st.cam} /><Pill label="Microphone" s={st.mic} /><Pill label="AI Recognition" s={aiState} /><Pill label="WebSocket" s={st.ws} /><Pill label="Video" s={st.rtc} /></div></div>

      <main className="call">
        <div>
          <div className="stage">
            <video ref={remoteRef} autoPlay playsInline aria-label="Remote participant video" />
            {st.rtc !== 'ok' && <div className="wait"><div><h3>{peer ? `Connecting to ${peer}…` : 'Waiting for someone to join…'}</h3><p>Share Room ID <b>{room}</b></p></div></div>}
            {caps && lastRemote && <div className="cap" aria-live="polite">{lastRemote.who}: {lastRemote.text}</div>}
            <div className="pip"><video ref={localRef} className="mirror" autoPlay playsInline muted aria-label="Your camera preview" /></div>
          </div>
          <p className="muted">Video is processed for real-time communication and is not permanently stored by the prototype.</p>
        </div>

        <aside className="side">
          <div className="card"><h3>LIVE SIGN TRANSLATION</h3><div className="muted">Supported Prototype Gesture Vocabulary — {GESTURES.length} Signs (intended for demonstration)</div>
            <label htmlFor="sign-language" className="muted" style={{ display: 'block', marginTop: 8 }}>Output Language:</label>
            <select id="sign-language" value={signLang} onChange={(e) => setSignLang(e.target.value)} aria-label="Sign output language">
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
            <div className="row" style={{ marginTop: 8 }}><span className="muted" id="voice-label">Voice Output:</span>
              <button className={`btn sm ${voiceOn ? 'on' : ''}`} role="switch" aria-checked={voiceOn} aria-labelledby="voice-label" onClick={() => setVoiceOn(!voiceOn)}>{voiceOn ? 'ON' : 'OFF'}</button></div>
            <div className="muted">The other person hears your signs in the selected language on their device{!TTS ? ' (voice is not supported in this browser)' : ''}.</div>
            <p role="status" style={{ color: 'var(--warn)', margin: '6px 0' }}>{status}</p>
            <div className="muted">Detected</div><div className="big" aria-live="polite">{sign.current ? (signLang === 'en' ? sign.current.text.toUpperCase() : sign.current.text) : '—'}</div>
            <div className="muted">Confidence: {sign.current ? Math.round(sign.current.conf * 100) + '%' : '—'}</div>
            {sign.words.length > 0 && <p>Building sentence: <b>{sign.words.map((w) => getText(w, signLang)).join(' ')}</b> <span className="muted">(sends after a pause)</span></p>}
            {suggestions.length > 0 && <div><div className="muted">Did you mean:</div>{suggestions.map((s) => <button key={s} className="btn sm" style={{ margin: 3 }} onClick={() => { sendText(s, 'sign', { lang: 'en-US', speak: voiceOn }); sign.reset(); }}>{s}</button>)}</div>}
            <details style={{ marginTop: 8 }}><summary>Gesture guide ({GESTURES.length} signs)</summary>
              <div className="log" style={{ marginTop: 6 }}>{GESTURES.map((g) => <div className="gest" key={g.id}><b>{getText(g.id, signLang)}</b><span className="muted">{g.hint}</span></div>)}</div></details>
            <div className="log" style={{ marginTop: 8 }}>{msgs.filter((m) => m.source === 'sign').slice(-4).map((m, i) => <div className="msg" key={i}><b>{m.who}:</b> {m.text}</div>)}
              {!msgs.some((m) => m.source === 'sign') && <p className="muted">No signs yet. Show a gesture to your camera.</p>}</div>
          </div>

          <div className="card"><h3>LIVE SPEECH</h3>
            <label htmlFor="speech-language" className="muted">Speech Language:</label>
            <div className="row"><select id="speech-language" value={lang} onChange={(e) => changeSpeechLang(e.target.value)} aria-label="Speech language" style={{ flex: 1 }}>{SPEECH_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}</select>
              <button className={`btn ${listening ? 'red' : 'pri'}`} onClick={() => (listening ? stopSpeech() : startSpeech())}>{listening ? 'Stop' : 'Start'} listening</button></div>
            {!SR && <p className="muted">Speech recognition isn’t supported in this browser — use Chrome or Edge.</p>}
            <p className="muted">Recognition depends on your browser/device (Chrome or Edge recommended); some languages may not be supported.</p>
            <div className="log" style={{ marginTop: 8 }}>{msgs.filter((m) => m.source === 'speech').slice(-3).map((m, i) => <div className="msg" key={i}><b>{m.who}:</b> {m.text}</div>)}
              {interim && <div className="msg muted">{interim}…</div>}
              {!interim && !msgs.some((m) => m.source === 'speech') && <p className="muted">Press Start and speak.</p>}</div>
          </div>

          <div className="card"><div className="row" style={{ justifyContent: 'space-between' }}><h3>Conversation</h3><button className="btn sm" onClick={() => setMsgs([])}><Trash2 size={14} /> Clear</button></div>
            <div className="log" aria-live="polite">{msgs.length ? msgs.map((m, i) => <div key={i} className={`msg ${m.me ? 'me' : ''}`}><b>{m.who}</b> <span className="muted">({m.source})</span><br />{m.text}</div>) : <p className="muted">Transcript is kept only for this call.</p>}</div></div>

          <div className="card"><h3><Siren size={18} /> Emergency phrases</h3><div className="muted">A communication shortcut — not an emergency service.</div>
            {EMERGENCY.map((e) => <button key={e} className="btn red" style={{ width: '100%', marginTop: 6 }} onClick={() => sendText(e, 'emergency')}>{e}</button>)}</div>
        </aside>
      </main>

      <div className="bar" role="toolbar" aria-label="Call controls">
        <button className={`btn ${micOn ? '' : 'off'}`} onClick={toggleMic} aria-pressed={!micOn} aria-label="Toggle microphone">{micOn ? <Mic /> : <MicOff />}</button>
        <button className={`btn ${camOn ? '' : 'off'}`} onClick={toggleCam} aria-pressed={!camOn} aria-label="Toggle camera">{camOn ? <Video /> : <VideoOff />}</button>
        <button className={`btn ${sharing ? 'on' : ''}`} onClick={toggleShare} aria-label="Toggle screen sharing"><MonitorUp /></button>
        <button className={`btn ${signOn ? 'on' : ''}`} onClick={() => setSignOn(!signOn)} aria-pressed={signOn}><Hand /> Sign recognition {signOn ? 'ON' : 'OFF'}</button>
        <button className={`btn ${caps ? 'on' : ''}`} onClick={() => setCaps(!caps)} aria-pressed={caps}><Captions /> Captions {caps ? 'ON' : 'OFF'}</button>
        <button className="btn red" onClick={() => nav('/')} aria-label="End call"><PhoneOff /> End</button>
      </div>
    </div>
  );
}
