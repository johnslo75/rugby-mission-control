"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

function daysUntil(target: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const FIFA_DATE = new Date("2026-06-11");
const RWC_DATE = new Date("2027-10-01");

interface Props {
  postsThisWeek: number;
}

export default function Header({ postsThisWeek }: Props) {
  const { data: session } = useSession();
  const [followers, setFollowers] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setFollowers(d.followers ?? 0);
        setDraft(String(d.followers ?? 0));
      });
  }, []);

  async function saveFollowers() {
    setSaving(true);
    const val = parseInt(draft, 10) || 0;
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followers: val }),
    });
    setFollowers(val);
    setSaving(false);
    setEditing(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <img src="/rugbyradarlogo.png" alt="Rugby Radar" style={{ width: 40, height: 40, objectFit: "contain" }} />
              Rugby Radar
              <span style={{ color: "#00a86b" }}> — Mission Control</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Stat label="FIFA WC 2026" value={`${daysUntil(FIFA_DATE)}d`} />
            <Stat label="RWC 2027" value={`${daysUntil(RWC_DATE)}d`} />
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-gray-400 text-xs uppercase tracking-wide">Followers</span>
              {editing ? (
                <div className="flex items-center gap-1.5">
                  <input
                    className="w-24 bg-white border border-[#00C853] rounded px-2 py-0.5 text-gray-900 text-sm focus:outline-none"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveFollowers()}
                    autoFocus
                  />
                  <button onClick={saveFollowers} disabled={saving} className="text-[#00a86b] hover:text-green-700 transition-colors text-xs font-semibold">Save</button>
                  <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-700 transition-colors text-xs">✕</button>
                </div>
              ) : (
                <button onClick={() => { setDraft(String(followers)); setEditing(true); }} className="text-gray-900 font-bold hover:text-[#00a86b] transition-colors">
                  {followers.toLocaleString()}
                </button>
              )}
            </div>
            <Stat label="Posts this week" value={String(postsThisWeek)} highlight />
            {session?.user && (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <span className="text-gray-500 text-xs font-medium">{session.user.name}</span>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-xs text-gray-400 capitalize">{(session.user as { role?: string }).role}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/hub/login" })}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-1"
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
      <span className="text-gray-400 text-xs uppercase tracking-wide">{label}</span>
      <span className={`font-bold ${highlight ? "text-[#00a86b]" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}
