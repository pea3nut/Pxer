(async function(){
    window['PXER_URL'] = window['PXER_URL'] || 'https://pxer-app.pea3nut.org/';
    window['PXER_MODE'] = window['PXER_MODE'] || 'native';
    window['pxer'] = window['pxer'] || {};

    pxer.url = PXER_URL;
    pxer.mode = PXER_MODE;
    pxer.log = (...msg) => console.log('[Pxer]', ...msg);
    pxer.addFile = async function (url) {
        if (!/^(https?:)?\/\//.test(url)) url = pxer.url + url;

        const createScript = () => new Promise(function (resolve, reject) {
            const elt = document.createElement('script');
            elt.addEventListener('error', reject);
            elt.addEventListener('load', resolve);
            elt.addEventListener('load', () => pxer.log('Loaded ' + url));
            elt.src = url;
            document.documentElement.appendChild(elt);
            return elt;
        });
        const createCss = () => new Promise(function (resolve) {
            const elt = document.createElement('link');
            elt.rel = 'stylesheet';
            elt.href = url;
            document.documentElement.appendChild(elt);
            pxer.log('Link ' + url);
            resolve();
        });
        const createIcon = () => new Promise(function (resolve) {
            const elt = document.createElement('link');
            elt.rel = 'shortcut icon';
            elt.type = 'image/x-icon';
            elt.href = url;
            document.documentElement.appendChild(elt);
            pxer.log('Link ' + url);
            resolve();
        });

        switch (true) {
            case url.endsWith('.js'):
                return createScript();
            case url.endsWith('.css'):
                return createCss();
            case url.endsWith('.ico'):
                return createIcon();
            case url.endsWith('.json'):
                return fetch(url).then(res => res.json());
            default:
                return fetch(url).then(res => res.text());
        }
    };

    switch (PXER_MODE) {
        case 'dev':
        case 'master':
        case 'native':
            await pxer.addFile('native.js');
            break;
        case 'local':
            await pxer.addFile('src/local.js');
            break;
        case 'sfp':
            break;
    }
})();