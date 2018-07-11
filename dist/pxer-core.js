'use strict';

/**
 * Pxer任务队列中的任务对象
 * @constructor
 * @abstract
 * */

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PxerRequest = function PxerRequest() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        url = _ref.url,
        html = _ref.html;

    _classCallCheck(this, PxerRequest);

    this.url = url;
    this.html = html;
    this.completed = false;
};
/**
 * 页面任务对象
 * @constructor
 * @extends {PxerRequest}
 * */


var PxerPageRequest = function (_PxerRequest) {
    _inherits(PxerPageRequest, _PxerRequest);

    function PxerPageRequest() {
        var _ref2;

        var _ret;

        _classCallCheck(this, PxerPageRequest);

        for (var _len = arguments.length, argn = Array(_len), _key = 0; _key < _len; _key++) {
            argn[_key] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (_ref2 = PxerPageRequest.__proto__ || Object.getPrototypeOf(PxerPageRequest)).call.apply(_ref2, [this].concat(argn)));

        return _ret = denyNewAttr(_this), _possibleConstructorReturn(_this, _ret);
    }

    return PxerPageRequest;
}(PxerRequest);
/**
 * 作品任务对象
 * @constructor
 * @extends {PxerRequest}
 * */


var PxerWorksRequest = function (_PxerRequest2) {
    _inherits(PxerWorksRequest, _PxerRequest2);

    function PxerWorksRequest() {
        var _ret2;

        var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref3$url = _ref3.url,
            url = _ref3$url === undefined ? [] : _ref3$url,
            _ref3$html = _ref3.html,
            html = _ref3$html === undefined ? {} : _ref3$html,
            type = _ref3.type,
            isMultiple = _ref3.isMultiple,
            id = _ref3.id;

        _classCallCheck(this, PxerWorksRequest);

        var _this2 = _possibleConstructorReturn(this, (PxerWorksRequest.__proto__ || Object.getPrototypeOf(PxerWorksRequest)).call(this, { url: url, html: html }));

        _this2.type = type; //[manga|ugoira|illust]
        _this2.isMultiple = isMultiple; //[true|false]
        _this2.id = id;
        return _ret2 = denyNewAttr(_this2), _possibleConstructorReturn(_this2, _ret2);
    }

    return PxerWorksRequest;
}(PxerRequest);

/**
 * 作品任务对象
 * @constructor
 * @extends {PxerRequest}
 * */


var PxerFailInfo = function PxerFailInfo() {
    var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        url = _ref4.url,
        type = _ref4.type,
        task = _ref4.task;

    _classCallCheck(this, PxerFailInfo);

    this.url = url;
    this.type = type;
    this.task = task;
    return denyNewAttr(this);
};

/**
 * 抓取到的作品对象
 * @constructor
 * */


var PxerWorks = function PxerWorks() {
    var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        id = _ref5.id,
        type = _ref5.type,
        date = _ref5.date,
        domain = _ref5.domain,
        tagList = _ref5.tagList,
        viewCount = _ref5.viewCount,
        ratedCount = _ref5.ratedCount,
        fileFormat = _ref5.fileFormat;

    var strict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    _classCallCheck(this, PxerWorks);

    /**作品ID*/
    this.id = id;
    /**
     * 投稿日期，格式：Y/m/d/h/m/s
     * @type {string}
     * */
    this.date = date;
    this.type = type; //[manga|ugoira|illust]
    /**作品存放的域名*/
    this.domain = domain;
    /**
     * 作品标签列表
     * @type {Array}
     * */
    this.tagList = tagList;
    /**作品被浏览的次数*/
    this.viewCount = viewCount;
    /**作品被赞的次数*/
    this.ratedCount = ratedCount;
    /**作品的图片文件扩展名*/
    this.fileFormat = fileFormat;

    if (strict) return denyNewAttr(this);
};
/**
 * 抓取到的多张插画/漫画作品对象
 * @extends {PxerWorks}
 * @constructor
 * */


var PxerMultipleWorks = function (_PxerWorks) {
    _inherits(PxerMultipleWorks, _PxerWorks);

    function PxerMultipleWorks() {
        var _ret3;

        var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, PxerMultipleWorks);

        /**作品的图片张数*/
        var _this3 = _possibleConstructorReturn(this, (PxerMultipleWorks.__proto__ || Object.getPrototypeOf(PxerMultipleWorks)).call(this, data, false));

        _this3.multiple = data.multiple;
        return _ret3 = denyNewAttr(_this3), _possibleConstructorReturn(_this3, _ret3);
    }

    return PxerMultipleWorks;
}(PxerWorks);

;
/**
 * 抓取到的动图作品对象
 * @extends {PxerWorks}
 * @constructor
 * */

var PxerUgoiraWorks = function (_PxerWorks2) {
    _inherits(PxerUgoiraWorks, _PxerWorks2);

    function PxerUgoiraWorks() {
        var _ret4;

        var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, PxerUgoiraWorks);

        var _this4 = _possibleConstructorReturn(this, (PxerUgoiraWorks.__proto__ || Object.getPrototypeOf(PxerUgoiraWorks)).call(this, data, false));

        _this4.fileFormat = 'zip';
        /**动图动画参数*/
        _this4.frames = data.frames;
        return _ret4 = denyNewAttr(_this4), _possibleConstructorReturn(_this4, _ret4);
    }

    return PxerUgoiraWorks;
}(PxerWorks);

;

/**
 * 对对象进行代理，拒绝新key赋值并抛出错误
 * @param {Object} obj - 要代理的对象
 * @return {Proxy}
 * */
function denyNewAttr(obj) {
    if (typeof Proxy === 'undefined') return obj;
    return new Proxy(obj, {
        get: function get(obj, prop) {
            if (!(prop in obj) && (typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) !== 'symbol' && !/^\_|to[A-Z]/.test(prop)) {
                console.warn('attribute "' + prop + '" is not in ' + obj.constructor.name);
            }
            return obj[prop];
        },
        set: function set(obj, prop, value) {
            if (!(prop in obj)) {
                throw new Error('Count not set attribute "' + prop + '" in ' + obj.constructor.name);
            };
            obj[prop] = value;
            return true;
        }
    });
}

'use strict';

