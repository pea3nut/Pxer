const NodeSass =require('node-sass');
const Path =require('path');
const Chokidar =require('chokidar');
const PxerUtility =require('./pxer-utility.js');
const Exec =require('child_process').exec;
const Fs =require('fs');

console.log('Pxer build watcher running!\n');

// watch *.jstpl.ejs *.build.js
{
    let tpls =PxerUtility.getAllFile('./').filter(filename=>filename.indexOf('.jstpl.ejs')!==-1);
    let builders =PxerUtility.getAllFile('./').filter(filename=>filename.indexOf('.build.js')!==-1);

    let watchFiles =[...tpls,...builders];
    console.log('watch:');
    watchFiles.forEach(filename=>console.log(' '+filename));
    Chokidar.watch(watchFiles).on('change',function(path){
        var build =path.replace('.jstpl.ejs','.build.js');
        Exec(`node ${build}`,__dirname ,function(err,msg){
            if(err) console.error(err);
            else    console.log(new Date+'\n'+msg.toString());
        });
    });
};

// watch view/*.scss
{
    var scssList =['../src/view/style.scss'];
    console.log('watch:');
    scssList.forEach(filename=>console.log(' '+filename));
    Chokidar.watch(scssList).on('change',function(path){
        var result =NodeSass.renderSync({file :path});
        Fs.writeFileSync(path.replace(/\.scss$/,'.css'),result.css);
        console.log('Scss reader '+path.replace(/\.scss$/,'.css'));
    });
}

console.log('');