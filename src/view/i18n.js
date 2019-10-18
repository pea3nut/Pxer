pxer.t = function (key) {
    const defaultLang = 'zh'; // FIXME: change to en when i18n got ready

    return (
        pxer.util.get(pxer.i18nMap[pxer.lang], key)
        || pxer.util.get(pxer.i18nMap[defaultLang], key)
        || key
    );
};
