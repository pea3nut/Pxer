// ==UserScript==
// @name           Pxer-local
// @description    Maybe the best tool for pixiv.net for capture pictures
// @description:zh-CN 可能是目前最好用的P站批量抓图工具
// @description:en-US Maybe the best tool for pixiv.net for capture pictures
// @description:ja-JP Pixiv の全てのツールで一番使いやすいバッチキャプチャーソフトかもしれない
// @icon           https://pxer-app.pea3nut.org/public/favicon.ico
// @version        7
// @homepageURL    http://pxer.pea3nut.org/
// @supportURL     https://github.com/FoXZilla/Pxer/issues/new/choose
// @author         pea3nut / eternal-flame-AD
// @grant          unsafeWindow
// @noframes
// @require        https://pxer-app.pea3nut.org/vue.js
// @include        https://www.pixiv.net*
// @include        http://www.pixiv.net*
// @include        http://pxer.pea3nut.org*
// @include        https://pxer.pea3nut.org*
// ==/UserScript==
javascript: void(function() {

    unsafeWindow['PXER_URL'] = 'https://127.0.0.1:8125/';
    unsafeWindow['PXER_MODE'] = 'local';
    unsafeWindow['Vue'] = Vue;

    // add enter point script in page
    document.documentElement.appendChild(
        document.createElement('script')
    ).src = unsafeWindow['PXER_URL'] + 'src/launcher.js?' + (+new Date);


}());
