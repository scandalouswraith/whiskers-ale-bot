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

// ================= CHANNELS =================
const WELCOME_CHANNEL_ID = "951572800253083738";
const GOODBYE_CHANNEL_ID = "1249723774748721264";
const CHAT_CHANNEL_ID = "1101697334934515794";

// ================= XP + GOLD STORAGE =================
const xp = {};
const gold = {};
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

// ================= XP SYSTEM =================
function getLevelFromXp(xpAmount = 0) {
  return Math.floor(xpAmount / 100);
}

function addXp(userId, amount, member) {
  if (!xp[userId]) xp[userId] = 0;

  const oldLevel = getLevelFromXp(xp[userId]);

  xp[userId] += amount;

  const newLevel = getLevelFromXp(xp[userId]);

  if (member && newLevel > oldLevel) {
    handleLevelUp(member, newLevel);
  }
}

async function handleLevelUp(member, level) {
  const roleData = [...levelRoles]
    .reverse()
    .find(r => level >= r.level);

  if (!roleData) return;

  const role = member.guild.roles.cache.get(roleData.id);
  if (!role) return;

  try {
    await member.roles.add(role);
  } catch (err) {
    console.error("Role assign error:", err);
  }
}

// ================= GOLD SYSTEM =================
function getGold(userId) {
  if (gold[userId] === undefined) gold[userId] = STARTING_GOLD;
  return gold[userId];
}

function addGold(userId, amount) {
  gold[userId] = getGold(userId) + amount;
  if (gold[userId] < 0) gold[userId] = 0;
  return gold[userId];
}

function formatGold(amount) {
  return `💰 ${amount} gold`;
}

// ================= UTIL =================
function rollDice(sides = 20) {
  return Math.floor(Math.random() * sides) + 1;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getMentionedMember(message) {
  return message.mentions.members.first();
}

// 🧾 Tavern Menu
const menu = {
  drinks: [
    { name: "Honeyed Mead", emoji: "🍯", price: 3, desc: "Sweet, warm, and dangerously easy to love." },
    { name: "Dark Dwarven Stout", emoji: "🍺", price: 4, desc: "Thick as a dungeon wall—smooth as a bard’s lie." },
    { name: "Spiced Apple Cider", emoji: "🍎", price: 3, desc: "A cozy sip that tastes like autumn stories." },
    { name: "Moonberry Wine", emoji: "🌙", price: 5, desc: "Fruity, mysterious, and a little enchanted." },
    { name: "Whiskers’ Cream Ale", emoji: "🐾", price: 4, desc: "House favorite—served with a judgmental cat stare." },
    { name: "Smoked Oak Whiskey", emoji: "🪵", price: 6, desc: "Smoky, bold, and perfect for late-night confessions." },
	  { name: "Hearthfire Mulled Wine", emoji: "🔥", price: 5, desc: "Served hot with cloves and a warning not to gulp." },
    { name: "Frostveil Lager", emoji: "❄️", price: 4, desc: "Crisp enough to fog the mug." },
    { name: "Golden Hop Pale Ale", emoji: "🌾", price: 4, desc: "Bright, bitter, and dangerously refreshing." },
    { name: "Black Cat Espresso", emoji: "☕", price: 3, desc: "Strong enough to wake the dead—or adventurers." },
    { name: "Midnight Plum Brandy", emoji: "🍑", price: 6, desc: "Smooth, dark, and best enjoyed slowly." },
    { name: "Stormcaller Rum", emoji: "🌩️", price: 6, desc: "Bold, sweet, and rumored to summon trouble." },
    { name: "Lavender Honey Milk", emoji: "🥛", price: 2, desc: "Surprisingly soothing. The cat approves." }
  ],
  food: [
    { name: "Slow-roasted Stew", emoji: "🍲", price: 6, desc: "Hearty stew with crusty bread—pure comfort." },
    { name: "Herbed Chicken Pie", emoji: "🥧", price: 6, desc: "Flaky crust, savory filling, instant happiness." },
    { name: "Hearthside Cider", emoji: "🔥", price: 4, desc: "Hot cider served near the fire—watch your fingers." },
    { name: "Fresh Fish", emoji: "🐟", price: 5, desc: "The cat watches this one… very closely." },
    { name: "Cheddar & Onion Bread", emoji: "🍞", price: 4, desc: "Pulled apart faster than it cools." },
    { name: "Mushroom & Thyme Tart", emoji: "🍄", price: 5, desc: "Earthy, buttery, and deceptively filling." },
    { name: "Spiced Root Vegetable Roast", emoji: "🥕", price: 5, desc: "A comforting plate for weary travelers." },
    { name: "Garlic Butter Skillet Potatoes", emoji: "🥔", price: 4, desc: "Crisp edges, soft centers, zero regrets." },
    { name: "Honey-glazed Ham Slab", emoji: "🍖", price: 7, desc: "Sweet, savory, and meant to be shared (but isn’t)." },
    { name: "Berry Hand Pies", emoji: "🫐", price: 4, desc: "Warm, flaky, and gone far too quickly." },
    { name: "Cat’s Share Cream Bowl", emoji: "🐾", price: 1, desc: "You didn’t order this. The cat did." }
  ]
};

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
  "Smoked Oak Whiskey 🪵",
  "Hearthfire Mulled Wine 🔥",
  "Frostveil Lager ❄️",
  "Golden Hop Pale Ale 🌾",
  "Black Cat Espresso ☕",
  "Midnight Plum Brandy 🍑",
  "Stormcaller Rum 🌩️",
  "Lavender Honey Milk 🥛"
];

