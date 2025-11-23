const axios = require("axios");
const fs = require("fs");
const path = require("path");

const DOWNLOAD_RETRIES = 3;
const RETRY_BASE_MS = 700;
const MAX_REDIRECTS = 5;

module.exports = {
  config: {
    name: "sing",
    aliases: ["playsing"],
    version: "1.5",
    author: "Mahi",
    countDown: 5,
    role: 0,
    shortDescription: "Play any song by name",
    category: "media",
    guide: {
      en: "{pn} <song name>"
    }
  },

  onStart: async function ({ message, args }) {
    if (!args[0]) return message.reply("Please provide a song name.");

    const query = encodeURIComponent(args.join(" "));
    const apiUrl = `https://www.dur4nto-yeager.rf.gd/api/sing?query=${query}`;
    const tempBase = `${Date.now()}_song`;
    let filePathBase = null;

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    async function downloadToFileWithRetries(url, destBase) {
      let lastErr = null;
      for (let attempt = 1; attempt <= DOWNLOAD_RETRIES; attempt++) {
        try {
          const tmpPath = destBase + ".part";
          if (fs.existsSync(tmpPath)) try { fs.unlinkSync(tmpPath); } catch (_) {}

          const resp = await axios({
            url,
            method: "GET",
            responseType: "stream",
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            maxRedirects: MAX_REDIRECTS,
            headers: {
              "User-Agent": "Mozilla/5.0 (Node.js)",
              "Accept": "*/*",
              "Accept-Encoding": "identity"
            },
            validateStatus: status => status >= 200 && status < 400
          });

          const contentLengthRaw = resp.headers['content-length'];
          const expectedBytes = contentLengthRaw ? parseInt(contentLengthRaw, 10) : null;

          const writer = fs.createWriteStream(tmpPath);
          let written = 0;
          resp.data.on('data', chunk => { written += chunk.length; });

          resp.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("close", resolve);
            writer.on("error", reject);
            resp.data.on("error", reject);
          });

          const st = fs.statSync(tmpPath);
          const actualBytes = st.size;

          if (expectedBytes && actualBytes !== expectedBytes) {
            throw new Error(`Incomplete download (expected ${expectedBytes}, got ${actualBytes})`);
          }

          const contentType = (resp.headers['content-type'] || '').toLowerCase();
          const extMap = {
            "audio/mpeg": ".mp3",
            "audio/mp3": ".mp3",
            "audio/mp4": ".m4a",
            "audio/x-m4a": ".m4a",
            "audio/webm": ".webm",
            "audio/ogg": ".ogg",
            "video/mp4": ".m4a",
            "video/mpeg": ".mp3"
          };
          const extFromType = extMap[contentType] || path.extname(url).split('?')[0] || ".mp3";
          const finalPath = destBase + extFromType;

          fs.renameSync(tmpPath, finalPath);

          return { path: finalPath, bytes: actualBytes, contentType };

        } catch (err) {
          lastErr = err;
          try { if (fs.existsSync(destBase + ".part")) fs.unlinkSync(destBase + ".part"); } catch (_) {}
          if (attempt < DOWNLOAD_RETRIES) {
            const wait = RETRY_BASE_MS * Math.pow(2, attempt - 1);
            await sleep(wait);
          }
        }
      }
      throw lastErr;
    }

    try {
      const apiResp = await axios.get(apiUrl, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: { "User-Agent": "Mozilla/5.0 (Node.js)" },
        maxRedirects: MAX_REDIRECTS,
        validateStatus: status => status >= 200 && status < 400
      });

      const data = apiResp.data;
      if (!data || data.success !== true || !data.url) {
        return message.reply("❌ | No playable result found from API.");
      }

      const title = data.title || args.join(" ");
      const thumbnail = data.thumbnail || "";
      const mediaUrl = data.url;

      filePathBase = path.join(__dirname, `${tempBase}`);

      const downloadResult = await downloadToFileWithRetries(mediaUrl, filePathBase);
      const sendPath = downloadResult.path;

      if (!fs.existsSync(sendPath)) {
        throw new Error("Downloaded file missing before send.");
      }

      const bodyLines = [
        `🎧 Title: ${title}`,
        `🔎 Query: ${args.join(" ")}`,
        thumbnail ? `🖼️ Thumbnail: ${thumbnail}` : null,
        `📥 Source: ${mediaUrl}`
      ].filter(Boolean).join("\n");

      message.reply({
        body: bodyLines,
        attachment: fs.createReadStream(sendPath)
      }, () => {
        try { if (fs.existsSync(sendPath)) fs.unlinkSync(sendPath); } catch (_) {}
      });

    } catch (error) {
      console.error("sing command error:", error && (error.stack || error.message || error));
      try { if (filePathBase && fs.existsSync(filePathBase + ".part")) fs.unlinkSync(filePathBase + ".part"); } catch (_) {}
      try {
        const candidates = fs.readdirSync(__dirname).filter(f => f.includes(tempBase));
        candidates.forEach(f => {
          try { fs.unlinkSync(path.join(__dirname, f)); } catch (_) {}
        });
      } catch (_) {}
      return message.reply("❌ | Failed to fetch or play the song. (" + (error.message || "unknown") + ")");
    }
  }
};
