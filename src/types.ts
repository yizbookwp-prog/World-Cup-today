export interface WorldCupHistory {
  appearances: number;
  titles: number;
  bestFinish: string;
}

export interface Match {
  id: string;
  time: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag?: string;
  awayFlag?: string;
  homeStrength: number; // 1-100
  awayStrength: number; // 1-100
  status: number; // 0: finished, 1: upcoming, 3: live
  homeScore?: number | null;
  awayScore?: number | null;
  homeFifaRanking?: number;
  awayFifaRanking?: number;
  homeWorldCupHistory?: WorldCupHistory;
  awayWorldCupHistory?: WorldCupHistory;
  homeInjuries?: number;
  awayInjuries?: number;
  homeAttackRating?: number;
  awayAttackRating?: number;
  homeDefenseRating?: number;
  awayDefenseRating?: number;
}

export interface Scoreline {
  home: number;
  away: number;
  stars: number; // 1-5 rating based on likelihood
}

export interface PredictionResult {
  matchId: string;
  winProbabilities: {
    home: number;
    draw: number;
    away: number;
  };
  recommendedResult: '主胜' | '平局' | '客胜';
  scorePredictions: Scoreline[];
  asianHandicap: {
    line: string;
    prediction: string;
    stars: number;
  };
  dataAnalysis: {
    homeTeam: {
      overallStrength: number;
      attackEfficiency: number;
      defenseStrength: number;
      fifaRanking: number;
      worldCupPedigree: number;
      injuryImpact: number;
    };
    awayTeam: {
      overallStrength: number;
      attackEfficiency: number;
      defenseStrength: number;
      fifaRanking: number;
      worldCupPedigree: number;
      injuryImpact: number;
    };
    weights: {
      baseStrength: number;
      fifaRanking: number;
      worldCupHistory: number;
      attackDefense: number;
      injuries: number;
    };
  };
}