var PxerEvent = function () {
    function PxerEvent() {
        var eventList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var shortName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        _classCallCheck(this, PxerEvent);

        this._pe_eventList = eventList;

        this._pe_event = {};
        this._pe_oneEvent = {};

        if (!shortName || typeof Proxy === 'undefined') return this;else return new Proxy(this, {
            get: function get(target, property) {
                if (property in target) {
                    return target[property];
                } else if (target._pe_eventList.indexOf(property) !== -1) {
                    return target.dispatch.bind(target, property);
                } else {
                    return target[property];
                };
            }
        });
    }

    _createClass(PxerEvent, [{
        key: 'on',
        value: function on(type, listener) {
            if (!PxerEvent.check(this, type, listener)) return false;
            if (!this._pe_event[type]) this._pe_event[type] = [];
            this._pe_event[type].push(listener);
            return true;
        }
    }, {
        key: 'one',
        value: function one(type, listener) {
            if (!PxerEvent.check(this, type, listener)) return false;
            if (!this._pe_oneEvent[type]) this._pe_oneEvent[type] = [];
            this._pe_oneEvent[type].push(listener);
            return true;
        }
    }, {
        key: 'dispatch',
        value: function dispatch(type) {
            for (var _len2 = arguments.length, data = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                data[_key2 - 1] = arguments[_key2];
            }

            if (this._pe_eventList.indexOf(type) === -1) return false;
            if (this._pe_event[type]) this._pe_event[type].forEach(function (fn) {
                return fn.apply(undefined, data);
            });
            if (this._pe_oneEvent[type]) {
                this._pe_oneEvent[type].forEach(function (fn) {
                    return fn.apply(undefined, data);
                });
                delete this._pe_oneEvent[type];
            }
            if (this._pe_event['*']) this._pe_event['*'].forEach(function (fn) {
                return fn.apply(undefined, data);
            });
            if (this._pe_oneEvent['*']) {
                this._pe_oneEvent['*'].forEach(function (fn) {
                    return fn.apply(undefined, data);
                });
                delete this._pe_oneEvent['*'];
            }
            return true;
        }
    }, {
        key: 'off',
        value: function off(eventType, listener) {
            if (!PxerEvent.checkEvent(this, eventType)) return false;
            if (listener && !PxerEvent.checkListener(listener)) return false;

            if (eventType === true) {
                this._pe_event = {};
                this._pe_oneEvent = {};
                return true;
            };

            if (listener === true || listener === '*') {
                delete this._pe_event[eventType];
                delete this._pe_oneEvent[eventType];
                return true;
            };

            var index1 = this._pe_event[type].lastIndexOf(listener);
            if (index1 !== -1) {
                this._pe_event[type].splice(index1, 1);
            };

            var index2 = this._pe_oneEvent[type].lastIndexOf(listener);
            if (index2 !== -1) {
                this._pe_oneEvent[type].splice(index2, 1);
            };

            return true;
        }
    }]);

    return PxerEvent;
}();

;

PxerEvent.check = function (pe, eventType, listener) {
    return PxerEvent.checkEvent(pe, eventType) && PxerEvent.checkListener(listener);
};
PxerEvent.checkEvent = function (pe, eventType) {
    if (eventType !== '*' && pe._pe_eventList.indexOf(eventType) === -1) {
        console.warn('PxerEvent : "' + eventType + '" is not in eventList[' + pe._pe_eventList + ']');
        return false;
    };
    return true;
};
PxerEvent.checkListener = function (listener) {
    if (!(listener instanceof Function || listener === true || listener === '*')) {
        console.warn('PxerEvent: "' + listener + '" is not a function');
        return false;
    };
    return true;
};

'use strict';

var PxerFilter = function () {
    /**
     * @param {Object} config - 过滤参数
     * @see PxerFilter.filterInfo
     * @see PxerFilter.filterTag
     * */
    function PxerFilter(config) {
        _classCallCheck(this, PxerFilter);

        /**
         * 每次过滤后得到的累计的作品集合
         * @type {PxerWorks[]}
         * */
        this.passWorks = [];

        /**
         * 过滤的配置信息
         * @see PxerFilter.filterInfo
         * @see PxerFilter.filterTag
         * */
        this.config = Object.assign(PxerFilter.defaultConfig(), config);
    }

    _createClass(PxerFilter, [{
        key: 'filter',


        /**
         * 对作品进行过滤
         * @param {PxerWorks[]} worksList - 要过滤的作品数组
         * @return {PxerWorks[]} - 过滤后的结果
         * */
        value: function filter(worksList) {
            var _passWorks;

            var resultSet = PxerFilter.filterInfo(PxerFilter.filterTag(worksList, this.config), this.config);
            (_passWorks = this.passWorks).push.apply(_passWorks, _toConsumableArray(resultSet));
            return resultSet;
        }
    }]);

    return PxerFilter;
}();

;

/**
 * 返回PxerFilter的默认配置参数
 * @see PxerFilter.filterInfo
 * @see PxerFilter.filterTag
 * */
PxerFilter.defaultConfig = function () {
    return {
        "rated": 0, //赞的数量
        "rated_pro": 0, //点赞率
        "view": 0, //浏览数
        "has_tag_every": [],
        "has_tag_some": [],
        "no_tag_any": [],
        "no_tag_every": []
    };
};

/**
 * 根据标签作品信息过滤作品
 * @param {PxerWorks[]} worksList
 * @param {number} rated      - 作品不小于的赞的数量
 * @param {number} rated_pro  - 作品不小于的点赞率，小于0的数字
 * @param {number} view       - 作品不小于的浏览数
 * @return {PxerWorks[]}
 * */
PxerFilter.filterInfo = function (worksList, _ref6) {
    var _ref6$rated = _ref6.rated,
        rated = _ref6$rated === undefined ? 0 : _ref6$rated,
        _ref6$rated_pro = _ref6.rated_pro,
        rated_pro = _ref6$rated_pro === undefined ? 0 : _ref6$rated_pro,
        _ref6$view = _ref6.view,
        view = _ref6$view === undefined ? 0 : _ref6$view;

    return worksList.filter(function (works) {
        return works.ratedCount >= rated && works.viewCount >= view && works.ratedCount / works.viewCount >= rated_pro;
    });
};

/**
 * 根据标签过滤作品
 * @param {PxerWorks[]} worksList
 * @param {string[]} no_tag_any    - 作品中不能含有里面的任意一个标签
 * @param {string[]} no_tag_every  - 作品中不能同时含有里面的所有标签
 * @param {string[]} has_tag_some  - 作品中必须含有有里面的任意一个标签
 * @param {string[]} has_tag_every - 作品中必须同时含有里面的所有标签
 * @return {PxerWorks[]}
 * */
PxerFilter.filterTag = function (worksList, _ref7) {
    var has_tag_every = _ref7.has_tag_every,
        has_tag_some = _ref7.has_tag_some,
        no_tag_any = _ref7.no_tag_any,
        no_tag_every = _ref7.no_tag_every;

    var passWorks = worksList;

    if (has_tag_every && has_tag_every.length !== 0) {
        passWorks = passWorks.filter(function (works) {
            return has_tag_every.every(function (tag) {
                return works.tagList.indexOf(tag) !== -1;
            });
        });
    };

    if (has_tag_some && has_tag_some.length !== 0) {
        passWorks = passWorks.filter(function (works) {
            return has_tag_some.some(function (tag) {
                return works.tagList.indexOf(tag) !== -1;
            });
        });
    };

    if (no_tag_any && no_tag_any.length !== 0) {
        passWorks = passWorks.filter(function (works) {
            return !no_tag_any.some(function (tag) {
                return works.tagList.indexOf(tag) !== -1;
            });
        });
    };

    if (no_tag_every && no_tag_every.length !== 0) {
        passWorks = passWorks.filter(function (works) {
            return !no_tag_every.every(function (tag) {
                return works.tagList.indexOf(tag) !== -1;
            });
        });
    };

    return passWorks;
};

