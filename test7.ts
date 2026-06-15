import fs from 'fs';
const html = fs.readFileSync('fifa-bot.html', 'utf8');
const results = html.match(/.{0,30}Mexico.{0,30}/g) || [];
console.log(results.join('\n'));
