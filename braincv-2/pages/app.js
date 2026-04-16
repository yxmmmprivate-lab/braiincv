import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { auth, db, provider } from '../lib/firebase';
import {
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, onAuthStateChanged, signOut
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, updateDoc, increment, collection, query, where, getDocs
} from 'firebase/firestore';

// ─── Constants ───────────────────────────────────────────
const ROLES = [
  'Software Engineer','Product Manager','Data Analyst','UX Designer',
  'Marketing Manager','Business Development','Sales Representative',
  'Content Creator','Graphic Designer','Financial Analyst','HR Manager',
  'Operations Manager','Teacher / Educator','Customer Service',
  'Healthcare Worker','Researcher','Entrepreneur / Founder','Other',
];

const QUESTIONS = [
  "Tell me about your most recent job, internship, or experience — even a part-time or volunteer role counts.",
  "What did you actually do on a day-to-day basis in that role? Just describe it naturally.",
  "Did you accomplish anything you're proud of? Think about problems you solved, things you improved, or projects you finished.",
  "Can you give me any numbers? For example: how many customers, what percentage something improved, how big was your team?",
  "What skills did you use or learn? Tools, software, languages, soft skills — anything goes.",
  "Do you have any education, certifications, or side projects you'd like to include?",
  "Last one — how would your manager or teammates describe you in one sentence?",
];

const MOCK_RESUME = {
  summary: "Driven and detail-oriented professional with demonstrated experience in customer service and retail operations. Proven ability to enhance customer satisfaction, streamline processes, and contribute to team goals in fast-paced environments.",
  experience: [{
    title: "Sales Associate", company: "RetailCo", date: "2022 – 2024",
    bullets: [
      "Served 80+ customers daily, maintaining a 96% satisfaction rating",
      "Increased upsell conversions by 23% through consultative selling",
      "Trained 5 new team members, reducing onboarding time by 30%",
      "Managed inventory for 200+ SKUs with 99.5% accuracy",
    ],
  }],
  skills: ["Customer Service","Sales","Inventory Management","Team Collaboration","POS Systems","Problem Solving","Communication","Time Management"],
  education: "Bachelor of Business Administration — Hanyang University, Seoul (2022)",
};

// ─── Helpers ─────────────────────────────────────────────
function makeSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Math.random().toString(36).slice(2, 6);
}

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
}

