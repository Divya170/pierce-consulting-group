export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading page" className="wrap-n" style={{ paddingTop: 'clamp(36px,5vw,64px)', paddingBottom: 96 }}>
      <div className="skel" style={{ height: 12, width: 120, marginBottom: 28 }} />
      <div className="skel" style={{ height: 'clamp(40px,5vw,64px)', width: 'min(720px, 90%)', marginBottom: 14 }} />
      <div className="skel" style={{ height: 'clamp(40px,5vw,64px)', width: 'min(520px, 70%)', marginBottom: 36 }} />
      <div className="skel" style={{ height: 16, width: 'min(560px, 90%)', marginBottom: 10 }} />
      <div className="skel" style={{ height: 16, width: 'min(480px, 80%)', marginBottom: 48 }} />
      <div className="flex-wrap" style={{ gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="skel" style={{ flex: '1 1 280px', height: 220 }} />
        ))}
      </div>
    </div>
  );
}
