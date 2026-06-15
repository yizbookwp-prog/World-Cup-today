import https from 'https';
import fs from 'fs';
https.get('https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=AU&wtw-filter=ALL', { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } }, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => fs.writeFileSync('fifa-bot.html', data));
});
