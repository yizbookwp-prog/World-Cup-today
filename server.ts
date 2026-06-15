import express from "express";
import path from "path";
import https from "https";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Cache for matches
  let matchesCache: any[] | null = null;
  let lastFetch = 0;

  app.get("/api/matches", async (req, res) => {
    // Cache for 30 seconds
    if (matchesCache && Date.now() - lastFetch < 30000) {
      return res.json(matchesCache);
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
          res.json(formattedMatches);
        } catch(e) {
          console.error(e);
          res.status(500).json({ error: "Failed to parse FIFA data" });
        }
      });
    }).on('error', (e) => {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch FIFA data" });
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
