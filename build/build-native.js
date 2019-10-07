const Path = require('path');
const Fs = require('fs');
const Ejs =require('ejs');
const BuildFiles = require('./package-files');

const template = Fs.readFileSync(Path.join(__dirname, './native.ejs')).toString();
const distPath = Path.join(__dirname, '../dist/');
const srcPath = Path.join(__dirname, '../src/');


(async function () {

    let { sourceCode, requireHeaders } = await BuildFiles();

    Fs.writeFileSync(Path.join(distPath, 'native.js'), sourceCode);
    Fs.writeFileSync(Path.join(distPath, 'pxer.user.js'), Ejs.render(template, { requireHeaders }));
    Fs.copyFileSync(Path.join(srcPath, 'launcher.js'), Path.join(distPath, 'launcher.js'));
    Fs.copyFileSync(Path.join(srcPath, 'launcher.js'), Path.join(distPath, 'jsonp.js'));

    console.log(`Release native`);
})();