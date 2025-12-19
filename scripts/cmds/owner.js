const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "owner",
    version: 2.1,
    author: "Jani nh ke manger nati cng marche 🙂",
    longDescription: "Info about bot and owner",
    category: "Special",
    guide: {
      en: "{p}owner or just type owner"
    },
    usePrefix: false
  },

  onStart: async function (context) {
    await module.exports.sendOwnerInfo(context);
  },

  onChat: async function ({ event, message, usersData }) {
    const prefix = global.GoatBot.config.prefix || "";
    const body = (event.body || "").toLowerCase().trim();
    const triggers = ["owner", `${prefix}owner`];
    if (!triggers.includes(body)) return;
    await module.exports.sendOwnerInfo({ event, message, usersData });
  },

  sendOwnerInfo: async function ({ event, message, usersData }) {
    const videoURL = "https://files.catbox.moe/m9m9ld.mp4";
    const attachment = await getStreamFromURL(videoURL);

    const id = event.senderID;
    const userData = usersData ? await usersData.get(id) : null;
    const name = userData?.name || "User";
    const mentions = [{ id, tag: name }];

    const info = `
╭─❖─────────────❖
│   │     𝐎𝐰𝐧𝐞𝐫 𝐈𝐧𝐟𝐨     │
├─────────────────❖
│ 👤 Name       : 𝐋𝐮𝐜𝐢𝐟ē𝐫𝐢𝐚𝐧 II
│ 📍 From        : 𝐘𝐨𝐮𝐫 𝐇𝐞𝐚𝐫𝐭 II
│ 🎓 Class       : 𝟱 II
│ 🎂 Birthday  : 𝟵 𝗡𝗼𝘃 II
│ 🔞 Age    : 𝐃𝐨𝐞𝐬𝐧'𝐭 𝐦𝐚𝐭𝐭𝐞𝐫 II
│ 📏 Height     : 𝐔𝐧𝐤𝐧𝐨𝐰𝐧 II
│ 🕌 Religion : 𝐈𝐬𝐥𝐚𝐦 II
├─────────────────❖
│ 🔗 Facebook : 𝐟𝟑𝐜𝐤𝐮𝐔 II
│ 📸 Instagram : 𝐥𝐨𝐚𝐝𝐢𝗻𝗴 II
│ ❤️ Relation  : 𝐒𝐞𝐜𝐫𝐞𝐭 II
│ 🩸 Blood group : 𝐍𝐨𝐭 𝐬𝐮𝐫𝐞 II
╰─❖─────────────❖
    `.trim();

    if (message && typeof message.reply === "function") {
      message.reply({
        body: info,
        attachment,
        mentions
      });
    } else if (event && typeof global.GoatBot.api.sendMessage === "function") {
      global.GoatBot.api.sendMessage(
        { body: info, attachment, mentions },
        event.threadID
      );
    }
  }
};
