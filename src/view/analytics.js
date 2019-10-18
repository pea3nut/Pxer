(function () {
    let uid = localStorage.getItem('pxer_uid');
    if (!uid) {
        uid = Number(Math.random().toString().split('.')[1]).toString(36);
        localStorage.setItem('pxer_uid', uid);
    }

    const eventSender = new EventSender('https://point.pea3nut.org/events', {
        uid,
        app_name: 'pxer-app',
        get event_page() { return pxer.util.getPageType(); },
        get referer() { return location.href; },
    });
    eventSender.setContent({
        mode: PXER_MODE,
        url: PXER_URL,
    });
    pxer.sendEvent = eventSender.send.bind(eventSender);
})();