// ─── Sub-components ──────────────────────────────────────
function ResumeCard({ userInfo, resume }) {
  return (
    <div className="resume-preview">
      <div className="resume-header-bar">
        <div className="resume-photo">
          {userInfo.photo
            ? <img src={userInfo.photo} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials(userInfo.name)}
        </div>
        <div style={{ flex: 1 }}>
          <div className="resume-name">{userInfo.name}</div>
          <div className="resume-role-text">{userInfo.targetRole}</div>
          <div className="resume-contact">
            <span>✉ {userInfo.email}</span>
            <span>🔗 brainresume.site/r/{userInfo.slug}</span>
          </div>
        </div>
      </div>
      <div className="resume-body">
        <div className="resume-section">
          <div className="resume-section-title">About</div>
          <div className="resume-summary">{resume.summary}</div>
        </div>
        <div className="resume-section">
          <div className="resume-section-title">Experience</div>
          {resume.experience?.map((exp, i) => (
            <div key={i} className="resume-exp-item">
              <div className="resume-exp-header">
                <div>
                  <div className="resume-exp-title">{exp.title}</div>
                  <div className="resume-exp-company">{exp.company}</div>
                </div>
                <div className="resume-exp-date">{exp.date}</div>
              </div>
              <ul className="resume-bullets">{exp.bullets?.map((b, j) => <li key={j}>{b}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="resume-section">
          <div className="resume-section-title">Skills</div>
          <div className="skills-wrap">{resume.skills?.map((s, i) => <span key={i} className="skill-pill">{s}</span>)}</div>
        </div>
        {resume.education && (
          <div className="resume-section">
            <div className="resume-section-title">Education</div>
            <div className="resume-summary">{resume.education}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Screens ─────────────────────────────────────────────

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmail = async () => {
    if (!email || !password) return;
    setLoading(true); setError('');
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      setError(e.message.replace('Firebase: ', '').replace(/\(auth\/[^)]+\)/, '').trim());
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try { await signInWithPopup(auth, provider); }
    catch (e) { setError('Google sign-in failed. Try again.'); }
    setLoading(false);
  };

  return (
    <div className="app-shell">
      <div className="app-topbar">
        <Link href="/" className="app-topbar-logo">Brain<span>CV</span></Link>
      </div>
      <div className="onboard-center">
        <div className="onboard-card">
          <div className="onboard-title" style={{ marginBottom: 4 }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</div>
          <div className="onboard-sub">{mode === 'login' ? 'Sign in to continue building your resume.' : 'Free to start. No credit card needed.'}</div>

          <button onClick={handleGoogle} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1.5px solid rgba(28,26,24,.15)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 15, fontFamily: "'DM Sans',sans-serif", marginBottom: 20, fontWeight: 500, transition: 'border-color .2s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, color: 'var(--muted)', fontSize: 13 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--cream-dark)' }} /> or <div style={{ flex: 1, height: 1, background: 'var(--cream-dark)' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmail()} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmail()} />
          </div>
          {error && <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 12, background: '#fff5f5', padding: '10px 14px', borderRadius: 8 }}>{error}</div>}
          <button className="btn-full" onClick={handleEmail} disabled={loading || !email || !password}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
          <div className="microcopy" style={{ marginTop: 20, cursor: 'pointer' }} onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); }}>
            {mode === 'login' ? "Don't have an account? Sign up free" : 'Already have an account? Sign in'}
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingScreen({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user.displayName || '');
  const [targetRole, setTargetRole] = useState('');
  const [photo, setPhoto] = useState(user.photoURL || null);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setPhoto(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = () => {
    const slug = makeSlug(name);
    onComplete({ name, targetRole, photo, slug, email: user.email });
  };

  return (
    <div className="app-shell">
      <div className="app-topbar">
        <Link href="/" className="app-topbar-logo">Brain<span>CV</span></Link>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>Setup {step}/2</span>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: step === 1 ? '50%' : '100%' }} /></div>
      <div className="onboard-center">
        {step === 1 ? (
          <div className="onboard-card">
            <div className="onboard-step-label">Step 1 of 2</div>
            <div className="onboard-title">Let&apos;s set up your profile</div>
            <div className="onboard-sub">This takes 30 seconds. You can update it anytime.</div>
            <label className="photo-upload">
              {photo
                ? <img src={photo} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <><div style={{ fontSize: 28 }}>📷</div><div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, textAlign: 'center' }}>Add photo<br />(optional)</div></>}
              <input type="file" accept="image/*" onChange={handlePhoto} />
            </label>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="e.g. Kim Soo-yeon" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Target Role *</label>
              <select className="form-select" value={targetRole} onChange={e => setTargetRole(e.target.value)}>
                <option value="">Select your target role...</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button className="btn-full" disabled={!name.trim() || !targetRole} onClick={() => setStep(2)}>Continue →</button>
            <div className="microcopy">Don&apos;t worry — just type anything. We&apos;ll make it professional.</div>
          </div>
        ) : (
          <div className="onboard-card">
            <div className="onboard-step-label">Step 2 of 2</div>
            <div className="onboard-title">You&apos;re all set, {name.split(' ')[0]}! 🌿</div>
            <div className="onboard-sub">We&apos;ll ask ~7 simple questions and build your resume automatically.</div>
            <div style={{ background: 'var(--cream-dark)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 28 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,var(--forest),var(--sage))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, overflow: 'hidden', flexShrink: 0 }}>
                  {photo ? <img src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/> : initials(name)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{name}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Targeting: {targetRole}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>🔗 brainresume.site/r/{name.toLowerCase().replace(/\s+/g, '-')}</div>
            </div>
            {['Answer ~7 quick questions', 'AI builds your resume', 'Get your shareable link'].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--forest)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: 15, color: 'var(--text)' }}>{s}</span>
              </div>
            ))}
            <button className="btn-full" style={{ marginTop: 24 }} onClick={handleComplete}>Start Brainstorming ✦</button>
            <div className="microcopy">Takes 3–5 minutes. You can regenerate anytime.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatScreen({ userInfo, onComplete }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi ${userInfo.name.split(' ')[0]}! 👋 I'm BrainCV — your personal resume brainstormer.\n\n${QUESTIONS[0]}` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const bottomRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const send = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');
    const newAnswers = [...answers, userMsg];
    setAnswers(newAnswers);
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const nextIndex = qIndex + 1;
    await new Promise(r => setTimeout(r, 700 + Math.random() * 500));

    if (nextIndex >= QUESTIONS.length) {
      setMessages(prev => [...prev, { role: 'ai', text: "That's everything I need! 🎉 Give me a moment to craft your professional resume…" }]);
      setIsTyping(false);
      await new Promise(r => setTimeout(r, 1000));
      onComplete(newAnswers);
      return;
    }

    let aiText;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentQuestion: QUESTIONS[qIndex], userAnswer: userMsg, nextQuestion: QUESTIONS[nextIndex] }),
      });
      const data = await res.json();
      aiText = data.text || QUESTIONS[nextIndex];
    } catch {
      const affirm = ['Got it!', 'That\'s helpful!', 'Nice — noted!', 'Perfect, thank you!'];
      aiText = `${affirm[qIndex % affirm.length]} ${QUESTIONS[nextIndex]}`;
    }

    setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    setQIndex(nextIndex);
    setIsTyping(false);
  };

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const progress = Math.min(((qIndex + 1) / QUESTIONS.length) * 100, 100);

  return (
    <div className="app-shell">
      <div className="app-topbar">
        <Link href="/" className="app-topbar-logo">Brain<span>CV</span></Link>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>Brainstorming</span>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      <div className="chat-shell">
        <div className="chat-progress">
          <span className="chat-progress-text">Question {Math.min(qIndex + 1, QUESTIONS.length)} of {QUESTIONS.length}</span>
          <div className="chat-progress-bar"><div className="chat-progress-fill" style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg-wrap ${m.role === 'user' ? 'user-wrap' : ''}`}>
              <div className={`msg-avatar ${m.role === 'user' ? 'user-av' : ''}`}>{m.role === 'ai' ? '✦' : initials(userInfo.name)}</div>
              <div className={`msg-bubble ${m.role === 'ai' ? 'ai-bubble' : 'user-bubble'}`}>{m.text}</div>
            </div>
          ))}
          {isTyping && (
            <div className="msg-wrap">
              <div className="msg-avatar">✦</div>
              <div className="msg-bubble ai-bubble"><div className="typing-dots"><div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" /></div></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="chat-input-area">
          <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginBottom: 8, fontStyle: 'italic' }}>Don&apos;t worry — just type anything. We&apos;ll make it professional.</div>
          <div className="chat-input-box">
            <textarea ref={textRef} className="chat-textarea" placeholder="Type your answer…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} rows={1} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} />
            <button className="chat-send" onClick={send} disabled={!input.trim() || isTyping}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22,2 15,22 11,13 2,9" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessingScreen({ userInfo, answers, onComplete }) {
  const [steps, setSteps] = useState(['active', '', '', '']);
  const labels = ['Analysing your experience…', 'Crafting bullet points…', 'Building skills section…', 'Finalising your resume…'];

  useEffect(() => {
    let cancelled = false;
    async function run() {
      for (let i = 0; i < labels.length; i++) {
        await new Promise(r => setTimeout(r, 900 + i * 300));
        if (cancelled) return;
        setSteps(prev => { const n = [...prev]; n[i] = 'done'; if (i + 1 < labels.length) n[i + 1] = 'active'; return n; });
      }
      if (cancelled) return;

      let resume = MOCK_RESUME;
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userInfo.name, targetRole: userInfo.targetRole, answers, questions: QUESTIONS }),
        });
        const data = await res.json();
        if (data.resume) resume = data.resume;
      } catch (e) { console.warn('Using mock resume:', e); }

      if (!cancelled) onComplete(resume);
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="app-shell">
      <div className="app-topbar"><Link href="/" className="app-topbar-logo">Brain<span>CV</span></Link></div>
      <div className="processing-screen">
        <div style={{ width: 80, height: 80, position: 'relative', margin: '0 auto 32px' }}>
          <div className="processing-ring" />
          <div className="processing-inner" />
        </div>
        <h2 className="processing-title">Building your resume</h2>
        <p className="processing-sub">Analysing your experience and crafting professional content…</p>
        <div className="processing-steps">
          {labels.map((l, i) => (
            <div key={i} className={`processing-step ${steps[i]}`}>
              <div className="dot" /><span className="processing-step-text">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardScreen({ userInfo, resume, onEdit, onRegenerate, resumeId }) {
  const [views] = useState(Math.floor(Math.random() * 20) + 5);
  const [copied, setCopied] = useState(false);
  const shareUrl = `brainresume.site/r/${userInfo.slug}`;

  const handleCopy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(`https://${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app-shell">
      <div className="app-topbar">
        <Link href="/" className="app-topbar-logo">Brain<span>CV</span></Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-outline" onClick={() => signOut(auth)}>Sign out</button>
          <a href={`/r/${userInfo.slug}`} target="_blank" rel="noreferrer" className="btn-forest" style={{ textDecoration: 'none' }}>🔗 View Profile</a>
        </div>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: '100%' }} /></div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        <div className="dashboard">
          <div className="analytics-bar">
            <div className="analytics-stat">
              <div className="analytics-num">{views}</div>
              <div className="analytics-label">Profile views</div>
            </div>
            <div className="analytics-divider" />
            <div className="analytics-stat">
              <div className="analytics-num" style={{ fontSize: 18, marginTop: 4 }}>Today</div>
              <div className="analytics-label">Last viewed</div>
            </div>
            <div className="analytics-divider" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, opacity: .75, marginBottom: 6 }}>Your resume link</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.1)', borderRadius: 8, padding: '8px 12px' }}>
                <span style={{ fontSize: 14, flex: 1 }}>{shareUrl}</span>
                <button onClick={handleCopy} style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: 'white', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>{copied ? '✓ Copied' : 'Copy'}</button>
              </div>
            </div>
          </div>
          <div className="dashboard-header">
            <div className="dashboard-title">Your Resume</div>
            <div className="dashboard-actions">
              <button className="btn-outline" onClick={onEdit}>✏️ Edit Answers</button>
              <button className="btn-outline" onClick={onRegenerate}>🔄 Regenerate</button>
              <button className="btn-forest" onClick={() => window.print()}>⬇ Download PDF</button>
            </div>
          </div>
          <ResumeCard userInfo={userInfo} resume={resume} />
          <div style={{ height: 40 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────
export default function AppPage() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [screen, setScreen] = useState('auth'); // auth | onboard | chat | processing | dashboard
  const [userInfo, setUserInfo] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [resume, setResume] = useState(null);
  const [resumeId, setResumeId] = useState(null);

  // Listen to Firebase auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setAuthUser(u);
      setAuthLoading(false);
      if (u) {
        // Check if user already has a resume saved
        try {
          const uDoc = await getDoc(doc(db, 'users', u.uid));
          if (uDoc.exists()) {
            const uData = uDoc.data();
            setUserInfo(uData);
            // Try to load saved resume
            const rSnap = await getDocs(query(collection(db, 'resumes'), where('userId', '==', u.uid)));
            if (!rSnap.empty) {
              const rData = rSnap.docs[0].data();
              setResumeId(rSnap.docs[0].id);
              setResume(rData.generatedResume);
              setScreen('dashboard');
              return;
            }
            setScreen('chat');
          } else {
            setScreen('onboard');
          }
        } catch (e) {
          setScreen('onboard');
        }
      } else {
        setScreen('auth');
      }
    });
    return unsub;
  }, []);

  const handleOnboardComplete = async (info) => {
    setUserInfo(info);
    try {
      await setDoc(doc(db, 'users', authUser.uid), { ...info, uid: authUser.uid, createdAt: new Date().toISOString() });
    } catch (e) { console.error('Save user:', e); }
    setScreen('chat');
  };

  const handleChatComplete = (ans) => {
    setAnswers(ans);
    setScreen('processing');
  };

  const handleResumeReady = async (gen) => {
    setResume(gen);
    try {
      const rRef = doc(collection(db, 'resumes'));
      setResumeId(rRef.id);
      await setDoc(rRef, {
        userId: authUser.uid,
        slug: userInfo.slug,
        rawAnswers: answers,
        generatedResume: gen,
        createdAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'analytics', rRef.id), { views: 0, resumeId: rRef.id });
    } catch (e) { console.error('Save resume:', e); }
    setScreen('dashboard');
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: 'var(--forest)', marginBottom: 16 }}>Brain<span style={{ color: 'var(--gold)' }}>CV</span></div>
          <div style={{ width: 32, height: 32, border: '3px solid var(--cream-dark)', borderTopColor: 'var(--forest)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>BrainCV — App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!authUser && <AuthScreen />}
      {authUser && screen === 'onboard' && <OnboardingScreen user={authUser} onComplete={handleOnboardComplete} />}
      {authUser && screen === 'chat' && <ChatScreen userInfo={userInfo} onComplete={handleChatComplete} />}
      {authUser && screen === 'processing' && <ProcessingScreen userInfo={userInfo} answers={answers} onComplete={handleResumeReady} />}
      {authUser && screen === 'dashboard' && resume && <DashboardScreen userInfo={userInfo} resume={resume} resumeId={resumeId} onEdit={() => setScreen('chat')} onRegenerate={() => setScreen('processing')} />}
    </>
  );
}
