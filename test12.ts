import https from 'https';
const req = https.request('https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&count=1', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'GET',
    'User-Agent': 'Mozilla/5.0'
  }
}, (res) => {
  console.log(res.headers);
});
req.end();
