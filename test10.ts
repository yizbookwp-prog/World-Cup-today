import https from 'https';
https.get('https://api.fifa.com/api/v3/seasons?idCompetition=17', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(json.Results.map(s => `${s.IdSeason} - ${s.Name[0]?.Description}`));
    } catch(e) { console.log('error', data.substring(0, 100)); }
  });
});
