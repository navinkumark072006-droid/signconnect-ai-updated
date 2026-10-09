import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { GESTURES, LANGUAGES } from '../data/gestures';
import { useSign } from '../hooks/useSign';
import { Access } from '../App.jsx';

export default function Demo() {
  const vref = useRef(null);
  const [cam, setCam] = useState('connecting'), [log, setLog] = useState([]), [signLang, setSignLang] = useState('en');
  useEffect(() => {
    let s, dead = false;
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((m) => { if (dead) return m.getTracks().forEach((t) => t.stop()); s = m; vref.current.srcObject = m; setCam('ok'); })
      .catch(() => setCam('error'));
    return () => { dead = true; s && s.getTracks().forEach((t) => t.stop()); };
  }, []);
  const sign = useSign(vref, cam === 'ok', (t) => setLog((l) => [t, ...l].slice(0, 6)), signLang);
  const msg = cam === 'error' ? 'Camera permission denied or no camera found.' : sign.status === 'loading' ? 'Loading AI model…' : sign.status === 'error' ? sign.error
    : !sign.hand ? 'No hand detected' : sign.current ? '' : 'Gesture not recognized — please try again.';
  return (
    <div className="wrap">
      <nav className="nav"><Link to="/" className="logo">SIGN<b>CONNECT</b> AI — DEMO</Link><Access /></nav>
      <div className="flow card" style={{ marginBottom: 14 }}><span className="s">Camera</span>→<span className="s">Gesture Detection</span>→<span className="s">Recognized Sign</span>→<span className="s">Text Translation</span>→<span className="s">Live Communication</span></div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
        <div className="card">
          <video ref={vref} className="vid mirror" autoPlay playsInline muted aria-label="Your camera" />
          <p><span className={`dot ${cam}`} />Camera: {cam === 'ok' ? 'Connected' : cam === 'error' ? 'Error' : 'Connecting'} &nbsp; <span className={`dot ${sign.status === 'ready' ? 'ok' : sign.status === 'error' ? 'error' : 'connecting'}`} />AI: {sign.status}</p>
          <label htmlFor="sign-language-demo" className="muted">Output Language:</label>
          <select id="sign-language-demo" value={signLang} onChange={(e) => setSignLang(e.target.value)} aria-label="Sign output language">{LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}</select>
          <div className="muted">Detected</div><div className="big" aria-live="polite">{sign.current ? (signLang === 'en' ? sign.current.text.toUpperCase() : sign.current.text) : '—'}</div>
          <div className="muted">Confidence: {sign.current ? Math.round(sign.current.conf * 100) + '%' : '—'}</div>
          {msg && <p role="status" style={{ color: 'var(--warn)' }}>{msg}</p>}
          <h3>Sentences sent</h3>{log.length ? log.map((t, i) => <div className="msg" key={i}>{t}</div>) : <p className="muted">Nothing yet — try a gesture.</p>}
        </div>
        <div className="card"><h3>Supported Prototype Gesture Vocabulary — {GESTURES.length} Signs</h3><p className="muted">Intended for demonstration. Motion signs: start moving right after showing the pose.</p>
          <div className="grid" style={{ gap: 6, maxHeight: 560, overflow: 'auto' }}>{GESTURES.map((g) => <div key={g.id} className={`gest ${sign.current?.id === g.id ? 'hit' : ''}`}><b>{g.text}</b><span className="muted">{g.hint}</span></div>)}</div></div>
      </div>
    </div>
  );
}
