const CACHE_NAME = "mission-ca-v7";

const FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./app.js",
    "./router.js",
    "./state.js",
    "./storage.js",
    "./dashboard.js",
    "./subject.js",
    "./mission.js",
    "./history.js",
    "./settings.js",
    "./planner.js",
    "./forms.js",
    "./charts.js",
    "./quotes.js",
    "./ui.js",
    "./CSS/part1-base.css?v=6",
    "./CSS/part2-welcome.css?v=6",
    "./CSS/part3-dashboard.css?v=6",
    "./CSS/part4-progress-ring.css?v=6",
    "./CSS/part5-missions.css?v=6",
    "./CSS/part6-study-plan.css?v=6",
    "./CSS/part7-subjects.css?v=6",
    "./CSS/part8-chapters.css?v=6",
    "./CSS/part9-history.css?v=6",
    "./CSS/part10-charts.css?v=6",
    "./CSS/part11-settings.css?v=6",
    "./CSS/part12-components.css?v=6",
    "./CSS/part13-responsive.css?v=6",
    "./assets/motivation/hello-kitty.jpeg",
    "./assets/motivation/cat-study.jpeg",
    "./assets/motivation/shant-girl.jpeg",
    "./assets/motivation/degree-girl.jpeg",
    "./assets/motivation/calculator-cat.jpeg",
    "./assets/icons/icon-192.png",
    "./assets/icons/icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)));
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
