self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Firebase Messaging in SW (compat)
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

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || "Lil's Life Chat";
  const body = data.body || "Nova mensagem";

  self.registration.showNotification(title, {
    body,
    icon: "/images/icon192.png",
    badge: "/images/icon192.png",
    tag: "lilslife-chat",   // THIS makes it replace (nest)
    renotify: true,
    data: { url: data.url || "/chat/" }
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/chat/";

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of allClients) {
      // if any tab/pwa is already open, focus it
      if ("focus" in client) return client.focus();
    }
    return clients.openWindow(url);
  })());
});
