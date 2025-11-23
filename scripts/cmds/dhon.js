const axios = require("axios");

module.exports = {
  config: {
    name: "dhon",
    aliases: ["imagegen", "imagine"],
    version: "1.0",
    author: "Eren",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Generate AI image" },
    longDescription: { en: "Generate AI image from prompt (direct stream)" },
    category: "ai",
    guide: { en: "{pn} [prompt]" }
  },

  onStart: async function ({ message, args }) {
    const prompt = args.join(" ").trim();
    
    if (!prompt) {
      return message.reply("❌ Please provide a prompt.\nExample: /dhon beautiful sunset over mountains");
    }

    if (prompt.length > 500) {
      return message.reply("❌ Prompt is too long. Please keep it under 500 characters.");
    }

    const url = `https://stable-diffution-mahi.onrender.com/generate?prompt=${encodeURIComponent(prompt)}&pass=mahisaxvi`;

    try {
      message.reply("⏳ Generating your image...");

      const response = await axios.get(url, { 
        responseType: "stream",
        timeout: 60000 // 60 seconds timeout for image generation
      });

      return message.reply({
        body: `🖼️ Generated Image\nPrompt: ${prompt}`,
        attachment: response.data
      });
      
    } catch (err) {
      console.error("Image generation error:", err);
      
      if (err.code === 'ECONNABORTED') {
        return message.reply("❌ Request timeout. The image generation is taking too long.");
      } else if (err.response?.status === 404) {
        return message.reply("❌ API endpoint not found. Please check the API URL.");
      } else {
        return message.reply("❌ Error: Couldn't generate image. The API might be down or the prompt might be inappropriate.");
      }
    }
  }
};
