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

// Track notification state
let notificationCount = 0;
let lastNotificationTime = 0;
const NOTIFICATION_TIMEOUT = 5000;

// Background push display
messaging.onBackgroundMessage(async (payload) => {
  const title = payload?.data?.title || "Lil's Life Chat";
  const body = payload?.data?.body || "Nova mensagem";
  
  const now = Date.now();
  
  // Reset count if it's been more than 5 seconds since last notification
  if (now - lastNotificationTime > NOTIFICATION_TIMEOUT) {
    notificationCount = 0;
  }
  
  notificationCount++;
  lastNotificationTime = now;
  
  const isFirstNotification = notificationCount === 1;
  
  // Get existing notifications to close them
  const existingNotifications = await self.registration.getNotifications({
    tag: "chat-messages"
  });
  
  // Close all existing chat notifications
  existingNotifications.forEach(n => n.close());
  
  // Build notification body text
  const notificationBody = notificationCount > 1 
    ? `${body}\n+${notificationCount - 1} ${notificationCount === 2 ? 'mensagem' : 'mensagens'}` 
    : body;
  
  // Build notification options
  const options = {
    body: notificationBody,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "chat-messages",
    renotify: isFirstNotification,
    requireInteraction: false,
    silent: !isFirstNotification,
    vibrate: isFirstNotification ? [200, 100, 200] : undefined,
    timestamp: now, // Force fresh timestamp
    actions: [
      { action: "open", title: "Abrir" }
    ],
    data: {
      url: "/chat",
      count: notificationCount,
      timestamp: now,
      ...(payload?.data || {})
    }
  };
  
  await self.registration.showNotification(title, options);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  // Reset count when user clicks
  notificationCount = 0;
  
  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ 
      type: "window", 
      includeUncontrolled: true 
    });
    
    // Focus existing chat window if found
    for (const c of allClients) {
      if (c.url.includes("/chat")) {
        return c.focus();
      }
    }
    
    // Otherwise open new window
    return clients.openWindow("/chat");
  })());
});

// Reset count when user opens the chat
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CHAT_OPENED") {
    notificationCount = 0;
  }
});