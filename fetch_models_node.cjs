
const https = require('https');

https.get('https://openrouter.ai/api/v1/models', (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    try {
        const json = JSON.parse(data);
        if (json.data) {
            const fluxModels = json.data.filter(m => m.id.toLowerCase().includes("flux"));
            console.log("Flux Models found:");
            fluxModels.forEach(m => console.log(m.id));
        } else {
            console.log("No data field in response", data.substring(0, 100));
        }
    } catch(e) {
        console.error("Parse Error:", e);
        console.log("Raw Data Start:", data.substring(0, 100));
    }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
