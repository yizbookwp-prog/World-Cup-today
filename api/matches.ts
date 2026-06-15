import https from "https";
import type { VercelRequest, VercelResponse } from "@vercel/node";

let matchesCache: any[] | null = null;
let lastFetch = 0;

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Cache for 30 seconds
  if (matchesCache && Date.now() - lastFetch < 30000) {
    return res.status(200).json(matchesCache);
  }

  https.get('https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&count=100&language=zh', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (fifaRes) => {
    let data = '';
    fifaRes.on('data', d => data += d);
    fifaRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        const formattedMatches = json.Results
          .filter((m: any) => m.Home?.IdCountry && m.Away?.IdCountry)
          .map((m: any) => ({
            id: m.IdMatch,
            time: m.Date,
            league: '世界杯',
            status: m.MatchStatus,
            homeScore: m.Home.Score,
            awayScore: m.Away.Score,
            homeTeam: m.Home.TeamName?.[0]?.Description || m.Home.ShortClubName,
            awayTeam: m.Away.TeamName?.[0]?.Description || m.Away.ShortClubName,
            homeFlag: m.Home.PictureUrl ? m.Home.PictureUrl.replace('{format}', 'sq').replace('{size}', '2') : `https://api.fifa.com/api/v3/picture/flags-sq-2/${m.Home.IdCountry}`,
            awayFlag: m.Away.PictureUrl ? m.Away.PictureUrl.replace('{format}', 'sq').replace('{size}', '2') : `https://api.fifa.com/api/v3/picture/flags-sq-2/${m.Away.IdCountry}`,
            homeStrength: 75 + ((m.Home.IdCountry?.length || 3) % 15),
            awayStrength: 75 + ((m.Away.IdCountry?.length || 3) % 15)
          }));
        matchesCache = formattedMatches;
        lastFetch = Date.now();
        res.status(200).json(formattedMatches);
      } catch(e) {
        console.error(e);
        res.status(500).json({ error: "Failed to parse FIFA data" });
      }
    });
  }).on('error', (e) => {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch FIFA data" });
  });
}
