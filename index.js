require("dotenv").config();
const fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔴 CHANNELS
const WELCOME_CHANNEL_ID = "951572800253083738";
const GOODBYE_CHANNEL_ID = "1249723774748721264";
const CHAT_CHANNEL_ID = "1101697334934515794";

// 🎖️ LEVEL ROLES
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

// 💰 GOLD
const STARTING_GOLD = 20;

// 📊 DATA LOAD
let xp = {};
let gold = {};

try { xp = JSON.parse(fs.readFileSync("./xp.json")); } catch {}
try { gold = JSON.parse(fs.readFileSync("./gold.json")); } catch {}

function saveAll() {
  fs.writeFileSync("./xp.json", JSON.stringify(xp, null, 2));
  fs.writeFileSync("./gold.json", JSON.stringify(gold, null, 2));
}

// 🎲 HELPERS
const cooldown = new Set();

function getLevel(xpAmount) {
  return Math.floor((xpAmount || 0) / 100);
}

function getGold(userId) {
  if (gold[userId] === undefined) gold[userId] = STARTING_GOLD;
  return gold[userId];
}

function addGold(userId, amount) {
  gold[userId] = getGold(userId) + amount;
  if (gold[userId] < 0) gold[userId] = 0;
  return gold[userId];
}

// 🎖️ ROLE SYNC
async function syncRoles(member, level) {
  if (!member) return;

  const eligible = levelRoles.filter(r => level >= r.level);
  if (!eligible.length) return;

  const top = eligible[eligible.length - 1];
  const role = member.guild.roles.cache.get(top.id);

  if (!role) return;

  // remove old roles
  for (const r of levelRoles) {
    const oldRole = member.guild.roles.cache.get(r.id);
    if (oldRole && member.roles.cache.has(oldRole.id) && r.level < top.level) {
      await member.roles.remove(oldRole).catch(() => {});
    }
  }

  if (!member.roles.cache.has(role.id)) {
    await member.roles.add(role).catch(() => {});
  }
}

// 🕯️ READY
client.once("ready", () => {
  console.log(`🍺 ${client.user.tag} is online!`);
});

// 👋 JOIN
client.on("guildMemberAdd", member => {
  if (member.user.bot) return;

  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (channel) channel.send(`🍻 Welcome ${member}!`);

  const baseRole = member.guild.roles.cache.get(levelRoles[0].id);
  if (baseRole) member.roles.add(baseRole).catch(() => {});
});

// 👋 LEAVE
client.on("guildMemberRemove", member => {
  const channel = member.guild.channels.cache.get(GOODBYE_CHANNEL_ID);
  if (channel) channel.send(`🍂 ${member.user.username} has left the tavern.`);
});

// 💬 MAIN MESSAGE HANDLER
client.on("messageCreate", async message => {
  if (message.author.bot || !message.guild) return;

  const userId = message.author.id;

  // =========================
  // ⭐ XP SYSTEM
  // =========================
  if (!cooldown.has(userId)) {
    cooldown.add(userId);

    const oldXp = xp[userId] || 0;
    const newXp = oldXp + 25;

    xp[userId] = newXp;

    const oldLevel = getLevel(oldXp);
    const newLevel = getLevel(newXp);

    const member = await message.guild.members.fetch(userId).catch(() => null);
    if (!member) return;

    await syncRoles(member, newLevel);

    if (newLevel > oldLevel) {
      message.channel.send(`🍻 ${member.user.username} reached Level ${newLevel}!`);
    }

    setTimeout(() => cooldown.delete(userId), 60000);
  }

  // 💰 passive gold
  if (!message.content.startsWith("!")) {
    addGold(userId, 1);
  }

  saveAll();

  // =========================
  // 🪙 COMMANDS
  // =========================

  if (message.content === "!level") {
    const level = getLevel(xp[userId] || 0);
    return message.reply(`📊 Level: **${level}** | XP: **${xp[userId] || 0}**`);
  }

  if (message.content === "!gold") {
    return message.reply(`💰 Gold: **${getGold(userId)}**`);
  }

  if (message.content === "!balance") {
    return message.reply(`💰 Gold: **${getGold(userId)}**`);
  }
});

// 🔐 LOGIN
client.login(process.env.DISCORD_TOKEN);




