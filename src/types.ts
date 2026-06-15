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
}
