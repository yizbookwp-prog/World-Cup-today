import https from 'https';
https.get('https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&count=1&language=zh', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json.Results[0].Home.TeamName, null, 2));
      console.log(json.Results[0].Home.IdCountry);
      console.log(json.Results[0].Home.PictureUrl);
    } catch(e) { console.log('error', data.substring(0, 100)); }
  });
});
