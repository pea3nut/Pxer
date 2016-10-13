// ==UserScript==
// @name          Pxer-6
// @version       6.1.3
// @namespace     https://github.com/pea3nut/Pxer
// @author        花生PeA
// @description   pixiv.net Tools
// @noframes
// @grant         none
// @include       http://www.pixiv.net/member_illust.php*
// @include       http://www.pixiv.net/bookmark.php*
// @include       http://www.pixiv.net/search.php*
// ==/UserScript==
javascript:void((function() {
    function loadPxer(){
        window.pxerDefinePxerConfig ={
            /*"URL_ROOT":"http://pxer.nutjs.com/pxer6/",*/
            "URL_ROOT":"http://127.0.0.1/github/pxer-beta-6/",
            "TEMPLATE_URL":'lib/template.php',
            "DEBUG":false,
            "CACHE":true,
        };
        document.head.appendChild(
            document.createElement("script")
        ).src
            =window.pxerDefinePxerConfig['URL_ROOT']+"lib/launcher.js"
            +"?pixiv_id="+document.cookie.match(/PHPSESSID=(\d+)/)[1]
            +"&time="+(new Date()).getTime()
        ;
    };
    if(document.readyState !=='loading'){
        setTimeout(loadPxer);
    }else{
        document.addEventListener('DOMContentLoaded' ,loadPxer);
    };
})());
