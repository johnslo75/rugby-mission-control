// Static map of team name → logo URL
// Uses Wikipedia Special:FilePath which redirects to the actual Wikimedia CDN
// Fallback renders team initials in a coloured circle

const WP = (file: string) => `https://en.wikipedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`;
const COM = (file: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`;

export const TEAM_LOGOS: Record<string, string> = {
  // ── URC ──────────────────────────────────────────────────────────────────────
  "Leinster":           WP("LeinsterRugby_logo_2019.svg"),
  "Munster":            WP("Munster_Rugby_logo.svg"),
  "Ulster":             WP("Ulster_Rugby_logo.svg"),
  "Connacht":           WP("ConnachtRugby_2017logo.svg"),
  "Glasgow Warriors":   WP("Glasgow_Warriors_Logo.svg"),
  "Edinburgh Rugby":    WP("Edinburgh_Rugby_logo.svg"),
  "Scarlets":           WP("Scarlets_logo.svg"),
  "Cardiff Rugby":      WP("Cardiff_Rugby_logo_(2021).jpg"),
  "Ospreys":            WP("Ospreys_Rugby_logo.svg"),
  "Dragons RFC":        WP("Dragons_RFC_logo.svg"),
  "Dragons":            WP("Dragons_RFC_logo.svg"),
  "Stormers":           WP("StormersRugbyClubLogo2025.svg"),
  "DHL Stormers":       WP("StormersRugbyClubLogo2025.svg"),
  "Bulls":              WP("Vodacom_Bulls_logo.svg"),
  "Vodacom Bulls":      WP("Vodacom_Bulls_logo.svg"),
  "Sharks":             WP("The_Sharks_logo.svg"),
  "Cell C Sharks":      WP("The_Sharks_logo.svg"),
  "Lions":              WP("Emirates_Lions_logo.svg"),
  "Emirates Lions":     WP("Emirates_Lions_logo.svg"),
  "Benetton Rugby":     WP("Benetton_Rugby_logo.svg"),
  "Benetton":           WP("Benetton_Rugby_logo.svg"),
  "Zebre Parma":        WP("Zebre_Rugby_Club_Logo.svg"),
  "Zebre":              WP("Zebre_Rugby_Club_Logo.svg"),

  // ── Gallagher Premiership ────────────────────────────────────────────────────
  "Bath Rugby":         WP("Bath_Rugby_2021.svg"),
  "Bath":               WP("Bath_Rugby_2021.svg"),
  "Bristol Bears":      WP("Bristol_Rugby_logo.svg"),
  "Bristol":            WP("Bristol_Rugby_logo.svg"),
  "Exeter Chiefs":      WP("Exeter_Chiefs_Logo_2019.svg"),
  "Exeter":             WP("Exeter_Chiefs_Logo_2019.svg"),
  "Gloucester Rugby":   WP("Gloucester_Rugby_logo.svg"),
  "Gloucester":         WP("Gloucester_Rugby_logo.svg"),
  "Harlequins":         WP("Harlequins_logo.svg"),
  "Leicester Tigers":   WP("Leicester_Tigers_logo.svg"),
  "Leicester":          WP("Leicester_Tigers_logo.svg"),
  "Newcastle Falcons":  WP("Newcastle_Falcons_logo.svg"),
  "Newcastle Red Bulls":WP("Newcastle_Falcons_logo.svg"),
  "Newcastle":          WP("Newcastle_Falcons_logo.svg"),
  "Northampton Saints": WP("Northampton_Saints_logo.svg"),
  "Northampton":        WP("Northampton_Saints_logo.svg"),
  "Sale Sharks":        WP("Sale_Sharks_logo.svg"),
  "Sale":               WP("Sale_Sharks_logo.svg"),
  "Saracens":           WP("Saracens_F.C._logo.svg"),

  // ── Top 14 ───────────────────────────────────────────────────────────────────
  "Stade Toulousain":           WP("Stade_Toulousain_logo.svg"),
  "Toulouse":                   WP("Stade_Toulousain_logo.svg"),
  "Stade Rochelais":            WP("Stade_rochelais_logo.svg"),
  "La Rochelle":                WP("Stade_rochelais_logo.svg"),
  "Racing 92":                  WP("Racing_92_logo.svg"),
  "ASM Clermont Auvergne":      WP("ASM_Clermont_Auvergne_logo.svg"),
  "Clermont":                   WP("ASM_Clermont_Auvergne_logo.svg"),
  "Castres Olympique":          WP("Castres_Olympique_logo.svg"),
  "Castres":                    WP("Castres_Olympique_logo.svg"),
  "Montpellier Hérault Rugby":  WP("Montpellier_Hérault_Rugby_logo.svg"),
  "Montpellier":                WP("Montpellier_Hérault_Rugby_logo.svg"),
  "RC Toulon":                  WP("RC_Toulon_logo.svg"),
  "Toulon":                     WP("RC_Toulon_logo.svg"),
  "LOU Rugby":                  WP("LOU_Rugby_logo.svg"),
  "Lyon":                       WP("LOU_Rugby_logo.svg"),
  "Section Paloise":            WP("Section_Paloise_logo.svg"),
  "Pau":                        WP("Section_Paloise_logo.svg"),
  "Union Bordeaux Bègle":      WP("Union_Bordeaux_Bègles_logo.svg"),
  "Bordeaux Bègle":            WP("Union_Bordeaux_Bègles_logo.svg"),
  "Stade Aurillacois":          WP("Stade_Aurillacois_logo.svg"),
  "Vannes":                     WP("RC_Vannes_logo.svg"),

  // ── Super Rugby Pacific ──────────────────────────────────────────────────────
  "Hurricanes":     WP("Hurricanes_rugby_logo.svg"),
  "Chiefs":         WP("Chiefs_rugby_logo.svg"),
  "Crusaders":      WP("Crusaders_rugby_logo.svg"),
  "Blues":          WP("Blues_rugby_logo.svg"),
  "Highlanders":    WP("Highlanders_rugby_logo.svg"),
  "Brumbies":       WP("Brumbies_rugby_logo.svg"),
  "NSW Waratahs":   WP("NSW_Waratahs_logo.svg"),
  "Waratahs":       WP("NSW_Waratahs_logo.svg"),
  "Reds":           WP("Queensland_Reds_logo.svg"),
  "Queensland Reds":WP("Queensland_Reds_logo.svg"),
  "Force":          WP("Western_Force_logo.svg"),
  "Western Force":  WP("Western_Force_logo.svg"),
  "Fijian Drua":    WP("Fijian_Drua_logo.svg"),
  "Moana Pasifika": WP("Moana_Pasifika_logo.svg"),

  // ── Six Nations / Rugby Championship (flags) ─────────────────────────────────
  "Ireland":      COM("Flag_of_Ireland.svg"),
  "England":      COM("Flag_of_England.svg"),
  "France":       COM("Flag_of_France.svg"),
  "Scotland":     COM("Flag_of_Scotland.svg"),
  "Wales":        COM("Flag_of_Wales.svg"),
  "Italy":        COM("Flag_of_Italy.svg"),
  "New Zealand":  COM("Flag_of_New_Zealand.svg"),
  "South Africa": COM("Flag_of_South_Africa.svg"),
  "Australia":    COM("Flag_of_Australia_(converted).svg"),
  "Argentina":    COM("Flag_of_Argentina.svg"),
};

export function getTeamLogo(teamName: string): string | null {
  if (TEAM_LOGOS[teamName]) return TEAM_LOGOS[teamName];
  // Partial match
  const key = Object.keys(TEAM_LOGOS).find(
    (k) => teamName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(teamName.toLowerCase())
  );
  return key ? TEAM_LOGOS[key] : null;
}

export function teamInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();
}
