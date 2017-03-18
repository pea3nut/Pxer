const Chokidar =require('chokidar');
const PxerUtility =require('./pxer-utility.js');
const Exec =require('child_process').exec;

console.log('Pxer build watcher running!\n');

// watch *.jstpl.ejs
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

