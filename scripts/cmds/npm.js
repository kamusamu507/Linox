const { exec } = require("child_process");

module.exports = {
  config: {
    name: "install",
    aliases: ["npminstall"],
    version: "1.0.1",
    author: "DUR4NTO",
    shortDescription: "Install npm packages dynamically (ignores Node version warnings)",
    longDescription: "Installs any npm package on the server, ignoring engine warnings",
    category: "owner",
    guide: {
      en: "{pn} <package_name>"
    }
  },

  onStart: async function ({ message, args }) {
    const pkg = args[0];
    if (!pkg) return message.reply("❌ You must provide a package name! Example: `.install axios`");

    message.reply(`⬇ Installing *${pkg}*...\nPlease wait...`);

    exec(`npm install ${pkg} --legacy-peer-deps --loglevel=error`, (err, stdout, stderr) => {
      if (err) return message.reply(`❌ Installation failed:\n${err.message}`);
      
      // ignore warnings, only send success output
      const output = stdout || "Package installed successfully (warnings ignored).";
      message.reply(`✅ *${pkg}* installed successfully!\nOutput:\n${output}`);
    });
  }
};
