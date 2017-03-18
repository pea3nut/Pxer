const Path =require('path');
const Fs =require('fs');
const PxerUtility =require('./pxer-utility.js');

const readerTpl =Fs.readFileSync('./launcher.jstpl.ejs').toString();
const renderData ={
    master:{
        libURL      :PxerUtility.path2URL('../dist/lib.js'),
        supportURL  :PxerUtility.path2URL('../dist/support.js'),
        pxerVersion :PxerUtility.pxerVersion,
    },
    dev   :{
        libURL      :PxerUtility.path2URL('../src/app/lib.js'),
        supportURL  :PxerUtility.path2URL('../src/app/support.js'),
        pxerVersion :PxerUtility.pxerVersion,
    },
};

var devSave ='../src/launcher.js';
console.log('build '+Path.resolve(devSave));
Fs.writeFileSync(
    devSave,
    PxerUtility.automaticDoc(__filename)+
    PxerUtility.reader(readerTpl,renderData['dev'])
);
var masterSave ='../dist/launcher.js';
console.log('build '+Path.resolve(masterSave));
Fs.writeFileSync(
    masterSave,
    PxerUtility.automaticDoc(__filename)+
    PxerUtility.reader(readerTpl,renderData['master'])
);