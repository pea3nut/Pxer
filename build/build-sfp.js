const Path = require('path');
const Fs = require('fs');
const Ejs =require('ejs');
const BuildFiles = require('./package-files');

const template = Fs.readFileSync(Path.join(__dirname, './sfp.ejs')).toString();
const distPath = Path.join(__dirname, '../dist/sfp.user.js');


(async function () {

    let { sourceCode, requireHeaders } = await BuildFiles();

    sourceCode = Fs.readFileSync(Path.join(__dirname, '../src/launcher.js')) + sourceCode;

    Fs.writeFileSync(distPath, Ejs.render(template, {
        sourceCode,
        requireHeaders,
    }));

    console.log(`Release ${distPath}`);
})();