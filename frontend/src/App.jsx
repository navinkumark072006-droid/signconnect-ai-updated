import { useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { Contrast, Copy, ShieldCheck } from 'lucide-react';
import { GESTURES } from './data/gestures';
import Call from './pages/Call.jsx';
import Demo from './pages/Demo.jsx';

export function Access() {
  const [hc, setHc] = useState(false), [rm, setRm] = useState(false);
  const t = (cls, v, set) => { document.documentElement.classList.toggle(cls, !v); set(!v); };
  return (
    <div className="row">
      <button className={`btn sm ${hc ? 'on' : ''}`} aria-pressed={hc} onClick={() => t('hc', hc, setHc)}><Contrast size={16} /> High contrast</button>
      <button className={`btn sm ${rm ? 'on' : ''}`} aria-pressed={rm} onClick={() => t('rm', rm, setRm)}>Reduce motion</button>
    </div>
  );
}

function Landing() {
  const steps = [['Camera', 'Your webcam is read locally in the browser.'], ['Hand landmarks', 'MediaPipe finds 21 hand points in real time.'], ['Gesture → text', 'A rule-based classifier maps landmarks to words.'], ['Live call', 'Text travels over WebSocket next to a WebRTC video call.']];
  return (
    <div className="wrap">
      <nav className="nav" aria-label="Main"><div className="logo">SIGN<b>CONNECT</b> AI</div><div className="row"><Access /><Link className="btn" to="/demo">Demo Mode</Link></div></nav>
      <header className="hero">
        <h1>SIGNCONNECT AI</h1>
        <p className="tag">“Breaking Communication Barriers in Real Time.”</p>
        <p className="muted" style={{ maxWidth: 680, margin: '0 auto 24px' }}>A video-call platform where sign gestures become live text for the other person, and spoken words become live captions for the signer.</p>
        <Link className="btn pri" to="/join">Start Communication</Link>
      </header>
      <section><h2>How it works</h2><div className="grid g3">{steps.map((s, i) => <div className="card" key={s[0]}><div className="num">{i + 1}</div><h3>{s[0]}</h3><p className="muted">{s[1]}</p></div>)}</div>
        <p className="muted">Sign → AI → Text → Video call &nbsp;|&nbsp; Speech → Speech recognition → Text → Video call</p></section>
      <section><h2>Accessibility features</h2>{['Large live captions', 'High-contrast mode', 'Reduced-motion option', 'Full keyboard navigation', 'Screen-reader labels', 'Emergency phrase shortcuts', 'Text-first communication'].map((x) => <span className="pill" key={x}>{x}</span>)}</section>
      <section><h2>Technology</h2>{['React + Vite', 'MediaPipe Hand Landmarker', 'WebRTC', 'WebSocket (FastAPI)', 'Web Speech API + Speech Synthesis (11 languages)', 'Public STUN'].map((x) => <span className="pill" key={x}>{x}</span>)}</section>
      <section><h2>Supported Prototype Gesture Vocabulary — {GESTURES.length} Signs</h2><p className="muted">Prototype gesture vocabulary — intended for demonstration. It is not a complete or official sign language.</p>
        <div className="grid g3">{GESTURES.map((g) => <div className="gest" key={g.id}><b>{g.text}</b><span className="muted">{g.hint}</span></div>)}</div></section>
      <section className="card"><h2><ShieldCheck size={20} /> About & privacy</h2><p className="muted">Built for Innovators Day as a limited-vocabulary prototype; accuracy depends on lighting and hand position. Video is processed for real-time communication and is not permanently stored by the prototype. Gesture detection runs locally in your browser.</p></section>
      <footer>© SIGNCONNECT AI — Innovators Day prototype</footer>
    </div>
  );
}

const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const makeId = () => Array.from({ length: 6 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('');

function Join() {
  const nav = useNavigate();
  const [tab, setTab] = useState('create'), [name, setName] = useState(''), [mode, setMode] = useState('sign');
  const [newId] = useState(makeId), [joinId, setJoinId] = useState(''), [err, setErr] = useState(''), [copied, setCopied] = useState(false);
  const go = (id, create) => {
    if (!name.trim()) return setErr('Please enter a display name.');
    if (!/^[A-Z0-9]{6}$/.test(id)) return setErr('Room ID must be 6 letters/numbers.');
    nav(`/call/${id}?name=${encodeURIComponent(name.trim())}&mode=${mode}${create ? '&create=1' : ''}`);
  };
  const copy = async () => { try { await navigator.clipboard.writeText(newId); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setErr('Copy failed — select the ID manually.'); } };
  return (
    <div className="wrap" style={{ maxWidth: 520 }}>
      <nav className="nav"><Link to="/" className="logo">SIGN<b>CONNECT</b> AI</Link><Access /></nav>
      <div className="card" style={{ marginTop: 30 }}>
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'create'} className={`btn ${tab === 'create' ? 'on' : ''}`} onClick={() => { setTab('create'); setErr(''); }}>Create Room</button>
          <button role="tab" aria-selected={tab === 'join'} className={`btn ${tab === 'join' ? 'on' : ''}`} onClick={() => { setTab('join'); setErr(''); }}>Join Room</button>
        </div>
        <label>Display name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="e.g. Priya" /></label>
        <label style={{ display: 'block', marginTop: 12 }}>Communication mode
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="sign">I sign (sign recognition ON)</option>
            <option value="speak">I speak (sign recognition OFF)</option>
          </select></label>
        {tab === 'create' ? (
          <div style={{ marginTop: 16 }}>
            <p className="muted">Share this Room ID with the other person:</p>
            <div className="row"><div className="big" aria-label="Room ID">{newId}</div><button className="btn sm" onClick={copy}><Copy size={16} /> {copied ? 'Copied!' : 'Copy Room ID'}</button></div>
            <button className="btn pri" style={{ width: '100%', marginTop: 10 }} onClick={() => go(newId, true)}>Create & Join</button>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <label>Room ID<input value={joinId} onChange={(e) => setJoinId(e.target.value.toUpperCase())} maxLength={6} placeholder="ABC123" /></label>
            <button className="btn pri" style={{ width: '100%', marginTop: 10 }} onClick={() => go(joinId, false)}>Join</button>
          </div>
        )}
        {err && <p role="alert" style={{ color: 'var(--err)' }}>{err}</p>}
        <p className="muted"><ShieldCheck size={14} /> Video is processed for real-time communication and is not permanently stored by the prototype.</p>
      </div>
    </div>
  );
}

export default function App() {
  return <Routes><Route path="/" element={<Landing />} /><Route path="/join" element={<Join />} /><Route path="/call/:room" element={<Call />} /><Route path="/demo" element={<Demo />} /></Routes>;
}
