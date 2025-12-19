module.exports = {
  config: {
    name: "top",
    aliases: ["tp"],
    version: "1.3",
    author: "𝐓𝐎𝐌 × GPT",
    role: 0,
    shortDescription: {
      en: "Top 15 Rich Users"
    },
    longDescription: {
      en: "Displays the top 15 richest users with styled names and real balance"
    },
    category: "group",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, message, event, usersData }) {
    return await this.runTopCommand({ api, message, event, usersData });
  },

  onChat: async function ({ api, message, event, usersData }) {
    const body = (event.body || "").toLowerCase().trim();
    if (body !== "top" && body !== "tp") return;
    return await this.runTopCommand({ api, message, event, usersData });
  },

  runTopCommand: async function ({ api, message, event, usersData }) {
    const allUsers = await usersData.getAll();
    const topUsers = allUsers
      .filter(u => u.money && !isNaN(u.money))
      .sort((a, b) => b.money - a.money)
      .slice(0, 15);

    const symbols = ["🥇", "🥈", "🥉"];

    const styledDigit = digit => {
      const map = ["𝟎","𝟏","𝟐","𝟑","𝟒","𝟓","𝟔","𝟕","𝟖","𝟗"];
      return map[digit] || digit;
    };

    const styledIndex = i => {
      return (i + 1).toString().split('').map(d => styledDigit(parseInt(d))).join('');
    };

    const toStyledName = text => {
      const map = {
        a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠",
        h: "𝐡", i: "𝐢", j: "𝐣", k: "𝐤", l: "𝐥", m: "𝐦", n: "𝐧",
        o: "𝐨", p: "𝐩", q: "𝐪", r: "𝐫", s: "𝐬", t: "𝐭", u: "𝐮",
        v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲", z: "𝐳",
        A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆",
        H: "𝐇", I: "𝐈", J: "𝐉", K: "𝐊", L: "𝐋", M: "𝐌", N: "𝐍",
        O: "𝐎", P: "𝐏", Q: "𝐐", R: "𝐑", S: "𝐒", T: "𝐓", U: "𝐔",
        V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙"
      };
      return text.split("").map(c => map[c] || c).join("");
    };

    const formatMoneyM = amount => {
      if (!isFinite(amount)) return "Infinity𝐌$";
      if (amount >= 1e12) return `${(amount / 1e12).toFixed(1)}𝐓$`;
      if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)}𝐁$`;
      if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}𝐌$`;
      if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}𝐊$`;
      return `${amount.toFixed(1)}$`;
    };

    const topList = topUsers.map((user, index) => {
      const medal = symbols[index] || styledIndex(index);
      const styledName = toStyledName(user.name || "Unknown");
      const moneyText = formatMoneyM(user.money || 0);
      return `${medal}. ${styledName}: ${moneyText}`;
    });

    const finalMessage = `👑 | 𝐓𝐨𝐩 𝟏𝟓 𝐑𝐢𝐜𝐡𝐞𝐬𝐭 𝐔𝐬𝐞𝐫𝐬:\n\n${topList.join('\n')}`;

    await message.reply(finalMessage);
  }
};
