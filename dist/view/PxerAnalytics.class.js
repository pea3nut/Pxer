'use strict';

/**
 * Pxer统计类
 * @class
 * */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PxerAnalytics = function () {
    function PxerAnalytics() {
        _classCallCheck(this, PxerAnalytics);

        this.uid = window.localStorage.getItem("PXER_UID");
        if (!this.uid) {
            this.uid = Math.random().toString(36).replace(/[^a-z]+/g, '') + Math.random().toString(36).replace(/[^a-z]+/g, '');
            window.localStorage.setItem("PXER_UID", this.uid);
        }
        this.enabled = window['PXER_LOAD_ANALYTICS'] && !window.localStorage.getItem("PXER_OPT_OUT_ANALYTICS");
    }

    _createClass(PxerAnalytics, [{
        key: 'postData',

        /**
         * 
         * @param {String} event - 发送的事件名称
         * @param {Object} data - 发送的数据（uid|pxer_mode|referer自动添加）
         */
        value: function postData(event, data) {
            if (!this.enabled) return;
            data.uid = this.uid;
            data.pxer_mode = window['PXER_MODE'];
            data.pxer_version = window['PXER_VERSION'];

            var xhr = new XMLHttpRequest();
            xhr.open("POST", window['PXER_URL'] + "stats/" + event.replace(/\./g, "/"), true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.onerror = function (e) {
                return console.error('PxerAnalytics.postData: ' + e.error);
            };
            xhr.send(JSON.stringify(data));
        }
    }]);

    return PxerAnalytics;
}();

;