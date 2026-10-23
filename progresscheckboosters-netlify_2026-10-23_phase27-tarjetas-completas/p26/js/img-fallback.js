/* Respaldo de imágenes sin JavaScript en el HTML (compatible con la política de seguridad del sitio).
   <img data-fallback="URL">  si falla, prueba esa URL una vez.
   data-onerr="remove"        si falla, quita la imagen.
   data-onerr="swap"          si falla, la oculta y muestra el elemento siguiente.
   data-onerr="hide"          si falla (tras el respaldo), la oculta. */
(function () {
    function failed(img) {
        if (img.dataset.fallback && !img.dataset.fbTried) { img.dataset.fbTried = '1'; img.src = img.dataset.fallback; return; }
        var k = img.dataset.onerr;
        if (k === 'remove') img.remove();
        else if (k === 'swap') { img.style.display = 'none'; if (img.nextElementSibling) img.nextElementSibling.classList.remove('hidden'); }
        else if (k === 'hide') img.style.display = 'none';
    }
    document.addEventListener('error', function (e) {
        if (e.target && e.target.tagName === 'IMG') failed(e.target);
    }, true);
    // Imágenes que ya fallaron antes de que este script se ejecutara.
    Array.prototype.forEach.call(document.images, function (img) {
        if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) failed(img);
    });
})();
