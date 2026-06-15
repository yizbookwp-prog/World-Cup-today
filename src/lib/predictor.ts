import { Match, PredictionResult, Scoreline } from '../types';

export const sampleMatches: Match[] = [
  { id: '1', time: '19:30', league: '世界杯', homeTeam: '阿根廷', awayTeam: '法国', homeStrength: 89, awayStrength: 88, status: 0 },
  { id: '2', time: '21:00', league: '欧洲杯', homeTeam: '英格兰', awayTeam: '西班牙', homeStrength: 86, awayStrength: 89, status: 0 },
  { id: '3', time: '23:30', league: '友谊赛', homeTeam: '巴西', awayTeam: '德国', homeStrength: 87, awayStrength: 84, status: 0 },
  { id: '4', time: '02:00', league: '欧国联', homeTeam: '葡萄牙', awayTeam: '荷兰', homeStrength: 85, awayStrength: 83, status: 0 },
  { id: '5', time: '04:00', league: '欧国联', homeTeam: '意大利', awayTeam: '克罗地亚', homeStrength: 82, awayStrength: 80, status: 0 },
  { id: '6', time: '08:00', league: '亚预赛', homeTeam: '日本', awayTeam: '韩国', homeStrength: 78, awayStrength: 76, status: 0 },
];

function calculateProbabilities(homeStr: number, awayStr: number) {
  const diff = homeStr - awayStr;
  const homeAdvantage = 3; // Home team bump
  const adjustedDiff = diff + homeAdvantage;

  let homeProb = 33 + (adjustedDiff * 1.5);
  let awayProb = 33 - (adjustedDiff * 1.5);
  let drawProb = 34 - Math.abs(adjustedDiff * 0.5); // Closer strength = higher draw prob

  // Add slight random variation (-2 to 2)
  const rand1 = (Math.random() * 4) - 2;
  const rand2 = (Math.random() * 4) - 2;
  
  homeProb += rand1;
  awayProb += rand2;
  drawProb = 100 - (homeProb + awayProb);

  // Bound checks
  if (homeProb < 5) { homeProb = 5; drawProb = 100 - (homeProb + awayProb); }
  if (awayProb < 5) { awayProb = 5; drawProb = 100 - (homeProb + awayProb); }
  
  return {
    home: Math.round(homeProb),
    draw: Math.round(drawProb),
    away: Math.round(awayProb)
  };
}

function generateScores(homeStr: number, awayStr: number, probs: {home: number, draw: number, away: number}): Scoreline[] {
  const scores: Scoreline[] = [];
  const baseAvgGoals = 2.5;
  const hGoals = (homeStr / 100) * baseAvgGoals * (probs.home / 40);
  const aGoals = (awayStr / 100) * baseAvgGoals * (probs.away / 40);

  const getPoisson = (lambda: number) => {
    let l = Math.exp(-lambda), k = 0, p = 1.0;
    do { k++; p *= Math.random(); } while (p > l);
    return k - 1;
  };

  const generatedScores = new Map<string, {h: number, a: number, count: number}>();
  
  // Simulate 1000 times
  for (let i=0; i<1000; i++) {
    const h = getPoisson(hGoals);
    const a = getPoisson(aGoals);
    const key = `${h}:${a}`;
    if (!generatedScores.has(key)) generatedScores.set(key, {h, a, count: 0});
    generatedScores.get(key)!.count++;
  }

  // Sort by occurrence
  const sorted = Array.from(generatedScores.values()).sort((a,b) => b.count - a.count);
  
  // Take top 3
  const top3 = sorted.slice(0, 3);
  
  return top3.map((s, i) => ({
    home: s.h,
    away: s.a,
    stars: i === 0 ? 4 : (i === 1 ? 3 : 2)
  }));
}

function calculateHandicap(homeStr: number, awayStr: number) {
  const diff = (homeStr + 3) - awayStr; // include home advantage
  let line = 0;
  let predictionStr = '';
  let hName = 'Home';
  let aName = 'Away';

  // rough conversion from strength difference to asian handicap line
  if (diff > 15) line = -1.5;
  else if (diff > 8) line = -1.0;
  else if (diff > 4) line = -0.5;
  else if (diff > 1) line = -0.25;
  else if (diff > -1) line = 0;
  else if (diff > -4) line = 0.25;
  else if (diff > -8) line = 0.5;
  else if (diff > -15) line = 1.0;
  else line = 1.5;

  let formattedLine = line > 0 ? `+${line}` : (line === 0 ? '0' : `${line}`);
  let stars = Math.floor(Math.random() * 2) + 3; // 3 or 4 stars

  // Decide who covers based on slight randomness towards the favorite
  const isHomeFavorite = diff > 0;
  const upsetRoll = Math.random() < 0.35; // 35% chance to predict the underdog covers

  if (isHomeFavorite) {
    predictionStr = upsetRoll ? `${aName} 赢盘 (+${Math.abs(line)})` : `${hName} 胜`;
  } else if (line === 0) {
    predictionStr = upsetRoll ? '平局' : (Math.random() > 0.5 ? `${hName} 胜` : `${aName} 胜`);
  } else {
    predictionStr = upsetRoll ? `${hName} 赢盘 (+${Math.abs(line)})` : `${aName} 胜`;
  }

  return {
    line: formattedLine,
    prediction: predictionStr,
    stars
  };
}

export function generatePrediction(match: Match): PredictionResult {
  const probs = calculateProbabilities(match.homeStrength, match.awayStrength);
  const scores = generateScores(match.homeStrength, match.awayStrength, probs);
  
  let recommendedResult: '主胜' | '平局' | '客胜' = '主胜';
  if (probs.away > probs.home && probs.away > probs.draw) recommendedResult = '客胜';
  if (probs.draw > probs.home && probs.draw > probs.away) recommendedResult = '平局';

  const handicapInfo = calculateHandicap(match.homeStrength, match.awayStrength);
  const handicapResult = {
      line: handicapInfo.line,
      prediction: handicapInfo.prediction.replace('Home', match.homeTeam).replace('Away', match.awayTeam),
      stars: handicapInfo.stars
  };

  return {
    matchId: match.id,
    winProbabilities: probs,
    recommendedResult,
    scorePredictions: scores,
    asianHandicap: handicapResult
  };
}
