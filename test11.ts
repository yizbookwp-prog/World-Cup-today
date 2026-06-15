import https from 'https';
https.get('https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&count=100', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`Found ${json.Results.length} matches`);
      console.log(json.Results.slice(0, 5).map(m => `${m.Date} | ${m.Home?.ShortClubName} vs ${m.Away?.ShortClubName}`));
    } catch(e) { console.log('error', data.substring(0, 100)); }
  });
});
