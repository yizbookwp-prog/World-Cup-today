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

const TEAM_FIFA_RANKINGS: Record<string, number> = {
  '阿根廷': 1, '法国': 2, '西班牙': 3, '英格兰': 4, '巴西': 5,
  '比利时': 6, '荷兰': 7, '葡萄牙': 8, '意大利': 9, '哥伦比亚': 10,
  '德国': 11, '克罗地亚': 12, '乌拉圭': 13, '摩洛哥': 14, '瑞士': 15,
  '美国': 16, '墨西哥': 17, '日本': 18, '塞内加尔': 19, '伊朗': 20,
  '丹麦': 21, '韩国': 23, '澳大利亚': 25, '塞尔维亚': 27, '土耳其': 28,
  '奥地利': 24, '乌克兰': 22, '波兰': 26, '瑞典': 29, '威尔士': 30,
  '匈牙利': 31, '厄瓜多尔': 32, '尼日利亚': 33, '埃及': 34, '加拿大': 35,
  '科特迪瓦': 36, '突尼斯': 37, '智利': 38, '秘鲁': 39, '喀麦隆': 40,
  '捷克': 41, '阿尔及利亚': 42, '挪威': 43, '苏格兰': 44, '沙特阿拉伯': 45,
  '南非': 46, '加纳': 47, '哥斯达黎加': 48, '卡塔尔': 49, '马里': 50
};

const TEAM_WORLD_CUP_HISTORY: Record<string, { appearances: number; titles: number; bestFinish: string }> = {
  '巴西': { appearances: 22, titles: 5, bestFinish: '冠军' },
  '德国': { appearances: 20, titles: 4, bestFinish: '冠军' },
  '意大利': { appearances: 18, titles: 4, bestFinish: '冠军' },
  '阿根廷': { appearances: 18, titles: 3, bestFinish: '冠军' },
  '法国': { appearances: 16, titles: 2, bestFinish: '冠军' },
  '英格兰': { appearances: 16, titles: 1, bestFinish: '冠军' },
  '西班牙': { appearances: 16, titles: 1, bestFinish: '冠军' },
  '乌拉圭': { appearances: 14, titles: 2, bestFinish: '冠军' },
  '荷兰': { appearances: 11, titles: 0, bestFinish: '亚军' },
  '葡萄牙': { appearances: 8, titles: 0, bestFinish: '四强' },
  '克罗地亚': { appearances: 6, titles: 0, bestFinish: '亚军' },
  '比利时': { appearances: 14, titles: 0, bestFinish: '四强' },
  '墨西哥': { appearances: 17, titles: 0, bestFinish: '八强' },
  '波兰': { appearances: 9, titles: 0, bestFinish: '四强' },
  '瑞典': { appearances: 12, titles: 0, bestFinish: '亚军' },
  '美国': { appearances: 11, titles: 0, bestFinish: '四强' },
  '日本': { appearances: 7, titles: 0, bestFinish: '十六强' },
  '韩国': { appearances: 11, titles: 0, bestFinish: '四强' },
  '塞内加尔': { appearances: 3, titles: 0, bestFinish: '八强' },
  '摩洛哥': { appearances: 6, titles: 0, bestFinish: '四强' },
  '瑞士': { appearances: 12, titles: 0, bestFinish: '八强' },
  '丹麦': { appearances: 6, titles: 0, bestFinish: '四强' },
  '哥伦比亚': { appearances: 6, titles: 0, bestFinish: '八强' },
  '澳大利亚': { appearances: 6, titles: 0, bestFinish: '十六强' },
  '伊朗': { appearances: 6, titles: 0, bestFinish: '小组赛' },
  '塞尔维亚': { appearances: 13, titles: 0, bestFinish: '四强' },
  '厄瓜多尔': { appearances: 4, titles: 0, bestFinish: '十六强' },
  '加拿大': { appearances: 2, titles: 0, bestFinish: '小组赛' },
  '卡塔尔': { appearances: 1, titles: 0, bestFinish: '小组赛' }
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

function getFifaRanking(teamName: string): number {
  return TEAM_FIFA_RANKINGS[teamName] || 100;
}

function getWorldCupHistory(teamName: string) {
  return TEAM_WORLD_CUP_HISTORY[teamName] || { appearances: 0, titles: 0, bestFinish: '小组赛' };
}

function getInjuries(): number {
  // Random injuries 0-3
  return Math.floor(Math.random() * 4);
}

function getAttackDefenseRatings(strength: number): { attack: number; defense: number } {
  // Generate attack/defense ratings based on strength with some variation
  const variation = Math.floor(Math.random() * 11) - 5; // -5 to +5
  const attack = Math.max(50, Math.min(100, strength + variation));
  const defense = Math.max(50, Math.min(100, strength - variation));
  return { attack, defense };
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
          .map((m: any) => {
            const homeTeamName = m.Home.TeamName?.[0]?.Description || m.Home.ShortClubName;
            const awayTeamName = m.Away.TeamName?.[0]?.Description || m.Away.ShortClubName;
            const homeStrength = getTeamStrength(homeTeamName, m.Home.IdCountry || '');
            const awayStrength = getTeamStrength(awayTeamName, m.Away.IdCountry || '');
            const homeAttackDefense = getAttackDefenseRatings(homeStrength);
            const awayAttackDefense = getAttackDefenseRatings(awayStrength);

            return {
              id: m.IdMatch,
              time: m.Date,
              league: '世界杯',
              status: m.MatchStatus,
              homeScore: m.Home.Score,
              awayScore: m.Away.Score,
              homeTeam: homeTeamName,
              awayTeam: awayTeamName,
              homeFlag: m.Home.PictureUrl ? m.Home.PictureUrl.replace('{format}', 'sq').replace('{size}', '2') : `https://api.fifa.com/api/v3/picture/flags-sq-2/${m.Home.IdCountry}`,
              awayFlag: m.Away.PictureUrl ? m.Away.PictureUrl.replace('{format}', 'sq').replace('{size}', '2') : `https://api.fifa.com/api/v3/picture/flags-sq-2/${m.Away.IdCountry}`,
              homeStrength,
              awayStrength,
              homeFifaRanking: getFifaRanking(homeTeamName),
              awayFifaRanking: getFifaRanking(awayTeamName),
              homeWorldCupHistory: getWorldCupHistory(homeTeamName),
              awayWorldCupHistory: getWorldCupHistory(awayTeamName),
              homeInjuries: getInjuries(),
              awayInjuries: getInjuries(),
              homeAttackRating: homeAttackDefense.attack,
              awayAttackRating: awayAttackDefense.attack,
              homeDefenseRating: homeAttackDefense.defense,
              awayDefenseRating: awayAttackDefense.defense
            };
          });
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
