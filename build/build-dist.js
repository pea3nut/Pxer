const Path =require('path');
const Join =Path.resolve;
const Fs =require('fs');
const Fse = require('fs-extra');
const PxerUtility =require('./pxer-utility.js');
const Exec =require('child_process').exec;

// 拷贝public文件夹
Fse.removeSync(Join(__dirname,'../dist/public'));
Fse.copySync(
    Join(__dirname,'../src/public'),
    Join(__dirname,'../dist/public')
);

// 拷贝lib.js
Fse.copySync(
    Join(__dirname,'../src/app/lib.js'),
    Join(__dirname,'../dist/lib.js')
);

// 拷贝View
Fse.copySync(Join(__dirname,'../src/view/template.html') ,Join(__dirname,'../dist/view/template.html'));
Fse.copySync(Join(__dirname,'../src/view/style.css')     ,Join(__dirname,'../dist/view/style.css'));
Fse.copySync(Join(__dirname,'../src/view/vm.js')         ,Join(__dirname,'../dist/view/vm.js'));

// 合并run/为run.js
Fs.writeFileSync(
    Join(__dirname,'../dist/run.js'),
    Buffer.concat(
        PxerUtility.getAllFile(Join(__dirname,'../src/run/')).map(path=>Fs.readFileSync(path))
    )
);

// 合并app/class为pxer-core
var fileList =[];
for(let array of PxerUtility.groupFile(PxerUtility.getAllFile(Join(__dirname,'../src/app/class/')))){
    fileList.push(...array);
};
Fs.writeFileSync(
    Join(__dirname,'../dist/pxer-core.js'),
    Buffer.concat(fileList.map(path=>Fs.readFileSync(path)))
);
console.log('Build ./dist/');

// 执行*.build.js
let builderList =PxerUtility.getAllFile('./').filter(filename=>filename.indexOf('.build.js')!==-1);
for(let build of builderList){
    Exec(`node ${build}`,__dirname ,function(err,msg){
        if(err) console.error(err);
        else    console.log(new Date+'\n'+msg.toString());
    });
}