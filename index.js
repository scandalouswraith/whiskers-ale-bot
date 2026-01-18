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
const CHAT_CHANNEL_ID = "1101697334934515794";

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
  `🐱 **{member} arrives!** A curious cat eyes your bag.`,
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

// 🕯️ Ambient tavern chatter
const tavernChatter = [
  "🍺 *The bartender polishes a mug, lost in thought...*",
  "🐾 *A cat jumps onto the counter and stares at everyone.*",
  "🎶 *Soft music drifts from a bard in the corner.*",
  "🔥 *The hearth crackles, casting dancing shadows on the walls.*",
  "💬 *How do I attract all these minions? Two words: funnel cakes.*",
  "🕯️ *I once served a drink to a Death Knight. It froze over... right in his hands!*",
  "🥜 *Sorry about the peanut shells on the floor. These minions are slobs.*",
  "🥨 *All the best minions come here. I've got the spicy pretzel mustard.*",
  "💬 *Have you met the League of Explorers? Nice folk. Great hats.*",
  "🕯️ *Candles flicker gently as conversations hum through the tavern.*",
  "🍞 *The smell of fresh bread and stew fills the air.*",
  "🎲 *Dice clatter across a nearby table, followed by cheers and groans.*",
  "🐈 *The tavern cat curls up on an empty chair, claiming it as their own.*",
  "🍻 *Mugs clink together as another round is poured.*",
  "🌙 *Night deepens outside, but the tavern stays warm and bright.*"
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

// 🕯️ Periodic tavern chatter in the chat channel (every 2 hours)
  setInterval(() => {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const channel = guild.channels.cache.get(CHAT_CHANNEL_ID);
    if (!channel || !channel.send) return;

    const phrase = tavernChatter[Math.floor(Math.random() * tavernChatter.length)];
    channel.send(phrase).catch(() => {});
  }, 1000 * 60 * 60 * 8); // 8 hours
});

// 👋 Welcome
client.on("guildMemberAdd", member => {
  if (member.user.bot) return;

  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  channel.send(getRandomMessage(welcomeMessages, member));

  // ⭐ Give base level role: "New Patron, lvl 1"
  const baseRoleName = levelRoles[0].name;
  const baseRole = member.guild.roles.cache.find(r => r.name === baseRoleName);

  if (baseRole && !member.roles.cache.has(baseRole.id)) {
    member.roles.add(baseRole).catch(() => {});
  }
});

// 👋 Goodbye
client.on("guildMemberRemove", member => {
  if (member.user.bot) return;

  const channel = member.guild.channels.cache.get(GOODBYE_CHANNEL_ID);
  if (!channel) return;

  channel.send(getRandomMessage(goodbyeMessages, member.user.tag));
});

// 💬 Commands & XP (prefix commands + leveling + auto role cleanup)
client.on("messageCreate", async message => {
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

  // 📜 !rank
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

  // 🛠️ Admin command: initialize base role for all members
  if (message.content.trim().toLowerCase() === "!initpatrons") {
    const guild = message.guild;
    if (!guild) {
      return message.reply("I can only run this command inside a server tavern, not in DMs.");
    }

    const baseRoleName = levelRoles[0].name; // 🍺 New Patron, lvl 1
    const baseRole = guild.roles.cache.find(r => r.name === baseRoleName);

    if (!baseRole) {
      return message.reply(
        `I couldn't find the base role **${baseRoleName}**. Make sure the role name matches exactly.`
      );
    }

    // Try to send the "working..." message, but don't crash if it fails
    try {
      await message.reply("⏳ Assigning base tavern role to **all non-bot members**…");
    } catch (err) {
      console.error("Failed to send initpatrons start message:", err);
    }

    let members;
    try {
      members = await guild.members.fetch();
      console.log(`!initpatrons: fetched ${members.size} members in ${guild.name}`);
    } catch (err) {
      console.error("Error fetching members for !initpatrons:", err);
      try {
        await message.channel.send(
          "❌ I couldn't fetch the server members. Check that I have the **Server Members Intent** enabled in the Developer Portal."
        );
      } catch (e) {
        console.error("Also couldn't send error message for !initpatrons:", e);
      }
      return;
    }

    let attempted = 0;
    let success = 0;

    for (const [, member] of members) {
      if (member.user.bot) continue;

      attempted++;

      try {
        await member.roles.add(baseRole);
        success++;
      } catch (err) {
        console.error(`Failed to add base role to ${member.user.tag}:`, err);
      }
    }

    try {
      await message.channel.send(
        `✅ Done! Tried to give **${baseRoleName}** to **${attempted}** members. Successfully updated **${success}**.`
      );
    } catch (err) {
      console.error("Failed to send initpatrons completion message:", err);
    }
  }

  //reponses to thank you
  const welcomeReplies = [
  "🍻 You're most welcome!",
  "🐾 Anytime, traveler.",
  "🍺 Glad to be of service!",
  "🔥 May your tales be many and your drinks be full!",
  "🎶 Think nothing of it — enjoy the hearth!"
];

if (message.reference && !message.author.bot) {
  const repliedTo = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);

  if (repliedTo && repliedTo.author.id === client.user.id) {
    const thankWords = ["thank you", "thanks", "ty", "tysm", "thx", "thank you good sir"];
    if (thankWords.some(w => message.content.toLowerCase().includes(w))) {
      const line = welcomeReplies[Math.floor(Math.random() * welcomeReplies.length)];
      message.reply(line).catch(() => {});
    }
  }
}

});

// 🔐 Login
client.login(process.env.DISCORD_TOKEN);










