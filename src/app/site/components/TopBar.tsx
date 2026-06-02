export default function TopBar() {
  const date = new Date().toLocaleDateString("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="topbar">
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{date} · rugbyradar.co · Rugby intelligence for serious fans</span>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a href="https://www.instagram.com/rugbyradar.co/" target="_blank" rel="noopener noreferrer">
            📸 Instagram
          </a>
          <a href="https://www.tiktok.com/@rugbyradar3" target="_blank" rel="noopener noreferrer">
            🎵 TikTok
          </a>
        </div>
      </div>
    </div>
  );
}
