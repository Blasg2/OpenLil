/* chat/firebase-messaging-sw.js */
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAzpUnWhMkePhLgwf22aA8YUzrUJUc_RlE",
  authDomain: "lilslife.firebaseapp.com",
  databaseURL: "https://lilslife-default-rtdb.firebaseio.com",
  projectId: "lilslife",
  storageBucket: "lilslife.firebasestorage.app",
  messagingSenderId: "731094352991",
  appId: "1:731094352991:web:6ac2b5b02253f4915947ea"
});

const messaging = firebase.messaging();

/**
 * Android grouping/replacing:
 * - Use a CONSTANT `tag` so new notifications replace the previous one.
 * - Use renotify:false so it won’t vibrate/sound when replacing.
 */
messaging.onBackgroundMessage((payload) => {
  const title =
    payload?.notification?.title ||
    payload?.data?.title ||
    "Lil's Life Chat";

  const body =
    payload?.notification?.body ||
    payload?.data?.body ||
    "Nova mensagem";

  const messageId = payload?.data?.messageId || "";
  const senderUid = payload?.data?.senderUid || "";

  const options = {
    body,
    icon: "/images/icon192.png",
    badge: "/images/icon192.png",

    // KEY: replace instead of stacking
    tag: "lils-life-chat",

    // KEY: replacing should not vibrate/sound again
    renotify: false,
    silent: true,

    data: {
      url: "/chat/",
      messageId,
      senderUid
    }
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/chat/";
  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of allClients) {
        if (c.url.includes("/chat")) {
          await c.focus();
          return;
        }
      }
      await clients.openWindow(url);
    })()
  );
});
