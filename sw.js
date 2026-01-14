/* sw.js (root) - minimal, no caching, adds FCM background notifications */

/* keep your current behavior */
self.addEventListener("install", (event) => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

/*
  Firebase Messaging SW (compat).
  IMPORTANT:
  - This file must be served from "/" (root) because your page registers "/sw.js".
  - No caching is added here.
*/
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAzpUnWhMkePhLgwf22aA8YUzrUJUc_RlE",
  authDomain: "lilslife.firebaseapp.com",
  projectId: "lilslife",
  messagingSenderId: "731094352991",
  appId: "1:731094352991:web:6ac2b5b02253f4915947ea"
});

const messaging = firebase.messaging();

/*
  When a push arrives and the app is in the background / closed,
  show a notification.
*/
messaging.onBackgroundMessage((payload) => {
  const data = payload?.data || {};
  const title = data.title || "Lil's Life Chat";
  const body = data.body || "Nova mensagem";

const options = {
  body,
  icon: "/images/icon192.png",
  badge: "/images/icon192.png",
  tag: "lilslife-chat",     // <-- this makes it replace the previous one
  renotify: true,           // optional: makes it alert again when replaced
  data: { url: data.url || "/chat/" }
};

  self.registration.showNotification(title, options);
});

/*
  Click on notification → focus chat if already open, else open it.
*/
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification?.data?.url || "/chat/";

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });

    // If there's already a chat tab, focus it
    for (const client of allClients) {
      if (client.url.includes("/chat/")) {
        return client.focus();
      }
    }

    // Otherwise open a new one
    return clients.openWindow(urlToOpen);
  })());
});
