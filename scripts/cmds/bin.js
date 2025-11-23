const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ALLOWED_UIDs = ["61560839870893", "61581800684497", "61577983130441"];
const BASE_API = "https://mahi-binx.vercel.app";

module.exports = {
  config: {
    name: "exbin",
    aliases: ["bin"],
    version: "3.5",
    author: "Eren",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Upload files to APIbin [Owner Only]" },
    longDescription: { en: "Upload files to apibin-x3 (Owner restricted)" },
    category: "utility",
    guide: { en: "{pn} <filename> or reply to a file" }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      if (!ALLOWED_UIDs.includes(event.senderID)) 
        return message.reply("⛔ You are not authorized to use this command.");

      if (event.type === "message_reply" && event.messageReply.attachments) {
        return this.uploadAttachment(api, event);
      }

      const fileName = args[0];
      if (!fileName) return message.reply("📝 Please provide a filename or reply to a file");

      await this.uploadFile(api, event, fileName);
    } catch (error) {
      console.error(error);
      message.reply("❌ Error: " + error.message);
    }
  },

  uploadFile: async function (api, event, fileName) {
    const filePath = this.findFilePath(fileName);
    if (!filePath.exists) return api.sendMessage(`🔍 File "${fileName}" not found!`, event.threadID, event.messageID);

    const fileBuffer = fs.readFileSync(filePath.fullPath);
    const base64Data = `data:application/octet-stream;base64,${fileBuffer.toString('base64')}`;

    const { data } = await axios.post(`${BASE_API}/upload`, { file: base64Data }, { headers: { "Content-Type": "application/json", "x-filename": fileName } });
    api.sendMessage({ body: `✅ File uploaded!\n\n🖇️ url: ${data.url}` }, event.threadID, event.messageID);
  },

  uploadAttachment: async function (api, event) {
    const attachment = event.messageReply.attachments[0];
    const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
    const base64Data = `data:application/octet-stream;base64,${Buffer.from(response.data).toString('base64')}`;

    const { data } = await axios.post(`${BASE_API}/upload`, { file: base64Data }, { headers: { "Content-Type": "application/json", "x-filename": attachment.name || 'file.bin' } });
    api.sendMessage({ body: `✅ Attachment uploaded!\n📝 Raw: ${data.url}` }, event.threadID, event.messageID);
  },

  findFilePath: function (fileName) {
    const dir = path.join(__dirname, '..', 'cmds');
    const extensions = ['', '.js', '.ts', '.txt'];
    for (const ext of extensions) {
      const filePath = path.join(dir, fileName + ext);
      if (fs.existsSync(filePath)) return { exists: true, fullPath: filePath };
    }
    return { exists: false };
  }
};
