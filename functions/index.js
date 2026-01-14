const { onValueCreated } = require("firebase-functions/v2/database");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notifyOnNewMessage = onValueCreated("/messages/{id}", async (event) => {
  const msg = event.data.val();
  if (!msg || !msg.uid) return;

  const senderUid = msg.uid;
  const messageId = event.params.id;

  // Load all tokens once
  const tokensSnap = await admin.database().ref("fcmTokens").get();
  if (!tokensSnap.exists()) return;

  const allTokens = tokensSnap.val(); // { uid: { token: true, ... }, ... }

  const tokens = [];
  const tokenToOwner = [];

  for (const [uid, tokenMap] of Object.entries(allTokens)) {
    if (uid === senderUid) continue; // skip sender

    for (const token of Object.keys(tokenMap)) {
      tokens.push(token);
      tokenToOwner.push({ uid, token });
    }
  }

  if (tokens.length === 0) return; // no one to notify

  const title = msg.nickname || "Lil's Life Chat";
  const body =
    msg.message ? String(msg.message).slice(0, 120) : // first 120 chars of text
    msg.imageUrl ? "📷 Imagem" : // or "Imagem" if it's a picture
    "Nova mensagem";

  const multicast = {
    tokens,
    notification: { title, body },
    data: {
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
