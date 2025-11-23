const axios = require("axios");

module.exports = {
  config: {
    name: "grayscale",
    aliases: ["gs", "black&white"],
    version: "1.0",
    author: "Eren",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "convert normal image to grayscale"
    },
    longDescription: {
      en: "Convert images to grayscale by replying to an image or providing an image URL"
    },
    category: "tools",
    guide: {
      en: "{pn} [reply to image or provide image URL]"
    }
  },

  onStart: async function({ message, event, args }) {
    let imageUrl;
    
    if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
      imageUrl = event.messageReply.attachments[0].url;
    } else if (args.length > 0) {
      imageUrl = args[0];
    } else {
      return message.reply("❌ Please reply to an image or provide an image URL!");
    }

    if (!imageUrl.startsWith('http')) {
      return message.reply("❌ Please provide a valid image URL!");
    }

    const apiUrl = `https://renaro-api.onrender.com/api/grayscale?url=${encodeURIComponent(imageUrl)}`;

    try {
      message.reply("⏳ Converting your image to grayscale...");
      
      const { data } = await axios.get(apiUrl, {
        timeout: 30000
      });
      
      if (data.status !== "success" || !data.uploaded_url) {
        return message.reply("❌ Failed to generate grayscale image!");
      }

      const imageStream = await global.utils.getStreamFromURL(data.uploaded_url);
      
      return message.reply({
        attachment: imageStream
      });
    } catch (err) {
      console.error("API Error:", err);
      return message.reply("❌ Error: Couldn't process the image. Please try again later.");
    }
  }
};
