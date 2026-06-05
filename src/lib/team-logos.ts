// Static map of team name → logo URL
// Sources: official club websites / Wikipedia Commons (stable URLs)
// Add new teams as needed — fallback renders team initials in a circle

export const TEAM_LOGOS: Record<string, string> = {
  // ── URC ──────────────────────────────────────────────────────────────────────
  "Leinster": "https://upload.wikimedia.org/wikipedia/en/8/8d/Leinster_Rugby_logo.svg",
  "Munster": "https://upload.wikimedia.org/wikipedia/en/5/5a/Munster_Rugby_crest.svg",
  "Ulster": "https://upload.wikimedia.org/wikipedia/en/6/60/Ulster_Rugby_crest.svg",
  "Connacht": "https://upload.wikimedia.org/wikipedia/en/3/34/Connacht_Rugby_logo.svg",
  "Glasgow Warriors": "https://upload.wikimedia.org/wikipedia/en/4/4d/Glasgow_Warriors_logo.svg",
  "Edinburgh Rugby": "https://upload.wikimedia.org/wikipedia/en/1/16/Edinburgh_Rugby_logo.svg",
  "Scarlets": "https://upload.wikimedia.org/wikipedia/en/2/26/Scarlets_rugby_logo.svg",
  "Cardiff Rugby": "https://upload.wikimedia.org/wikipedia/en/4/4e/Cardiff_Rugby_logo.svg",
  "Ospreys": "https://upload.wikimedia.org/wikipedia/en/b/b7/Ospreys_rugby_logo.svg",
  "Dragons RFC": "https://upload.wikimedia.org/wikipedia/en/6/65/Newport_Gwent_Dragons_logo.svg",
  "Stormers": "https://upload.wikimedia.org/wikipedia/en/5/5b/DHL_Stormers_logo.svg",
  "Bulls": "https://upload.wikimedia.org/wikipedia/en/e/e3/Blue_Bulls_logo.svg",
  "Sharks": "https://upload.wikimedia.org/wikipedia/en/d/d5/The_Sharks_logo.svg",
  "Lions": "https://upload.wikimedia.org/wikipedia/en/8/8f/Lions_Rugby_Union_logo.svg",
  "Benetton Rugby": "https://upload.wikimedia.org/wikipedia/commons/5/56/Benetton_Rugby_logo.svg",
  "Zebre Parma": "https://upload.wikimedia.org/wikipedia/en/c/cf/Zebre_Rugby_logo.svg",

  // ── Gallagher Premiership ────────────────────────────────────────────────────
  "Bath Rugby": "https://upload.wikimedia.org/wikipedia/en/8/88/Bath_Rugby_2021.svg",
  "Bristol Bears": "https://upload.wikimedia.org/wikipedia/en/1/1a/Bristol_Rugby_logo.svg",
  "Exeter Chiefs": "https://upload.wikimedia.org/wikipedia/en/5/57/Exeter_Chiefs_Logo_2019.svg",
  "Gloucester Rugby": "https://upload.wikimedia.org/wikipedia/en/5/5a/Gloucester_Rugby_logo.svg",
  "Harlequins": "https://upload.wikimedia.org/wikipedia/en/8/8d/Harlequins_logo.svg",
  "Leicester Tigers": "https://upload.wikimedia.org/wikipedia/en/7/7c/Leicester_Tigers_logo.svg",
  "Newcastle Falcons": "https://upload.wikimedia.org/wikipedia/en/5/59/Newcastle_Falcons_logo.svg",
  "Newcastle Red Bulls": "https://upload.wikimedia.org/wikipedia/en/5/59/Newcastle_Falcons_logo.svg",
  "Northampton Saints": "https://upload.wikimedia.org/wikipedia/en/3/37/Northampton_Saints_logo.svg",
  "Sale Sharks": "https://upload.wikimedia.org/wikipedia/en/8/84/Sale_Sharks_logo.svg",
  "Saracens": "https://upload.wikimedia.org/wikipedia/en/2/20/Saracens_F.C._logo.svg",
  "Wasps": "https://upload.wikimedia.org/wikipedia/en/a/aa/Wasps_rugby_logo.svg",

  // ── Top 14 ───────────────────────────────────────────────────────────────────
  "Toulouse": "https://upload.wikimedia.org/wikipedia/en/b/bc/Stade_Toulousain_logo.svg",
  "Stade Toulousain": "https://upload.wikimedia.org/wikipedia/en/b/bc/Stade_Toulousain_logo.svg",
  "La Rochelle": "https://upload.wikimedia.org/wikipedia/en/e/e7/Stade_Rochelais_logo.svg",
  "Stade Rochelais": "https://upload.wikimedia.org/wikipedia/en/e/e7/Stade_Rochelais_logo.svg",
  "Bordeaux-Bègle": "https://upload.wikimedia.org/wikipedia/en/5/5c/Union_Bordeaux_B%C3%A8gles_logo.svg",
  "Bordeaux Bègle": "https://upload.wikimedia.org/wikipedia/en/5/5c/Union_Bordeaux_B%C3%A8gles_logo.svg",
  "Union Bordeaux Bègle": "https://upload.wikimedia.org/wikipedia/en/5/5c/Union_Bordeaux_B%C3%A8gles_logo.svg",
  "Racing 92": "https://upload.wikimedia.org/wikipedia/en/d/d1/Racing_92_logo.svg",
  "Clermont": "https://upload.wikimedia.org/wikipedia/en/5/5e/ASM_Clermont_Auvergne_logo.svg",
  "ASM Clermont Auvergne": "https://upload.wikimedia.org/wikipedia/en/5/5e/ASM_Clermont_Auvergne_logo.svg",
  "Castres": "https://upload.wikimedia.org/wikipedia/en/7/7d/Castres_Olympique_logo.svg",
  "Montpellier": "https://upload.wikimedia.org/wikipedia/en/5/58/Montpellier_H%C3%A9rault_Rugby_logo.svg",
  "Toulon": "https://upload.wikimedia.org/wikipedia/en/a/a4/Toulon_RC_logo.svg",
  "Lyon": "https://upload.wikimedia.org/wikipedia/en/e/e7/LOU_Rugby_logo.svg",
  "Pau": "https://upload.wikimedia.org/wikipedia/en/d/d7/Section_Paloise_logo.svg",

  // ── Super Rugby Pacific ──────────────────────────────────────────────────────
  "Hurricanes": "https://upload.wikimedia.org/wikipedia/en/c/cf/Hurricanes_rugby_logo.svg",
  "Chiefs": "https://upload.wikimedia.org/wikipedia/en/1/1b/Chiefs_rugby_logo.svg",
  "Crusaders": "https://upload.wikimedia.org/wikipedia/en/e/e2/Crusaders_rugby_logo.svg",
  "Blues": "https://upload.wikimedia.org/wikipedia/en/5/59/Blues_rugby_logo.svg",
  "Highlanders": "https://upload.wikimedia.org/wikipedia/en/b/b8/Highlanders_rugby_logo.svg",
  "Brumbies": "https://upload.wikimedia.org/wikipedia/en/8/84/Brumbies_rugby_logo.svg",
  "NSW Waratahs": "https://upload.wikimedia.org/wikipedia/en/0/05/NSW_Waratahs_logo.svg",
  "Waratahs": "https://upload.wikimedia.org/wikipedia/en/0/05/NSW_Waratahs_logo.svg",
  "Reds": "https://upload.wikimedia.org/wikipedia/en/d/d4/Queensland_Reds_logo.svg",
  "Queensland Reds": "https://upload.wikimedia.org/wikipedia/en/d/d4/Queensland_Reds_logo.svg",
  "Force": "https://upload.wikimedia.org/wikipedia/en/4/4c/Western_Force_logo.svg",
  "Western Force": "https://upload.wikimedia.org/wikipedia/en/4/4c/Western_Force_logo.svg",
  "Fijian Drua": "https://upload.wikimedia.org/wikipedia/en/a/a4/Fijian_Drua_logo.svg",
  "Moana Pasifika": "https://upload.wikimedia.org/wikipedia/en/e/e3/Moana_Pasifika_logo.svg",

  // ── Six Nations ───────────────────────────────────────────────────────────────
  "Ireland": "https://upload.wikimedia.org/wikipedia/commons/4/45/Flag_of_Ireland.svg",
  "England": "https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg",
  "France": "https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg",
  "Scotland": "https://upload.wikimedia.org/wikipedia/commons/1/10/Flag_of_Scotland.svg",
  "Wales": "https://upload.wikimedia.org/wikipedia/commons/d/dc/Flag_of_Wales.svg",
  "Italy": "https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg",

  // ── Rugby Championship ────────────────────────────────────────────────────────
  "New Zealand": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Flag_of_New_Zealand.svg",
  "South Africa": "https://upload.wikimedia.org/wikipedia/commons/a/af/Flag_of_South_Africa.svg",
  "Australia": "https://upload.wikimedia.org/wikipedia/commons/8/88/Flag_of_Australia_%28converted%29.svg",
  "Argentina": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg",

  // ── Champions Cup / Challenge Cup ─────────────────────────────────────────────
  // (same clubs as URC/Premiership/Top 14 above)
};

export function getTeamLogo(teamName: string): string | null {
  // Direct match
  if (TEAM_LOGOS[teamName]) return TEAM_LOGOS[teamName];
  // Partial match (e.g. "DHL Stormers" → "Stormers")
  const key = Object.keys(TEAM_LOGOS).find((k) =>
    teamName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(teamName.toLowerCase())
  );
  return key ? TEAM_LOGOS[key] : null;
}

export function teamInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();
}
