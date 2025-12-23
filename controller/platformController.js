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
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: "Missing code or state",
      });
    }

    // 1️⃣ Decode state → JWT
    let decoded;
    try {
      const token = Buffer.from(state, "base64").toString("utf-8");
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid login state",
      });
    }

    const userId = decoded.userId;

    // 2️⃣ Exchange code → short-lived token
    const shortTokenRes = await fetch(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: `${process.env.BACKEND_URL}/api/platforms/facebookCallback`,
          code,
        }),
      }
    );

    const shortTokenData = await shortTokenRes.json();
    if (!shortTokenRes.ok) {
      throw new Error(shortTokenData.error?.message);
    }

    // 3️⃣ Exchange → long-lived token
    const longTokenRes = await fetch(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          fb_exchange_token: shortTokenData.access_token,
        }),
      }
    );

    const longTokenData = await longTokenRes.json();
    if (!longTokenRes.ok || !longTokenData.access_token) {
      throw new Error("Long-lived token exchange failed");
    }

    const userAccessToken = longTokenData.access_token;

    // 4️⃣ Fetch Facebook user
    const meRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name&access_token=${userAccessToken}`
    );
    const meData = await meRes.json();

    // 5️⃣ Fetch pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`
    );
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error("No Facebook pages found");
    }

    // 6️⃣ Save pages (PlatformAccount)
    let lastPlatformAccount = null;

    for (const page of pagesData.data) {
      lastPlatformAccount = await PlatformAccount.findOneAndUpdate(
        {
          userId,
          platform: "facebook",
          accountId: page.id,
        },
        {
          userId,
          platform: "facebook",
          accountId: page.id,
          accountName: page.name,
          accessToken: encryptToken(page.access_token),
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          status: "connected",
          meta: page,
        },
        { upsert: true, new: true, runValidators: true }
      );
    }

    // 7️⃣ Update User.platforms (LinkedIn-style logic)
    const updated = await User.findOneAndUpdate(
      { _id: userId, "platforms.platform": "facebook" },
      {
        $set: {
          "platforms.$.status": "connected",
          "platforms.$.platformAccountId": lastPlatformAccount._id,
        },
      },
      { new: true }
    );

    // 8️⃣ If Facebook platform does NOT exist → create it
    if (!updated) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: {
          platforms: {
            platform: "facebook",
            platformAccountId: lastPlatformAccount._id,
            status: "connected",
          },
        },
      });
    }

    // 9️⃣ Log activity
    await logActivity({
      userId,
      type: "PLATFORM_CONNECTED",
      title: "Facebook account connected",
      metadata: {
        platform: "facebook",
      },
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}/platforms?facebook=connected`
    );
  } catch (error) {
    console.error("Facebook callback error:", error.message);
    return res.redirect(
      `${process.env.FRONTEND_URL}/platforms?facebook=error`
    );
  }
};



const disconnectPlatform = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const platform = req.params.platform.toLowerCase();

    // 1️⃣ Disconnect PlatformAccount ONLY if connected
    const accountResult = await PlatformAccount.updateOne(
      { userId, platform, status: "connected" },
      { $set: { status: "disconnected" } }
    );

    // 2️⃣ Disconnect User.platform entry ONLY if connected
    const userResult = await User.updateOne(
      {
        _id: userId,
        "platforms.platform": platform,
        "platforms.status": "connected",
      },
      {
        $set: {
          "platforms.$.status": "disconnected",
          "platforms.$.platformAccountId": null,
        },
      }
    );

    // 3️⃣ Nothing was connected → return error
    if (
      accountResult.modifiedCount === 0 &&
      userResult.modifiedCount === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Platform already disconnected or not connected",
      });
    }

    await logActivity({
      userId,
      type: "PLATFORM_DISCONNECTED",
      title: `${platform} account disconnected`,
      metadata: { platform },
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

    const platforms = await PlatformAccount.find({
      userId,
      status: "connected",
    })
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
