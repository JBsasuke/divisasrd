// Service worker de Divisas RD: solo muestra las notificaciones
// y abre la web al tocarlas (Android no permite notificaciones sin esto).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const abiertas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of abiertas) {
      if (c.url.startsWith(self.location.origin)) return c.focus();
    }
    return self.clients.openWindow("/");
  })());
});
