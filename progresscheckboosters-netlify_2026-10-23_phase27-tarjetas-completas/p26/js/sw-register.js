// Activa el modo sin conexión (ver /sw.js). Si el navegador no lo soporta, la página funciona igual.
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
}
