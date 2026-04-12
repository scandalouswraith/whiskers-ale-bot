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


const fs = require("fs");

const DATA_FILE = "./data.json";

let xp = {};
let gold = {};

// Load data
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return;

  const raw = fs.readFileSync(DATA_FILE);
  const data = JSON.parse(raw);

  xp = data.xp || {};
  gold = data.gold || {};
}

// Save data
function saveData() {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({ xp, gold }, null, 2)
  );
}

// ================= IDS =================
const WELCOME_CHANNEL_ID = "951572800253083738";
const GOODBYE_CHANNEL_ID = "1249723774748721264";
const CHAT_CHANNEL_ID = "1101697334934515794";

// ================= STORAGE =================
const cooldown = new Set();
const STARTING_GOLD = 20;

// ================= LEVEL ROLES =================
const levelRoles = [
  { level: 1, id: "1459698956782145598" },
  { level: 5, id: "1459699377382621472" },
  { level: 10, id: "1459698903925526792" },
  { level: 15, id: "1459699696883732500" },
  { level: 20, id: "1459699613622861864" },
  { level: 25, id: "1459699760964436060" },
  { level: 30, id: "1459700285860745417" },
  { level: 40, id: "1459700428437459105" },
  { level: 50, id: "1459700094118006936" },
  { level: 65, id: "1459700604573188238" },
  { level: 80, id: "1459700674768928902" },
  { level: 100, id: "1459700747242311681" }
];

// ================= YOUR FULL DATA (UNCHANGED) =================

// 🌟 Greetings & Goodbyes
const welcomeMessages = [
  `🍻 **Welcome to Hearthside Tavern, {member}!** Pull up a chair by the hearth and enjoy your stay. 🐾`,
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
const menu = {
  drinks: [
    { name: "Honeyed Mead", emoji: "🍯", price: 3, desc: "Sweet, warm, and dangerously easy to love." },
    { name: "Dark Dwarven Stout", emoji: "🍺", price: 4, desc: "Thick as a dungeon wall—smooth as a bard’s lie." },
    { name: "Spiced Apple Cider", emoji: "🍎", price: 3, desc: "A cozy sip that tastes like autumn stories." },
    { name: "Moonberry Wine", emoji: "🌙", price: 5, desc: "Fruity, mysterious, and a little enchanted." },
    { name: "Whiskers’ Cream Ale", emoji: "🐾", price: 4, desc: "House favorite—served with a judgmental cat stare." },
    { name: "Smoked Oak Whiskey", emoji: "🪵", price: 6, desc: "Smoky, bold, and perfect for late-night confessions." }
  ],
  food: [
    { name: "Slow-roasted Stew", emoji: "🍲", price: 6, desc: "Hearty stew with crusty bread—pure comfort." },
    { name: "Herbed Chicken Pie", emoji: "🥧", price: 6, desc: "Flaky crust, savory, instant happiness." }
  ]
};

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
  "🌙 *Last call echoes softly. Someone insists they’re ‘fine’.*",
  "🕯️ *Candlelight flickers as secrets trade hands with coin.*",
  "🥃 *A strong drink slides across the bar—no questions asked.*",
  "🐈 *The tavern cat judges the final patrons with ancient disappointment.*",
  "💬 *How do I attract all these minions? Two words: funnel cakes.*",
  "🕯️ *I once served a drink to a Death Knight. It froze over... right in his hands!*",
  "🍺 *A midday pour foams over the rim. The bartender pretends not to notice.*",
  "🎯 *A dart hits the board—close enough for bragging rights.*",
  "🧹 *Someone swears they’ll clean up later. The cat remains unconvinced.*",
  "🍲 *Stew bubbles gently while stories grow louder.*",
  "🥜 *Sorry about the peanut shells on the floor. These minions are slobs.*",
  "🥨 *All the best minions come here. I've got the spicy pretzel mustard.*",
  "💬 *Have you met the League of Explorers? Nice folk. Great hats.*",
  "🕯️ *Candles flicker gently as conversations hum through the tavern.*",
  "🍞 *The smell of fresh bread and stew fills the air.*",
  "🎲 *Dice clatter across a nearby table, followed by cheers and groans.*",
  "🐈 *The tavern cat curls up on an empty chair, claiming it as their own.*",
  "🍻 *Mugs clink together as another round is poured.*",
  "☀️ *Morning light slips through the shutters. The first kettle begins to simmer.*",
  "🍞 *Fresh bread hits the table. The tavern cat watches… respectfully.*",
  "🔥 *The hearth crackles as the tavern fills with laughter and clinking mugs.*",
  "🎶 *A bard tests a chord. The room hushes… for half a second.*",
  "🎲 *Dice clatter across a table—followed by cheers and dramatic groans.*",
  "🐾 *A cat weaves between boots like it owns the place. It does.*",
  "🥣 *A quiet breakfast crowd murmurs over warm bowls and warmer gossip.*",
  "🐾 *A sleepy cat stretches, then immediately claims the best chair.*",
  "🌙 *Night deepens outside, but the tavern stays warm and bright.*"
];

