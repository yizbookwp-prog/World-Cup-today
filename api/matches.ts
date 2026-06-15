import https from "https";
import type { VercelRequest, VercelResponse } from "@vercel/node";

let matchesCache: any[] | null = null;
let lastFetch = 0;

const TEAM_STRENGTHS: Record<string, number> = {
  // Top Tier (90+)
  '阿根廷': 95, '法国': 94, '巴西': 93, '英格兰': 92, '比利时': 91,
  '西班牙': 92, '荷兰': 90, '葡萄牙': 91, '意大利': 90, '克罗地亚': 89,
  '德国': 89, '乌拉圭': 88, '哥伦比亚': 88, '美国': 87, '墨西哥': 86,
  '摩洛哥': 86, '瑞士': 85, '塞内加尔': 84, '日本': 85, '伊朗': 83,
  
  // Mid-High Tier (80-84)
  '丹麦': 84, '塞尔维亚': 82, '韩国': 82, '奥地利': 83, '澳大利亚': 81,
  '乌克兰': 81, '土耳其': 82, '瑞典': 80, '波兰': 81, '威尔士': 80,
  '匈牙利': 80, '突尼斯': 79, '厄瓜多尔': 80, '秘鲁': 79, '智利': 78,
  
  // Mid Tier (70-79)
  '捷克': 79, '阿尔及利亚': 78, '罗马尼亚': 78, '挪威': 80, '斯洛伐克': 77,
  '喀麦隆': 77, '马里': 76, '尼日利亚': 78, '埃及': 77, '科特迪瓦': 78,
  '沙特阿拉伯': 77, '卡塔尔': 76, '伊拉克': 75, '阿联酋': 74, '加拿大': 78,
  '哥斯达黎加': 75, '巴拿马': 75, '牙买加': 74, '苏格兰': 79, '希腊': 76,
  
  // Lower-Mid / Lower Tier (60-69)
  '南非': 74, '加纳': 75, '黑山': 73, '北爱尔兰': 71, '波斯尼亚和黑塞哥维那': 74,
  '爱尔兰': 73, '冰岛': 72, '约旦': 72, '巴拉圭': 76, '委内瑞拉': 77,
  '玻利维亚': 71, '新西兰': 70, '乌兹别克斯坦': 73, '阿曼': 70, '中国': 68,
  '叙利亚': 69, '巴林': 68, '海地': 69, '库拉索': 67, '佛得角': 72,
  '刚果民主共和国': 73
};

function getTeamStrength(teamName: string, idCountry: string): number {
  if (TEAM_STRENGTHS[teamName]) {
    return TEAM_STRENGTHS[teamName];
  }
  // Default fallback based on country id length and char codes for slight determinism
  let hash = 0;
  for (let i = 0; i < idCountry.length; i++) {
    hash = idCountry.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 65 + (Math.abs(hash) % 15); // Fallback between 65 and 80
}

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
            homeStrength: getTeamStrength(m.Home.TeamName?.[0]?.Description || m.Home.ShortClubName, m.Home.IdCountry || ''),
            awayStrength: getTeamStrength(m.Away.TeamName?.[0]?.Description || m.Away.ShortClubName, m.Away.IdCountry || '')
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