'use strict';

var PxerHtmlParser = function PxerHtmlParser() {
    _classCallCheck(this, PxerHtmlParser);

    throw new Error('PxerHtmlParse could not construct');
};

;

/**
 * 解析页码任务对象
 * @param {PxerPageRequest} task - 抓取后的页码任务对象
 * @return {PxerWorksRequest[]|false} - 解析得到的作品任务对象
 * */
PxerHtmlParser.parsePage = function (task) {
    if (!(task instanceof PxerPageRequest)) {
        window['PXER_ERROR'] = 'PxerHtmlParser.parsePage: task is not PxerPageRequest';
        return false;
    }
    if (!task.url || !task.html) {
        window['PXER_ERROR'] = 'PxerHtmlParser.parsePage: task illegal';
        return false;
    }

    var URLData = parseURL(task.url);
    var dom = PxerHtmlParser.HTMLParser(task.html);

    // old method
    var taskList = [];

    var searchResult = dom.body.querySelector("input#js-mount-point-search-result-list");
    var elts = null;
    if (searchResult) {
        var searchData = JSON.parse(searchResult.getAttribute('data-items'));
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = searchData[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var searchItem = _step.value;

                var task = new PxerWorksRequest({
                    html: {},
                    type: searchItem.illustType == 2 ? 'ugoira' : searchItem.illustType == 1 ? 'manga' : 'illust',

                    isMultiple: searchItem.pageCount > 1,
                    id: searchItem.illustId
                });
                task.url = PxerHtmlParser.getUrlList(task);

                taskList.push(task);
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
    } else {
        elts = dom.body.querySelectorAll('a.work._work');

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = elts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var elt = _step2.value;

                var task = new PxerWorksRequest({
                    html: {},
                    type: elt.matches('.ugoku-illust') ? 'ugoira' : elt.matches(".manga") ? 'manga' : "illust",

                    isMultiple: elt.matches(".multiple"),
                    id: elt.getAttribute('href').match(/illust_id=(\d+)/)[1]
                });

                task.url = PxerHtmlParser.getUrlList(task);

                taskList.push(task);
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

        ;
    }

    if (elts !== null && elts.length === 0 && !searchResult) {
        window['PXER_ERROR'] = 'PxerHtmlParser.parsePage: result empty';
        return false;
    }

    return taskList;
};

/**
 * 解析作品任务对象
 * @param {PxerWorksRequest} task - 抓取后的页码任务对象
 * @return {PxerWorks} - 解析得到的作品任务对象
 * */
PxerHtmlParser.parseWorks = function (task) {
    if (!(task instanceof PxerWorksRequest)) {
        window['PXER_ERROR'] = 'PxerHtmlParser.parseWorks: task is not PxerWorksRequest';
        return false;
    }
    if (!task.url.every(function (item) {
        return task.html[item];
    }) || !task.type) {
        window['PXER_ERROR'] = 'PxerHtmlParser.parsePage: task illegal';
        return false;
    }

    var pw;
    if (task.type === 'ugoira') {
        pw = new PxerUgoiraWorks();
    } else if (task.isMultiple) {
        pw = new PxerMultipleWorks();
    } else {
        pw = new PxerWorks();
    };

    for (var url in task.html) {
        var data = {
            dom: PxerHtmlParser.HTMLParser(task.html[url]),
            url: url, pw: pw, task: task
        };
        try {
            switch (true) {
                case url.indexOf('mode=medium') !== -1:
                    PxerHtmlParser.parseMediumHtml(data);
                    break;
                case url.indexOf('mode=manga') !== -1:
                    PxerHtmlParser.parseMangaHtml(data);
                    break;
                default:
                    return false;
                    window['PXER_ERROR'] = 'PxerHtmlParser.parsePage: count not parse task url "' + url + '"';
            };
        } catch (e) {
            window['PXER_ERROR'] = task.id + ':' + e.message;
            if (window['PXER_MODE'] === 'dev') console.error(task, e);
            return false;
        }
    };

    return pw;
};

/**
 * @param {PxerWorksRequest} task
 * @return {Array}
 * */
PxerHtmlParser.getUrlList = function (task) {

    return ["https://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + task.id];
};

PxerHtmlParser.parseMangaHtml = function (_ref8) {
    var task = _ref8.task,
        dom = _ref8.dom,
        url = _ref8.url,
        pw = _ref8.pw;

    pw.multiple = +dom.body.querySelector('img[data-src]').innerHTML;
};
PxerHtmlParser.parseMediumHtml = function (_ref9) {
    var task = _ref9.task,
        dom = _ref9.dom,
        url = _ref9.url,
        pw = _ref9.pw;

    pw.id = task.id;
    pw.type = task.type;

    var illustData = dom.head.innerHTML.match(this.REGEXP['getInitData'])[0];
    illustData = this.getKeyFromStringObjectLiteral(illustData, "preload");
    illustData = this.getKeyFromStringObjectLiteral(illustData, 'illust');
    illustData = this.getKeyFromStringObjectLiteral(illustData, pw.id);
    illustData = JSON.parse(illustData);

    pw.tagList = illustData.tags.tags.map(function (e) {
        return e.tag;
    });
    pw.viewCount = illustData.viewCount;
    pw.ratedCount = illustData.bookmarkCount;
    if (pw instanceof PxerMultipleWorks) {
        pw.multiple = illustData.pageCount;
    }

    if (pw.type === "ugoira") {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.pixiv.net/ajax/illust/" + task.id + "/ugoira_meta", false);
        xhr.send();
        var meta = JSON.parse(xhr.responseText);
        var src = meta['body']['originalSrc'];
        var URLObj = parseURL(src);

        pw.domain = URLObj.domain;
        pw.date = src.match(PxerHtmlParser.REGEXP['getDate'])[1];
        pw.frames = meta['body']['frames'];
    } else {
        var _src = illustData.urls.original;
        var _URLObj = parseURL(_src);

        pw.domain = _URLObj.domain;
        pw.date = _src.match(PxerHtmlParser.REGEXP['getDate'])[1];
        pw.fileFormat = _src.match(/\.(jpg|gif|png)$/)[1];
    };
};

PxerHtmlParser.REGEXP = {
    'getDate': /img\/((?:\d+\/){5}\d+)/,
    'getInitData': /\{token:.*\}(?=\);)/
};

PxerHtmlParser.HTMLParser = function (aHTMLString) {
    var dom = document.implementation.createHTMLDocument('');
    dom.documentElement.innerHTML = aHTMLString;
    return dom;
};

/**@param {Element} img*/
PxerHtmlParser.getImageUrl = function (img) {
    return img.getAttribute('src') || img.getAttribute('data-src');
};

PxerHtmlParser.parseObjectLiteral = function () {
    // Javascript object literal parser
    // Splits an object literal string into a set of top-level key-value pairs
    // (c) Michael Best (https://github.com/mbest)
    // License: MIT (http://www.opensource.org/licenses/mit-license.php)
    // Version 2.1.0
    // https://github.com/mbest/js-object-literal-parse
    // This parser is inspired by json-sans-eval by Mike Samuel (http://code.google.com/p/json-sans-eval/)

    // These two match strings, either with double quotes or single quotes
    var stringDouble = '"(?:[^"\\\\]|\\\\.)*"',
        stringSingle = "'(?:[^'\\\\]|\\\\.)*'",

    // Matches a regular expression (text enclosed by slashes), but will also match sets of divisions
    // as a regular expression (this is handled by the parsing loop below).
    stringRegexp = '/(?:[^/\\\\]|\\\\.)*/\w*',

    // These characters have special meaning to the parser and must not appear in the middle of a
    // token, except as part of a string.
    specials = ',"\'{}()/:[\\]',

    // Match text (at least two characters) that does not contain any of the above special characters,
    // although some of the special characters are allowed to start it (all but the colon and comma).
    // The text can contain spaces, but leading or trailing spaces are skipped.
    everyThingElse = '[^\\s:,/][^' + specials + ']*[^\\s' + specials + ']',

    // Match any non-space character not matched already. This will match colons and commas, since they're
    // not matched by "everyThingElse", but will also match any other single character that wasn't already
    // matched (for example: in "a: 1, b: 2", each of the non-space characters will be matched by oneNotSpace).
    oneNotSpace = '[^\\s]',


    // Create the actual regular expression by or-ing the above strings. The order is important.
    token = RegExp(stringDouble + '|' + stringSingle + '|' + stringRegexp + '|' + everyThingElse + '|' + oneNotSpace, 'g'),


    // Match end of previous token to determine whether a slash is a division or regex.
    divisionLookBehind = /[\])"'A-Za-z0-9_$]+$/,
        keywordRegexLookBehind = { 'in': 1, 'return': 1, 'typeof': 1 };

    function trim(string) {
        return string == null ? '' : string.trim ? string.trim() : string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
    }

    return function (objectLiteralString) {
        // Trim leading and trailing spaces from the string
        var str = trim(objectLiteralString);

        // Trim braces '{' surrounding the whole object literal
        if (str.charCodeAt(0) === 123) str = str.slice(1, -1);

        // Split into tokens
        var result = [],
            toks = str.match(token),
            key,
            values = [],
            depth = 0;

        if (toks) {
            // Append a comma so that we don't need a separate code block to deal with the last item
            toks.push(',');

            for (var i = 0, tok; tok = toks[i]; ++i) {
                var c = tok.charCodeAt(0);
                // A comma signals the end of a key/value pair if depth is zero
                if (c === 44) {
                    // ","
                    if (depth <= 0) {
                        if (!key && values.length === 1) {
                            key = values.pop();
                        }
                        result.push([key, values.length ? values.join('') : undefined]);
                        key = undefined;
                        values = [];
                        depth = 0;
                        continue;
                    }
                    // Simply skip the colon that separates the name and value
                } else if (c === 58) {
                    // ":"
                    if (!depth && !key && values.length === 1) {
                        key = values.pop();
                        continue;
                    }
                    // A set of slashes is initially matched as a regular expression, but could be division
                } else if (c === 47 && i && tok.length > 1) {
                    // "/"
                    // Look at the end of the previous token to determine if the slash is actually division
                    var match = toks[i - 1].match(divisionLookBehind);
                    if (match && !keywordRegexLookBehind[match[0]]) {
                        // The slash is actually a division punctuator; re-parse the remainder of the string (not including the slash)
                        str = str.substr(str.indexOf(tok) + 1);
                        toks = str.match(token);
                        toks.push(',');
                        i = -1;
                        // Continue with just the slash
                        tok = '/';
                    }
                    // Increment depth for parentheses, braces, and brackets so that interior commas are ignored
                } else if (c === 40 || c === 123 || c === 91) {
                    // '(', '{', '['
                    ++depth;
                } else if (c === 41 || c === 125 || c === 93) {
                    // ')', '}', ']'
                    --depth;
                    // The key will be the first token; if it's a string, trim the quotes
                } else if (!key && !values.length && (c === 34 || c === 39)) {
                    // '"', "'"
                    tok = tok.slice(1, -1);
                }
                values.push(tok);
            }
        }
        return result;
    };
}();

