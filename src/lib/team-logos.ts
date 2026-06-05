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
  "Dragons RFC":        WP("Dragons_RFC_logo.png"),
  "Dragons":            WP("Dragons_RFC_logo.png"),
  "Stormers":           WP("StormersRugbyClubLogo2025.svg"),
  "DHL Stormers":       WP("StormersRugbyClubLogo2025.svg"),
  "Bulls":              WP("Bulls_rugby_logo.jpg"),
  "Vodacom Bulls":      WP("Bulls_rugby_logo.jpg"),
  "Sharks":             WP("Sharks_rugby_union_logo.png"),
  "Cell C Sharks":      WP("Sharks_rugby_union_logo.png"),
  "Lions":              WP("Lions_rugby_logo_2007.png"),
  "Emirates Lions":     WP("Lions_rugby_logo_2007.png"),
  "Benetton Rugby":     WP("Benetton_rugby.svg"),
  "Benetton":           WP("Benetton_rugby.svg"),
  "Zebre Parma":        WP("Zebre_parma_logo23.png"),
  "Zebre":              WP("Zebre_parma_logo23.png"),

  // ── Gallagher Premiership ────────────────────────────────────────────────────
  "Bath Rugby":         WP("Bath_Rugby_2021.svg"),
  "Bath":               WP("Bath_Rugby_2021.svg"),
  "Bristol Bears":      WP("Bristol_Bears_logo.svg"),
  "Bristol":            WP("Bristol_Bears_logo.svg"),
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
  "Northampton Saints": WP("Northampton_Saints_Logo.svg"),
  "Northampton":        WP("Northampton_Saints_Logo.svg"),
  "Sale Sharks":        WP("Sale_Sharks_logo.svg"),
  "Sale":               WP("Sale_Sharks_logo.svg"),
  "Saracens":           WP("Saracens_F.C._Logo.svg"),

  // ── Top 14 ───────────────────────────────────────────────────────────────────
  "Stade Toulousain":               WP("StadeToulousainLogo.svg"),
  "Toulouse":                       WP("StadeToulousainLogo.svg"),
  "Stade Rochelais":                WP("Stade_rochelais_logo.svg"),
  "La Rochelle":                    WP("Stade_rochelais_logo.svg"),
  "Racing 92":                      WP("Racing_92_logo.svg"),
  "ASM Clermont Auvergne":          WP("ASMClermontLogo.svg"),
  "Clermont":                       WP("ASMClermontLogo.svg"),
  "Castres Olympique":              WP("Castres_olympique_badge.png"),
  "Castres":                        WP("Castres_olympique_badge.png"),
  "Montpellier Hérault Rugby":      WP("Logo_Montpellier_Hérault_rugby_2013.svg"),
  "Montpellier Herault Rugby Club": WP("Logo_Montpellier_Hérault_rugby_2013.svg"),
  "Montpellier":                    WP("Logo_Montpellier_Hérault_rugby_2013.svg"),
  "RC Toulon":                      WP("RCT_LOGO.png"),
  "RC Toulonnais":                  WP("RCT_LOGO.png"),
  "Toulon":                         WP("RCT_LOGO.png"),
  "Section Paloise":                WP("Section_Paloise_2024.png"),
  "Pau":                            WP("Section_Paloise_2024.png"),
  "Union Bordeaux-Begles":          WP("UnionBordeauxBeglesLogo.svg"),
  "Union Bordeaux Bègle":          WP("UnionBordeauxBeglesLogo.svg"),
  "Bordeaux Bègle":                WP("UnionBordeauxBeglesLogo.svg"),
  "Aviron Bayonnais":               WP("AvironBayonnaisLogo2022.svg"),
  "Stade Francais Paris":           WP("Stade_francais_logo18.svg"),
  "Stade Français Paris":           WP("Stade_francais_logo18.svg"),
  "USA Perpignan":                  WP("Usa_perpignan_badge.png"),
  "US Montauban":                   WP("Us_montauban.png"),
  "Lyon Olympique Universitaire":   WP("Lyon_Olympique_Universitaire.svg"),
  "Lyon":                           WP("Lyon_Olympique_Universitaire.svg"),
  "LOU Rugby":                      WP("Lyon_Olympique_Universitaire.svg"),
  "Stade Aurillacois":              WP("Stade_Aurillacois_logo.svg"),
  "Vannes":                         WP("RC_Vannes_logo.svg"),

  // ── Super Rugby Pacific ──────────────────────────────────────────────────────
  "Hurricanes":      WP("Wellington_Hurricanes_logo.png"),
  "Chiefs":          WP("Chiefs_rugby_union_logo.jpg"),
  "Crusaders":       WP("Crusaders_(rugby_union)_logo.png"),
  "Blues":           WP("Auckland_Blues_rugby_logo.webp"),
  "Highlanders":     WP("Highlanders_NZ_rugby_union_team_logo.svg"),
  "Brumbies":        WP("Brumbies_Rugby_logo.svg"),
  "NSW Waratahs":    WP("Waratahs_logo.svg"),
  "Waratahs":        WP("Waratahs_logo.svg"),
  "Reds":            WP("QLD_reds_logo.svg"),
  "Queensland Reds": WP("QLD_reds_logo.svg"),
  "Force":           WP("Western_force_rugby_logo.png"),
  "Western Force":   WP("Western_force_rugby_logo.png"),
  "Fijian Drua":     WP("Fijian_Drua_logo.svg"),
  "Moana Pasifika":  WP("Moana_Pasifika_logo.jpg"),

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
