module.exports = {
  config: {
    name: "pending",
    version: "2.0",
    author: "ArYan 🐔",
    countDown: 5,
    role: 0,
    shortDescription: { vi: "", en: "" },
    longDescription: { vi: "", en: "" },
    category: "ArYan"
  },

  langs: {
    en: {
      invaildNumber: "%1 is not a valid number!",
      approveSuccess: "✅ Approved %1 thread(s) successfully!",
      cantGetPendingList: "⚠️ Can't get the pending list!",
      returnListPending: "»「PENDING」«\n❮ Total pending threads: %1 ❯\n\n%2",
      returnListClean: "✅ No threads in the pending list.",
      approveAllSuccess: "✅ Approved all %1 pending threads!",
      cancelSuccess: "❌ Rejected %1 thread(s) successfully!",
      cancelAllSuccess: "❌ Rejected all %1 pending threads!"
    }
  },

  onReply: async function ({ api, event, Reply, getLang }) {
    if (String(event.senderID) !== String(Reply.author)) return;
    const { body, threadID, messageID } = event;
    let count = 0;

    // Approve All
    if (body.toLowerCase() === "all") {
      for (const group of Reply.pending) {
        try {
          // approve by sending message
          await api.sendMessage("✅ Group Approved & Connected!", group.threadID);

          const prefix =
            (global.GoatBot.config.prefix && global.GoatBot.config.prefix[group.threadID]) ||
            global.GoatBot.config.prefix?.default ||
            "-";

          const msg = `╭━「 ✅ 𝐆𝐫𝐨𝐮𝐩 𝐀𝐩𝐩𝐫𝐨𝐯𝐞𝐝 」
┃📍 𝐆𝐥𝐨𝐛𝐚𝐥 𝐏𝐫𝐞𝐟𝐢𝐱: -
┃👥 𝐓𝐡𝐫𝐞𝐚𝐝 𝐏𝐫𝐞𝐟𝐢𝐱: ${prefix}
┃🧸 𝐒𝐭𝐚𝐭𝐮𝐬: Connected 🎉
╰━━━━━━━━━━━━━╮
╭─❍ 𝐁𝐨𝐭 𝐁𝐲: Mahi
┃🌐 FB: Ryuū Erēn
╰━━━━━━━━━━━━━╯`;

          await api.sendMessage(msg, group.threadID);
          count++;
        } catch (e) {
          console.error("Approve failed:", e);
        }
      }
      return api.sendMessage(getLang("approveAllSuccess", count), threadID, messageID);
    }

    // Cancel All
    if (body.toLowerCase() === "cancel all") {
      for (const group of Reply.pending) {
        try {
          await api.removeUserFromGroup(api.getCurrentUserID(), group.threadID);
          count++;
        } catch (e) {
          console.error("Cancel failed:", e);
        }
      }
      global.GoatBot.onReply.delete(Reply.messageID);
      return api.sendMessage(getLang("cancelAllSuccess", count), threadID, messageID);
    }

    // Approve/Cancel selected
    const indexes = body.split(/\s+/);
    for (const i of indexes) {
      const num = parseInt(i);
      if (isNaN(num) || num <= 0 || num > Reply.pending.length)
        return api.sendMessage(getLang("invaildNumber", i), threadID, messageID);

      const group = Reply.pending[num - 1];

      if (body.toLowerCase().includes("cancel")) {
        // Reject
        try {
          await api.removeUserFromGroup(api.getCurrentUserID(), group.threadID);
          count++;
        } catch (e) {
          console.error("Cancel failed:", e);
        }
      } else {
        // Approve
        try {
          await api.sendMessage("✅ Group Approved & Connected!", group.threadID);

          const prefix =
            (global.GoatBot.config.prefix && global.GoatBot.config.prefix[group.threadID]) ||
            global.GoatBot.config.prefix?.default ||
            "-";

          const msg = `╭━「 ✅ 𝐆𝐫𝐨𝐮𝐩 𝐀𝐩𝐩𝐫𝐨𝐯𝐞𝐝 」
┃📍 𝐆𝐥𝐨𝐛𝐚𝐥 𝐏𝐫𝐞𝐟𝐢𝐱: -
┃👥 𝐓𝐡𝐫𝐞𝐚𝐝 𝐏𝐫𝐞𝐟𝐢𝐱: ${prefix}
┃🧸 𝐒𝐭𝐚𝐭𝐮𝐬: Connected 🎉
╰━━━━━━━━━━━━━╮
╭─❍ 𝐁𝐨𝐭 𝐁𝐲: Mahi
┃🌐 FB: Ryuū Erēn
╰━━━━━━━━━━━━━╯`;

          await api.sendMessage(msg, group.threadID);
          count++;
        } catch (e) {
          console.error("Approve failed:", e);
        }
      }
    }

    if (body.toLowerCase().includes("cancel"))
      return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);
    else return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
  },

  onStart: async function ({ api, event, getLang, commandName }) {
    const { threadID, messageID, senderID } = event;

    // Permission check
    const permission = global.GoatBot?.config?.DEV || [];
    if (!permission.includes(senderID)) {
      api.sendMessage("- মাদারচুদ বট কি তর বাপের নাকি..!😾", threadID, messageID);
      return;
    }

    let msg = "", index = 1;

    try {
      var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      var pending = await api.getThreadList(100, null, ["PENDING"]) || [];
    } catch (e) {
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }

    const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);
    for (const ArYan of list) msg += `${index++}/ ${ArYan.name || "null"} (${ArYan.threadID})\n`;

    if (list.length !== 0) {
      return api.sendMessage(
        getLang("returnListPending", list.length, msg) +
          `\n\n`,
        threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: senderID,
            pending: list
          });
        },
        messageID
      );
    } else {
      return api.sendMessage(getLang("returnListClean"), threadID, messageID);
    }
  }
};