PxerHtmlParser.getKeyFromStringObjectLiteral = function (s, key) {
    var resolvedpairs = this.parseObjectLiteral(s);
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = resolvedpairs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var pair = _step3.value;

            if (pair[0] === key) return pair[1];
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

    throw new Error("Key not found.");
};

var PxerPrinter = function () {
    function PxerPrinter(config) {
        _classCallCheck(this, PxerPrinter);

        /**
         * 计算得到的下载地址
         * @type {string[]} 
         * */
        this.address = [];
        /**计算得到的任务信息*/
        this.taskInfo = '';
        /**剥离的动图参数*/
        this.ugoiraFrames = {};

        /**配置信息*/
        this.config = PxerPrinter.defaultConfig();
        config && this.setConfig(config);
    }

    _createClass(PxerPrinter, [{
        key: 'setConfig',


        /**
         * 设置配置信息
         * @param {string|Object} key - 要设置的key或是一个将被遍历合并的对象
         * @param {string} [value] - 要设置的value
         * */
        value: function setConfig(key, value) {
            if (arguments.length === 1 && (typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
                var obj = key;
                for (var objKey in obj) {
                    if (objKey in this.config) this.config[objKey] = obj[objKey];else console.warn('PxerPrinter.setConfig: skip key "' + objKey + '"');
                };
            } else {
                if (!(key in this.config)) throw new Error('PxerPrinter.setConfig: ' + key + ' is not in config');
                this.config[key] = value;
            }
            return this;
        }
    }]);

    return PxerPrinter;
}();

;

/**
 * 根据作品列表将下载地址填充到PxerPrinter#address
 * @param {PxerWorks[]} worksList
 * @return {void}
 * */
PxerPrinter.prototype['fillAddress'] = function (worksList) {
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = worksList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _address;

            var works = _step4.value;

            var configKey = PxerPrinter.getWorksKey(works);
            if (configKey === 'ugoira_zip' && this.config['ugoira_frames'] === 'yes') {
                this.ugoiraFrames[works.id] = works.frames;
            }
            if (!(configKey in this.config)) throw new Error('PxerPrinter.fillAddress: ' + configKey + ' in not in config');
            if (this.config[configKey] === 'no') continue;
            (_address = this.address).push.apply(_address, _toConsumableArray(PxerPrinter.countAddress(works, this.config[configKey])));
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }
};

/**
 * 根据作品将可读的下载信息填充到PxerPrinter#taskInfo
 * @param {PxerWorks[]} worksList
 * @return {void}
 * */
