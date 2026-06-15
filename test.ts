import https from 'https';
https.get('https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=AU&wtw-filter=ALL', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(data.substring(0, 500)));
});
