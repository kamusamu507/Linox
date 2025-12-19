const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configuration
const ALLOWED_UID = "61577103244134";
const API_SOURCE = "https://raw.githubusercontent.com/Ayan-alt-deep/xyc/main/baseApiurl.json";

module.exports = {
  config: {
    name: "xbin",
    aliases: ["xbin"],
    version: "3.2",
    author: "Eren (Modified by tom)",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Upload files to APIbin [Owner Only]"
    },
    longDescription: {
      en: "Upload files to apibin-x3 (dynamic API, Owner restricted)"
    },
    category: "utility",
    guide: {
      en: "{pn} <filename> or reply to a file"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      if (event.senderID !== ALLOWED_UID) {
        return message.reply("𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐧𝐞 𝐚𝐠𝐞 𝐛𝐨𝐥𝐨𝐝 😆");
      }

      const baseApiUrl = await getApiBinUrl();
      if (!baseApiUrl) {
        return message.reply("❌ Failed to fetch API base URL.");
      }

      if (event.type === "message_reply" && event.messageReply.attachments) {
        return this.uploadAttachment(api, event, baseApiUrl);
      }

      const fileName = args[0];
      if (!fileName) {
        return message.reply("📝 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐟𝐢𝐥𝐞𝐧𝐚𝐦𝐞 𝐨𝐫 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐟𝐢𝐥𝐞 !! ");
      }

      await this.uploadFile(api, event, fileName, baseApiUrl);
    } catch (error) {
      console.error(error);
      message.reply("❌ Error: " + error.message);
    }
  },

  onChat: async function ({ api, event, args, message }) {
    const body = (event.body || "").trim().toLowerCase();
    
    // Check for both prefixed and non-prefixed commands
    if (body === "xbin" || body.startsWith("xbin ")) {
      // Extract arguments
      const commandArgs = body.split(/\s+/).slice(1);
      await this.onStart({ 
        api, 
        event, 
        args: commandArgs, 
        message 
      });
    }
  },

  uploadFile: async function (api, event, fileName, baseApiUrl) {
    const filePath = this.findFilePath(fileName);
    if (!filePath.exists) {
      return api.sendMessage(`🔍 𝐅𝐢𝐥𝐞 "${fileName}" 𝐍𝐨𝐭 𝐟𝐨𝐮𝐧𝐝`, event.threadID, event.messageID);
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath.fullPath));

    const { data } = await axios.post(`${baseApiUrl}/upload`, form, {
      headers: form.getHeaders()
    });

    api.sendMessage({
      body: `✅ 𝐅𝐢𝐥𝐞 𝐮𝐩𝐥𝐨𝐚𝐝𝐞𝐝!\n📝 𝐑𝐚𝐰: ${data.raw}`,
      attachment: null
    }, event.threadID, event.messageID);
  },

  uploadAttachment: async function (api, event, baseApiUrl) {
    const attachment = event.messageReply.attachments[0];
    const response = await axios.get(attachment.url, { responseType: 'stream' });

    const form = new FormData();
    form.append('file', response.data, attachment.name || 'file.bin');

    const { data } = await axios.post(`${baseApiUrl}/upload`, form, {
      headers: form.getHeaders()
    });

    api.sendMessage({
      body: `✅ Attachment uploaded!\n📝 Raw: ${data.raw}`,
      attachment: null
    }, event.threadID, event.messageID);
  },

  findFilePath: function (fileName) {
    const dir = path.join(__dirname, '..', 'cmds');
    const extensions = ['', '.js', '.ts', '.txt'];

    for (const ext of extensions) {
      const filePath = path.join(dir, fileName + ext);
      if (fs.existsSync(filePath)) {
        return { exists: true, fullPath: filePath };
      }
    }
    return { exists: false };
  }
};

async function getApiBinUrl() {
  try {
    const { data } = await axios.get(API_SOURCE);
    return data.uploadApi;
  } catch (err) {
    console.error("Failed to fetch base API URL:", err.message);
    return null;
  }
  }
