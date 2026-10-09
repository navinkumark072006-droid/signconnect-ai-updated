import { useCallback, useEffect, useRef, useState } from 'react';
import { getText, sentence } from '../data/gestures';
import { classifyFrame, MOTION_IDS } from '../data/engine';

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

/** Real-time hand landmark detection + temporal smoothing + debounce. Runs ~14 fps, fully in-browser. */
export function useSign(videoRef, enabled, onSentence, language = 'en') {
  const [s, setS] = useState({ status: 'idle', error: '', hand: false, current: null, words: [] });
  const cb = useRef(onSentence); cb.current = onSentence;
  const languageRef = useRef(language); languageRef.current = language; // always-fresh language: MediaPipe is NOT re-initialised on change
  const wordsRef = useRef([]); const timer = useRef(null);
  const reset = useCallback(() => { wordsRef.current = []; clearTimeout(timer.current); setS((p) => ({ ...p, words: [] })); }, []);

  useEffect(() => {
    if (!enabled) { setS((p) => ({ ...p, status: 'idle', hand: false, current: null })); return; }
    let stop = false, raf, lm, last = 0, win = [], lastId = null, gone = true, miss = 0, key = '';
    const trail = []; let lockUntil = 0; // trail = recent hand positions for motion signs
    setS((p) => ({ ...p, status: 'loading', error: '' }));

    const commit = (id) => {
      wordsRef.current = [...wordsRef.current, id];
      setS((p) => ({ ...p, words: wordsRef.current }));
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {          // pause => send formed sentence
        const w = wordsRef.current; wordsRef.current = [];
        setS((p) => ({ ...p, words: [] }));
        if (w.length) cb.current(sentence(w, languageRef.current), languageRef.current);
      }, 3500);
    };

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      const v = videoRef.current;
      if (!v || v.readyState < 2 || t - last < 70) return;
      last = t;
      let hand = false, cur = null;
      try {
        const r = lm.detectForVideo(v, performance.now());
        hand = r.landmarks.length > 0;
        if (hand) {
          miss = 0;
          win.push(classifyFrame(r.landmarks[0], trail)); if (win.length > 8) win.shift();
          const cnt = {}; win.forEach((x) => { if (x) cnt[x] = (cnt[x] || 0) + 1; });
          const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
          if (top && top[1] >= 6) {                // temporal smoothing: >=6 of last 8 frames agree
            cur = { id: top[0], conf: top[1] / win.length };
            if (cur.id !== lastId || gone) {                // repeat suppression
              if (performance.now() < lockUntil && !MOTION_IDS.has(cur.id)) { lastId = cur.id; gone = false; cur = null; } // pose settling after a motion sign: don't fire a static sign
              else { commit(cur.id); lastId = cur.id; gone = false; if (MOTION_IDS.has(cur.id)) lockUntil = performance.now() + 1500; }
            }
          }
        } else { win = []; trail.length = 0; if (++miss >= 4) gone = true; }
      } catch { return; }
      const k = `${hand}|${cur ? cur.id + cur.conf.toFixed(2) : ''}`;
      if (k !== key) { key = k; setS((p) => ({ ...p, hand, current: cur })); }
    };

    (async () => {
      try {
        const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
        const fs = await FilesetResolver.forVisionTasks(WASM);
        lm = await HandLandmarker.createFromOptions(fs, { baseOptions: { modelAssetPath: MODEL }, runningMode: 'VIDEO', numHands: 1 });
        if (stop) { lm.close(); return; }
        setS((p) => ({ ...p, status: 'ready' }));
        raf = requestAnimationFrame(loop);
      } catch {
        setS((p) => ({ ...p, status: 'error', error: 'AI model failed to load. Check your internet connection and refresh.' }));
      }
    })();
    return () => { stop = true; cancelAnimationFrame(raf); clearTimeout(timer.current); try { lm && lm.close(); } catch {} };
  }, [enabled, videoRef]);

  // text is derived at render time so the dropdown updates the detected gesture immediately
  return { ...s, current: s.current ? { ...s.current, text: getText(s.current.id, language) } : null, reset };
}