PxerPrinter.prototype['fillTaskInfo'] = function (worksList) {
    var _fill = new Array(20).fill(0),
        _fill2 = _slicedToArray(_fill, 7),
        manga = _fill2[0],
        ugoira = _fill2[1],
        illust = _fill2[2],
        multiple = _fill2[3],
        single = _fill2[4],
        worksNum = _fill2[5],
        address = _fill2[6];

    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = worksList[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var works = _step5.value;

            var configKey = PxerPrinter.getWorksKey(works);
            if (this.config[configKey] === 'no') continue;

            worksNum++;

            switch (works.type) {
                case 'manga':
                    manga++;
                    break;
                case 'ugoira':
                    ugoira++;
                    break;
                case 'illust':
                    illust++;
                    break;
                default:
                    console.error(works);
                    throw new Error('PxerPrinter.fillTaskInfo: works.type illegal');
                    break;
            };

            if (works instanceof PxerMultipleWorks) {
                multiple++;
                address += works.multiple;
            } else if (works instanceof PxerWorks) {
                //动图
                address++;
                single++;
            } else {
                console.error(works);
                throw new Error('PxerPrinter.fillTaskInfo: works instanceof illegal');
            };
        }
    } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
            }
        } finally {
            if (_didIteratorError5) {
                throw _iteratorError5;
            }
        }
    }

    this.taskInfo = ('\n\u5171\u8BA1' + worksNum + '\u4E2A\u4F5C\u54C1\uFF0C' + address + '\u4E2A\u4E0B\u8F7D\u5730\u5740\u3002<br />\n\u5355\u5F20\u56FE\u7247\u4F5C\u54C1\u5360 ' + (single / worksNum * 100).toFixed(1) + '%<br />\n\u591A\u5F20\u56FE\u7247\u4F5C\u54C1\u5360 ' + (multiple / worksNum * 100).toFixed(1) + '%<br />\n').trim();
};
/**
 * 将结果输出
 * 确保下载地址和任务信息已被填充
 * */
PxerPrinter.prototype['print'] = function () {

    /**判断输出动图参数*/
    if (this.config['ugoira_frames'] === "yes" && Object.keys(this.ugoiraFrames).length !== 0) {
        var win = window.open(document.URL, '_blank');
        if (!win) {
            alert('Pxer:\n浏览器拦截了弹出窗口，请检查浏览器提示，设置允许此站点的弹出式窗口。');
            return;
        };
        var str = ['<pre>', '/** 这个页面是动图压缩包的动画参数，目前Pxer还无法将动图压缩包打包成GIF，请寻找其他第三方软件 */', JSON.stringify(this.ugoiraFrames, null, 4), '</pre>'];
        win.document.write(str.join('\n'));
    };

    {
        /**输出下载地址*/
        var _win = window.open(document.URL, '_blank');
        if (!_win) {
            alert('Pxer:\n浏览器拦截了弹出窗口，请检查浏览器提示，设置允许此站点的弹出式窗口。');
            return;
        };
        var _str = ['<pre>', '/** 这个页面是抓取到的下载地址，你可以将它们复制到第三方下载工具如QQ旋风中下载 */', '/**', this.taskInfo.replace(/\<br \/\>/g, ''), '*/', this.address.join('\n'), '</pre>'];
        _win.document.write(_str.join('\n'));
    }
};

/**
 * 根据作品类型，生成配置信息的key
 * @param {PxerWorks} works
 * @return {string}
 * @see PxerPrinter.defaultConfig
 * */
PxerPrinter.getWorksKey = function (works) {
    var configKey = null;
    if (works instanceof PxerUgoiraWorks) {
        configKey = 'ugoira_zip';
    } else {
        configKey = works.type + (works instanceof PxerMultipleWorks ? '_multiple' : '_single');
    };
    return configKey;
};
/**返回默认的配置对象*/
PxerPrinter.defaultConfig = function () {
    return {
        "manga_single": "max", //[max|600p|no]
        "manga_multiple": "max", //[max|1200p|cover_600p|no]
        "illust_single": "max", //[max|600p|no]
        "illust_multiple": "max", //[max|1200p|cover_600p|no]
        "ugoira_zip": "no", //[max|600p|no]
        "ugoira_frames": "no" //[yes|no]
    };
};
/**作品页跳过过滤 */
PxerPrinter.printAllConfig = function () {
    return {
        "manga_single": "max", //[max|600p|no]
        "manga_multiple": "max", //[max|1200p|cover_600p|no]
        "illust_single": "max", //[max|600p|no]
        "illust_multiple": "max", //[max|1200p|cover_600p|no]
        "ugoira_zip": "max", //[max|600p|no]
        "ugoira_frames": "yes" //[yes|no]
    };
};

/**
 * 拼装动图原始地址
 * @param {PxerUgoiraWorks} works - 作品
 * @param {string} [type] - 拼装类型 [max|600p]
 * @return {Array}
 * */
PxerPrinter.getUgoira = function (works) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'max';

    var tpl = {
        "max": "https://#domain#/img-zip-ugoira/img/#date#/#id#_ugoira1920x1080.zip",
        "600p": "https://#domain#/img-zip-ugoira/img/#date#/#id#_ugoira600x600.zip"
    };

    var address = tpl[type];
    if (!address) throw new Error('PxerPrint.getUgoira: unknown type "' + type + '"');

    for (var key in works) {
        address = address.replace('#' + key + '#', works[key]);
    };

    return [address];
};
/**
 * 拼装多副原始地址
 * @param {PxerMultipleWorks} works - 作品
 * @param {string} [type] - 拼装类型 [max|1200p|cover_600p]
 * @return {Array}
 * */
PxerPrinter.getMultiple = function (works) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'max';

    var tpl = {
        "max": "https://#domain#/img-original/img/#date#/#id#_p#index#.#fileFormat#",
        "1200p": "https://#domain#/c/1200x1200/img-master/img/#date#/#id#_p#index#_master1200.jpg",
        "cover_600p": "https://#domain#/c/600x600/img-master/img/#date#/#id#_p0_master1200.jpg"
    };

    var address = tpl[type];
    if (!address) throw new Error('PxerPrint.getMultiple: unknown type "' + type + '"');

    for (var key in works) {
        address = address.replace('#' + key + '#', works[key]);
    };

    //渲染多张
    var addressList = [];
    for (var i = 0; i < works.multiple; i++) {
        addressList.push(address.replace('#index#', i));
    };

    return addressList;
};
/**
 * 拼装单副原始地址
 * @param {PxerWorks} works - 作品
 * @param {string=max} [type] - 拼装类型 [max|600p]
 * @return {Array}
 * */
PxerPrinter.getWorks = function (works) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'max';

    var tpl = {
        "max": "https://#domain#/img-original/img/#date#/#id#_p0.#fileFormat#",
        "600p": "https://#domain#/c/600x600/img-master/img/#date#/#id#_p0_master1200.jpg"
    };

    var address = tpl[type];
    if (!address) throw new Error('PxerPrint.getWorks: unknown type "' + type + '"');

    for (var key in works) {
        address = address.replace('#' + key + '#', works[key]);
    }

    return [address];
};
/**
 * 智能拼装原始地址，对上述的简单封装
 * @param {PxerWorks} [works]
 * @param {...arguments} [argn]
 * @return {Array}
 * */
