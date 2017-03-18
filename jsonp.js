~function(){
    // 判断启动模式，引入启动器
    if(window['PXER_MODE']==='master'){
        document.head.appendChild(
            document.createElement("script")
        ).src=window['PXER_URL']+"dist/launcher.js";
    }else{
        document.head.appendChild(
            document.createElement("script")
        ).src=window['PXER_URL']+"src/launcher.js";
    };

}();