const specials = [
  "Slow-roasted stew with crusty bread 🍲",
  "Herbed chicken pie 🥧",
  "Spiced cider by the hearth 🔥",
  "Fresh fish (the cat is watching closely) 🐟",
  "Cheddar & Onion Bread 🍞",
  "Mushroom & Thyme Tart 🍄",
  "Spiced Root Vegetable Roast 🥕",
  "Garlic Butter Skillet Potatoes 🥔",
  "Honey-glazed Ham Slab 🍖",
  "Berry Hand Pies 🫐",
  "Cat’s Share Cream Bowl 🐾"
];

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

// ================= READY =================
client.once("ready", () => {
  console.log(`🍺 ${client.user.tag} is online!`);

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

// ================= WELCOME =================
client.on("guildMemberAdd", member => {
  if (member.user.bot) return;

  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (channel) channel.send(`🍻 Welcome ${member}!`);

  const baseRole = member.guild.roles.cache.get(levelRoles[0].id);
  if (baseRole) member.roles.add(baseRole).catch(() => {});
});

// ================= GOODBYE =================
client.on("guildMemberRemove", member => {
  const channel = member.guild.channels.cache.get(GOODBYE_CHANNEL_ID);
  if (channel) channel.send(`🍂 ${member.user.tag} left the tavern.`);
});

// ================= MAIN MESSAGE SYSTEM =================
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  const userId = message.author.id;

  // ⭐ XP GAIN (EVERY MESSAGE)
  addXp(userId, 25, message.member);

  const content = message.content.toLowerCase();

  // ================= MENU =================
  if (content === "!menu") {
    return message.reply("🍺 Tavern menu loaded (your full version kept here)");
  }

  // ================= ORDER =================
  if (content.startsWith("!order")) {
    return message.reply(`🍺 Order placed!`);
  }

  // ================= DRINK =================
  if (content === "!drink") {
    return message.reply(`🍺 ${pick(drinks)}`);
  }

  // ================= SPECIAL =================
  if (content === "!special") {
    return message.reply(`🪵 ${pick(specials)}`);
  }

  // ================= CAT =================
  if (content === "!cat" || content === "!petcat") {
    return message.reply(`🐾 ${pick(catResponses)}`);
  }

  // ================= DICE =================
  if (content.startsWith("!roll")) {
    return message.reply(`🎲 ${rollDice()}`);
  }

  if (content === "!coinflip") {
    return message.reply(Math.random() < 0.5 ? "Heads" : "Tails");
  }

  // ================= XP =================
  if (content === "!xp" || content === "!level") {
    const userXp = xp[userId] || 0;
    const level = getLevelFromXp(userXp);

    return message.reply(`📊 XP: ${userXp}\n⭐ Level: ${level}`);
  }

  // ================= GOLD =================
  if (content === "!gold" || content === "!balance") {
    return message.reply(formatGold(getGold(userId)));
  }

  // ================= ARMWRESTLE =================
  if (content.startsWith("!armwrestle")) {
    const opponent = getMentionedMember(message);
    if (!opponent) return message.reply("Tag someone!");

    const a = rollDice();
    const b = rollDice();

    return message.reply(
      a > b
        ? `${message.author.username} wins!`
        : `${opponent.user.username} wins!`
    );
  }

  // ================= LEADERBOARD =================
  if (content === "!leaderboard") {
    const sorted = Object.entries(xp)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    let board = "🏆 Leaderboard\n";
    for (const [id, val] of sorted) {
      board += `<@${id}> - ${val} XP\n`;
    }

    return message.reply(board);
  }
});

// ================= LOGIN =================
client.login(process.env.DISCORD_TOKEN);
