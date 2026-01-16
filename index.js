require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔴 Channel IDs
const WELCOME_CHANNEL_ID = "951572800253083738";
const GOODBYE_CHANNEL_ID = "1249723774748721264";

// 🎖️ Level → Role mapping
const levelRoles = [
  { level: 1, name: "🍺 New Patron" },
  { level: 5, name: "🍺 Tavern Guest" },
  { level: 10, name: "🍺 Tavern Regular" },
  { level: 15, name: "🐾 Friend of the Tavern" },
  { level: 20, name: "🐾 Hearthside Companion" },
  { level: 25, name: "🐾 Honored Patron" },
  { level: 30, name: "🍻 Esteemed Regular" },
  { level: 40, name: "🍻 House Favorite" },
  { level: 50, name: "🍻 Tavern Fixture" },
  { level: 65, name: "🏆 Keeper's Confidant" },
  { level: 80, name: "🏆 Legend of the Hearth" },
  { level: 100, name: "🏆 Whiskered Legend" }
];

// 🌟 Greetings & Goodbyes
const welcomeMessages = [
  `🍻 **Welcome to Whiskers & Ale, {member}!** Pull up a chair by the hearth and enjoy your stay. 🐾`,
  `🐾 **Hey {member}, glad you found our tavern!** The cat on the counter flicks its tail.`,
  `🍺 **{member} joins the fun!** The fire is warm and the ale is cold.`,
  `✨ **Cheers {member}!** Let the stories flow and the laughter fill the room.`,
  `😿 **{member} arrives!** A curious cat eyes your bag.`
  `🎶 **{member} joins the fun!** The fire is warm, the ale is cold, and the bard is tuning their lute.`
];

const goodbyeMessages = [
  `🍂 **{member} has left the tavern.** A cat watches them go. 🍺`,
  `😿 **Farewell {member}!** The hearth grows quieter.`,
  `🥀 **{member} steps back onto the road.** Come back soon.`,
  `💨 **{member} departs.** May warm fires find them.`,
  `🍺 **{member} leaves the tavern.** Their mug remains… for now.`
  `💨 **{member} has gone on their journey.** Until we meet again, may the tavern’s lights guide you.`,
  `🍂 **{member} has left the tavern.** A cat watches them go. 🍺`
];

// 🍺 Tavern Data
const drinks = [
  "Honeyed Mead 🍯",
  "Dark Dwarven Stout 🍺",
  "Spiced Apple Cider 🍎",
  "Moonberry Wine 🌙",
  "Whiskers’ Cream Ale 🐾",
  "Smoked Oak Whiskey 🪵"
];

const specials = [
  "Slow-roasted stew with crusty bread 🍲",
  "Herbed chicken pie 🥧",
  "Spiced cider by the hearth 🔥",
  "Fresh fish (the cat is watching closely) 🐟"
];

const catResponses = [
  "The tavern cat accepts your affection… briefly. 🐾",
  "The cat judges you silently. 😼",
  "You have been chosen. The cat curls up beside you. 🐈",
  "The cat knocks a mug off the bar. Chaos ensues."
];

// 📊 XP System
const xp = {};
const cooldown = new Set();

// 🎲 Dice
function rollDice(sides = 20) {
  return Math.floor(Math.random() * sides) + 1;
}

// 🧰 Helpers
function getRandomMessage(messages, member) {
  return messages[Math.floor(Math.random() * messages.length)]
    .replace("{member}", member);
}

// ✅ Bot ready
client.once("clientReady", () => {
  console.log(`🍺 ${client.user.tag} is online!`);
});

// 👋 Welcome
client.on("guildMemberAdd", member => {
  if (member.user.bot) return;

  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  channel.send(getRandomMessage(welcomeMessages, member));
});

// 👋 Goodbye
client.on("guildMemberRemove", member => {
  if (member.user.bot) return;

  const channel = member.guild.channels.cache.get(GOODBYE_CHANNEL_ID);
  if (!channel) return;

  channel.send(getRandomMessage(goodbyeMessages, member.user.tag));
});

// 💬 Commands & XP
client.on("messageCreate", message => {
  if (message.author.bot) return;

  // 📊 XP gain
  if (!cooldown.has(message.author.id)) {
    xp[message.author.id] = (xp[message.author.id] || 0) + 5;
    cooldown.add(message.author.id);

    const member = message.member;
    const newLevel = Math.floor(xp[message.author.id] / 100);

    // 🎖️ Role assignment
    for (const roleData of levelRoles) {
      if (newLevel >= roleData.level) {
        const role = message.guild.roles.cache.find(
          r => r.name === roleData.name
        );

        if (role && !member.roles.cache.has(role.id)) {
          member.roles.add(role);
          message.channel.send(
            `🍻 **${member.user.username}** has earned the title **${roleData.name}!**`
          );
        }
      }
    }

    setTimeout(() => cooldown.delete(message.author.id), 60_000);
  }

  const level = Math.floor((xp[message.author.id] || 0) / 100);

  // 🍺 !drink
  if (message.content === "!drink") {
    message.reply(
      `🍺 **The bartender slides you a drink:** ${
        drinks[Math.floor(Math.random() * drinks.length)]
      }`
    );
  }

  // 🍲 !special
  if (message.content === "!special") {
    message.reply(
      `🪵 **Tonight’s Tavern Special:** ${
        specials[Math.floor(Math.random() * specials.length)]
      }`
    );
  }

  // 🐾 !cat
  if (message.content === "!petcat" || message.content === "!cat") {
    message.reply(
      `🐾 ${catResponses[Math.floor(Math.random() * catResponses.length)]}`
    );
  }

  // 🎲 !roll
  if (message.content.startsWith("!roll")) {
    message.reply(
      `🎲 You roll a **${rollDice()}**. The tavern holds its breath…`
    );
  }

  // 📜 !level
  if (message.content === "!level") {
    message.reply(
      `📊 **Tavern Standing**\nXP: ${xp[message.author.id] || 0}\nLevel: ${level}`
    );
  }
});

// 🔐 Login
client.login(process.env.DISCORD_TOKEN);









