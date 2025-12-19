module.exports = {
  config: {
    name: "slot",
    version: "3.2",
    author: "OtinXSandip [Edit by kamu]",
    countDown: 10,
    shortDescription: { en: "🎰 Spin & Win!" },
    longDescription: { en: "Quick slot game with instant rewards." },
    category: "game",
  },

  langs: {
    en: {
      invalid_amount: "❌ Min bet: $100",
      not_enough_money: "💸 𝐒𝐫𝐲 𝐬𝐢𝐫 𝐚𝐩𝐧𝐚𝐫 𝐜𝐚𝐬𝐡 𝐧𝐞𝐢",
      win: "• 𝐁𝐚𝐛𝐲, 𝐲𝐨𝐮 𝐰𝐨𝐧 $%1",
      lose: "• 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 $%1",
      jackpot: "• 💰 𝐉𝐀𝐂𝐊𝐏𝐎𝐓! $%1"
    }
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const user = await usersData.get(senderID);
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet < 100) return message.reply(getLang("invalid_amount"));
    if (bet > user.money) return message.reply(getLang("not_enough_money"));

    const slots = ["🍒", "🍋", "💰", "💎", "7️⃣", "🍀", "💙", "💜"];
    const spin = () => slots[Math.floor(Math.random() * slots.length)];

    const [a, b, c] = [spin(), spin(), spin()];
    const result = `[ ${a} | ${b} | ${c} ]`;

    let winAmount = 0;
    if (a === b && b === c) {
      winAmount = bet * (a === "7️⃣" ? 20 : 10);
    } else if (a === b || a === c || b === c) {
      winAmount = bet * 2;
    }

    const finalBalance = user.money + (winAmount - bet);
    await usersData.set(senderID, { money: finalBalance });

    const msg = winAmount > bet
      ? getLang(winAmount >= bet * 10 ? "jackpot" : "win", winAmount)
      : getLang("lose", bet);

    return message.reply(`${msg}\n• 𝐆𝐚𝐦𝐞 𝐑𝐞𝐬𝐮𝐥𝐭𝐬: ${result}`);
  }
};
