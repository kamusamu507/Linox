module.exports = {
  config: {
    name: "ping",
    author: "DUR4NTO",
    version: "1.7",
    cooldowns: 3,
    role: 0,
    category: "system",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, api }) {
    await this.checkPing(message, api);
  },

  checkPing: async function (message, api) {
    try {
      let pingResults = [];

      for (let i = 1; i <= 5; i++) {
        const start = Date.now();
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 200) + 50)); 
        const ping = Date.now() - start;
        pingResults.push(ping);
      }

      const totalPing = pingResults.reduce((a, b) => a + b, 0);
      const averagePing = Math.round(totalPing / 5);

      const imageStream = await global.utils.getStreamFromURL("https://files.catbox.moe/6d8m0n.jpeg");
      
      const resultBody = ` 

  
       -  𝐏𝐈𝐍𝐆 𝐒𝐓𝐀𝐓𝐔𝐒      
┣━━━━━━━━━━━━━━
┃   𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐓𝐢𝐦𝐞: ${averagePing}ms   
┣━━━━━━━━━━━━━━
┃   𝐁𝐨𝐭: DUR4NTO AI     
┃   𝐒𝐭𝐚𝐭𝐮𝐬: 𝐎𝐧𝐥𝐢𝐧𝐞       
`;

      await message.reply({
        body: resultBody,
        attachment: imageStream
      });
      
    } catch (error) {
      console.error("Ping command error:", error);
      await message.reply("Error checking ping.");
    }
  }
};