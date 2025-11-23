const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "song",
    aliases: ["sng", "muic"],
    version: "1.0",
    author: "Eren Yeager",
    countDown: 5,
    role: 0,
    shortDescription: "Play music from YouTube",
    longDescription: "Search and stream mp3 audio from YouTube using your API",
    category: "media"
  },

  onStart: async function ({ args, message, api, event }) {
    if (!args.length)
      return message.reply("⚠️ Please type a song name.\nUsage: song <name>");

    const query = args.join(" ");
    let loadingMsgID;

    try {
      // FIRST SEARCH THE SONG
      const res = await ytSearch(query);
      const video = res.videos.length > 0 ? res.videos[0] : null;

      if (!video) {
        return message.reply("😿 No results found for your query.");
      }

      // THEN SEND LOADING MESSAGE
      const loadingMsg = await message.reply(`⬇️ Downloading your song...\n🎵 ${video.title}`);
      loadingMsgID = loadingMsg.messageID;

      const videoUrl = `https://youtube.com/watch?v=${video.videoId}`;
      const apiUrl = `https://sivexis-mahi.vercel.app/api/song?url=${encodeURIComponent(videoUrl)}`;

      // UNSEND LOADING
      await api.unsendMessage(loadingMsgID);

      // SEND AUDIO
      await message.reply({
        body: `🎶 Now Playing:\n${video.title}`,
        attachment: await global.utils.getStreamFromURL(apiUrl)
      });

    } catch (err) {
      console.error(err);
      if (loadingMsgID) await api.unsendMessage(loadingMsgID);
      await message.reply("❌ Failed to process. Try again later.");
    }
  }
};
