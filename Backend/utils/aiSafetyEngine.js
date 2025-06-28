const cohere = require('cohere-ai');
cohere.apiKey = process.env.COHERE_API_KEY;

// Call Cohere to classify the severity of a safety report
async function getSeverityFromAI(description) {
  try {
    const prompt = `
Classify the severity of this safety report into one of the following categories:
- critical (e.g. murder, gunfire, major violence)
- high (e.g. robbery, assault, serious accident)
- moderate (e.g. potholes, poor lighting, unsafe surroundings)
- low (e.g. minor issues, unverified suspicion)
- safe (e.g. patrolled area, well lit, safe report)

Safety Report: "${description}"

Return only the label in lowercase.
`;

    const response = await cohere.generate({
      model: 'command-r-plus',
      prompt,
      max_tokens: 10,
      temperature: 0.2,
    });

    const label = response.body.generations[0].text.trim().toLowerCase();

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
    console.error('AI error:', error.message);
    return {
      aiTag: 'neutral',
      scoreImpact: -5,
    };
  }
}

module.exports = { getSeverityFromAI };
