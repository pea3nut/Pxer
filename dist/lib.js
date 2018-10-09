'use strict';

// 全局函数

window.afterLoad = function (fn) {
    if (document.readyState !== 'loading') {
        setTimeout(fn);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    };
};
window.setDefalut = function (obj, key, val) {
    if (key in obj) return false;
    obj[key] = val;
    return true;
};
window.blinkTitle = function (addMsg, spaceMsg) {
    var addMsg = addMsg || '[完成] ';
    var spaceMsg = spaceMsg || '[　　] ';
    var timer = setInterval(function () {
        if (document.title.indexOf(addMsg) !== -1) {
            document.title = document.title.replace(addMsg, spaceMsg);
        } else if (document.title.indexOf(spaceMsg) !== -1) {
            document.title = document.title.replace(spaceMsg, addMsg);
        } else {
            document.title = addMsg + document.title;
        };
    }, 500);
    window.addEventListener('mousemove', function _self() {
        window.addEventListener('mousemove', _self);
        clearInterval(timer);
        document.title = document.title.replace(spaceMsg, "").replace(addMsg, "");
    });
};
window.parseURL = function () {
    var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.URL;

    var arr = url.match(/^(?:(https?)\:)?\/\/([\w\_\.]+)((?:\/[^\/?]*)*)\/?(?:\?(.+))?$/);
    var data = {
        protocol: arr[1],
        domain: arr[2],
        path: arr[3],
        query: arr[4]
    };
    if (data.query && data.query.indexOf('=') !== -1) {
        data.query = {};
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = arr[4].split('&')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var item = _step.value;

                var tmp = item.split('=');
                data.query[tmp[0]] = tmp[1];
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        ;
    }
    return data;
};
window.createScript = function (url) {
    if (!/^(https?:)?\/\//.test(url)) url = window['PXER_URL'] + url;
    var elt = document.createElement('script');
    elt.charset = 'utf-8';
    return function (resolve, reject) {
        elt.addEventListener('load', resolve);
        elt.addEventListener('load', function () {
            if (window['PXER_MODE'] === 'dev') console.log('Loaded ' + url);
        });
        elt.addEventListener('error', reject);
        elt.src = url;
        document.documentElement.appendChild(elt);
        return elt;
    };
};
window.createResource = function (url) {
    if (!/^(https?:)?\/\//.test(url)) url = window['PXER_URL'] + url;
    var fx = url.match(/\.([^\.]+?)$/)[1];
    var elt = document.createElement('link');
    switch (fx) {
        case 'css':
            elt.rel = 'stylesheet';
            break;
        case 'ico':
            elt.rel = 'shortcut icon';
            elt.type = 'image/x-icon';
            break;
        default:
            throw new Error('unknown filename extension "' + fx + '"');
    }
    return function (resolve, reject) {
        elt.href = url;
        document.documentElement.appendChild(elt);
        if (window['PXER_MODE'] === 'dev') console.log('Linked ' + url);
        resolve();
    };
};
window.execPromise = function (taskList, call) {
    var promise = Promise.resolve();
    if (Array.isArray(taskList) && Array.isArray(taskList[0])) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            var _loop = function _loop() {
                var array = _step2.value;

                promise = promise.then(function () {
                    return Promise.all(array.map(function (item) {
                        return new Promise(call(item));
                    }));
                });
            };

            for (var _iterator2 = taskList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                _loop();
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    } else if (Array.isArray(taskList)) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            var _loop2 = function _loop2() {
                var item = _step3.value;

                promise = promise.then(function () {
                    return new Promise(call(item));
                });
            };

            for (var _iterator3 = taskList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                _loop2();
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }
    } else {
        promise = promise.then(function () {
            return new Promise(call(taskList));
        });
    };
    return promise;
};

/**
 * 当前页面类型。可能的值
 * - bookmark_user  自己/其他人关注的用户列表
 * - bookmark_works 自己/其他人收藏的作品
 * - member_info    自己/其他人的主页
 * - works_medium   查看某个作品
 * - works_manga    查看某个多张作品的多张页
 * - works_big      查看某个作品的某张图片的大图
 * - member_works   自己/其他人作品列表页
 * - search         检索页
 * - index          首页
 * - discovery      探索
 * - rank           排行榜
 * - bookmark_new   关注的新作品
 * - unknown        未知
 * @param {string} url
 * @return {string} - 页面类型
 * */
window.getPageType = function () {
    var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.URL;

    var URLData = parseURL(url);
    var type = null;
    var isnew = !(Boolean(document.querySelector(".count-badge")) || Boolean(document.querySelector(".profile")));
    if (URLData.domain !== 'www.pixiv.net') return 'unknown';
    if (URLData.path === '/bookmark.php') {
        if (URLData.query && URLData.query.type) {
            switch (URLData.query.type) {
                case 'user':
                    type = 'bookmark_user';
                    break;
                default:
                    type = 'unknown';
            };
        } else {
            type = 'bookmark_works';
        }
    } else if (URLData.path === '/bookmark_new_illust.php') {
        type = 'bookmark_new';
    } else if (URLData.path === '/member.php') {
        type = isnew ? 'member_works_new' : "member_info";
    } else if (URLData.path === '/ranking.php') {
        type = 'rank';
    } else if (URLData.path === '/member_illust.php') {
        if (URLData.query && URLData.query.mode) {
            switch (URLData.query.mode) {
                case 'medium':
                    type = 'works_medium';
                    break;
                case 'manga':
                    type = 'works_manga';
                    break;
                case 'manga_big':
                    type = 'works_big';
                    break;
                default:
                    type = 'unknown';
            };
        } else {
            type = isnew ? 'member_works_new' : "member_works";
        }
    } else if (URLData.path === '/search.php') {
        type = 'search';
    } else if (URLData.path === '/discovery') {
        type = 'discovery';
    } else if (URLData.path === '/') {
        type = 'index';
    } else {
        type = 'unknown';
    }
    return type;
};
/**
 * 查询对应页面类型每页作品数量
 * @param {string} type - 作品类型
 * @return {number} - 每页作品数
 */
window.getOnePageWorkCount = function (type) {
    switch (type) {
        case "search":
            return 40;
        case "rank":
            return 50;
        case "discovery":
            return 3000;
        case "bookmark_works":
            return 48;
        case "member_works_new":
            return Number.MAX_SAFE_INTEGER;
        default:
            return 20;
    };
};
window.getIDfromURL = function () {
    var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'id';
    var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.URL;

    url = new URL(url, document.URL);
    var query = url.search;
    var params = new URLSearchParams(query);
    return params.get(key);
};
/*EventTarget扩展
EventTarget.prototype['addOneEventListener'] =function(type,listener,useCapture){
    var fn;
    this.addEventListener(type,listener,useCapture);
    this.addEventListener(type,fn=()=>{
        this.removeEventListener(type,listener,useCapture);
        this.removeEventListener(type,fn,useCapture);
        fn=null;
    },useCapture);
};
~function(originAdd ,originRemove){
    var map =new Map();
    EventTarget.prototype.addEventListener =function(type,listener,useCapture){
        let eltMap =map.get(this);
        if(eltMap ===undefined) map.set(this ,eltMap={});
        if(eltMap[type] ===undefined) eltMap[type] =[];
        eltMap[type].push({listener ,useCapture});
        return originAdd.apply(this ,arguments);
    };
    EventTarget.prototype.removeEventListener =function(type,listener,useCapture){
        if(listener!=='*' && type!=='*'){
            return originRemove.apply(this ,arguments);
        };
        let eltMap =map.get(this);
        if(type==='*'){
            for(let hasType in eltMap){
                this.removeEventListener(hasType,'*',useCapture);
            };
            return;
        };
        if(eltMap[type] ===undefined) return;
        for(let {listener:l ,useCapture:u} of eltMap[type]){
            originRemove.bind(this)(type ,l ,u);
        };
    };
}(EventTarget.prototype.addEventListener ,EventTarget.prototype.removeEventListener);
*/