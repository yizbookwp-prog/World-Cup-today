import https from 'https';
https.get('https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&count=100', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(json.Results[0]);
    } catch(e) { console.log(data.substring(0, 500)); }
  });
});
