const Content = require("../models/Content");

const saveContentFromN8n = async (req, res) => {
  try {
    const { userId, schedulerId, content } = req.body;

    if (!userId || !schedulerId || !content) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }


    const nowIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const startOfDayIST = new Date(nowIST);
    startOfDayIST.setHours(0, 0, 0, 0);

    const endOfDayIST = new Date(nowIST);
    endOfDayIST.setHours(23, 59, 59, 999);


    const existingContent = await Content.findOne({
      userId,
      schedulerId,
      createdAt: {
        $gte: startOfDayIST,
        $lte: endOfDayIST,
      },
    });

    // Regeneration → update content only
    if (existingContent) {
      existingContent.content = content;
      await existingContent.save();

      return res.status(200).json({
        success: true,
        message: "Content updated for today (IST)",
        data: existingContent,
      });
    }

    // New scheduler or new day → create new entry
    const newContent = await Content.create({
      userId,
      schedulerId,
      content,
    });

    return res.status(201).json({
      success: true,
      message: "Content saved successfully (IST)",
      data: newContent,
    });

  } catch (error) {
    console.error("n8n save error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save content",
    });
  }
};

module.exports = saveContentFromN8n;
