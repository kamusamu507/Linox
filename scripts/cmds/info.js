const moment = require('moment-timezone');
const axios = require('axios');

module.exports = {
  config: {
    name: "info",
    aliases: ["Info", "in4"],
    version: "2.0",
    author: "Eren",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Sends information about the bot and admin along with a video."
    },
    longDescription: {
      en: "Sends information about the bot and admin along with a video."
    },
    category: "Information",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    await this.sendInfo(message);
  },

  onChat: async function ({ event, message }) {
    if (event.body && event.body.toLowerCase() === "info") {
      await this.sendInfo(message);
    }
  },

  sendInfo: async function (message) {
    const botName = "𝗕𝗔'𝗕𝗬 くめ";
    const authorName = "Lucifērian II";
    const authorFB = "f3ckuU";
    const authorInsta = "Loading..";
    const status = "Single";
    const age = "Secret";
    const gender = "Male";

    const now = moment().tz('Asia/Dhaka');
    const time = now.format('h:mm:ss A');

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

    const videoUrl = "https://files.catbox.moe/pnr02n.mp4";

    const body = `
👤 Admin Info!
────────────
• Name      : ${authorName}
• Age       : ${age}
• Gender    : ${gender}
• Facebook  : ${authorFB}
• Instagram : @${authorInsta}
• Status    : ${status}

🤖 Bot Details
──────────────
• Name      : ${botName}
• Time      : ${time}
• Uptime    : ${uptimeString}

- I may not be perfect, but I’ll always reply to you. 
`;

    try {
      const response = await axios.get(videoUrl, { responseType: 'stream' });

      await message.reply({
        body,
        attachment: response.data
      });
    } catch (error) {
      console.error("Error sending video:", error);
      await message.reply(body);
    }
  }
};
