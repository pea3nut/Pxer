const Path =require('path');
const Fs =require('fs');
const Fse = require('fs-extra');
const PxerUtility =require('./pxer-utility.js');
const Exec =require('child_process').exec;

// 拷贝public文件夹
Fse.removeSync('../dist/public');
Fse.copySync('../src/public','../dist/public');

// 拷贝lib.js
Fse.copySync('../src/app/lib.js','../dist/lib.js');

// 拷贝View
Fse.copySync('../src/view/template.html','../dist/view/template.html');
Fse.copySync('../src/view/style.css','../dist/view/style.css');
Fse.copySync('../src/view/vm.js','../dist/view/vm.js');

// 合并run/为run.js
Fs.writeFileSync(
    '../dist/run.js',
    Buffer.concat(PxerUtility.getAllFile('../src/run/').map(path=>Fs.readFileSync(path)))
);

// 合并app/class为pxer-core
var fileList =[];
for(let array of PxerUtility.groupFile(PxerUtility.getAllFile('../src/app/class/'))){
    fileList.push(...array);
};
Fs.writeFileSync(
    '../dist/pxer-core.js',
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