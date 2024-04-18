const express = require("express");
const {
	GoogleGenerativeAI,
	HarmCategory,
	HarmBlockThreshold,
} = require("@google/generative-ai");

const router = express.Router();

async function generateDiagnosis(userSymptoms) {
	try {
		const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
		const model = genAI.getGenerativeModel({
			model: process.env.GOOGLE_API_MODEL,
		});

		const generationConfig = {
			temperature: 0.9,
			topK: 1,
			topP: 1,
			maxOutputTokens: 2048,
		};

		const safetySettings = [
			{
				category: HarmCategory.HARM_CATEGORY_HARASSMENT,
				threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
			},
			{
				category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
				threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
			},
			{
				category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
				threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
			},
			{
				category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
				threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
			},
		];

		const chat = model.startChat({
			generationConfig,
			safetySettings,
			history: [
				{ role: "user", parts: [{ text: "Hello" }] },
				{
					role: "model",
					parts: [{ text: "Hello there! How can I assist you today?" }],
				},
			],
		});

		const result = await chat.sendMessage(
			"I am experiencing the following symptoms. Give me a list of actions that I can take to remedy the situation. And please tell me if it would me advisable to see the doctor if the issue is so serious. Give the answer in the shortest text possible." +
				userSymptoms
		);

		return result.response.text();
	} catch (error) {
		console.error("Error generating diagnosis:", error);
		throw new Error("Failed to generate diagnosis");
	}
}

router.post("/getDiagnosis", async (req, res) => {
	const userSymptoms = req.body.userSymptoms;

	try {
		const diagnosis = await generateDiagnosis(userSymptoms);
		req.session.userDiagnosis = diagnosis;
		res.status(200).json({ diagnosis });
	} catch (error) {
		console.error("Error:", error.message);
		req.flash("error", "Error getting diagnosis. Please try again.");
		res.status(500).json({ error: "Could not fetch diagnosis" });
	}
});

module.exports = router;
