require("dotenv").config();
const PlatformAccount = require("../models/platform");
const User = require("../models/User");
const encryptToken = require("../utils/encryption");
const jwt = require("jsonwebtoken");
const logActivity = require("../utils/logActivity");



const getLinkedInToken = async (code) => {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
  });

  const response = await fetch(
    process.env.LINKEDIN_ACCESS_TOKEN_LINK,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    }
  );

  if (!response.ok) {
    throw new Error("LinkedIn token exchange failed");
  }

  return response.json();
};


const getLinkedInProfile = async (accessToken) => {
  const response = await fetch(process.env.LINKEDIN_USER_INFO, {
    method: 'get',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch LinkedIn profile");
  }

  return response.json();
};


const linkedinCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: "Missing code or state",
      });
    }

    let token;
    try {
      token = Buffer.from(state, "base64").toString("utf-8");
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid state encoding",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const userId = decoded.userId;


    const tokenData = await getLinkedInToken(code);


    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    const profile = await getLinkedInProfile(tokenData.access_token);
    console.log(profile);


    const accountId = profile.sub;


    const platformAccount = await PlatformAccount.findOneAndUpdate(
      {
        userId,
        platform: "linkedin",
        accountId,
      },
      {
        userId,
        platform: "linkedin",
        accountId,
        accountName: profile.name,
        profileUrl: profile.picture,
        accessToken: encryptToken(tokenData.access_token),
        tokenExpiresAt: expiresAt,
        scope: tokenData.scope?.split(",") || [],
        status: "connected",
        meta: profile,
      },
      { upsert: true, new: true, runValidators: true }
    );

    const updated = await User.findOneAndUpdate(
      { _id: userId, "platforms.platform": "linkedin" },
      {
        $set: {
          "platforms.$.platformAccountId": platformAccount._id,
          "platforms.$.status": "connected",
        },
      },
      { new: true }
    );

    if (!updated) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: {
          platforms: {
            platform: "linkedin",
            platformAccountId: platformAccount._id,
            status: "connected",
          },
        },
      });
    }

    await logActivity({
      userId,
      type: "PLATFORM_CONNECTED",
      title: "LinkedIn account connected",
      metadata: {
        platform: "linkedin",
        accountName: profile.name,
      },
    });

    return res.redirect(process.env.FRONTEND_URL);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "LinkedIn connection failed",
      error: error.message,
    });
  }
};


const facebookCallback = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const userId = req.userInfo.userId;


    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Missing access token",
      });
    }

    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,picture&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error("Facebook profile fetch failed");
    }

    const profile = await response.json();

    console.log(profile);

    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    const platformAccount = await PlatformAccount.findOneAndUpdate(
      {
        userId,
        platform: "facebook",
        accountId: profile.id,
      },
      {
        userId,
        platform: "facebook",
        accountId: profile.id,
        accountName: profile.name,
        profileUrl: profile.picture?.data?.url,
        accessToken: encryptToken(accessToken),
        tokenExpiresAt: expiresAt,
        status: "connected",
        meta: profile,
      },
      { upsert: true, new: true }
    );

    const updated = await User.findOneAndUpdate(
      { _id: userId, "platforms.platform": "facebook" },
      {
        $set: {
          "platforms.$.platformAccountId": platformAccount._id,
          "platforms.$.status": "connected",
        },
      },
      { new: true }
    );

    if (!updated) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: {
          platforms: {
            platform: "facebook",
            platformAccountId: platformAccount._id,
            status: "connected",
          },
        },
      });
    }

    await logActivity({
      userId,
      type: "PLATFORM_CONNECTED",
      title: "Facebook account connected",
      metadata: {
        platform: "facebook",
        accountName: profile.name,
      },
    });

    return res.json({
      success: true,
      message: "Facebook connected",
      platformId: platformAccount._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Facebook connection failed",
      error: error.message,
    });
  }
};

const disconnectPlatform = async (req, res) => {
  try {
    const userId = req.userInfo.userId; 
    const platform = req.params.platform.toLowerCase();

    const accountResult = await PlatformAccount.updateOne(
      { userId, platform },
      { $set: { status: "disconnected" } }
    );

    const userResult = await User.updateOne(
      { _id: userId, "platforms.platform": platform },
      {
        $set: {
          "platforms.$.status": "disconnected",
        },
      }
    );

    if (
      accountResult.matchedCount === 0 &&
      userResult.matchedCount === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "Platform not connected",
      })
    }

    await logActivity({
      userId,
      type: "PLATFORM_DISCONNECTED",
      title: `${platform} account disconnected`,
      metadata: {
        platform,
      },
    });

    return res.json({
      success: true,
      message: `${platform} disconnected`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to disconnect platform",
      error: error.message,
    });
  }
};



const getPlatformStatus = async (req, res) => {
  try {
    const userId = req.userInfo.userId;

    const platforms = await PlatformAccount.find({ userId })
      .select("platform accountName status")
      .lean();

    return res.json({
      success: true,
      platforms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch platform status",
    });
  }
};


module.exports = {
  linkedinCallback,
  facebookCallback,
  getPlatformStatus,
  disconnectPlatform
};
