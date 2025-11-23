const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "balance",
        aliases: ["bal", "money", "wallet"],
        version: "1.6",
        author: "Mahi",
        countDown: 5,
        role: 0,
        description: { en: "View your money with a beautiful wallet card, rank & anime-style background" },
        category: "economy"
    },

    onStart: async function ({ message, usersData, event, args }) {
        return generateBalanceCard(event, usersData, message);
    }
};

// Format money
function formatMoney(amount) {
    if (amount >= 1e9) return (amount / 1e9).toFixed(2) + "B";
    if (amount >= 1e6) return (amount / 1e6).toFixed(2) + "M";
    if (amount >= 1e3) return (amount / 1e3).toFixed(2) + "K";
    return amount.toFixed(2);
}

// RoundRect helper
function drawRoundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    return ctx;
}

async function generateBalanceCard(event, usersData, message) {
    const userID = Object.keys(event.mentions || {})[0] || event.senderID;
    const userName = event.mentions?.[userID]?.replace("@", "") || await usersData.getName(userID);
    const money = await usersData.get(userID, "money") || 0;
    const bank = await usersData.get(userID, "bank") || 0;

    // Avatar
    const avatarURL = await usersData.getAvatarUrl(userID);

    const canvas = Canvas.createCanvas(900, 400);
    const ctx = canvas.getContext("2d");

    // Purple-themed gradient background
    const gradient = ctx.createLinearGradient(0, 0, 900, 400);
    gradient.addColorStop(0, "#4B0082");  // Dark purple
    gradient.addColorStop(0.5, "#800080"); // Medium purple
    gradient.addColorStop(1, "#DA70D6");  // Light purple
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glow effect (semi-transparent overlay)
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    drawRoundRect(ctx, 30, 50, 840, 300, 25);
    ctx.fill();

    // Optional anime character overlay (semi-transparent)
    try {
        const animeImg = await Canvas.loadImage(path.join(__dirname, "anime_bg.png"));
        ctx.globalAlpha = 0.3;
        ctx.drawImage(animeImg, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
    } catch {}

    // Avatar
    const avatarX = 50, avatarY = 100, avatarSize = 160;
    if (avatarURL) {
        try {
            const avatarImg = await Canvas.loadImage(avatarURL);
            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
            ctx.restore();
        } catch {
            ctx.fillStyle = "#555555";
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        ctx.fillStyle = "#555555";
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Username
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px 'Segoe UI'";
    let displayName = userName.length > 15 ? userName.substring(0, 15) + "..." : userName;
    ctx.fillText(displayName, 250, 130);

    // Rank
    const allUsers = await usersData.getAll();
    const sorted = allUsers.sort((a, b) => b.money - a.money);
    const position = sorted.findIndex(u => u.userID === userID) + 1;
    ctx.font = "bold 28px 'Segoe UI'";
    ctx.fillStyle = "#FFD700";
    ctx.fillText(`🏆 Rank: #${position}`, 250, 270);

    // Cash & Bank left-aligned with same font
    const labels = ["💵 Cash:", "🏦 Bank:"];
    const values = [money, bank];
    let startY = 180;
    for (let i = 0; i < labels.length; i++) {
        ctx.font = "28px 'Segoe UI'";
        ctx.fillStyle = "#FFD700";
        ctx.fillText(labels[i], 250, startY + i * 50);

        ctx.font = "28px 'Segoe UI'";
        ctx.fillStyle = "#00FF99";
        ctx.fillText(formatMoney(values[i]), 400, startY + i * 50);
    }

    // UID
    ctx.font = "18px 'Segoe UI'";
    ctx.fillStyle = "#AAAAAA";
    ctx.fillText(`UID: ${userID}`, 250, 350);

    // Save image
    const imgPath = path.join(__dirname, `balance_${userID}.png`);
    const out = fs.createWriteStream(imgPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    out.on("finish", () => {
        message.reply({
            body: `💰 | 𝐘𝐨𝐮𝐫 \n\n💵 𝐂𝐚𝐬𝐡: $${formatMoney(money)}\n🏦 𝐁𝐚𝐧𝐤: $${formatMoney(bank)}\n🏆 𝐑𝐚𝐧𝐤: #${position}`,
            attachment: fs.createReadStream(imgPath)
        }, () => fs.unlinkSync(imgPath));
    });
}
