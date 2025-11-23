const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

let tempSearchResults = {};

module.exports = {
  config: {
    name: "pin",
    aliases: ["pinterest"],
    version: "1.9",
    author: "DUR4NTO",
    countDown: 15,
    role: 0,
    shortDescription: "Pinterest Image Search",
    longDescription: "Pinterest Image Search with elegant grid preview and reply selection",
    category: "download",
    guide: {
      en: "{pn} query - number\nThen reply 1,2,3... to get full image",
    },
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      // --- 1️⃣ Handle reply selection ---
      if (event.type === "message_reply" && event.messageReply) {
        const repliedMessage = event.messageReply.body;
        if (repliedMessage && (repliedMessage.includes("Pinterest Grid") || repliedMessage.includes("Reply to this message"))) {
          const replyNumber = parseInt(event.body.trim());
          
          if (!isNaN(replyNumber) && tempSearchResults[event.senderID]) {
            const images = tempSearchResults[event.senderID].images;
            const index = replyNumber - 1;
            
            if (index >= 0 && index < images.length) {
              try {
                await message.reply(`⬇️ | Downloading image ${replyNumber}...`);
                
                const imgResponse = await axios.get(images[index], { 
                  responseType: "stream",
                  timeout: 30000
                });
                
                delete tempSearchResults[event.senderID];
                
                await message.reply({
                  body: `✅ | Successfully downloaded image ${replyNumber}!`,
                  attachment: imgResponse.data
                });
                return;
                
              } catch (error) {
                console.error("Image download error:", error);
                await message.reply("❌ | Failed to download the selected image. Please try again.");
                return;
              }
            } else {
              await message.reply(`❌ | Invalid selection. Please choose between 1-${images.length}`);
              return;
            }
          }
        }
      }

      // --- 2️⃣ Normal search ---
      if (!args || args.length === 0) {
        return message.reply(
          "❌ | Wrong Format\n💡 | Use: pin query - number\nExample: pin Saitama - 5"
        );
      }

      const fullQuery = args.join(" ");
      const queryParts = fullQuery.split("-");
      
      if (queryParts.length < 2) {
        return message.reply(
          "❌ | Wrong Format\n💡 | Use: pin query - number\nExample: pin Saitama - 5"
        );
      }

      const q = queryParts[0].trim();
      const length = queryParts[1].trim();
      
      if (!q || !length || isNaN(length)) {
        return message.reply(
          "❌ | Invalid format\n💡 | Use: pin query - number\nExample: pin Saitama - 5"
        );
      }

      const imageCount = parseInt(length);
      if (imageCount < 1 || imageCount > 20) {
        return message.reply("❌ | Number must be between 1-20");
      }

      const w = await message.reply(`🔍 | Searching for "${q}"...`);

      try {
        const response = await axios.get(`https://www.dur4nto-yeager.rf.gd/api/pin?search=${encodeURIComponent(q)}&count=${encodeURIComponent(imageCount)}`, {
          timeout: 30000
        });
        const data = response.data;

        if (!data || data.status !== "success" || !data.images || !Array.isArray(data.images)) {
          await api.unsendMessage(w.messageID);
          return message.reply("❌ | No images found or API error");
        }

        const images = data.images.slice(0, imageCount);
        if (images.length === 0) {
          await api.unsendMessage(w.messageID);
          return message.reply("❌ | No images found");
        }

        // Save for reply selection
        tempSearchResults[event.senderID] = {
          images: images,
          timestamp: Date.now(),
          query: q
        };

        // Clean old results
        const now = Date.now();
        for (const userID in tempSearchResults) {
          if (now - tempSearchResults[userID].timestamp > 10 * 60 * 1000) {
            delete tempSearchResults[userID];
          }
        }

        // --- 3️⃣ Create grid canvas ---
        const columns = Math.min(images.length, 3);
        const rows = Math.ceil(images.length / columns);
        const thumbSize = 400; // Increased from 300 to 400
        const padding = 10; // Reduced padding to remove white space

        // Calculate canvas dimensions without extra white space
        const canvasWidth = columns * thumbSize + (columns + 1) * padding;
        const canvasHeight = rows * thumbSize + (rows + 1) * padding;
        
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext("2d");

        // Background - Dark theme for better contrast
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Load and draw images
        let loadedImages = 0;
        const imagePromises = images.map(async (imgUrl, i) => {
          try {
            const img = await loadImage(imgUrl);
            const col = i % columns;
            const row = Math.floor(i / columns);
            
            const x = padding + col * (thumbSize + padding);
            const y = padding + row * (thumbSize + padding);

            // Draw image with rounded corners
            ctx.save();
            
            // Create rounded rectangle path
            const radius = 15;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + thumbSize - radius, y);
            ctx.quadraticCurveTo(x + thumbSize, y, x + thumbSize, y + radius);
            ctx.lineTo(x + thumbSize, y + thumbSize - radius);
            ctx.quadraticCurveTo(x + thumbSize, y + thumbSize, x + thumbSize - radius, y + thumbSize);
            ctx.lineTo(x + radius, y + thumbSize);
            ctx.quadraticCurveTo(x, y + thumbSize, x, y + thumbSize - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.clip();

            // Draw the image
            ctx.drawImage(img, x, y, thumbSize, thumbSize);
            ctx.restore();

            // Add overlay with text inside each image
            const overlayHeight = 60;
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(x, y + thumbSize - overlayHeight, thumbSize, overlayHeight);

            // Number circle
            ctx.fillStyle = "#ff4444";
            ctx.beginPath();
            ctx.arc(x + 35, y + thumbSize - overlayHeight / 2, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // Number text
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`${i + 1}`, x + 35, y + thumbSize - overlayHeight / 2);

            // Selection text inside image
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 14px Arial";
            ctx.textAlign = "left";
            ctx.fillText("Click to select", x + 60, y + thumbSize - overlayHeight / 2 - 8);
            
            ctx.font = "12px Arial";
            ctx.fillText("Reply with this number", x + 60, y + thumbSize - overlayHeight / 2 + 10);

            loadedImages++;
          } catch (error) {
            console.error(`Failed to load image ${i + 1}:`, error);
          }
        });

        await Promise.allSettled(imagePromises);

        if (loadedImages === 0) {
          await api.unsendMessage(w.messageID);
          return message.reply("❌ | Failed to load any images");
        }

        const buffer = canvas.toBuffer("image/png");
        const tmpPath = path.join(__dirname, `temp_${event.senderID}_${Date.now()}.png`);
        fs.writeFileSync(tmpPath, buffer);

        await api.unsendMessage(w.messageID);

        const sentMessage = await message.reply({
          body: `📌 | Search: "${q}"\n🖼️ | Images: ${loadedImages}\n💬 | Reply 1-${loadedImages} to download\n⏰ | Expires in 10 min`,
          attachment: fs.createReadStream(tmpPath)
        });

        tempSearchResults[event.senderID].messageID = sentMessage.messageID;

        // Clean up temp file
        setTimeout(() => {
          if (fs.existsSync(tmpPath)) {
            fs.unlinkSync(tmpPath);
          }
        }, 5000);

      } catch (error) {
        console.error("Search error:", error);
        await api.unsendMessage(w.messageID);
        await message.reply("❌ | Search failed. Please try again later.");
      }

    } catch (error) {
      console.error("Global error:", error);
      await message.reply("❌ | An unexpected error occurred");
    }
  },

  // Handle chat events for reply detection
  onChat: async function ({ api, event, message }) {
    if (event.type === "message_reply" && event.messageReply) {
      const repliedMessage = event.messageReply.body;
      
      if (repliedMessage && (repliedMessage.includes("Pinterest Grid") || repliedMessage.includes("Reply to this message") || repliedMessage.includes("Search:"))) {
        const replyNumber = parseInt(event.body.trim());
        
        if (!isNaN(replyNumber) && tempSearchResults[event.senderID]) {
          const images = tempSearchResults[event.senderID].images;
          const index = replyNumber - 1;
          
          if (index >= 0 && index < images.length) {
            try {
              await message.reply(`⬇️ | Downloading image ${replyNumber}...`);
              
              const imgResponse = await axios.get(images[index], { 
                responseType: "stream",
                timeout: 30000
              });
              
              delete tempSearchResults[event.senderID];
              
              await message.reply({
                body: `✅ | Image ${replyNumber} downloaded successfully!`,
                attachment: imgResponse.data
              });
              
            } catch (error) {
              console.error("Image download error:", error);
              await message.reply("❌ | Failed to download the image. Please try again.");
            }
          } else {
            await message.reply(`❌ | Please choose a number between 1-${images.length}`);
          }
        }
      }
    }
  }
};
