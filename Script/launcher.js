/*pxer启动器*/
function PxerLauncher(){
    this.syncLoadList=[
        predefinePxerConfig['URL_ROOT']+"Pxer/Script/pxer.js",
        predefinePxerConfig['URL_ROOT']+"Library/jquery.scoped.js",
        predefinePxerConfig['URL_ROOT']+"Pxer/View/"+predefinePxerConfig['THEME_NAME']+"/"+predefinePxerConfig['THEME_NAME']+".js",
    ];
    this.asynLoadList=[
        predefinePxerConfig['URL_ROOT']+"Pxer/Script/lib/PxerHtmlParser.class.js",
        predefinePxerConfig['URL_ROOT']+"Pxer/Script/lib/PxerPrint.class.js",
        predefinePxerConfig['URL_ROOT']+"Pxer/Script/lib/PxerRequest.class.js",
        predefinePxerConfig['URL_ROOT']+"Pxer/Script/lib/PxerThread.class.js",
        predefinePxerConfig['URL_ROOT']+"Pxer/Script/lib/PxerThreadManager.class.js",
        predefinePxerConfig['URL_ROOT']+"Pxer/Script/lib/PxerWorks.class.js",
        predefinePxerConfig['URL_ROOT']+"Pxer/View/"+predefinePxerConfig['THEME_NAME']+"/"+predefinePxerConfig['THEME_NAME']+".css",
        predefinePxerConfig['URL_ROOT']+"Library/favicon.ico"
   ];
};
PxerLauncher.prototype={
    "loadFiles":function(){},
    "loadUI"   :function(){},
};

PxerLauncher.prototype["loadFiles"] =function(){
    for(var i=0 ;i<this.asynLoadList.length ;i++){
        var elt =createElt(this.asynLoadList[i]);
        document.head.appendChild(elt);
    };

    var syncList =Array();
    for(var i=0 ;i<this.syncLoadList.length ;i++){
         syncList.push(createElt(this.syncLoadList[i]));
    };

    for(var i=0 ;i<syncList.length ;i++){
        syncList[i].onload =function(){
            for(var i=0 ;i<syncList.length-1 ;i++){
                if(this ===syncList[i]){
                    document.head.appendChild(syncList[i+1]);
                    break;
                }
            }
        };
    };
    document.head.appendChild(syncList[0]);


    function createElt(url){
        var elt =null;
        switch(url.match(/\w+$/)[0]){
            case "js":
                elt =_addJs(url);
                break;
            case "css":
                elt =_addCss(url);
                break;
            case "ico":
                elt =_addIco(url);
                break;
            default:
                alert("createElt error!"+url);
        }
        return elt;

        function _addJs(url){
            var elt =document.createElement("script");
            elt.src=url+"?"+(new Date()).getTime();
            return elt;
        };
        function _addCss(url){
            var elt =document.createElement("link");
            elt.rel="stylesheet";
            elt.href=url+"?"+(new Date()).getTime();
            return elt;
        };
        function _addIco(url){
            var elt =document.createElement("link");
            elt.rel="shortcut icon";
            elt.href=url+"?"+(new Date()).getTime()
            return elt;
        };
    };
};

PxerLauncher.prototype["loadUI"] =function(){
    $.ajax({
        "context"   :this,
        "dataType"  :'html',
        "url"       :predefinePxerConfig['URL_ROOT']+"Pxer/View/"+predefinePxerConfig['THEME_NAME']+"/"+predefinePxerConfig['THEME_NAME']+".html",
        "success"   :function(data){
            var parentNote =document.getElementById('page-mypage')
                ||document.getElementById('wrapper')
                ||document.getElementById('contents')
                ||document.body
            ;
            var elt =document.createElement("div");
            elt.innerHTML =data;
            $(parentNote).prepend(elt);
        },
    });
};

void($(function() {
    window.predefinePxerConfig =$.extend({
        "THEME_NAME":"default",
    }, window.predefinePxerConfig);
    var pl=new PxerLauncher();
    pl.loadFiles();
    pl.loadUI();
}));
