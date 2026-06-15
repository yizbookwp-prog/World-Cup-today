import https from 'https';
https.get('https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&language=en&count=10', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(data.substring(0, 1000)));
});
