const { CohereClient } = require("cohere-ai");

// Initialize the Cohere client with your API key
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// Classify severity of a safety report using AI
async function getSeverityFromAI(description) {
  try {
    const message = `
Classify the severity of this safety report into one of the following categories:
- critical (e.g. murder, gunfire, major violence)
- high (e.g. robbery, assault, serious accident)
- moderate (e.g. potholes, poor lighting, unsafe surroundings)
- low (e.g. minor issues, unverified suspicion)
- safe (e.g. patrolled area, well lit, safe report)

Safety Report: "${description}"

Return only the label in lowercase.
    `.trim();

    const response = await cohere.chat({
      model: 'command-r-plus',
      message,
      temperature: 0.2,
      max_tokens: 10,
    });

    const label = response.text.trim().toLowerCase();

    const scoreMap = {
      critical: -40,
      high: -30,
      moderate: -15,
      low: -5,
      safe: +10,
    };

    return {
      aiTag: label,
      scoreImpact: scoreMap[label] ?? -5,
    };
  } catch (error) {
    console.error('AI error (severity):', error.message);
    return {
      aiTag: 'neutral',
      scoreImpact: -5,
    };
  }
}

// Generate an explanation for a safe route from a list of safety reports
async function generateRouteExplanation(routeReports) {
  try {
    const message = `
Based on the following safety reports, explain in 2-3 lines why this route was selected as safer:

${routeReports.map((r, i) => `${i + 1}. ${r.description}`).join('\n')}

Focus on crime reduction, lighting, fewer accidents, or safety patterns.
    `.trim();

    const response = await cohere.chat({
      model: 'command-r-plus',
      message,
      temperature: 0.5,
      max_tokens: 100,
    });

    return response.text.trim();
  } catch (error) {
    console.error('AI error (route explanation):', error.message);
    return "AI explanation unavailable due to an error.";
  }
}

module.exports = { getSeverityFromAI, generateRouteExplanation };
