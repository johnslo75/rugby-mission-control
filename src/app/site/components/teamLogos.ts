// ─── Team logo map ────────────────────────────────────────────────────────────
// Sources:
//   URC:          https://www.unitedrugby.com/media/
//   6 Nations:    Wikipedia infobox crests
//   World Rugby:  Wikipedia infobox crests

export const TEAM_LOGOS: Record<string, string> = {
  // ── URC clubs ──────────────────────────────────────────────────────────────
  "Leinster":         "https://www.unitedrugby.com/wp-content/uploads/2025/05/Leinster.svg",
  "Munster":          "https://www.unitedrugby.com/wp-content/uploads/2025/05/Munster-Rugby.svg",
  "Connacht":         "https://www.unitedrugby.com/wp-content/uploads/2025/05/Connacht.svg",
  "Ulster":           "https://www.unitedrugby.com/wp-content/uploads/2025/05/Ulster-1.svg",
  "Cardiff":          "https://www.unitedrugby.com/wp-content/uploads/2025/05/Cardiff-Rugby-1.svg",
  "Cardiff Rugby":    "https://www.unitedrugby.com/wp-content/uploads/2025/05/Cardiff-Rugby-1.svg",
  "Ospreys":          "https://www.unitedrugby.com/wp-content/uploads/2025/05/Ospreys-1.svg",
  "Scarlets":         "https://www.unitedrugby.com/wp-content/uploads/2025/05/Scarlets-1.svg",
  "Dragons":          "https://www.unitedrugby.com/wp-content/uploads/2025/05/Dragons-1.svg",
  "Dragons RFC":      "https://www.unitedrugby.com/wp-content/uploads/2025/05/Dragons-1.svg",
  "Glasgow Warriors": "https://www.unitedrugby.com/wp-content/uploads/2025/05/Glasgow-Warriors-1.svg",
  "Glasgow":          "https://www.unitedrugby.com/wp-content/uploads/2025/05/Glasgow-Warriors-1.svg",
  "Edinburgh":        "https://www.unitedrugby.com/wp-content/uploads/2025/05/Edinburgh-1.svg",
  "Benetton":         "https://www.unitedrugby.com/wp-content/uploads/2025/05/Benetton-Rugby-1.svg",
  "Benetton Rugby":   "https://www.unitedrugby.com/wp-content/uploads/2025/05/Benetton-Rugby-1.svg",
  "Zebre":            "https://www.unitedrugby.com/wp-content/uploads/2025/05/Zebre-Parma-1.svg",
  "Zebre Parma":      "https://www.unitedrugby.com/wp-content/uploads/2025/05/Zebre-Parma-1.svg",
  "Stormers":         "https://www.unitedrugby.com/wp-content/uploads/2025/08/Stormers.svg",
  "DHL Stormers":     "https://www.unitedrugby.com/wp-content/uploads/2025/08/Stormers.svg",
  "Sharks":           "https://www.unitedrugby.com/wp-content/uploads/2025/05/Hollywoodbets-Sharks.svg",
  "Hollywoodbets Sharks": "https://www.unitedrugby.com/wp-content/uploads/2025/05/Hollywoodbets-Sharks.svg",
  "Bulls":            "https://www.unitedrugby.com/wp-content/uploads/2025/05/Vodacom.svg",
  "Vodacom Bulls":    "https://www.unitedrugby.com/wp-content/uploads/2025/05/Vodacom.svg",
  "Lions":            "https://www.unitedrugby.com/wp-content/uploads/2026/03/Fidelity-SecureDrive-Lions.svg",

  // ── 6 Nations & international ──────────────────────────────────────────────
  "Ireland":          "https://upload.wikimedia.org/wikipedia/en/thumb/e/e9/Irfu_jersey_logo.svg/250px-Irfu_jersey_logo.svg.png",
  "England":          "https://upload.wikimedia.org/wikipedia/en/thumb/3/39/England_national_rugby_team_logo.svg/250px-England_national_rugby_team_logo.svg.png",
  "Scotland":         "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Scotland_national_rugby_union_team_logo.png/250px-Scotland_national_rugby_union_team_logo.png",
  "Wales":            "https://upload.wikimedia.org/wikipedia/en/thumb/d/d6/Welsh_Rugby_Union_logo.svg/250px-Welsh_Rugby_Union_logo.svg.png",
  "France":           "https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/Logo_XV_de_France_masculin_2019.png/120px-Logo_XV_de_France_masculin_2019.png",
  "Italy":            "https://upload.wikimedia.org/wikipedia/en/thumb/b/bb/Italian_Rugby_Federation_logo.svg/250px-Italian_Rugby_Federation_logo.svg.png",

  // ── World Rugby nations ────────────────────────────────────────────────────
  "South Africa":     "https://upload.wikimedia.org/wikipedia/en/thumb/8/83/South_Africa_national_rugby_union_team.svg/250px-South_Africa_national_rugby_union_team.svg.png",
  "Springboks":       "https://upload.wikimedia.org/wikipedia/en/thumb/8/83/South_Africa_national_rugby_union_team.svg/250px-South_Africa_national_rugby_union_team.svg.png",
  "New Zealand":      "https://upload.wikimedia.org/wikipedia/en/thumb/f/fb/All_Blacks_logo.svg/250px-All_Blacks_logo.svg.png",
  "All Blacks":       "https://upload.wikimedia.org/wikipedia/en/thumb/f/fb/All_Blacks_logo.svg/250px-All_Blacks_logo.svg.png",
  "Australia":        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Wallabies_Vertical_Primary_RGB.svg/250px-Wallabies_Vertical_Primary_RGB.svg.png",
  "Wallabies":        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Wallabies_Vertical_Primary_RGB.svg/250px-Wallabies_Vertical_Primary_RGB.svg.png",
  "Argentina":        "https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Los_pumas_argentina_logo23.png/250px-Los_pumas_argentina_logo23.png",
  "Los Pumas":        "https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Los_pumas_argentina_logo23.png/250px-Los_pumas_argentina_logo23.png",
  "Japan":            "https://upload.wikimedia.org/wikipedia/en/thumb/3/37/Logo_JRFU.svg/250px-Logo_JRFU.svg.png",
  "Brave Blossoms":   "https://upload.wikimedia.org/wikipedia/en/thumb/3/37/Logo_JRFU.svg/250px-Logo_JRFU.svg.png",
};

/**
 * Find a logo URL for a team name (case-insensitive partial match).
 * Returns undefined if no match found.
 */
export function getTeamLogo(teamName: string): string | undefined {
  // Exact match first
  if (TEAM_LOGOS[teamName]) return TEAM_LOGOS[teamName];
  // Case-insensitive exact
  const lower = teamName.toLowerCase();
  const exactKey = Object.keys(TEAM_LOGOS).find(k => k.toLowerCase() === lower);
  if (exactKey) return TEAM_LOGOS[exactKey];
  // Partial match — team name contains a known key or vice versa
  const partialKey = Object.keys(TEAM_LOGOS).find(k =>
    lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)
  );
  return partialKey ? TEAM_LOGOS[partialKey] : undefined;
}

/**
 * Extract team names from a string of text and return matched logos.
 */
export function findTeamLogosInText(text: string): Array<{ team: string; logo: string }> {
  const results: Array<{ team: string; logo: string }> = [];
  const seen = new Set<string>();
  for (const [team, logo] of Object.entries(TEAM_LOGOS)) {
    if (text.toLowerCase().includes(team.toLowerCase()) && !seen.has(logo)) {
      results.push({ team, logo });
      seen.add(logo);
    }
  }
  return results;
}
