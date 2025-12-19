const axios = require("axios");
const logActivity = require("../utils/logActivity");
require('dotenv').config()


const sendPrompt = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.userInfo.userId; 
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    console.log(prompt);
    
    const n8nResponse = await axios.post(
      process.env.N8N_PROMPT_URL,
      {
        userId:userId,
       prompt: prompt,
      }
    );

    await logActivity({
      userId,
      type: "PROMPT_GENERATED",
      title: "AI prompt processed",
      metadata: {
        promptLength: prompt.length,
      },
    });

    return res.json({
      success: true,
      result: n8nResponse.data.result,
    });
  } catch (error) {
    console.error("Prompt error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process prompt",
    });
  }
};

module.exports = { sendPrompt };
