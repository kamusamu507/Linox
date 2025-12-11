const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

module.exports.config = {
    name: "tiksr",
    aliases: ["tiktok", "tt", "fyp", "FYP", "4u", "foryou", "tik"],
    version: "1.6",
    author: "DUR4NTO",
    countDown: 3,
    role: 0,
    description: { en: "Direct TikTok video downloader with catbox link" },
    category: "MEDIA"
};

const API = "https://www.dur4nto-yeager.rf.gd/api/tiksr";

function clean(n) {
    return n.replace(/[/\\?%*:|"<>]/g, "").trim().substring(0, 150) || "video";
}

async function uploadCatbox(filepath) {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(filepath));

    const r = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });

    return r.data;
}

async function sendVideo(api, event, query) {
    const res = await axios.get(`${API}?query=${encodeURIComponent(query)}`);
    const vid = res.data;

    const link =
        vid.url ||
        vid.video ||
        vid.videoUrl ||
        vid.download;

    if (!link) {
        await api.sendMessage("No video URL found.", event.threadID);
        return;
    }

    const dl = await axios.get(link, { responseType: "arraybuffer" });
    const buf = dl.data;

    const filename = clean(vid.title || query) + ".mp4";
    const filepath = path.join(__dirname, filename);

    await fs.writeFile(filepath, buf);

    let catbox;
    try {
        catbox = await uploadCatbox(filepath);
    } catch {
        catbox = link;
    }

    const body =
`𝐁𝐚𝐛𝐲🐥
𝐇𝐞𝐫𝐞 𝐢𝐬 𝐲𝐨𝐮𝐫 𝐕𝐢𝐝𝐞𝐨

° ${vid.title || "Video"}
° Link : ${catbox}`;

    await api.sendMessage(
        { body, attachment: fs.createReadStream(filepath) },
        event.threadID
    );

    await fs.unlink(filepath);
}

module.exports.onStart = async function ({ api, args, event }) {
    const query = args.join(" ").trim();
    if (!query) return api.sendMessage("Example: tiksr mikasa", event.threadID);

    try { await sendVideo(api, event, query); }
    catch { api.sendMessage("Download failed.", event.threadID); }
};

module.exports.onReply = async function ({ api, event }) {
    const query = event.body.trim();
    if (!query) return;

    try { await sendVideo(api, event, query); }
    catch { api.sendMessage("Download failed.", event.threadID); }
};
