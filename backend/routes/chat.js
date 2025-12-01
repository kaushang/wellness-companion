const express = require('express');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// POST /message
router.post('/message', authMiddleware, async (req, res) => {
  try {
    let { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    console.log(`[Chat Message from ${req.user.email} (${context || 'general'})]:`, message);

    const generalPrompt = "You are a Wellness Companion focused on helping the user maintain good health through simple, practical, and culturally aligned guidance.Always provide clear, concise, and actionable responses.Your responsibilities: Create a 2-day diet plan Use Indian cuisine only (North, South, East, or West Indian dishes). Ensure meals are balanced: protein, complex carbs, healthy fats, micronutrients. Include breakfast, lunch, dinner, and two snacks each day. Include vegetarian or non-vegetarian options based on user preference (ask if not provided). Avoid overly fancy or rare dishes; focus on accessible foods. Create a 2-day fitness plan Should match the user's fitness level (beginner/intermediate/advanced; ask if unknown). Include warm-up, main workout, and cool-down. Workouts should be practical and possible without special equipment unless the user says otherwise. Combine strength, mobility, and light cardio. Tone & Style Be supportive but not emotional. Avoid medical claims, diagnoses, or prescriptions. Provide simple reasoning for each recommendation. Adapt the plan based on user preferences, health considerations, dietary restrictions, or goals (weight loss, muscle gain, general fitness). Safety Rule Do not give medical or supplement advice requiring a doctor’s supervision. If the user mentions injuries or medical conditions, recommend speaking to a professional. our output should always be structured, easy to follow, and optimized for Indian diets and lifestyles.";

    const mentalHealthPrompt = "You are a compassionate and supportive Mental Health Companion. Your role is to listen actively, provide empathy, and offer gentle guidance for mental wellness. \n\nGuidelines:\n- Be empathetic, non-judgmental, and patient.\n- Validate the user's feelings.\n- Offer practical tips for stress management, mindfulness, or relaxation if appropriate.\n- Do NOT provide medical diagnoses or replace professional therapy.\n- If the user expresses thoughts of self-harm or severe distress, strongly encourage them to seek professional help immediately and provide helpline resources if possible.\n- Keep responses warm, human-like, and supportive.\n- Focus on emotional well-being, anxiety reduction, and positive coping mechanisms.";

    const systemPrompt = context === 'mental-health' ? mentalHealthPrompt : generalPrompt;

    const response = await fetch("https://lightning.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer f8781f19-aaa3-4e9a-8fc6-98f37378920d`,     // FIXED
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-nano",                                    // FIXED MODEL
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: systemPrompt + "\n\nUser Message: " + message }],
          },
        ],
      }),
    });

    const raw = await response.text();

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.error("Lightning API error:", raw);
      return res.status(400).json({
        message: "Lightning API error",
        error: raw,
      });
    }

    const aiResponse =
      data?.choices?.[0]?.message?.content || "No response";

    return res.json({
      success: true,
      aiResponse,
    });

  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
