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
  { level: 1, name: "🍺 New Patron, lvl 1" },
  { level: 5, name: "🍺 Tavern Guest, lvl 5" },
  { level: 10, name: "🍺 Tavern Regular, lvl 10" },
  { level: 15, name: "🐾 Friend of the Tavern, lvl 15" },
  { level: 20, name: "🐾 Hearthside Companion, lvl 20" },
  { level: 25, name: "🐾 Honored Patron, lvl 25" },
  { level: 30, name: "🍻 Esteemed Regular, lvl 30" },
  { level: 40, name: "🍻 House Favorite, lvl 40" },
  { level: 50, name: "🍻 Tavern Fixture, lvl 50" },
  { level: 65, name: "✨ Keeper's Confidant, lvl 65" },
  { level: 80, name: "✨ Legend of the Hearth, lvl 80" },
  { level: 100, name: "🏆 Whiskered Legend, lvl 100" }
];

// 🌟 Greetings & Goodbyes
const welcomeMessages = [
  `🍻 **Welcome to Whiskers & Ale, {member}!** Pull up a chair by the hearth and enjoy your stay. 🐾`,
  `🐾 **Hey {member}, glad you found our tavern!** The cat on the counter flicks its tail.`,
  `🍺 **{member} joins the fun!** The fire is warm and the ale is cold.`,
  `✨ **Cheers {member}!** Let the stories flow and the laughter fill the room.`,
  `😿 **{member} arrives!** A curious cat eyes your bag.`,
  `🎶 **{member} joins the fun!** The fire is warm, the ale is cold, and the bard is tuning their lute.`
];

const goodbyeMessages = [
  `🍂 **{member} has left the tavern.** A cat watches them go. 🍺`,
  `😿 **Farewell {member}!** The hearth grows quieter.`,
  `🥀 **{member} steps back onto the road.** Come back soon.`,
  `💨 **{member} departs.** May warm fires find them.`,
  `🍺 **{member} leaves the tavern.** Their mug remains… for now.`,
  `💨 **{member} has gone on their journey.** Until we meet again, may the tavern’s lights guide them.`,
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

// 📊 XP System (in-memory)
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

function getLevelFromXp(amount) {
  return Math.floor((amount || 0) / 100);
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

// 💬 Commands & XP (prefix commands + leveling + auto role cleanup)
client.on("messageCreate", message => {
  if (message.author.bot) return;

  const userId = message.author.id;

  // 📊 XP gain with cooldown
  if (!cooldown.has(userId)) {
    const oldXp = xp[userId] || 0;
    const newXp = oldXp + 5;
    xp[userId] = newXp;
    cooldown.add(userId);

    const oldLevel = getLevelFromXp(oldXp);
    const newLevel = getLevelFromXp(newXp);

    const member = message.member;

    // If they leveled up, check for role rewards
    if (newLevel > oldLevel) {
      // Find highest unlocked role
      const unlocked = levelRoles.filter(r => newLevel >= r.level);
      if (unlocked.length > 0) {
        const highest = unlocked[unlocked.length - 1];
        const highestRole = message.guild.roles.cache.find(
          r => r.name === highest.name
        );

        if (highestRole) {
          const alreadyHas = member.roles.cache.has(highestRole.id);

          // Remove all lower level roles
          for (const roleData of levelRoles) {
            if (roleData.level < highest.level) {
              const lowerRole = message.guild.roles.cache.find(
                r => r.name === roleData.name
              );
              if (lowerRole && member.roles.cache.has(lowerRole.id)) {
                member.roles.remove(lowerRole).catch(() => {});
              }
            }
          }

          // Add highest role if they don't already have it
          if (!alreadyHas) {
            member.roles.add(highestRole).catch(() => {});
            message.channel.send(
              `🍻 **${member.user.username}** has risen to **${highest.name}** (Level ${newLevel})!`
            );
          }
        }
      }
    }

    setTimeout(() => cooldown.delete(userId), 60_000);
  }

  const userXp = xp[userId] || 0;
  const level = getLevelFromXp(userXp);

  // 🍺 !drink
  if (message.content === "!drink") {
    return message.reply(
      `🍺 **The bartender slides you a drink:** ${
        drinks[Math.floor(Math.random() * drinks.length)]
      }`
    );
  }

  // 🍲 !special
  if (message.content === "!special") {
    return message.reply(
      `🪵 **Tonight’s Tavern Special:** ${
        specials[Math.floor(Math.random() * specials.length)]
      }`
    );
  }

  // 🐾 !cat
  if (message.content === "!petcat" || message.content === "!cat") {
    return message.reply(
      `🐾 ${catResponses[Math.floor(Math.random() * catResponses.length)]}`
    );
  }

  // 🎲 !roll
  if (message.content.startsWith("!roll")) {
    return message.reply(
      `🎲 You roll a **${rollDice()}**. The tavern holds its breath…`
    );
  }

  // 📜 !level
  if (message.content === "!level") {
    return message.reply(
      `📊 **Tavern Standing**\nXP: ${userXp}\nLevel: ${level}`
    );
  }

  // 📜 !rank (same as !level, just nicer name)
  if (message.content === "!rank") {
    return message.reply(
      `📊 **Your Tavern Standing**\nXP: ${userXp}\nLevel: ${level}`
    );
  }

  // 🏆 !leaderboard
  if (message.content === "!leaderboard") {
    const entries = Object.entries(xp);

    if (entries.length === 0) {
      return message.reply(
        "No one has earned any tavern reputation yet. The night is young!"
      );
    }

    const top = entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    let board = "🏆 **Tavern Leaderboard**\n\n";

    top.forEach(([id, xpValue], index) => {
      const lvl = getLevelFromXp(xpValue);
      board += `${index + 1}. <@${id}> — XP: ${xpValue} (Level ${lvl})\n`;
    });

    return message.reply(board);
  }
});

// 🔐 Login
client.login(process.env.DISCORD_TOKEN);













