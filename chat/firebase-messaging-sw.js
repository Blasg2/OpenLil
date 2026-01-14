/* /chat/firebase-messaging-sw.js */
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

// Background push display
messaging.onBackgroundMessage((payload) => {
  const title =
    payload?.notification?.title ||
    payload?.data?.title ||
    "Lil's Life Chat";

  const body =
    payload?.notification?.body ||
    payload?.data?.body ||
    "Nova mensagem";

  self.registration.showNotification(title, {
    body,
    icon: "/images/icon-192.png", // adjust if your icon path differs
    data: payload?.data || {}
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of allClients) {
      if (c.url.includes("/chat")) return c.focus();
    }
    return clients.openWindow("/chat");
  })());
});
