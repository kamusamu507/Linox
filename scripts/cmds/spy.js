const axios = require("axios");

const baseApiUrl = async () => {
  return "https://www.noobs-api.rf.gd";
};

module.exports = {
  config: {
    name: "spy",
    aliases: ["whoishe", "whoisshe", "whoami", "atake"],
    version: "1.0",
    role: 0,
    author: "Dipto // Eren",
    description: "Get user information and profile photo",
    category: "information",
    countDown: 10,
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    try {
      const uid1 = event.senderID;
      const uid2 = Object.keys(event.mentions)[0];
      let uid;

      if (args[0]) {
        if (/^\d+$/.test(args[0])) {
          uid = args[0];
        } else {
          const match = args[0].match(/profile\.php\?id=(\d+)/);
          if (match) uid = match[1];
        }
      }

      if (!uid) {
        uid = event.type === "message_reply"
          ? event.messageReply.senderID
          : uid2 || uid1;
      }

      // Get baby teacher data
      let babyTeach = 0;
      try {
        const apiUrl = await baseApiUrl();
        const response = await axios.get(`${apiUrl}/dipto/baby?list=all`, { timeout: 10000 });
        const dataa = response.data || { teacher: { teacherList: [] } };

        if (dataa?.teacher?.teacherList?.length) {
          const teacherData = dataa.teacher.teacherList.find((t) => t[uid]);
          babyTeach = teacherData ? teacherData[uid] : 0;
        }
      } catch (error) {
        console.error("Failed to fetch baby teacher data:", error.message);
        babyTeach = 0;
      }

      // Get user info
      const userInfo = await api.getUserInfo(uid);
      if (!userInfo[uid]) {
        return message.reply("❌ User not found.");
      }

      const avatarUrl = await usersData.getAvatarUrl(uid);
      const userData = await usersData.get(uid);
      const money = userData?.money || 0;
      const exp = userData?.exp || 0;

      const allUser = await usersData.getAll();
      const rank = allUser.slice().sort((a, b) => b.exp - a.exp).findIndex(u => u.userID === uid) + 1;
      const moneyRank = allUser.slice().sort((a, b) => b.money - a.money).findIndex(u => u.userID === uid) + 1;

      const userInformation = `
°       🔍 𝗨𝗦𝗘𝗥 𝗜𝗡𝗙𝗢       

┌─• 𝗡𝗮𝗺𝗲: ${userInfo[uid].name}
├─• 𝗨𝗜𝗗: ${uid}
├─• 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: ${userInfo[uid].vanity || "𝗡𝗼𝗻𝗲"}
├─• 𝗣𝗿𝗼𝗳𝗶𝗹𝗲: ${userInfo[uid].profileUrl}
├─• 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆: ${userInfo[uid].isBirthday !== false ? userInfo[uid].isBirthday : "𝗣𝗿𝗶𝘃𝗮𝘁𝗲"}
├─• 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲: ${userInfo[uid].alternateName || "𝗡𝗼𝗻𝗲"}
└─• 𝗚𝗲𝗻𝗱𝗲𝗿: ${getGenderEmoji(userInfo[uid].gender)}


│       📊 𝗨𝗦𝗘𝗥 𝗦𝗧𝗔𝗧𝗦        │


┌─• 💰 𝗠𝗼𝗻𝗲𝘆: $${formatMoney(money)}
├─• 🏆 𝗘𝗫𝗣 𝗥𝗮𝗻𝗸: #${rank}
├─• 📈 𝗠𝗼𝗻𝗲𝘆 𝗥𝗮𝗻𝗸: #${moneyRank}
├─• 👥 𝗧𝗼𝘁𝗮𝗹 𝗨𝘀𝗲𝗿𝘀: ${allUser.length}
└─• 👶 𝗕𝗮𝗯𝘆 𝗧𝗲𝗮𝗰𝗵: ${babyTeach || 0}
`;

      message.reply({
        body: userInformation,
        attachment: await global.utils.getStreamFromURL(avatarUrl),
      });
    } catch (error) {
      console.error("Error in spy command:", error);
      message.reply("❌ An error occurred while fetching user information. Please try again later.");
    }
  },
};

function getGenderEmoji(genderCode) {
  switch (genderCode) {
    case 1:
      return "♀️ Girl";
    case 2:
      return "♂️ Boy";
    default:
      return "🌈 Gay";
  }
}

function formatMoney(num) {
  if (!num || isNaN(num)) return "0";
  
  const units = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N", "D"];
  let unit = 0;
  let number = parseFloat(num);
  
  while (number >= 1000 && unit < units.length - 1) {
    number /= 1000;
    unit++;
  }
  
  return number.toFixed(1).replace(/\.0$/, "") + units[unit];
}