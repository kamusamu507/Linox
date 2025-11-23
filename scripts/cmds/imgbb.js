const axios = require("axios");

module.exports = {
  config: {
    name: "imgbb",
    aliases: ["postimg", "ipost"],
    version: "4.1",
    author: "Eren",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Upload image via URL to ImgBB" },
    longDescription: { en: "Upload image directly using private GET API hosted on Render" },
    category: "utility",
    guide: { en: "{pn} [reply to an image or provide image URL]" }
  },

  onStart: async function ({ message, event }) {
    try {
      let imageUrl = "";

      if (event.messageReply?.attachments?.length) {
        const attachment = event.messageReply.attachments[0];
        if (attachment.type !== "photo") {
          return message.reply("❌ Only image supported.");
        }
        imageUrl = attachment.url;
      } else {
        const args = event.body?.trim().split(/\s+/).slice(1);
        if (!args || !args[0]) return message.reply("⚠️ Reply to an image or provide a URL.");
        imageUrl = args[0];
      }

      const apiRes = await axios.get("https://www.dur4nto-yeager.rf.gd/api/imgbb", {
        params: { url: imageUrl }
      });

      if (apiRes.data.success) {
        return message.reply(
          `✅ Uploaded Successfully!\n🔗 URL: ${apiRes.data.url}`
        );
      } else {
        return message.reply("❌ Upload failed: " + JSON.stringify(apiRes.data));
      }
    } catch (e) {
      console.error(e);
      return message.reply("⚠️ Error: " + e.message);
    }
  }
};
