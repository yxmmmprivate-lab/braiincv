import Head from 'next/head';
import Link from 'next/link';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';

export default function PublicResume({ resume, userInfo, error }) {
  if (error || !resume) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', flexDirection: 'column', gap: 16, padding: 40, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: 'var(--forest)' }}>Brain<span style={{ color: 'var(--gold)' }}>CV</span></div>
        <h1 style={{ fontSize: 28, color: 'var(--ink)' }}>Resume not found</h1>
        <p style={{ color: 'var(--muted)' }}>This profile link may have changed or been removed.</p>
        <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>← Back to BrainCV</Link>
      </div>
    );
  }

  const initials = (userInfo.name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <Head>
        <title>{userInfo.name} — Resume | BrainCV</title>
        <meta name="description" content={resume.summary} />
        <meta property="og:title" content={`${userInfo.name} — ${userInfo.targetRole}`} />
        <meta property="og:description" content={resume.summary} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="share-page">
        <nav className="share-nav">
          <Link href="/" className="share-logo">Brain<span>CV</span></Link>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>brainresume.site/r/{userInfo.slug}</span>
            <Link href="/app" style={{ background: 'rgba(255,255,255,.1)', border: 'none', color: 'white', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, textDecoration: 'none' }}>Build yours →</Link>
          </div>
        </nav>

        <div className="share-body">
          {/* Hero */}
          <div className="share-hero">
            <div className="share-avatar">
              {userInfo.photo
                ? <img src={userInfo.photo} alt={userInfo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div className="share-name">{userInfo.name}</div>
            <div className="share-role-text">{userInfo.targetRole}</div>
            <a href={`mailto:${userInfo.email}`} className="share-btn">📧 Get in Touch</a>
          </div>

          {/* About */}
          <div className="share-section">
            <div className="share-section-title">About</div>
            <div className="share-summary">{resume.summary}</div>
          </div>

          {/* Experience */}
          <div className="share-section">
            <div className="share-section-title">Experience</div>
            {resume.experience?.map((exp, i) => (
              <div key={i} className="share-exp-item">
                <div className="share-exp-header">
                  <div>
                    <div className="share-exp-title">{exp.title}</div>
                    <div className="share-exp-company">{exp.company}</div>
                  </div>
                  <div className="share-exp-date">{exp.date}</div>
                </div>
                <ul className="share-bullets">{exp.bullets?.map((b, j) => <li key={j}>{b}</li>)}</ul>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="share-section">
            <div className="share-section-title">Skills</div>
            <div className="share-skills">{resume.skills?.map((s, i) => <span key={i} className="share-skill-pill">{s}</span>)}</div>
          </div>

          {/* Education */}
          {resume.education && (
            <div className="share-section">
              <div className="share-section-title">Education</div>
              <div className="share-summary">{resume.education}</div>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '32px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.35)' }}>
            Resume built with <span style={{ color: 'var(--gold-light)', fontFamily: "'Playfair Display',serif" }}>BrainCV</span>
            {' — '}
            <Link href="/app" style={{ color: 'var(--gold-light)', textDecoration: 'none' }}>Build yours free →</Link>
          </div>
        </div>
      </div>
    </>
  );
}

// Fetch resume data at request time and increment view count
export async function getServerSideProps({ params }) {
  const { slug } = params;
  try {
    const q = query(collection(db, 'resumes'), where('slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) return { props: { error: true, resume: null, userInfo: null } };

    const rDoc = snap.docs[0];
    const rData = rDoc.data();

    // Increment view count
    try { await updateDoc(doc(db, 'analytics', rDoc.id), { views: increment(1) }); } catch (_) {}

    // Get user info
    const userQ = query(collection(db, 'users'), where('slug', '==', slug));
    const userSnap = await getDocs(userQ);
    const uData = userSnap.empty ? { name: 'Anonymous', targetRole: '', slug, email: '', photo: null } : userSnap.docs[0].data();

    return {
      props: {
        resume: rData.generatedResume,
        userInfo: { name: uData.name, targetRole: uData.targetRole, slug: uData.slug, email: uData.email || '', photo: uData.photo || null },
        error: false,
      },
    };
  } catch (e) {
    return { props: { error: true, resume: null, userInfo: null } };
  }
}
