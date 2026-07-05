// =======================================================
// AI Chat (Grok-powered) — conversation CRUD + streaming endpoint
// =======================================================

const express = require("express");
const { requireStudentIdentity } = require("../middleware/accessControl");
const store = require("../services/aiChatStore");
const grokClient = require("../services/grokClient");
const { buildContextWindow } = require("../services/aiChatContext");

const router = express.Router();

const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful, knowledgeable AI assistant inside MicroTrainer. " +
  "Answer clearly and directly. Use Markdown (including fenced code blocks with a language tag) when it helps readability.";

const CONTINUE_NUDGE =
  "Continue exactly where you left off. Do not repeat any text you already wrote, and do not add a preamble.";

const MAX_ATTACHMENT_TEXT = 16000;

/**
 * Fold a user turn's typed text + attachments into what we persist and what we
 * send to Grok. Document text is inlined (it's just text); images are NOT
 * persisted — history keeps a "[Attached image: name]" placeholder, and the
 * raw dataUrls are returned separately for this turn's multimodal request only.
 */
function buildUserMessageParts(text = "", attachments = []) {
  const list = Array.isArray(attachments) ? attachments : [];
  const docs = list.filter((a) => a.kind === "document" && a.text);
  const images = list.filter((a) => a.kind === "image" && a.dataUrl);

  // Model-only context: extracted document text + notes that an image was
  // shared (so later turns still "know" about it, without re-sending bytes).
  const contextParts = [];
  if (docs.length) {
    let docText = docs
      .map((d) => `--- Attached file: ${d.name} ---\n${d.text}`)
      .join("\n\n");
    if (docText.length > MAX_ATTACHMENT_TEXT) {
      docText = `${docText.slice(0, MAX_ATTACHMENT_TEXT)}\n\n[…truncated]`;
    }
    contextParts.push(docText);
  }
  for (const img of images) {
    contextParts.push(`[Attached image: ${img.name}]`);
  }

  const meta = list.map((a) => ({ name: a.name, kind: a.kind }));
  return {
    content: text || "", // what the user sees (typed text only)
    contextText: contextParts.length ? contextParts.join("\n\n") : null,
    images,
    attachments: meta.length ? meta : null,
  };
}

function resolveOwnerId(req) {
  return req.studentId || req.authUser?.email || null;
}

router.use(requireStudentIdentity);

router.use((req, res, next) => {
  const ownerId = resolveOwnerId(req);
  if (!ownerId) {
    return res.status(400).json({ error: "Could not resolve account identity for AI Chat." });
  }
  req.ownerId = ownerId;
  next();
});

// ------------------------------------------------------
// Conversation CRUD
// ------------------------------------------------------

router.get("/status", (req, res) => {
  res.json({
    configured: Boolean(grokClient.loadGrokKey()),
    models: grokClient.ALLOWED_MODELS,
  });
});

router.get("/conversations", (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q : "";
  res.json({ conversations: store.listConversations(req.ownerId, query) });
});

router.post("/conversations", (req, res) => {
  const { title, model } = req.body || {};
  const conversation = store.createConversation(req.ownerId, { title, model });
  res.status(201).json({ conversation });
});

router.get("/conversations/:id", (req, res) => {
  const conversation = store.getConversation(req.ownerId, req.params.id);
  if (!conversation) return res.status(404).json({ error: "Conversation not found" });
  res.json({ conversation });
});

router.patch("/conversations/:id", (req, res) => {
  const { title } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: "title is required" });

  const conversation = store.renameConversation(req.ownerId, req.params.id, title.trim());
  if (!conversation) return res.status(404).json({ error: "Conversation not found" });
  res.json({ conversation });
});

router.delete("/conversations/:id", (req, res) => {
  const deleted = store.deleteConversation(req.ownerId, req.params.id);
  if (!deleted) return res.status(404).json({ error: "Conversation not found" });
  res.status(204).end();
});

// ------------------------------------------------------
// Streaming endpoint — send / edit / regenerate / continue
// ------------------------------------------------------

