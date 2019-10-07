(function () {
    const eventSender = new EventSender('https://point.pea3nut.org/events', {
        uid: dataLayer[0].user_id,
        app_name: 'pxer-app',
        get event_page() { return pxer.util.getPageType(); },
        get referer() { return location.href; },
    });
    eventSender.setContent({
        dataLayer,
    });
    pxer.sendEvent = eventSender.send.bind(eventSender);
})();