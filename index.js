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

// 🌟 Multiple greetings and goodbyes with flavor and cats
const welcomeMessages = [
  `🍻 **Welcome to Whiskers & Ale, {member}!** Pull up a chair by the hearth and enjoy your stay. 🐾`,
  `🐾 **Hey {member}, glad you found our tavern!** The cat on the counter waves its paw in greeting.`,
  `🍺 **{member} joins the fun!** The fire is warm, the ale is cold, and the bard is tuning their lute.`,
  `✨ **Cheers {member}!** Let the stories flow and the laughter fill the room.`,
  `🎶 **{member} arrives!** A cozy nook awaits, and perhaps a curious feline companion.`
];

const goodbyeMessages = [
  `🍂 **{member} has left the tavern.** May the road rise to meet them, and the cat keep your seat warm.`,
  `😿 **Farewell {member}!** We'll miss your presence in the tavern and the purring by the hearth.`,
  `🥀 **{member} walks away from the hearth.** Come back soon for ale, tales, and mischief.`,
  `💨 **{member} has gone on their journey.** Until we meet again, may the tavern’s lights guide you.`,
  `🍺 **{member} leaves the tavern.** Save a seat for your return, and keep an eye on the playful cats!`
];

// Helper function to pick a random message
function getRandomMessage(messages, member) {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex].replace("{member}", member);
}

// ✅ Bot ready
client.once("clientReady", () => {
  console.log(`🍺 ${client.user.tag} is online!`);
});

// Welcome message
client.on("guildMemberAdd", member => {
  if (member.user.bot) return; // Ignore bots

  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  channel.send(getRandomMessage(welcomeMessages, member));
});

// Goodbye message
client.on("guildMemberRemove", member => {
  if (member.user.bot) return; // Ignore bots

  const channel = member.guild.channels.cache.get(GOODBYE_CHANNEL_ID);
  if (!channel) return;

  channel.send(getRandomMessage(goodbyeMessages, member.user.tag));
});

// ✅ Login using token from .env
client.login(process.env.DISCORD_TOKEN);




