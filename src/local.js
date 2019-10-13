(async function () {
    const lists = await pxer.util.addFile('src/files.json');

    for (const list of lists) {
        await Promise.all(
            list.map(
                info => pxer.util.addFile(info.src).then(res => {
                    pxer.log(`Loaded ${info.src}`);
                    if (info.saveAs) {
                        pxer.util.set(pxer, info.saveAs, res);
                    }
                }),
            ),
        );
    }

}().then(function () {
    pxer.log('Pxer loaded');
}).catch(function (e) {
    pxer.log('Pxer load error!');
    throw e;
}));