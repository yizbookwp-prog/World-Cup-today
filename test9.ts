import https from 'https';
https.get('https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&count=500', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      // Group by idSeason
      const seasons = new Set();
      json.Results.forEach(m => seasons.add(`${m.IdSeason} - ${m.SeasonName[0]?.Description}`));
      console.log(Array.from(seasons));
    } catch(e) { console.log('error'); }
  });
});