router.post("/conversations/:id/stream", async (req, res) => {
  const conversation = store.getConversation(req.ownerId, req.params.id);
  if (!conversation) return res.status(404).json({ error: "Conversation not found" });

  const { action, content, messageId, model, temperature, systemPrompt, attachments } =
    req.body || {};

  let messages = [...conversation.messages];
  let targetAssistantId;
  let turnImages = []; // images to send to Grok for THIS turn only (not persisted)

  if (action === "send") {
    if (!content?.trim() && !(attachments && attachments.length)) {
      return res.status(400).json({ error: "content or an attachment is required" });
    }
    const built = buildUserMessageParts(content?.trim(), attachments);
    turnImages = built.images;
    messages.push(
      store.createMessage({
        role: "user",
        content: built.content,
        contextText: built.contextText,
        attachments: built.attachments,
      })
    );
    const assistantMsg = store.createMessage({ role: "assistant", content: "" });
    messages.push(assistantMsg);
    targetAssistantId = assistantMsg.id;
  } else if (action === "edit") {
    if (!messageId || !content?.trim()) {
      return res.status(400).json({ error: "messageId and content are required" });
    }
    const idx = messages.findIndex((m) => m.id === messageId && m.role === "user");
    if (idx === -1) return res.status(404).json({ error: "Message not found" });

    const edited = { ...messages[idx], content: content.trim() };
    messages = [...messages.slice(0, idx), edited];
    const assistantMsg = store.createMessage({ role: "assistant", content: "" });
    messages.push(assistantMsg);
    targetAssistantId = assistantMsg.id;
  } else if (action === "regenerate") {
    if (messages.length && messages[messages.length - 1].role === "assistant") {
      messages.pop();
    }
    const assistantMsg = store.createMessage({ role: "assistant", content: "" });
    messages.push(assistantMsg);
    targetAssistantId = assistantMsg.id;
  } else if (action === "continue") {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) {
      return res.status(400).json({ error: "Nothing to continue yet" });
    }
    messages.push(store.createMessage({ role: "user", content: CONTINUE_NUDGE, hidden: true }));
    targetAssistantId = lastAssistant.id;
  } else {
    return res.status(400).json({ error: "Invalid action" });
  }

  // Persist optimistically before calling Grok so history survives a crash mid-stream.
  store.saveMessages(req.ownerId, req.params.id, messages);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  const controller = new AbortController();
  let finished = false;
  const targetMessage = messages.find((m) => m.id === targetAssistantId);
  let accumulated = targetMessage?.content || "";

  const persistAccumulated = () => {
    const finalMessages = messages.map((m) =>
      m.id === targetAssistantId ? { ...m, content: accumulated } : m
    );
    store.saveMessages(req.ownerId, req.params.id, finalMessages, { model: grokClient.resolveModel(model) });
    return finalMessages;
  };

  // NOTE: req.on("close") fires on normal request-body completion too, not
  // just client aborts — res.on("close") + writableEnded correctly isolates
  // "the client actually disconnected before we finished responding".
  res.on("close", () => {
    if (finished || res.writableEnded) return;
    finished = true;
    controller.abort();
    persistAccumulated();
  });

  const send = (payload) => {
    try {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch {
      /* client already gone */
    }
  };

  try {
    const contextMessages = buildContextWindow(messages, {
      systemPrompt: systemPrompt || DEFAULT_SYSTEM_PROMPT,
    });

    // For this turn only, attach the raw images to the last user message as a
    // multimodal content array (the stored history keeps just placeholders).
    if (turnImages.length) {
      for (let i = contextMessages.length - 1; i >= 0; i--) {
        if (contextMessages[i].role === "user") {
          contextMessages[i] = {
            role: "user",
            content: [
              { type: "text", text: contextMessages[i].content },
              ...turnImages.map((img) => ({
                type: "image_url",
                image_url: { url: img.dataUrl },
              })),
            ],
          };
          break;
        }
      }
    }

    const upstream = await grokClient.streamGrokChat({
      messages: contextMessages,
      model,
      temperature,
      signal: controller.signal,
    });

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let usage = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop();

      for (const frame of frames) {
        const line = frame.trim();
        if (!line.startsWith("data:")) continue;
        const dataStr = line.slice(5).trim();
        if (dataStr === "[DONE]") continue;

        let json;
        try {
          json = JSON.parse(dataStr);
        } catch {
          continue;
        }

        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          accumulated += delta;
          send({ type: "delta", text: delta });
        }
        if (json.usage) usage = json.usage;
      }
    }

    if (finished) return;
    finished = true;

    let finalMessages = messages.map((m) =>
      m.id === targetAssistantId ? { ...m, content: accumulated, usage } : m
    );

    let titleUpdated;
    if (conversation.title === store.DEFAULT_TITLE && accumulated.trim()) {
      try {
        const firstUser = finalMessages.find((m) => m.role === "user" && !m.hidden);
        if (firstUser) {
          const rawTitle = await grokClient.callGrokOnce({
            messages: [
              {
                role: "system",
                content:
                  "Generate a very short chat title (4-6 words, no quotes, no trailing punctuation) summarizing the user's message.",
              },
              { role: "user", content: firstUser.content.slice(0, 500) },
            ],
            maxTokens: 16,
          });
          const cleanTitle = rawTitle.replace(/^["']|["']$/g, "").trim();
          if (cleanTitle) titleUpdated = cleanTitle;
        }
      } catch (titleErr) {
        console.warn("AI chat title generation failed:", titleErr.message);
      }
    }

    store.saveMessages(req.ownerId, req.params.id, finalMessages, {
      model: grokClient.resolveModel(model),
      title: titleUpdated,
    });

    send({
      type: "done",
      message: finalMessages.find((m) => m.id === targetAssistantId),
      titleUpdated,
    });
    res.end();
  } catch (err) {
    if (finished) return;
    finished = true;
    persistAccumulated();
    send({ type: "error", message: grokClient.formatGrokError(err) });
    res.end();
  }
});

module.exports = router;
