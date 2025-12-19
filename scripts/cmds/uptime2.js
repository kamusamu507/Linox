module.exports = {
	config: {
  name: "uptime2",
  aliases: ["up2", "upt2"],
  version: "1.0",
  author: "Ullash ッ",
  role: 0,
  shortDescription: {
   en: "Check the bot's uptime."
  },
  longDescription: {
   en: "Shows how long the bot has been running."
  },
  category: "system",
  guide: {
   en: "Use {p}uptime2 or just type uptime2 without prefix."
  }
	},

	onStart: async function () {},

	onChat: async function ({ message, event }) {
  const prefix = global.GoatBot.config.prefix;
  const body = (event.body || "").toLowerCase().trim();

  // Remove prefix if exists
  let command = body;
  if (body.startsWith(prefix)) {
   command = body.slice(prefix.length).trim(); // remove prefix
  }

  // All valid commands
  const validCommands = ["uptime2", "upt2", "up2"];

  if (!validCommands.includes(command)) return;

  // Uptime calculation
  const uptime = process.uptime();
  const seconds = Math.floor(uptime % 60);
  const minutes = Math.floor((uptime / 60) % 60);
  const hours = Math.floor((uptime / (60 * 60)) % 24);
  const days = Math.floor(uptime / (60 * 60 * 24));

  let uptimeString = "";
  if (days > 0) uptimeString += `➪ ${days} day${days > 1 ? "s" : ""}\n`;
  if (hours > 0) uptimeString += `➪ ${hours} hour${hours > 1 ? "s" : ""}\n`;
  if (minutes > 0) uptimeString += `➪ ${minutes} minute${minutes > 1 ? "s" : ""}\n`;
  uptimeString += `➪ ${seconds} second${seconds > 1 ? "s" : ""}`;

  const messageContent = `🎀🐥 BA'BY くめ\n\n${uptimeString}\n\n`;

  message.reply(messageContent);
	}
};
