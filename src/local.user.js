// ==UserScript==
// @name          Pxer-local
// @grant         unsafeWindow
// @noframes
// @include       https://www.pixiv.net*
// @include       http://www.pixiv.net*
// @include       http://pxer.pea3nut.org*
// @include       https://127.0.0.1*
// @include       http://127.0.0.1*
// ==/UserScript==
void (function () {
    unsafeWindow['PXER_URL'] = 'https://127.0.0.1:8125/';
    unsafeWindow['PXER_MODE'] = 'local';

    // add enter point script in page
    document.documentElement.appendChild(
        document.createElement('script')
    ).src = unsafeWindow['PXER_URL'] + 'src/launcher.js?' + (+new Date);

}());