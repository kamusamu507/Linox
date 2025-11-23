const axios = require("axios");

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tikdl", "ttdl"],
    version: "1.0.9",
    author: "Eren",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Auto download TikTok videos from links" },
    longDescription: { en: "Automatically detects TikTok links in group chats and downloads the video" },
    category: "media",
    guide: { en: "" }
  },

  onStart: async function({ message, args }) {
    if (args.length > 0) {
      try {
        const url = args[0];
        if (!url) return message.reply("⚠️ Please provide a TikTok URL!");

        const loadingMsg = await message.reply("⏳ Downloading your TikTok video, please wait...");
        const apiUrl = `https://flame-mahi.onrender.com/api/tikdl2?url=${encodeURIComponent(url)}`;
        const res = await axios.get(apiUrl, { timeout: 30000 });

        if (!res.data || !res.data.cloudinary_url) {
          await message.unsend(loadingMsg.messageID);
          return message.reply("❌ Failed to fetch video. Please check if the URL is valid.");
        }

        let msg = `🎬 𝗧𝗶𝗸𝗧𝗼𝗸 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱\n\n`;
        msg += `🔗 Original URL: ${res.data.original_url}\n`;
        msg += `⚡ Powered by: ${res.data.powered_by || "Renaro Tavares"}\n`;
        msg += `🕒 Fetched at: ${new Date(res.data.timestamp).toLocaleString()}`;

        const videoResponse = await axios({
          method: "GET",
          url: res.data.cloudinary_url,
          responseType: "stream",
          timeout: 60000
        });

        await message.reply({ body: msg, attachment: videoResponse.data });
        await message.unsend(loadingMsg.messageID);

      } catch (err) {
        console.error("❌ Error in tiktok command:", err.message);
        message.reply("❌ Failed to download the video. Please try again later.");
      }
    }
  },

  onChat: async function({ event, message }) {
    if (event.isGroup && event.body) {
      const tiktokRegex =
        /https?:\/\/(www\.)?(vm\.|vt\.)?tiktok\.com\/[^\s]+|https?:\/\/(www\.)?tiktok\.com\/@[^\/]+\/video\/\d+/i;
      const match = event.body.match(tiktokRegex);

      if (match) {
        const tiktokUrl = match[0];
        try {
          const loadingMsg = await message.reply("⏳ Detected TikTok link! Downloading video, please wait...");
          const apiUrl = `https://flame-mahi.onrender.com/api/tikdl2?url=${encodeURIComponent(tiktokUrl)}`;
          const res = await axios.get(apiUrl, { timeout: 30000 });

          if (!res.data || !res.data.cloudinary_url) {
            await message.unsend(loadingMsg.messageID);
            return;
          }

          let msg = `🎬 𝗧𝗶𝗸𝗧𝗼𝗸 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱\n\n`;
          msg += `🔗 Original URL: ${res.data.original_url}\n`;
          msg += `⚡ Powered by: ${res.data.powered_by || "Renaro Tavares"}\n`;
          msg += `🕒 Fetched at: ${new Date(res.data.timestamp).toLocaleString()}`;

          const videoResponse = await axios({
            method: "GET",
            url: res.data.cloudinary_url,
            responseType: "stream",
            timeout: 60000
          });

          await message.reply({ body: msg, attachment: videoResponse.data });
          await message.unsend(loadingMsg.messageID);

        } catch (err) {
          console.error("❌ Error auto-downloading TikTok:", err.message);
        }
      }
    }
  }
};
