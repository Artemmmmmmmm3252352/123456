
const https = require('https');
const fs = require('fs');

https.get('https://openrouter.ai/api/v1/models', (resp) => {
  let data = '';
  resp.on('data', chunk => data += chunk);
  resp.on('end', () => {
    try {
        const json = JSON.parse(data);
        const ids = json.data.map(m => m.id).join('\n');
        fs.writeFileSync('all_models.txt', ids);
        console.log("Wrote models to all_models.txt");
    } catch(e) { console.error(e); }
  });
});
