pxer.t = function (key) {
    const defaultLang = 'en';

    return (
        pxer.util.get(pxer.i18nMap[pxer.lang], key)
        || pxer.util.get(pxer.i18nMap[defaultLang], key)
        || key
    );
};
