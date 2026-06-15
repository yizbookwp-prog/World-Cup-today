import fs from 'fs';
const html = fs.readFileSync('fifa-bot.html', 'utf8');
const scripts = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi);
scripts?.forEach(s => {
  if (s.length > 200) console.log(s.substring(0, 150) + '...');
});
