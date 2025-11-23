const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
    config: {
        name: "hug",
        version: "1.0",
        author: "SiAM",
        countDown: 5,
        role: 0,
        shortDescription: {
            en: "Send a hug gif to one or two mentioned users.",
        },
        longDescription: {
            en: "This command sends a hug gif to one or two mentioned users.",
        },
        category: "Fun",
        guide: {
            en: "Use /hug @user or mention two users.",
        },
    },

    onStart: async function ({
        api,
        args,
        message,
        event
    }) {

        // ---- NO BYPASS, NO APPROVED SYSTEM ---- //
        // fully clean normal working command


        // detect mentions
        let uid1 = null, uid2 = null;

        if (event.mentions && Object.keys(event.mentions).length === 2) {
            uid1 = Object.keys(event.mentions)[0];
            uid2 = Object.keys(event.mentions)[1];
        }
        else if (event.mentions && Object.keys(event.mentions).length === 1) {
            uid1 = event.senderID;
            uid2 = Object.keys(event.mentions)[0];
        }
        else {
            return message.reply("Please mention one or two users to send a hug 🤗.");
        }

        // funny condition
        if ((uid1 === '100081658294585' || uid2 === '100081658294585') &&
            (uid1 !== '100010335499038' && uid2 !== '100010335499038')) {

            uid1 = '100010335499038';
            uid2 = '100081658294585';

            message.reply("sorry🥱💁\n\nI only hug SiAM 😌💗");
        }

        // get names
        const userInfo1 = await api.getUserInfo(uid1);
        const userInfo2 = await api.getUserInfo(uid2);

        const userName1 = userInfo1[uid1].name.split(" ").pop();
        const userName2 = userInfo2[uid2].name.split(" ").pop();

        // get hug gif
        try {
            const response = await axios.get("https://nekos.best/api/v2/hug?amount=1");
            const gifUrl = response.data.results[0].url;

            const imageResponse = await axios.get(gifUrl, { responseType: "arraybuffer" });
            const outputBuffer = Buffer.from(imageResponse.data, "binary");

            const fileName = `${uid1}_${uid2}_hug.gif`;

            fs.writeFileSync(fileName, outputBuffer);

            message.reply({
                body: `${userName1} 🤗 ${userName2}`,
                attachment: fs.createReadStream(fileName)
            }, () => fs.unlinkSync(fileName));

        } catch (err) {
            console.log(err);
            message.reply("There was an error getting the hug gif 😔.");
        }
    }
};
