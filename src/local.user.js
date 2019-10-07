// ==UserScript==
// @name          Pxer-local
// @noframes
// @include       https://www.pixiv.net*
// @include       http://www.pixiv.net*
// @include       http://pxer.pea3nut.org*
// @include       https://127.0.0.1*
// @include       http://127.0.0.1*
// ==/UserScript==
javascript: void(function() {
    window['PXER_URL'] = 'https://127.0.0.1:8125/';
    window['PXER_MODE'] = 'local';

    // add enter point script in page
    document.documentElement.appendChild(
        document.createElement('script')
    ).src = window['PXER_URL'] + 'src/launcher.js?' + (+new Date);

}());