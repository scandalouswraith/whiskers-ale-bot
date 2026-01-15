require('dotenv').config();  // ✅ Load .env variables first

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// 🔴 Channel IDs
const WELCOME_CHANNEL_ID = "951572800253083738";
const GOODBYE_CHANNEL_ID = "1249723774748721264";

client.once("clientReady", () => {
  console.log(`🍺 ${client.user.tag} is online!`);
});

// Welcome message
client.on("guildMemberAdd", member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  channel.send(
    `🍻 **Welcome to Whiskers & Ale, ${member}!**
Pull up a chair by the hearth and enjoy your stay. 🐾`
  );
});

// Goodbye message
client.on("guildMemberRemove", member => {
  const channel = member.guild.channels.cache.get(GOODBYE_CHANNEL_ID);
  if (!channel) return;

  channel.send(
    `🍂 **${member.user.tag} has left the tavern.**
May the road rise to meet them. 🍺`
  );
});

// ✅ Login using token from .env
client.login(process.env.DISCORD_TOKEN);





