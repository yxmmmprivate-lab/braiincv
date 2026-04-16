import Head from 'next/head';
import Link from 'next/link';

export default function Landing() {
  return (
    <>
      <Head>
        <title>BrainCV — Turn your thoughts into a professional resume</title>
        <meta name="description" content="No experience? No problem. Answer simple questions and get a professional resume in 5 minutes." />
        <meta property="og:title" content="BrainCV — AI-powered resume builder" />
        <meta property="og:description" content="Turn messy thoughts into a professional resume in 5 minutes." />
        <meta property="og:url" content="https://brainresume.site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Nav */}
      <nav className="nav">
        <a href="/" className="nav-logo">Brain<span>CV</span></a>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/app" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>Sign in</Link>
          <Link href="/app" className="nav-cta">Start for Free →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">✦ AI-powered resume brainstorming</div>
          <h1 className="hero-h1">Turn your messy thoughts into a <em>professional resume</em> in 5 minutes</h1>
          <p className="hero-sub">No experience? No problem. Just answer simple questions — we&apos;ll make it shine.</p>
          <div className="hero-cta-wrap">
            <Link href="/app" className="btn-primary">Start for Free ✦</Link>
            <a href="#how" className="btn-secondary">See how it works →</a>
          </div>

          {/* Demo chat preview */}
          <div style={{ marginTop: 64, animation: 'fadeUp .6s ease .5s both' }}>
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 32, maxWidth: 540, margin: '0 auto', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--cream-dark)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--forest),var(--sage))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16 }}>✦</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>BrainCV AI</div>
                  <div style={{ fontSize: 12, color: 'var(--sage)' }}>● Online</div>
                </div>
              </div>
              {[
                { role: 'ai', text: 'Tell me about your last job or experience — even a part-time role counts!' },
                { role: 'user', text: 'I worked part-time at a coffee shop for 2 years. Made drinks and helped customers.' },
                { role: 'ai', text: 'That\'s great! Did you handle any specific responsibilities — like training others or managing the register?' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14, flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.role === 'ai' ? 'linear-gradient(135deg,var(--forest),var(--sage))' : 'linear-gradient(135deg,var(--gold),#e8c06a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, flexShrink: 0 }}>
                    {m.role === 'ai' ? '✦' : 'U'}
                  </div>
                  <div style={{ padding: '12px 16px', borderRadius: 16, fontSize: 14, lineHeight: 1.5, maxWidth: '80%', background: m.role === 'ai' ? 'var(--cream-dark)' : 'var(--forest)', color: m.role === 'ai' ? 'var(--text)' : 'var(--cream)', borderBottomLeftRadius: m.role === 'ai' ? 4 : 16, borderBottomRightRadius: m.role === 'user' ? 4 : 16 }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--muted)', display: 'flex', justifyContent: 'center', gap: 6 }}>↓ Transforms into ↓</div>
            <div style={{ marginTop: 12, background: 'var(--white)', borderRadius: 'var(--radius)', padding: '20px 24px', boxShadow: 'var(--shadow)', maxWidth: 540, margin: '12px auto 0', textAlign: 'left' }}>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, fontWeight: 700 }}>Generated Bullet Point</div>
              <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6 }}>▸ Served 120+ customers daily in fast-paced café environment, maintaining &lt;3 min average wait time and achieving 4.9★ service rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how">
        <div className="section-inner">
          <span className="section-tag">How it works</span>
          <h2 className="section-h2">From scattered thoughts to polished resume</h2>
          <p className="section-sub">No templates. No blank pages. Just a conversation.</p>
          <div className="steps-grid">
            {[
              { n: '01', t: 'Tell us about yourself', d: 'Answer a few friendly AI questions about your experience. No formal writing needed — just talk naturally.' },
              { n: '02', t: 'AI builds your resume', d: 'Our AI extracts achievements, quantifies impact, and writes professional bullet points automatically.' },
              { n: '03', t: 'Share your profile', d: 'Get a beautiful resume + a shareable personal website link you can put anywhere.' },
            ].map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-num" data-num={s.n}>{s.n}</div>
                <div className="step-title">{s.t}</div>
                <div className="step-desc">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section features-bg">
        <div className="section-inner">
          <span className="section-tag">Features</span>
          <h2 className="section-h2">Everything you need to stand out</h2>
          <p className="section-sub">Built for people who feel stuck staring at a blank page.</p>
          <div className="feature-grid">
            {[
              { i: '🧠', t: 'AI Brainstorming', d: 'Smart questions that pull out your real accomplishments — even when you think you have none.' },
              { i: '✍️', t: 'Professional Writing', d: 'AI rewrites your answers with action verbs, metrics, and ATS-friendly language.' },
              { i: '🔗', t: 'Shareable Resume Site', d: 'Your own personal page at brainresume.site/yourname — share it anywhere.' },
              { i: '📊', t: 'View Analytics', d: 'See how many employers have viewed your profile and when.' },
              { i: '⚡', t: 'One-Click Regenerate', d: 'Not happy with a section? Regenerate it instantly with one click.' },
              { i: '📄', t: 'PDF Export', d: 'Download a clean, formatted PDF resume ready to submit.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.i}</div>
                <div className="feature-title">{f.t}</div>
                <div className="feature-desc">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section">
        <div className="section-inner">
          <span className="section-tag">Pricing</span>
          <h2 className="section-h2">Simple, honest pricing</h2>
          <p className="section-sub">Start free. Upgrade when you&apos;re ready.</p>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-name">Free</div>
              <div className="pricing-price">$0</div>
              <div className="pricing-desc">Perfect for getting started with your first resume.</div>
              <ul className="pricing-features">
                <li>1 AI-powered resume</li>
                <li>Shareable profile link</li>
                <li>Basic resume layout</li>
                <li>PDF download</li>
              </ul>
              <Link href="/app" className="btn-full" style={{ textAlign: 'center', background: 'var(--cream-dark)', color: 'var(--text)', display: 'block', textDecoration: 'none' }}>Start Free</Link>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-badge">MOST POPULAR</div>
              <div className="pricing-name">Pro</div>
              <div className="pricing-price">$9<span>/mo</span></div>
              <div className="pricing-desc">For serious job seekers who want every edge.</div>
              <ul className="pricing-features">
                <li>Unlimited resumes</li>
                <li>3 design themes</li>
                <li>Profile view analytics</li>
                <li>Priority AI generation</li>
                <li>Custom URL slug</li>
              </ul>
              <Link href="/app" className="btn-full" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>Get Pro →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo">Brain<span>CV</span></div>
        <p style={{ fontSize: 14, maxWidth: 400, margin: '0 auto' }}>Turn your thoughts into opportunities. Built for students, freshers, and career changers worldwide.</p>
        <p style={{ marginTop: 24, fontSize: 13, opacity: 0.6 }}>Jumaydullaev Mukhammadsiddik — <a href="mailto:yxmmm.private@gmail.com" style={{ color: 'var(--gold-light)', textDecoration: 'none' }}>yxmmm.private@gmail.com</a></p>
        <p style={{ marginTop: 8, fontSize: 13, opacity: 0.5 }}>© 2026 BrainCV. All rights reserved.</p>
      </footer>
    </>
  );
}
