(async function () {
    const lists = await pxer.addFile('src/files.json');

    for (const list of lists) {
        await Promise.all(
            list.map(
                info => pxer.addFile(info.src).then(res => {
                    if (info.saveAs) {
                        pxer[info.saveAs] = res;
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