PxerPrinter.countAddress = function (works, argn) {
    switch (true) {
        case works instanceof PxerUgoiraWorks:
            return PxerPrinter.getUgoira.apply(PxerPrinter, arguments);
        case works instanceof PxerMultipleWorks:
            return PxerPrinter.getMultiple.apply(PxerPrinter, arguments);
        case works instanceof PxerWorks:
            return PxerPrinter.getWorks.apply(PxerPrinter, arguments);
        default:
            throw new Error('PxerPrinter.countAddress: unknown works');
    };
};

var PxerThread = function (_PxerEvent) {
    _inherits(PxerThread, _PxerEvent);

    /**
     * @param id {string} 线程的ID，便于调试
     * @param {Object} config 线程的配置信息
     * */
    function PxerThread() {
        var _ref10 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            id = _ref10.id,
            config = _ref10.config;

        _classCallCheck(this, PxerThread);

        /**当前线程的ID*/
        var _this5 = _possibleConstructorReturn(this, (PxerThread.__proto__ || Object.getPrototypeOf(PxerThread)).call(this, ['load', 'error', 'fail']));

        _this5.id = id;
        /**
         * 当前线程的状态
         * - free
         * - ready
         * - error
         * - fail
         * - running
         * */
        _this5.state = 'free';
        /**线程执行的任务*/
        _this5.task = null;

        /**
         *
         * */
        _this5.config = config || {
            /**ajax超时重试时间*/
            timeout: 8000,
            /**最多重试次数*/
            retry: 5
        };

        /**运行时参数*/
        _this5.runtime = {};

        /**使用的xhr对象*/
        _this5.xhr = null;

        return _this5;
    }

    return PxerThread;
}(PxerEvent);

;

/**
 * 对抓取到的URL和HTML进行校验
 * @param {string} url
 * @param {string} html
 * @return {string|true} 返回字符串表示失败
 * */
PxerThread.checkRequest = function (url, html) {
    if (!html) return 'empty';
    if (html.indexOf("_no-item _error") !== -1) {
        if (html.indexOf("sprites-r-18g-badge") !== -1) return 'r-18g';
        if (html.indexOf("sprites-r-18-badge") !== -1) return 'r-18';
    };
    if (html.indexOf("sprites-mypixiv-badge") !== -1) return 'mypixiv';
    return true;
};

/**终止线程的执行*/
PxerThread.prototype['stop'] = function () {
    this.xhr.abort();
};

/**
 * 初始化线程
 * @param {PxerRequest} task
 * */
PxerThread.prototype['init'] = function (task) {
    this.task = task;

    this.runtime = {};
    this.state = 'ready';

    // 必要的检查
    if (Number.isNaN(+this.config.timeout) || Number.isNaN(+this.config.retry)) {
        throw new Error('PxerThread#init: ' + this.id + ' config illegal');
    }

    //判断行为，读取要请求的URL
    if (this.task instanceof PxerWorksRequest) {
        this.runtime.urlList = this.task.url.slice();
    } else if (this.task instanceof PxerPageRequest) {
        this.runtime.urlList = [this.task.url];
    } else {
        this.dispatch('error', 'PxerThread#' + this.id + '.init: unknown task');
        return false;
    };
};

/**
 * 使用PxerThread#xhr发送请求
 * @param {string} url
 * */
PxerThread.prototype['sendRequest'] = function (url) {
    this.state = 'running';
    this.xhr.open('GET', url, true);
    // 单副漫画请求需要更改Referer头信息
    if (this.task instanceof PxerWorksRequest && this.task.type === 'manga' && this.task.isMultiple === false && /mode=big/.test(url)) {
        var referer = this.task.url.find(function (item) {
            return item.indexOf('mode=medium') !== -1;
        });
        var origin = document.URL;
        if (!referer) {
            this.dispatch('error', 'PxerThread.sendRequest: cannot find referer');
        };
        history.replaceState({}, null, referer);
        this.xhr.send();
        history.replaceState({}, null, origin);
    } else {
        this.xhr.send();
    };
};
/**运行线程*/
PxerThread.prototype['run'] = function _self() {
    var _this6 = this;

    var URL = this.runtime.urlList.shift();
    if (!URL) {
        this.state = 'free';
        this.task.completed = true;
        this.dispatch("load", this.task);
        return true;
    }

    var XHR = new XMLHttpRequest();

    this.xhr = XHR;
    XHR.timeout = this.config.timeout;
    XHR.responseType = 'text';

    var retry = 0;
    XHR.addEventListener('timeout', function () {
        if (++retry > _this6.config.retry) {
            _this6.state = 'fail';
            _this6.dispatch('fail', new PxerFailInfo({
                task: _this6.task,
                url: URL,
                type: 'timeout',
                xhr: XHR
            }));
            return false;
        } else {
            _this6.sendRequest(URL);
        }
    });
    XHR.addEventListener("load", function () {
        if (XHR.status.toString()[0] !== '2' && XHR.status !== 304) {
            _this6.state = 'fail';
            _this6.dispatch('fail', new PxerFailInfo({
                task: _this6.task,
                url: URL,
                type: 'http:' + XHR.status
            }));
            return false;
        };
        // 判断是否真的请求成功
        var msg = PxerThread.checkRequest(URL, XHR.responseText);
        if (msg !== true) {
            _this6.state = 'fail';
            _this6.dispatch('fail', {
                task: _this6.task,
                url: URL,
                type: msg
            });
            return false;
        };

        // 执行成功回调
        if (_this6.task instanceof PxerWorksRequest) {
            _this6.task.html[URL] = XHR.responseText;
        } else {
            _this6.task.html = XHR.responseText;
        };
        _self.call(_this6); //递归
        return true;
    });
    XHR.addEventListener("error", function () {
        _this6.state = 'error';
        _this6.dispatch('error', {
            task: _this6.task,
            url: URL
        });
    });

    this.sendRequest(URL);
};

var PxerThreadManager = function (_PxerEvent2) {
    _inherits(PxerThreadManager, _PxerEvent2);

    /**
     * @param {number} timeout - 超时时间
     * @param {number} retry   - 重试次数
     * @param {number} thread  - 线程数
     * */
    function PxerThreadManager() {
        var _ref11 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref11$timeout = _ref11.timeout,
            timeout = _ref11$timeout === undefined ? 5000 : _ref11$timeout,
            _ref11$retry = _ref11.retry,
            retry = _ref11$retry === undefined ? 3 : _ref11$retry,
            _ref11$thread = _ref11.thread,
            thread = _ref11$thread === undefined ? 8 : _ref11$thread;

        _classCallCheck(this, PxerThreadManager);

        var _this7 = _possibleConstructorReturn(this, (PxerThreadManager.__proto__ || Object.getPrototypeOf(PxerThreadManager)).call(this, ['load', 'error', 'fail', 'warn']));

        _this7.config = { timeout: timeout, retry: retry, thread: thread };

        /**
         * 任务列表
         * @type {PxerRequest[]}
         * */
        _this7.taskList = [];
        /**执行的任务列表的指针，指派了下一条要执行的任务*/
        _this7.pointer = 0;
        /**
         * 存放的线程对象
         * @type {PxerThread[]}
         * */
        _this7.threads = [];
        /**
         * 每当执行任务开始前调用的中间件
         * @type {Function[]} 返回true继续执行，false终止执行
         * */
        _this7.middleware = [function (task) {
            return !!task;
        }];

        /**运行时用到的变量*/
        _this7.runtime = {};

        return _this7;
    }

    return PxerThreadManager;
}(PxerEvent);

