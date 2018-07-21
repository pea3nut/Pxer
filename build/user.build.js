const Path =require('path');
const Fs =require('fs');
const PxerUtility =require('./pxer-utility.js');

const readerTpl =Fs.readFileSync('./user.jstpl.ejs').toString();
const renderData ={
    master:{
        isLocal :false,
        isDev   :false,
        pxerURL :PxerUtility.pxerURL,
    },
    dev   :{
        isLocal :false,
        isDev   :true,
        pxerURL :PxerUtility.pxerURL,
    },
};


// 输出文件
var devSave ='../pxer-dev.user.js';
console.log('build '+Path.resolve(devSave));
Fs.writeFileSync(
    devSave,
    PxerUtility.automaticDoc(__filename)+
    PxerUtility.reader(readerTpl,renderData['dev'])
);
var masterSave ='../pxer-master.user.js';
console.log('build '+Path.resolve(masterSave));
Fs.writeFileSync(
    masterSave,
    PxerUtility.automaticDoc(__filename)+
    PxerUtility.reader(readerTpl,renderData['master'])
);