const { onValueCreated } = require("firebase-functions/v2/database");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notifyOnNewMessage = onValueCreated("/messages/{id}", async (event) => {
  const msg = event.data.val();
  if (!msg || !msg.uid) return;

  const senderUid = String(msg.uid);
  const messageId = String(event.params.id);

  const tokensSnap = await admin.database().ref("fcmTokens").get();
  if (!tokensSnap.exists()) return;

  const allTokens = tokensSnap.val();

  const tokens = [];
  const tokenToOwner = [];

  for (const [uid, tokenMap] of Object.entries(allTokens)) {
    if (uid === senderUid) continue;
    if (!tokenMap) continue;

    for (const token of Object.keys(tokenMap)) {
      tokens.push(token);
      tokenToOwner.push({ uid, token });
    }
  }

  if (tokens.length === 0) return;

  const title = msg.nickname ? String(msg.nickname) : "Lil's Life Chat";
  const body =
    msg.message ? String(msg.message).slice(0, 120) :
    msg.imageUrl ? "📷 Imagem" :
    "Nova mensagem";

  // IMPORTANT: DATA ONLY (no notification/webpush.notification)
  const multicast = {
    tokens,
    data: {
      title,
      body,
      url: "/chat/",
      messageId,
      senderUid
    }
  };

  const resp = await admin.messaging().sendEachForMulticast(multicast);

  // Clean up invalid tokens
  const updates = {};
  resp.responses.forEach((r, idx) => {
    if (r.success) return;

    const code = r.error?.code || "";
    const shouldDelete =
      code.includes("registration-token-not-registered") ||
      code.includes("invalid-argument");

    if (shouldDelete) {
      const owner = tokenToOwner[idx];
      updates[`fcmTokens/${owner.uid}/${owner.token}`] = null;
    }
  });

  if (Object.keys(updates).length) {
    await admin.database().ref().update(updates);
  }
});
