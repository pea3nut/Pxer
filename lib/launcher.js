~function(){
    if(window.pxerDefinePxerConfig['LOAD_START']) return console.warn('Prevent repeat load.');
    var script =document.createElement('script');
    script.src =pxerDefinePxerConfig['URL_ROOT']+'lib/PxerLauncher.class.js';
    script.addEventListener('load' ,function(){
        let pl =new PxerLauncher({
            sync:[
                pxerDefinePxerConfig['URL_ROOT']+'lib/pxer.core.min.js',
            ],
            asyn:[
                pxerDefinePxerConfig['URL_ROOT']+'lib/bs.pxer.min.css',
                pxerDefinePxerConfig['URL_ROOT']+'lib/style.min.css',
                pxerDefinePxerConfig['URL_ROOT']+'lib/favicon.ico',
            ],
            cache:pxerDefinePxerConfig['CACHE'],
        });
        pl.load();
    });
    document.head.appendChild(script);
    window.pxerDefinePxerConfig['LOAD_START'] =true;
}();




