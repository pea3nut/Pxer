'use strict';

~function(){
    var script =document.createElement('script');
    script.src =pxerDefinePxerConfig['URL_ROOT']+'src/script/class/PxerLauncher.class.js';
    script.addEventListener('load' ,function(){
        let pl =new PxerLauncher({
            sync:[
                pxerDefinePxerConfig['URL_ROOT']+'src/script/lib.js',
                pxerDefinePxerConfig['URL_ROOT']+'src/script/PxerData.js',
                pxerDefinePxerConfig['URL_ROOT']+'src/script/class/PxerEvent.class.js',
                pxerDefinePxerConfig['URL_ROOT']+'src/script/class/PxerPrinter.class.js',
                pxerDefinePxerConfig['URL_ROOT']+'src/script/class/PxerHtmlParser.class.js',
                pxerDefinePxerConfig['URL_ROOT']+'src/script/class/PxerThread.class.js',
                pxerDefinePxerConfig['URL_ROOT']+'src/script/class/PxerThreadManager.class.js',
                pxerDefinePxerConfig['URL_ROOT']+'src/script/class/PxerApp.class.js',
                pxerDefinePxerConfig['URL_ROOT']+'src/view/ui.js',
            ],
            asyn:[
                pxerDefinePxerConfig['URL_ROOT']+'src/view/bs.pxer.css',
                pxerDefinePxerConfig['URL_ROOT']+'src/view/style.css',
            ],
            cache:pxerDefinePxerConfig['CACHE'],
        });
        pl.load();
    });
    setTimeout(()=>{
        if(window.pxerDefinePxerConfig['LOAD_START']) return console.warn('Prevent repeat load.');
        window.pxerDefinePxerConfig['LOAD_START'] =true;
        document.head.appendChild(script);
    });
}();


