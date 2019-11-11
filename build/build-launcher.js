const Path = require('path');
const Fs = require('fs');
const Package = require('../package.json');

const launcherFile = Path.join(__dirname, '../src/launcher.js');
const tag = '/*@auto-fill*/';

Fs.writeFileSync(
    launcherFile,
    Fs.readFileSync(launcherFile).toString().replace(
        /\/\*@auto-fill\*\/.+?\/\*@auto-fill\*\//,
        `/*@auto-fill*/'${Package.version}'/*@auto-fill*/`
    ),
);

console.log('Rewrite the version in launcher.js');

