const Path = require('path');
const Fs = require('fs');
const Ejs =require('ejs');
const BuildFiles = require('./package-files');
const packageInfo = require('../package.json');

const template = Fs.readFileSync(Path.join(__dirname, './native.ejs')).toString();
const distPath = Path.join(__dirname, '../dist/');
const srcPath = Path.join(__dirname, '../src/');


(async function () {

    let { sourceCode, requireHeaders } = await BuildFiles();

    Fs.writeFileSync(Path.join(distPath, 'native.js'), sourceCode);
    Fs.writeFileSync(Path.join(distPath, 'pxer.user.js'), Ejs.render(template, {
        requireHeaders,
        version: packageInfo.version,
    }));
    Fs.copyFileSync(Path.join(srcPath, 'launcher.js'), Path.join(distPath, 'launcher.js'));
    Fs.copyFileSync(Path.join(srcPath, 'launcher.js'), Path.join(distPath, 'jsonp.js'));
    Fs.copyFileSync(Path.join('node_modules/vue/dist/vue.js'), Path.join(distPath, 'vue.js'));

    console.log(`Release native`);
})();