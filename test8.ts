import fs from 'fs';
const html = fs.readFileSync('fifa-bot.html', 'utf8');
const results = html.match(/.{0,200}Mexico.{0,200}/g) || [];
console.log(results[1]);
