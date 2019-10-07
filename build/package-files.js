const Path = require('path');
const Fs = require('fs');
const request = require('request');

const lists = require('../src/files.json');

module.exports = async function () {
    let sourceCode = '';
    let requireHeaders = '';

    for (const list of lists) {
        for (const info of list) {
            if (info.requirePath) {
                requireHeaders += `// @require        ${info.requirePath}\n`
            } else {
                let fileContent = '';
                if (info.src.startsWith('http')) {
                    fileContent = await new Promise((resolve, reject) => request(info.src, function (error, response, body) {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(body);
                    }))
                } else {
                    fileContent = Fs.readFileSync(Path.join(__dirname, '../', info.src));
                }


                sourceCode += `\n\n// ${info.src}\n`;

                if (info.saveAs) {
                    sourceCode += `pxer['${info.saveAs}'] = \`${fileContent}\``
                } else if (info.src.endsWith('.ico')) {
                    sourceCode += `pxer.addFile('${info.src}')`;
                } else if (info.src.endsWith('.css')) {
                    sourceCode += 'document.documentElement.appendChild(\n';
                    sourceCode += '    document.createElement(\'style\')\n';
                    sourceCode += ').innerHTML = `'+ fileContent +'`;\n';
                } else {
                    sourceCode += fileContent;
                }

                sourceCode += `\n;\n`;
            }
        }
    }

    requireHeaders = requireHeaders.trim();

    return { sourceCode, requireHeaders };
};
