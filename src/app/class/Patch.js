"use strict";
;
var Patch;
(function (Patch) {
    function existIllustData(htmlString) {
        return htmlString.indexOf('js-mount-point-search-result-list') !== -1;
    }
    Patch.existIllustData = existIllustData;
    ;
    function getIllustDataList(htmlString) {
        return JSON.parse(htmlString
            .match(/<[^<>]+id="js-mount-point-search-result-list"[^<>]+>/im)[0]
            .match(/data-items="([^"]+)"/im)[1]
            .replace(/&quot;/g, '"'));
    }
    Patch.getIllustDataList = getIllustDataList;
    ;
    //JSON.stringify(JSON.parse(document.getElementById('js-mount-point-search-result-list').dataset.items)[0])
    function rid2pwr(data) {
        var illustTypeMap = {
            '0': 'illust',
            '1': 'manga',
            '2': 'ugoira',
        };
        var pwr = {
            url: [],
            html: {},
            type: illustTypeMap[data.illustType],
            isMultiple: Number(data) > 1,
            id: data.illustId,
        };
        pwr.url = PxerHtmlParser.getUrlList(pwr);
        return new PxerWorksRequest(pwr);
    }
    Patch.rid2pwr = rid2pwr;
    ;
})(Patch || (Patch = {}));