// ================= HELPERS =================
function rollDice(sides = 20) {
  return Math.floor(Math.random() * sides) + 1;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getMentionedMember(message) {
  return message.mentions?.members?.first() || null;
}

function getLevelFromXp(xpAmount = 0) {
  return Math.floor(xpAmount / 100);
}

function getGold(userId) {
  if (gold[userId] === undefined) gold[userId] = STARTING_GOLD;
  return gold[userId];
}

function addGold(userId, amount) {
  gold[userId] = getGold(userId) + amount;
  if (gold[userId] < 0) gold[userId] = 0;

  saveData(); // ✅ SAVE

  return gold[userId];
}

function formatGold(amount) {
  return `💰 ${amount} gold`;
}

function normalize(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

function findMenuItem(query) {
  const q = normalize(query);
  return [...menu.drinks, ...menu.food].find(item =>
    normalize(item.name).includes(q)
  );
}

// ================= READY =================
client.once("ready", () => {
  console.log(`🍺 ${client.user.tag} is online!`);

  loadData(); // ✅ LOAD HERE
  
    // ✅ Tavern chatter restored
  setInterval(async () => {
    try {
      const channel = await client.channels.fetch(CHAT_CHANNEL_ID);
      if (!channel?.isTextBased()) return;

      await channel.send(pick(tavernChatter));
    } catch (err) {
      console.error(err);
    }
  }, 1000 * 60 * 60 * 36);
});



// ================= JOIN / LEAVE =================
client.on("guildMemberAdd", member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (channel) channel.send(pick(welcomeMessages).replace("{member}", member));
});

client.on("guildMemberRemove", member => {
  const channel = member.guild.channels.cache.get(GOODBYE_CHANNEL_ID);
  if (channel) channel.send(pick(goodbyeMessages).replace("{member}", member.user.tag));
});

// ==================================
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  const userId = message.author.id;
  const content = message.content.toLowerCase();

  // XP
if (!cooldown.has(userId)) {
  const oldXp = xp[userId] || 0;
  const newXp = oldXp + 25;

  xp[userId] = newXp;
  cooldown.add(userId);

  const oldLevel = getLevelFromXp(oldXp);
  const newLevel = getLevelFromXp(newXp);

  if (newLevel > oldLevel) {
    await handleLevelUp(message.member, newLevel);
  }

  saveData(); // ✅ SAVE

  setTimeout(() => cooldown.delete(userId), 60000);
}

async function handleLevelUp(member, level) {
  const eligible = levelRoles.filter(r => level >= r.level);
  if (eligible.length === 0) return;

  const highest = eligible[eligible.length - 1];

  const newRole = member.guild.roles.cache.get(highest.id);
  if (!newRole) return;

  // Remove lower roles
  for (const roleData of levelRoles) {
    if (roleData.level < highest.level) {
      const role = member.guild.roles.cache.get(roleData.id);
      if (role && member.roles.cache.has(role.id)) {
        await member.roles.remove(role).catch(() => {});
      }
    }
  }

  // Add new role
  if (!member.roles.cache.has(newRole.id)) {
    await member.roles.add(newRole).catch(() => {});
    
    member.guild.channels.cache
      .find(c => c.id === CHAT_CHANNEL_ID)
      ?.send(`🍻 **${member.user.username}** reached **Level ${level}**!`);
  }
}

  // ================= COMMANDS =================

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

  if (content === "!drink") {
    return message.reply(`🍺 ${pick(drinks)}`);
  }

  if (content === "!special") {
    return message.reply(`🪵 ${pick(specials)}`);
  }

  if (content === "!menu") {
    const drinkLines = menu.drinks.map(d => `• ${d.emoji} ${d.name}`);
    const foodLines = menu.food.map(f => `• ${f.emoji} ${f.name}`);

    return message.reply(
      `🧾 Menu\n\n🍺 Drinks:\n${drinkLines.join("\n")}\n\n🍲 Food:\n${foodLines.join("\n")}`
    );
  }

  if (content.startsWith("!order")) {
    const raw = message.content.slice(6).trim();
    const item = raw ? findMenuItem(raw) : pick([...menu.drinks, ...menu.food]);

    if (!item) return message.reply("Not on the menu.");

    const wallet = getGold(userId);
    if (wallet < item.price) return message.reply("Not enough gold.");

    addGold(userId, -item.price);

    return message.reply(
      `${item.emoji} You receive **${item.name}**!\n💸 ${formatGold(item.price)}`
    );
  }

    // 📜 !level
  if (message.content === "!level") {
    return message.reply(
      `📊 **Tavern Standing**\nXP: ${userXp}\nLevel: ${level}`
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
  
  // 🐾 CAT
  if (content === "!cat" || content === "!petcat") {
    return message.reply(`🐾 ${pick(catResponses)}`);
  }

  // 🎲 ROLL
  if (content.startsWith("!roll")) {
    return message.reply(`🎲 ${rollDice()}`);
  }

  // 🪙 COINFLIP
  if (content === "!coinflip") {
    return message.reply(Math.random() < 0.5 ? "Heads" : "Tails");
  }

  // 🎯 DARTS
  if (content === "!darts") {
    const score = rollDice(20);
    return message.reply(`🎯 You scored ${score}/20`);
  }

  // 💪 ARMWRESTLE
  if (content.startsWith("!armwrestle")) {
    const opponent = getMentionedMember(message);
    if (!opponent) return message.reply("Tag someone!");

    const a = rollDice();
    const b = rollDice();

    const winner = a > b ? message.author.username : opponent.user.username;

    return message.reply(`💪 ${winner} wins! (${a} vs ${b})`);
  }

  // 🃏 BLACKJACK
  if (content === "!blackjack") {
    const draw = () => Math.min(10, rollDice(13));
    const player = draw() + draw();
    const dealer = 16 + rollDice(6);

    return message.reply(`🃏 You: ${player} | Dealer: ${dealer}`);
  }

  // 🎲 HIGHROLL
  if (content.startsWith("!highroll")) {
    const opponent = getMentionedMember(message);
    if (!opponent) return message.reply("Tag someone!");

    const a = rollDice();
    const b = rollDice();

    const winner = a > b ? message.author.username : opponent.user.username;

    return message.reply(`🎲 ${winner} wins!`);
  }

  // 💰 GOLD
  if (content === "!gold") {
    return message.reply(formatGold(getGold(userId)));
  }
});

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

// ================= LOGIN =================
client.login(process.env.DISCORD_TOKEN);
