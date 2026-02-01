
const apiKey = "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";

async function fetchModels() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models");
    const data = await response.json();
    const fluxModels = data.data.filter(m => m.id.includes("flux"));
    console.log("Available Flux Models:");
    fluxModels.forEach(m => console.log(m.id));
  } catch (error) {
    console.error(error);
  }
}

fetchModels();
