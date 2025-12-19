const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "uidx",
    version: 2.1,
    author: "Riyel ke jani nh !! (Modified by tom × gpt)",
    longDescription: "Info about bot and owner",
    category: "Special",
    guide: {
      en: "{p}free fire uid just type uid"
    },
    usePrefix: false
  },
  onStart: async function (context) {
    await module.exports.sendOwnerInfo(context);
  },
  onChat: async function ({ event, message, usersData }) {
    const prefix = global.GoatBot.config.prefix;
    const body = (event.body || "").toLowerCase().trim();
    const triggers = ["uid", `${prefix}owner`];
    if (!triggers.includes(body)) return;
    await module.exports.sendOwnerInfo({ event, message, usersData });
  },
  sendOwnerInfo: async function ({ event, message, usersData }) {
    const videoURL = "https://files.catbox.moe/fznvm7.mp4";
    const attachment = await getStreamFromURL(videoURL);
    const id = event.senderID;
    const userData = await usersData.get(id);
    const name = userData.name;
    const mentions = [{ id, tag: name }];
    const info = `
╔════════════════════╗
║  🎮 𝐅𝐑𝐄𝐄 𝐅𝐈𝐑𝐄 𝐈𝐃 🎮  ║
╠════════════════════╣
║  ➤ 𝟡𝟟𝟟𝟙𝟛𝟛𝟟𝟚𝟜𝟑       ║
║  ➤ 𝗠𝗬 𝗕𝐎𝐒𝐒 𝗨𝐈𝐃 あ    ║
╚════════════════════╝
    `.trim();

    message.reply({ body: info, attachment, mentions });
  }
};
