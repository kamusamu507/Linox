const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "monitor",
    aliases: ["run"],
    version: "1.2",
    author: "SAIF",
    role: 0,
    shortDescription: { 
      en: "Check bot's uptime & ping with a cool design!" 
    },
    longDescription: { 
      en: "Get details about how long the bot has been active along with its response time, presented in a stylish format."
    },
    category: "owner",
    guide: { 
      en: "Use {p}monitor to check bot uptime and ping with a cool design!" 
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const startTime = Date.now(); 

      // 🌟 List of male anime characters
      const characters = ["Monkey D. Luffy", "Mikey", "Madara Uchiha", "Itachi Uchiha", "Naruto Uzumaki", "Sasuke Uchiha", "Zoro"];
      const randomCharacter = characters[Math.floor(Math.random() * characters.length)];

      // 🌟 Fetch image of the character using Jikan API (MyAnimeList)
      const characterResponse = await axios.get(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(randomCharacter)}&limit=1`);
      if (!characterResponse.data || !characterResponse.data.data || characterResponse.data.data.length === 0) {
        throw new Error("No character data found from the API.");
      }

      const characterImageURL = characterResponse.data.data[0].images.jpg.image_url;
      const imageBuffer = await axios.get(characterImageURL, { responseType: 'arraybuffer' });

      const cacheDir = path.join(__dirname, 'cache');
      await fs.ensureDir(cacheDir); // Ensure the cache directory exists

      const imagePath = path.join(cacheDir, `monitor_image.jpg`);
      await fs.outputFile(imagePath, imageBuffer.data);

      // ⏳ Uptime Calculation
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      let uptimeFormatted = `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s`;
      if (days === 0) uptimeFormatted = `⏳ ${hours}h ${minutes}m ${seconds}s`;
      if (hours === 0) uptimeFormatted = `⏳ ${minutes}m ${seconds}s`;
      if (minutes === 0) uptimeFormatted = `⏳ ${seconds}s`;

      // 🏓 Ping Calculation
      const ping = Date.now() - startTime;

      // 🎨 Simple Message Design
      const message = `
<🎀 𝐁𝐚𝐛𝐲 𝐒𝐭𝐚𝐭𝐮𝐬༄ 

𝐔𝐩𝐭𝐢𝐦𝐞: ${uptimeFormatted}

𝐏𝐢𝐧𝐠: ${ping}ms

𝐎𝐰𝐧𝐞𝐫: 卡姆鲁尔
`;

      // 📤 Sending Message with Image
      const imageStream = fs.createReadStream(imagePath);
      await api.sendMessage({
        body: message,
        attachment: imageStream
      }, event.threadID, event.messageID);

      await fs.unlink(imagePath); // Clean up the image file
    } catch (error) {
      console.error("Error in monitor command:", error);
      return api.sendMessage(`❌ An error occurred: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
