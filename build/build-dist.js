const Path =require('path');
const Process =require('process');
const NodeSass =require('node-sass');
const Join =Path.resolve;
const Fs =require('fs');
const Fse = require('fs-extra');
const PxerUtility =require(Join(__dirname,'./pxer-utility.js'));
const Exec =require('child_process').exec;
const program = require('commander');
const Chokidar =require('chokidar');

program
    .option("--watch","watch for file changes and build automatically");

program.parse(process.argv);
const buildOnce =()=>{
    console.log("\x1b[33mInitiated build\x1b[0m")
    // 拷贝public文件夹
    Fse.removeSync(Join(__dirname,'../dist/public'));
    Fse.copySync(
        Join(__dirname,'../src/public'),
        Join(__dirname,'../dist/public')
    );

    // 拷贝lib.js
    PxerUtility.babelCopy(
        Join(__dirname,'../src/app/lib.js'),
        Join(__dirname,'../dist/lib.js')
    );

    // 编译Sass
    for (path of [Join(__dirname,'../src/view/style.scss')]) {
        var result =NodeSass.renderSync({file : path});
        Fs.writeFileSync(path.replace(/\.scss$/,'.css'),result.css);
    };

    // 拷贝View
    Fse.copySync(Join(__dirname,'../src/view/template.html') ,Join(__dirname,'../dist/view/template.html'));
    Fse.copySync(Join(__dirname,'../src/view/style.css')     ,Join(__dirname,'../dist/view/style.css'));
    PxerUtility.babelCopy(
        Join(__dirname,'../src/view/AutoSuggestControl.class.js'),
        Join(__dirname,'../dist/view/AutoSuggestControl.class.js')
    );
    PxerUtility.babelCopy(
        Join(__dirname,'../src/view/vm.js'),
        Join(__dirname,'../dist/view/vm.js')
    );
    PxerUtility.babelCopy(
        Join(__dirname,'../src/view/PxerAnalytics.class.js'),
        Join(__dirname,'../dist/view/PxerAnalytics.class.js')
    );

    // 合并run/为run.js
    Fs.writeFileSync(
        Join(__dirname,'../dist/run.js'),
        PxerUtility.babelTransform(
            Buffer.concat(
                PxerUtility.getAllFile(Join(__dirname,'../src/run/')).map(path=>Fs.readFileSync(path))
            )
        )
    );

    // 合并app/class为pxer-core
    var fileList =[Join(__dirname, "generator-runtime.js")];
    for(let array of PxerUtility.groupFile(
            PxerUtility
                .getAllFile(Join(__dirname,'../src/app/class/'))
                .filter(fileName=>/\.js$/.test(fileName))
        )
    ){
        fileList.push(...array);
    };
    Fs.writeFileSync(
        Join(__dirname,'../dist/pxer-core.js'),
        PxerUtility.babelTransform(
            Buffer.concat(
                fileList.map(
                    path=>Buffer.concat([
                        Fs.readFileSync(path),
                        Buffer.from('\n'),
                    ])
                )
            )
        )
    );
    console.log('Build ./dist/');

    // 执行*.build.js
    let builderList =PxerUtility.getAllFile(__dirname).filter(filename=>filename.indexOf('.build.js')!==-1);
    for(let build of builderList){
        Exec(`node ${build}` ,{cwd:__dirname} ,function(err,msg){
            if(err) console.error(err);
            else    console.log(new Date+'\n'+msg.toString());
        });
    }
};

//build once
buildOnce();

if (program.watch) {
    console.log("Watching file changes.");
    let pathList = [
        Join(__dirname,"../src/"),
        ...PxerUtility.getAllFile(Join(__dirname,"../src/")),
        Join(__dirname,"*.build.js"),
        Join(__dirname,"*.ejs"),
    ];
    var watcher =Chokidar.watch(pathList, {
        persistent: true,
        ignored: (path)=>{
            if (!Fs.existsSync(path)) {
                return true;
            }
            if (Fs.statSync(path).isDirectory()) {
                return true;
            }
            if (Path.extname(path)===".css" && Fs.existsSync(path.replace(/\.css$/,".scss"))) {
                return true;
            }
            if (Path.extname(path)===".js" && Fs.existsSync(Join(__dirname, Path.basename(path, ".js")+".jstpl.ejs"))) {
                return true;
            }
            return false;
        },
        ignoreInitial:true,
    });
    let buildWithError = ()=>{
        try {
            buildOnce()
            console.log("\x1b[32mBuild Success.\x1b[0m")
        } 
        catch (e) {
            console.log("\x1b[31mBuild failed with error\x1b[0m\n"+e.message);
        }
    }
    watcher
        .on("add", buildWithError)
        .on("change", buildWithError)
        .on("unlink", buildWithError)
    setTimeout(()=>{}, 86400000);
};