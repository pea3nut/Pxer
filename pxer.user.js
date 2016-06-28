// ==UserScript==
// @name          Pxer-beta-5
// @namespace     https://github.com/pea3nut/Pxer
// @description   pixiv.net Tools
// @include       http://www.pixiv.net/member_illust.php*
// @include       http://www.pixiv.net/search.php*
// @include       http://www.pixiv.net/member.php*
// @include       http://www.pixiv.net/member_illust.php*
// @include       http://www.pixiv.net/bookmark.php*

// @exclude       http://www.pixiv.net/messages.php*
// ==/UserScript==
javascript:void((function() {
    window.predefinePxerConfig ={
        "URL_ROOT":"http://127.0.0.233/",
    };
    document.head.appendChild(
        document.createElement("script")
    ).src
    =window.predefinePxerConfig+"Pxer/Script/launcher.js?"
    +(new Date()).getTime()
})());