;

/**
 * 停止线程的执行，实际上假装任务都执行完了
 * 停止后还会触发load事件，需要一段时间
 * */
PxerThreadManager.prototype['stop'] = function () {
    this.pointer = this.taskList.length + 1;
};

/**
 * 初始化线程管理器
 * @param {PxerRequest[]} taskList
 * */
PxerThreadManager.prototype['init'] = function (taskList) {
    if (!this.taskList.every(function (request) {
        return request instanceof PxerRequest;
    })) {
        this.dispatch('error', 'PxerThreadManager.init: taskList is illegal');
        return false;
    }

    // 初始任务与结果
    this.taskList = taskList;
    this.runtime = {};
    this.pointer = 0;

    // 建立线程对象
    this.threads = [];
    for (var i = 0; i < this.config.thread; i++) {
        this.threads.push(new PxerThread({
            id: i,
            config: {
                timeout: this.config.timeout,
                retry: this.config.retry
            }
        }));
    };

    return this;
};
/**
 * 运行线程管理器
 * */
PxerThreadManager.prototype['run'] = function () {
    var _this8 = this;

    if (this.taskList.length === 0) {
        this.dispatch('warn', 'PxerApp#run: taskList.length is 0');
        this.dispatch('load', []);
        return false;
    };

    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
        var _loop = function _loop() {
            var thread = _step6.value;


            thread.on('load', function (data) {
                next(_this8, thread);
            });
            thread.on('fail', function (pfi) {
                _this8.dispatch('fail', pfi);
                next(_this8, thread);
            });
            thread.on('error', _this8.dispatch.bind(_this8, 'error'));

            next(_this8, thread);
        };

        for (var _iterator6 = this.threads[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            _loop();
        }
    } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
            }
        } finally {
            if (_didIteratorError6) {
                throw _iteratorError6;
            }
        }
    }

    ;

    function next(ptm, thread) {
        if (ptm.middleware.every(function (fn) {
            return fn(ptm.taskList[ptm.pointer]);
        })) {
            thread.init(ptm.taskList[ptm.pointer++]);
            thread.run();
        } else if (ptm.threads.every(function (thread) {
            return ['free', 'fail', 'error'].indexOf(thread.state) !== -1;
        })) {
            ptm.dispatch('load', ptm.taskList);
        };
    }
};

'use strict';

/**
 * Pxer主程序对象，与所有模块都是强耦合关系
 * 若你想阅读源码，建议不要从这个类开始
 * @class
 * */

