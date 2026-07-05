// =======================================================
// File-based storage for the AI Chat feature — conversations
// keyed by ownerId (studentId, or trainer email as a fallback).
// =======================================================

const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const DATA_DIR = path.join(__dirname, "../data/ai-chat");
const CONVERSATIONS_FILE = path.join(DATA_DIR, "conversations.json");

const DEFAULT_TITLE = "New conversation";

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(CONVERSATIONS_FILE)) {
  fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify({}, null, 2));
}

function loadAll() {
  try {
    return JSON.parse(fs.readFileSync(CONVERSATIONS_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveAll(data) {
  fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(data, null, 2));
}

function toSummary(conversation) {
  const lastMessage = [...conversation.messages]
    .reverse()
    .find((m) => !m.hidden && m.content?.trim());
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    model: conversation.model,
    preview: lastMessage ? lastMessage.content.trim().slice(0, 120) : "",
  };
}

function matchesQuery(conversation, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (conversation.title?.toLowerCase().includes(q)) return true;
  return conversation.messages.some((m) => m.content?.toLowerCase().includes(q));
}

function listConversations(ownerId, query = "") {
  const all = loadAll();
  const owned = Object.values(all[ownerId] || {});
  return owned
    .filter((c) => matchesQuery(c, query))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map(toSummary);
}

function getConversation(ownerId, id) {
  const all = loadAll();
  return all[ownerId]?.[id] || null;
}

function createConversation(ownerId, { title, model } = {}) {
  const all = loadAll();
  if (!all[ownerId]) all[ownerId] = {};

  const now = new Date().toISOString();
  const conversation = {
    id: randomUUID(),
    title: title || DEFAULT_TITLE,
    model: model || null,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };

  all[ownerId][conversation.id] = conversation;
  saveAll(all);
  return conversation;
}

function renameConversation(ownerId, id, title) {
  const all = loadAll();
  const conversation = all[ownerId]?.[id];
  if (!conversation) return null;

  conversation.title = title;
  conversation.updatedAt = new Date().toISOString();
  saveAll(all);
  return conversation;
}

function deleteConversation(ownerId, id) {
  const all = loadAll();
  if (!all[ownerId]?.[id]) return false;
  delete all[ownerId][id];
  saveAll(all);
  return true;
}

function saveMessages(ownerId, id, messages, extra = {}) {
  const all = loadAll();
  const conversation = all[ownerId]?.[id];
  if (!conversation) return null;

  conversation.messages = messages;
  conversation.updatedAt = new Date().toISOString();
  if (extra.title) conversation.title = extra.title;
  if (extra.model) conversation.model = extra.model;
  saveAll(all);
  return conversation;
}

function createMessage({ role, content, hidden = false, usage = null }) {
  return {
    id: randomUUID(),
    role,
    content,
    hidden,
    usage,
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  DEFAULT_TITLE,
  listConversations,
  getConversation,
  createConversation,
  renameConversation,
  deleteConversation,
  saveMessages,
  createMessage,
};