var PxerApp = function (_PxerEvent3) {
    _inherits(PxerApp, _PxerEvent3);

    function PxerApp() {
        _classCallCheck(this, PxerApp);

        /**
         * 当前页面类型。可能的值
         * @type {string}
         * */
        var _this9 = _possibleConstructorReturn(this, (PxerApp.__proto__ || Object.getPrototypeOf(PxerApp)).call(this, ['executeWroksTask', 'executePageTask', 'finishWorksTask', 'finishPageTask', 'error', 'stop']));
        /**
         * 可能被触发的事件
         * - stop 被终止时
         * - error 出错时
         * - executeWroksTask 执行作品抓取时
         * - finishWorksTask  完成作品抓取时
         * - executePageTask  执行页码抓取时
         * - finishPageTask   完成页码抓取时
         * - finishTask 完成所有任务
         * */


        _this9.pageType = getPageType();
        /**
         * 页面的作品数量
         * @type {number|null}
         * */
        _this9.worksNum = PxerApp.getWorksNum();

        /**
         * 任务队列
         * @type {PxerRequest[]}
         * */
        _this9.taskList = [];
        /**
         * 失败的任务信息
         * @type {PxerFailInfo[]}
         * */
        _this9.failList = [];
        /**
         * 抓取到的结果集
         * @type {PxerWorks[]}
         * */
        _this9.resultSet = [];
        /**
         * 过滤得到的结果集
         * @type {PxerWorks[]}
         * */
        _this9.filterResult = [];

        /**
         * 任务配置选项，用来指派任务执行过程中的一些逻辑
         * 必须在PxerApp#initPageTask调用前配置
         * */
        _this9.taskOption = {
            /**仅抓取前几副作品*/
            limit: null,
            /**遇到id为x的作品停止后续，不包括本id*/
            stopId: null
        };

        // 其他对象的配置参数
        _this9.ptmConfig = { //PxerThreadManager
            timeout: 5000,
            retry: 3,
            thread: 8
        };
        _this9.ppConfig = _this9.pageType.startsWith("works_") ? PxerPrinter.printAllConfig() : PxerPrinter.defaultConfig(); //PxerPrinter
        _this9.pfConfig = PxerFilter.defaultConfig(); //PxerFilter

        // 使用的PxerThreadManager实例
        _this9.ptm = null;

        if (window['PXER_MODE'] === 'dev') window['PXER_APP'] = _this9;

        return _this9;
    }

    _createClass(PxerApp, [{
        key: 'stop',


        /**
         * 停止执行当前任务
         * 调用后仍会触发对应的finish*事件
         * */
        value: function stop() {
            this.dispatch('stop');
            this.ptm.stop();
        }
    }, {
        key: 'initPageTask',


        /**初始化批量任务*/
        value: function initPageTask() {
            if (typeof this.pageType !== 'string' || typeof this.worksNum !== 'number') {
                this.dispatch('error', 'PxerApp.initPageTask: pageType or number illegal');
                return false;
            };

            var onePageWorksNumber = this.pageType === 'search' ? 40 : 20;

            var pageNum = Math.ceil(this.taskOption.limit ? this.taskOption.limit : this.worksNum) / onePageWorksNumber;

            var separator = /\?/.test(document.URL) ? "&" : "?";
            for (var i = 0; i < pageNum; i++) {
                this.taskList.push(new PxerPageRequest({
                    url: document.URL + separator + "p=" + (i + 1)
                }));
            };
        }
    }, {
        key: 'executePageTask',

        /**抓取页码*/
        value: function executePageTask() {
            var _this10 = this;

            if (this.taskList.length === 0) {
                this.dispatch('error', 'PxerApp.executePageTask: taskList is empty');
                return false;
            };
            if (!this.taskList.every(function (request) {
                return request instanceof PxerPageRequest;
            })) {
                this.dispatch('error', 'PxerApp.executePageTask: taskList is illegal');
                return false;
            };

            this.dispatch('executePageTask');

            var ptm = this.ptm = new PxerThreadManager(this.ptmConfig);
            ptm.on('error', function () {
                for (var _len3 = arguments.length, argn = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    argn[_key3] = arguments[_key3];
                }

                return _this10.dispatch('error', argn);
            });
            ptm.on('warn', function () {
                for (var _len4 = arguments.length, argn = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                    argn[_key4] = arguments[_key4];
                }

                return _this10.dispatch('error', argn);
            });
            ptm.on('load', function () {
                var parseResult = [];
                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                    for (var _iterator7 = _this10.taskList[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                        var result = _step7.value;

                        result = PxerHtmlParser.parsePage(result);
                        if (!result) {
                            _this10.dispatch('error', window['PXER_ERROR']);
                            continue;
                        }
                        parseResult.push.apply(parseResult, _toConsumableArray(result));
                    }
                } catch (err) {
                    _didIteratorError7 = true;
                    _iteratorError7 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion7 && _iterator7.return) {
                            _iterator7.return();
                        }
                    } finally {
                        if (_didIteratorError7) {
                            throw _iteratorError7;
                        }
                    }
                }

                ;
                _this10.resultSet = parseResult;
                _this10.dispatch('finishPageTask', parseResult);
            });
            ptm.on('fail', function (pfi) {
                ptm.pointer--; //失败就不停的尝试
            });
            ptm.init(this.taskList);
            ptm.run();
        }
    }, {
        key: 'executeWroksTask',

        /**
         * 抓取作品
         * @param {PxerWorksRequest[]} tasks - 要执行的作品请求数组
         * */
        value: function executeWroksTask() {
            var _this11 = this;

            var tasks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.taskList;

            if (tasks.length === 0) {
                this.dispatch('error', 'PxerApp.executeWroksTask: taskList is empty');
                return false;
            };
            if (!tasks.every(function (request) {
                return request instanceof PxerWorksRequest;
            })) {
                this.dispatch('error', 'PxerApp.executeWroksTask: taskList is illegal');
                return false;
            };

            this.dispatch('executeWroksTask');

            var ptm = this.ptm = new PxerThreadManager(this.ptmConfig);
            ptm.on('error', function () {
                for (var _len5 = arguments.length, argn = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                    argn[_key5] = arguments[_key5];
                }

                return _this11.dispatch('error', argn);
            });
            ptm.on('warn', function () {
                for (var _len6 = arguments.length, argn = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                    argn[_key6] = arguments[_key6];
                }

                return _this11.dispatch('error', argn);
            });
            // 根据taskOption添加ptm中间件
            if (this.taskOption.limit) {
                ptm.middleware.push(function (task) {
                    return ptm.pointer < _this11.taskOption.limit;
                });
            }
            if (this.taskOption.stopId) {
                ptm.middleware.push(function (task) {
                    if (task.id == _this11.taskOption.stopId) {
                        ptm.stop();
                        return false;
                    }
                    return true;
                });
            }

            ptm.on('load', function () {
                _this11.resultSet = [];
                var tl = _this11.taskList.slice( //限制结果集条数
                0, _this11.taskOption.limit ? _this11.taskOption.limit : undefined);
                var _iteratorNormalCompletion8 = true;
                var _didIteratorError8 = false;
                var _iteratorError8 = undefined;

                try {
                    for (var _iterator8 = tl[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                        var pwr = _step8.value;

                        if (!pwr.completed) continue; //跳过未完成的任务
                        var pw = PxerHtmlParser.parseWorks(pwr);
                        if (!pw) {
                            pwr.completed = false;
                            ptm.dispatch('fail', new PxerFailInfo({
                                type: 'parse',
                                task: pwr,
                                url: pwr.url[0]
                            }));
                            _this11.dispatch('error', window['PXER_ERROR']);
                            continue;
                        }
                        _this11.resultSet.push(pw);
                    }
                } catch (err) {
                    _didIteratorError8 = true;
                    _iteratorError8 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                            _iterator8.return();
                        }
                    } finally {
                        if (_didIteratorError8) {
                            throw _iteratorError8;
                        }
                    }
                }

                _this11.dispatch('finishWorksTask', _this11.resultSet);
            });
            ptm.on('fail', function (pfi) {
                _this11.failList.push(pfi);
            });
            ptm.init(tasks);
            ptm.run();

            return true;
        }
    }, {
        key: 'executeFailWroks',

        /**对失败的作品进行再抓取*/
        value: function executeFailWroks() {
            var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.failList;

            // 把重试的任务从失败列表中减去
            this.failList = this.failList.filter(function (pfi) {
                return list.indexOf(pfi) === -1;
            });
            // 执行抓取
            this.executeWroksTask(list.map(function (pfi) {
                return pfi.task;
            }));
        }
    }, {
        key: 'switchPage2Works',

        /**抓取页码完成后，初始化，准备抓取作品*/
        value: function switchPage2Works() {
            var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.resultSet.length;

            this.taskList = this.resultSet.slice(0, len);
            this.resultSet = [];
        }
    }, {
        key: 'getWorksInfo',

        /**
         * 获取当前抓取到的可读的任务信息
         * @return {string}
         * */
        value: function getWorksInfo() {
            var pp = new PxerPrinter(this.ppConfig);
            var pf = new PxerFilter(this.pfConfig);
            pp.fillTaskInfo(pf.filter(this.resultSet));
            return pp.taskInfo;
        }
    }, {
        key: 'printWorks',

        /**
         * 输出抓取到的作品
         * @return {string}
         * */
        value: function printWorks() {
            var pp = new PxerPrinter(this.ppConfig);
            var pf = new PxerFilter(this.pfConfig);
            var works = pf.filter(this.resultSet);
            pp.fillTaskInfo(works);
            pp.fillAddress(works);
            pp.print();
        }
    }]);

    return PxerApp;
}(PxerEvent);

;

/**直接抓取本页面的作品*/
PxerApp.prototype['getThis'] = function () {
    var _this12 = this;

    // 生成任务对象
    var initdata = document.head.innerHTML.match(PxerHtmlParser.REGEXP['getInitData'])[0];
    var id = document.URL.match(/illust_id=(\d+)/)[1];

    initdata = PxerHtmlParser.getKeyFromStringObjectLiteral(initdata, "preload");
    initdata = PxerHtmlParser.getKeyFromStringObjectLiteral(initdata, 'illust');
    initdata = PxerHtmlParser.getKeyFromStringObjectLiteral(initdata, id);
    initdata = JSON.parse(initdata);

    var type = initdata.illustType;
    var pageCount = initdata.pageCount;
    var pwr = new PxerWorksRequest({
        isMultiple: pageCount > 1,
        id: id
    }); //[manga|ugoira|illust]
    switch (type) {
        case 2:
            pwr.type = 'ugoira';break;
        case 1:
            pwr.type = 'illust';break;
        case 0:
            pwr.type = 'manga';break;
        default:
            throw new Error("Unknown work type. id:" + id);
    }
    pwr.url = PxerHtmlParser.getUrlList(pwr);
    // 添加执行
    this.taskList.push(pwr);
    this.one('finishWorksTask', function () {
        return _this12.printWorks();
    });
    this.executeWroksTask();
};

/**
 * 获取当前页面的总作品数
 * @param {Document=document} dom - 页面的document对象
 * @return {number} - 作品数
 * */
PxerApp.getWorksNum = function () {
    var dom = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;

    var elt = dom.querySelector(".count-badge");
    if (!elt) return null;
    return parseInt(elt.innerHTML);
};