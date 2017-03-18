'use strict';

/**
 * Pxer任务队列中的任务对象
 * @constructor
 * @abstract
 * */
class PxerRequest{
    constructor({url ,html}={}){
        this.url=url;
        this.html =html;
    };
}
/**
 * 页面任务对象
 * @constructor
 * @extends {PxerRequest}
 * */
class PxerPageRequest extends PxerRequest{
    constructor(...argn){
        super(...argn);
        return denyNewAttr(this);
    }
}
/**
 * 作品任务对象
 * @constructor
 * @extends {PxerRequest}
 * */
class PxerWorksRequest extends PxerRequest{
    constructor({url=[] ,html={} ,type ,isMultiple ,id}={}){
        super({url ,html});
        this.type =type;//[manga|ugoira|illust]
        this.isMultiple =isMultiple;//[true|false]
        this.id =id;
        return denyNewAttr(this);
    }
}


/**
 * 作品任务对象
 * @constructor
 * @extends {PxerRequest}
 * */
class PxerFailInfo{
    constructor({url,type,xhr,task}={}){
        this.url  =url;
        this.type =type;
        this.xhr  =xhr;
        this.task =task;
        return denyNewAttr(this);
    }
}



/**
 * 抓取到的作品对象
 * @constructor
 * */
class PxerWorks{
    constructor({id ,type ,date ,server ,tagList ,viewCount ,ratedCount ,scoreCount ,fileFormat}={},strict=true){
        /*!作品ID*/
        this.id =id;
        /**
         * 投稿日期，格式：[Y,m,d,h,m,s]
         * @type {Array}
         * */
        this.date =date;
        this.type =type;//[manga|ugoira|illust]
        /*!作品存放的P站服务器*/
        this.server =server;//i\d
        /**
         * 作品标签列表
         * @type {Array}
         * */
        this.tagList =tagList;
        /*!作品被浏览的次数*/
        this.viewCount =viewCount;
        /*!作品被评价的次数*/
        this.ratedCount =ratedCount;
        /*!作品的总分*/
        this.scoreCount =scoreCount;
        /*!作品的图片文件扩展名*/
        this.fileFormat =fileFormat;

        if(strict)return denyNewAttr(this);
    }
}
/**
 * 抓取到的多张插画/漫画作品对象
 * @extends {PxerWorks}
 * @constructor
 * */
class PxerMultipleWorks extends PxerWorks{
    constructor(data={}){
        super(data,false);
        /*!作品的图片张数*/
        this.multiple =data.multiple;
        return denyNewAttr(this);
    }
};
/**
 * 抓取到的动图作品对象
 * @extends {PxerWorks}
 * @constructor
 * */
class PxerUgoiraWorks extends PxerWorks{
    constructor(data={}){
        super(data,false);
        this.fileFormat='zip';
        /*!动图动画参数*/
        this.frames =data.frames;
        return denyNewAttr(this);
    }
};

function denyNewAttr(obj){
    return new Proxy(obj ,{
        get(obj ,prop){
            if(!(prop in obj) && typeof prop !=='symbol' && !/^\_|to[A-Z]/.test(prop)){
                console.warn(`attribute "${prop}" is not in ${obj.constructor.name}`)
            }
            return obj[prop];
        },
        set(obj ,prop ,value){
            if(!(prop in obj)){
                throw new Error(`Count not set attribute "${prop}" in ${obj.constructor.name}`);
            };
            obj[prop]=value;
            return true;
        },
    });
}
'use strict';

class PxerEvent{
    constructor(eventList=[] ,shortName =true){
        this._pe_eventList =eventList;

        this._pe_event ={};
        this._pe_oneEvent ={};


        if(!shortName) return this;
        else return new Proxy(this ,{
            get(target ,property){
                if(property in target){
                    return target[property];
                }else if(target._pe_eventList.indexOf(property) !==-1){
                    return target.dispatch.bind(target ,property);
                }else{
                    return target[property];
                };
            },
        });

    };
    on(type, listener){
        if(!PxerEvent.check(this ,type ,listener))return false;
        if(!this._pe_event[type]) this._pe_event[type]=[];
        this._pe_event[type].push(listener);
        return true;
    };
    one(type, listener){
        if(!PxerEvent.check(this ,type ,listener))return false;
        if(!this._pe_oneEvent[type]) this._pe_oneEvent[type]=[];
        this._pe_oneEvent[type].push(listener);
        return true;
    };
    dispatch(type ,...data){
        if(this._pe_eventList.indexOf(type) ===-1) return false;
        if(this._pe_event[type]) this._pe_event[type].forEach(fn=>fn(...data));
        if(this._pe_oneEvent[type]){
            this._pe_oneEvent[type].forEach(fn=>fn(...data));
            delete this._pe_oneEvent[type];
        }
        if(this._pe_event['*']) this._pe_event['*'].forEach(fn=>fn(...data));
        if(this._pe_oneEvent['*']){
            this._pe_oneEvent['*'].forEach(fn=>fn(...data));
            delete this._pe_oneEvent['*'];
        }
        return true;
    };
    off(eventType, listener){
        if(!PxerEvent.checkEvent(this ,eventType)) return false;
        if(listener &&!PxerEvent.checkListener(listener)) return false;

        if(eventType ===true){
            this._pe_event ={};
            this._pe_oneEvent ={};
            return true;
        };

        if(listener===true || listener==='*'){
            delete this._pe_event[eventType];
            delete this._pe_oneEvent[eventType];
            return true;
        };

        let index1 = this._pe_event[type].lastIndexOf(listener);
        if (index1 !== -1) {
            this._pe_event[type].splice(index1, 1);
        };

        let index2 =this._pe_oneEvent[type].lastIndexOf(listener);
        if(index2 !== -1){
            this._pe_oneEvent[type].splice(index2 ,1);
        };

        return true;

    };
};

PxerEvent.check =function(pe ,eventType ,listener){
    return PxerEvent.checkEvent(pe ,eventType)&&PxerEvent.checkListener(listener);
};
PxerEvent.checkEvent =function(pe ,eventType){
    if(eventType !=='*' &&pe._pe_eventList.indexOf(eventType) ===-1){
        console.warn(`PxerEvent : "${eventType}" is not in eventList[${pe._pe_eventList}]`);
        return false;
    };
    return true;
};
PxerEvent.checkListener =function(listener){
    if(!(listener instanceof Function || listener===true || listener==='*')){
        console.warn(`PxerEvent: "${listener}" is not a function`);
        return false;
    };
    return true;
};


'use strict';

class PxerFilter{
    constructor(config){
        /*!全部的作品集合*/
        this.worksList =[];
        /*!过滤后得到的作品集合*/
        this.passWorks =[];

        /*!过滤配置信息*/
        this.config =Object.assign(PxerFilter.defaultConfig(),config);
    };

    filter(worksList){
        var resultSet =PxerFilter.filterInfo(PxerFilter.filterTag(worksList,this.config) ,this.config);
        this.passWorks.push(...resultSet);
        return resultSet;
    };
};

PxerFilter.defaultConfig =function(){
    return{
        "score"     :0,
        "avg"       :0,
        "view"      :0,
        "has_tag_every" :[],
        "has_tag_some"  :[],
        "no_tag_any"    :[],
        "no_tag_every"  :[],
    };
};

PxerFilter.filterInfo =function(worksList ,{score=0,avg=0,view=0}){
    return worksList.filter(function(works){
        return works.scoreCount >= score
        && works.viewCount >= view
        && (works.ratedCount&&(works.scoreCount/works.ratedCount)) >= avg
    });
};

PxerFilter.filterTag =function(worksList ,{has_tag_every,has_tag_some,no_tag_any,no_tag_every}){
    var passWorks =worksList;

    if(has_tag_every && has_tag_every.length !==0){
        passWorks =passWorks.filter(function(works){
            return has_tag_every.every(tag=>works.tagList.indexOf(tag)!==-1);
        });
    };

    if(has_tag_some && has_tag_some.length !==0){
        passWorks =passWorks.filter(function(works){
            return has_tag_some.some(tag=>works.tagList.indexOf(tag)!==-1);
        });
    };

    if(no_tag_any && no_tag_any.length !==0){
        passWorks =passWorks.filter(function(works){
            return !no_tag_any.some(tag=>works.tagList.indexOf(tag)!==-1);
        });
    };

    if(no_tag_every && no_tag_every.length !==0){
        passWorks =passWorks.filter(function(works){
            return !no_tag_every.every(tag=>works.tagList.indexOf(tag)!==-1);
        });
    };

    return passWorks;

};

'use strict';

class PxerHtmlParser{
    constructor(){};
};

/**
 * 根据任务对象类型智能选择解析
 * @param {PxerRequest} request - 抓取后的任务对象
 * @return {PxerWorksRequest[]|PxerWorks[]} - 解析得到的结果
 * */
PxerHtmlParser.parse =function(request){
    if(request instanceof PxerWorksRequest){
        this.task =request;
        return [this.parseWorks()];
    }else if(request instanceof PxerPageRequest){
        this.task =request;
        return this.parsePage();
    }else{
        return false;
    };
};

/**
 * 解析页码任务对象
 * @param {PxerPageRequest} task - 抓取后的页码任务对象
 * @return {PxerWorksRequest[]} - 解析得到的作品任务对象
 * */
PxerHtmlParser.parsePage =function(task){
    if(!(task instanceof PxerPageRequest)){
        window['PXER_ERROR'] ='PxerHtmlParser.parsePage: task is not PxerPageRequest';
        return false;
    }
    if(!task.url || !task.html){
        window['PXER_ERROR'] ='PxerHtmlParser.parsePage: task illegal';
        return false;
    }

    var URLData =parseURL(task.url);
    var dom =PxerHtmlParser.HTMLParser(task.html);
    var elts =null;
    if(URLData.path==='/search.php'){
        elts =dom.querySelectorAll('.column-search-result a.work._work');
    }else{
        elts =dom.querySelectorAll('a.work._work');
    }
    if(elts.length ===0){
        window['PXER_ERROR'] ='PxerHtmlParser.parsePage: a.work._work empty';
        return false;
    }



    var taskList =[];
    for(let elt of elts){
        let task =new PxerWorksRequest({
            html        :{},
            type        :elt.matches('.ugoku-illust')?'ugoira'
                :elt.matches(".manga")?'manga'
                :"illust"
            ,
            isMultiple  :elt.matches(".multiple"),
            id          :elt.getAttribute('href').match(/illust_id=(\d+)/)[1]
        });

        task.url =PxerHtmlParser.getUrlList(task);

        taskList.push(task);
    };


    return taskList;




};

/**
 * 解析作品任务对象
 * @param {PxerWorksRequest} task - 抓取后的页码任务对象
 * @return {PxerWorks} - 解析得到的作品任务对象
 * */
PxerHtmlParser.parseWorks =function(task){
    if(!(task instanceof PxerWorksRequest)){
        window['PXER_ERROR'] ='PxerHtmlParser.parseWorks: task is not PxerWorksRequest';
        return false;
    }
    if(!task.url.every(item=>task.html[item]) || !task.type){
        window['PXER_ERROR'] ='PxerHtmlParser.parsePage: task illegal';
        return false;
    }

    var pw;
    if(task.type ==='ugoira'){
        pw =new PxerUgoiraWorks();
    }else if(task.isMultiple){
        pw =new PxerMultipleWorks();
    }else{
        pw =new PxerWorks();
    };

    for(let url in task.html){
        let data ={
            dom :PxerHtmlParser.HTMLParser(task.html[url]),
            url,pw,task,
        };
        switch (true){
            case url.indexOf('mode=medium')!==-1:
                PxerHtmlParser.parseMediumHtml(data);
                break;
            case url.indexOf('mode=big')!==-1:
            case url.indexOf('mode=manga_big')!==-1:
                PxerHtmlParser.parseMangaBigHtml(data);
                break;
            case url.indexOf('mode=manga&')!==-1:
                PxerHtmlParser.parseMangaHtml(data);
                break;
            default:
                return false;
                window['PXER_ERROR'] =`PxerHtmlParser.parsePage: count not parse task url "${url}"`;
        };
    };

    return pw;

};




PxerHtmlParser.getUrlList =function(task){
    if(
        task.type ==="ugoira"
        ||(
            task.type ==="illust"
            && !task.isMultiple
        )
    ){
        return ["http://www.pixiv.net/member_illust.php?mode=medium&illust_id="+task.id];
    }else if(task.isMultiple){
        return [
            "http://www.pixiv.net/member_illust.php?mode=medium&illust_id="+task.id,
            "http://www.pixiv.net/member_illust.php?mode=manga&illust_id="+task.id,
            "http://www.pixiv.net/member_illust.php?mode=manga_big&page=0&illust_id="+task.id
        ];
    }else if(task.type ==="manga" && !task.isMultiple){
        return [
            "http://www.pixiv.net/member_illust.php?mode=medium&illust_id="+task.id,
            "http://www.pixiv.net/member_illust.php?mode=big&illust_id="+task.id,
        ];
    }else{
        console.warn('miss task '+task.id);
        return [];
    };
};

PxerHtmlParser.parseMangaHtml =function({task,dom,url,pw}){
    pw.multiple =+(
        dom.querySelector('.page .total')
        || dom.querySelector('.position .total')
    ).innerHTML;
};
PxerHtmlParser.parseMangaBigHtml =function({task,dom,url,pw}){
    var src =dom.getElementsByTagName('img')[0].src;
    pw.server     =src.match(/(i\d+)\.pixiv\.net/)[1];
    pw.date       =src.match(PxerHtmlParser.REGEXP['getDate'])[1];
    pw.fileFormat =src.match(/\.(jpg|gif|png)$/)[1];
};
PxerHtmlParser.parseMediumHtml =function({task,dom,url,pw}){
    pw.id           =task.id;
    pw.type         =task.type;
    pw.tagList      =[...dom.querySelectorAll(".tag a.text")].map(elt=>elt.innerHTML);
    pw.viewCount    =+dom.querySelector(".view-count").innerHTML;
    pw.ratedCount   =+dom.querySelector(".rated-count").innerHTML;
    pw.scoreCount   =+dom.querySelector(".score-count").innerHTML;

    if(task.type ==='ugoira'){
        let script =[...dom.querySelectorAll("script")]
                .filter(tag=>/zip/.test(tag.innerHTML))[0]
                .innerHTML
            ;
        let exp =/"src":"([^"<>]*?600x600\.zip)"[^<>]*?"frames":(\[.*?\])/mi;
        let arr =script.match(exp);

        pw.server =arr[1].replace(/\\\//g ,'\/').match(/(i\d+)\.pixiv\.net/)[1];
        pw.date   =arr[1].replace(/\\\//g ,'\/').match(PxerHtmlParser.REGEXP['getDate'])[1];
        pw.frames =JSON.parse(arr[2]);

    };

    if(task.type ==='illust' &&!task.isMultiple){
        let src =dom.querySelector(".ui-modal-close-box img.original-image").getAttribute("data-src");
        pw.server     =src.match(/(i\d+)\.pixiv\.net/)[1];
        pw.date       =src.match(PxerHtmlParser.REGEXP['getDate'])[1];
        pw.fileFormat =src.match(/\.(jpg|gif|png)$/)[1];
    }

    if(task.type ==='manga' &&!task.isMultiple){
        let src =dom.querySelector("a._work.manga img").src;
        pw.server =src.match(/(i\d+)\.pixiv\.net/)[1];
        pw.date   =src.match(PxerHtmlParser.REGEXP['getDate'])[1];
    }

};


PxerHtmlParser.REGEXP ={
    'getDate':/img\/((?:\d+\/){5}\d+)/,
};

PxerHtmlParser.HTMLParser =function(aHTMLString){
    var dom =document.implementation.createHTMLDocument("example");
    dom.documentElement.innerHTML =aHTMLString;
    return dom.body;
};


class PxerPrinter{
    constructor(config){

        this.address =[];
        this.taskInfo ='';
        this.ugoiraFrames ={};

        /*!输出配置信息*/
        this.config =Object.assign(PxerPrinter.defaultConfig(),config);
        config &&this.setConfig(config);
        this.worksList =[];

    };
    setConfig(key ,value){
        if(arguments.length ===1 && typeof key ==='object'){
            let obj =key;
            for(let objKey in obj){
                if(objKey in this.config) this.config[objKey] =obj[objKey];
                else console.warn(`PxerPrinter.setConfig: skip key "${objKey}"`);
            };
        }else{
            if(!(key in this.config)) throw new Error(`PxerPrinter.setConfig: ${key} is not in config`);
            this.config[key]=value;
        }
        return this;
    };
    addWorks(){
        var argn =Array.from(arguments);
        if(!argn.every(works=>works instanceof PxerWorks)){
            console.error(arguments);
            throw new Error('PxerPrinter.addWorks: argument illegal');
        }
        this.worksList.push(...arguments);
        return this;
    };
};


PxerPrinter.prototype['fillAddress'] =function(worksList){
    for(let works of worksList){
        let configKey =null;
        if(works instanceof PxerUgoiraWorks){
            configKey ='ugoira_zip';
            if(this.config['ugoira_frames']==='yes'){
                this.ugoiraFrames[works.id] =works.frames
            }
        }else{
            configKey =works.type+(
                works instanceof PxerMultipleWorks
                ?'_multiple'
                :'_single'
            );
        };
        if(!(configKey in this.config)) throw new Error(`PxerPrinter.fillAddress: ${configKey} in not in config`);
        if(this.config[configKey]==='no') continue;
        this.address.push(...PxerPrinter.countAddress(works,this.config[configKey]));
    }
};
PxerPrinter.prototype['fillTaskInfo'] =function(worksList){
    var [manga,ugoira,illust,multiple,single,works,address] =new Array(20).fill(0);
    for(let works of worksList){
        switch(works.type){
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
                throw new Error(`PxerPrinter.fillTaskInfo: works.type illegal`);
                break;
        };

        if(works instanceof PxerMultipleWorks){
            multiple++;
            address +=works.multiple;
        }else if(!(works instanceof PxerUgoiraWorks)){
            single++;
            address++;
        };
    }

    works =worksList.length;

    this.taskInfo =`
共计${works}个作品，${address}个下载地址。<br />
单张图片作品占 ${(multiple/works*100).toFixed(1)}%<br />
多张图片作品占 ${(single/works*100).toFixed(1)}%<br />
`.trim();
};
PxerPrinter.prototype['print'] =function(){

    /*!判断输出动图参数*/
    if(this.config['ugoira_frames'] ==="yes"){
        let win =window.open(document.URL ,'_blank');
        let str =[
            '<pre>',
            '/*! 这个页面是动图压缩包的动画参数，目前Pxer还无法将动图压缩包打包成GIF，请寻找其他第三方软件 */',
            JSON.stringify(this.ugoiraFrames ,null ,4),
            '</pre>',
        ];
        win.document.write(str.join('\n'));
    };

    {/*!输出下载地址*/
        let win = window.open(document.URL ,'_blank');
        let str = [
            '<pre>' ,
            '/*! 这个页面是抓取到的下载地址，你可以将它们复制到第三方下载工具如QQ旋风中下载 */' ,
            '/*!' ,
            this.taskInfo.replace(/\<br \/\>/g,'') ,
            '*/' ,
            this.address.join('\n') ,
            '</pre>' ,
        ];
        win.document.write(str.join('\n'));
    }


};


PxerPrinter.defaultConfig =function(){
    return{
        "manga_single"    :"max",//[max|600p|no]
        "manga_multiple"  :"max",//[max|1200p|cover_600p|no]
        "illust_single"   :"max",//[max|600p|no]
        "illust_multiple" :"max",//[max|1200p|cover_600p|no]
        "ugoira_zip"      :"no",//[max|600p|no]
        "ugoira_frames"   :"no",//[yes|no]
    };
};






/**
 * 拼装动图原始地址
 * @param {PxerUgoiraWorks} works - 作品
 * @param {string} [type] - 拼装类型 [max|600p]
 * @return {Array}
 * */
PxerPrinter.getUgoira =function(works ,type='max'){
    const tpl ={
        "max"   :"http://#server#.pixiv.net/img-zip-ugoira/img/#date#/#id#_ugoira1920x1080.zip",
        "600p"  :"http://#server#.pixiv.net/img-zip-ugoira/img/#date#/#id#_ugoira600x600.zip",
    };

    var address =tpl[type];
    if(!address) throw new Error(`PxerPrint.getUgoira: unknown type "${type}"`);

    for(let key in works){
        address =address.replace(`#${key}#` ,works[key]);
    };

    return [address];

};
/**
 * 拼装多副原始地址
 * @param {PxerMultipleWorks} works - 作品
 * @param {string} [type] - 拼装类型 [max|1200p|cover_600p]
 * @return {Array}
 * */
PxerPrinter.getMultiple =function(works ,type='max'){
    const tpl ={
        "max"        :"http://#server#.pixiv.net/img-original/img/#date#/#id#_p#index#.#fileFormat#",
        "1200p"      :"http://#server#.pixiv.net/c/1200x1200/img-master/img/#date#/#id#_p#index#_master1200.jpg",
        "cover_600p" :"http://#server#.pixiv.net/c/600x600/img-master/img/#date#/#id#_p0_master1200.jpg",
    };

    var address =tpl[type];
    if(!address) throw new Error(`PxerPrint.getMultiple: unknown type "${type}"`);

    for(let key in works){
        address =address.replace(`#${key}#` ,works[key]);
    };

    //渲染多张
    var addressList =[];
    for(let i=0 ;i<works.multiple ;i++){
        addressList.push(address.replace('#index#' ,i));
    };

    return addressList;

};
/**
 * 拼装单副原始地址
 * @param {PxerWorks} works - 作品
 * @param {string=max} [type] - 拼装类型 [max|600p]
 * @return {Array}
 * */
PxerPrinter.getWorks =function (works ,type='max'){
    const tpl ={
        "max"   :"http://#server#.pixiv.net/img-original/img/#date#/#id#_p0.#fileFormat#",
        "600p"  :"http://#server#.pixiv.net/c/600x600/img-master/img/#date#/#id#_p0_master1200.jpg",
    };

    var address =tpl[type];
    if(!address) throw new Error(`PxerPrint.getWorks: unknown type "${type}"`);

    for(let key in works){
        address =address.replace(`#${key}#` ,works[key]);
    }

    return [address];

};
/**
 * 智能拼装原始地址，对上述的简单封装
 * @param {PxerWorks} [works]
 * @param {...arguments} [argn]
 * @return {Array}
 * */
PxerPrinter.countAddress =function(works,argn){
    switch(true){
        case works instanceof PxerUgoiraWorks:
            return PxerPrinter.getUgoira(...arguments);
        case works instanceof PxerMultipleWorks:
            return PxerPrinter.getMultiple(...arguments);
        case works instanceof PxerWorks:
            return PxerPrinter.getWorks(...arguments);
        default:
            throw new Error('PxerPrinter.countAddress: unknown works');
    };
};




class PxerThread extends PxerEvent{
    constructor({id ,config ,task}={}){
        super(['load','error','fail']);
        /*!当前线程的ID*/
        this.id =id;
        /**
         * 当前线程的状态
         * - free
         * - ready
         * - error
         * - fail
         * - running
         * */
        this.state='free';
        /*!线程执行的任务*/
        this.task =task;

        this.config =config ||{
            /*!ajax超时重试时间*/
            timeout:8000,
            /*!最多重试次数*/
            retry:5,
        };

        /*!运行时参数*/
        this.runtime ={};

        /*!使用的xhr对象*/
        this.xhr =null;

    };
};


PxerThread.checkRequest =function(url ,html){
    if(!html) return 'empty';
    if(html.indexOf("_no-item _error") !==-1){
        if(html.indexOf("sprites-r-18g-badge") !==-1) return 'r-18g';
        if(html.indexOf("sprites-r-18-badge") !==-1) return 'r-18';
    };
    if(html.indexOf("sprites-mypixiv-badge") !==-1) return 'mypixiv';
    return true;
};


PxerThread.prototype['stop'] =function(){
    this.xhr.abort();
};


PxerThread.prototype['init'] =function(task){
    this.task=task;

    this.runtime ={};
    this.state ='ready';

    // 必要的检查
    if(Number.isNaN(+this.config.timeout)||Number.isNaN(+this.config.retry)){
        throw new Error(`PxerThread#init: ${this.id} config illegal`);
    }

    //判断行为，读取要请求的URL
    if(this.task instanceof PxerWorksRequest){
        this.runtime.urlList =this.task.url.slice();
    }else if(this.task instanceof PxerPageRequest){
        this.runtime.urlList =[this.task.url];
    }else{
        this.dispatch('error' ,`PxerThread#${this.id}.init: unknown task`);
        return false;
    };

};


PxerThread.prototype['sendRequest'] =function(url){
    this.state ='running';
    this.xhr.open('GET' ,url ,true);
    // 单副漫画请求需要更改Referer头信息
    if(
        this.task instanceof PxerWorksRequest
        && this.task.type ==='manga'
        && this.task.isMultiple===false
        && /mode=big/.test(url)
    ){
        var referer =this.task.url.find(item=>item.indexOf('mode=medium')!==-1);
        var origin  =document.URL;
        if(!referer){
            this.dispatch('error','PxerThread.sendRequest: cannot find referer');
        };
        history.replaceState({} ,null ,referer);
        this.xhr.send();
        history.replaceState({} ,null ,origin);
    }else{
        this.xhr.send();
    };
};
PxerThread.prototype['run'] =function _self(){
    const URL =this.runtime.urlList.shift();
    if(!URL){
        this.state ='free';
        this.dispatch("load" ,this.task);
        return true;
    }

    const XHR =new XMLHttpRequest();

    this.xhr =XHR;
    XHR.timeout =this.config.timeout;
    XHR.responseType ='text';


    var retry=0;
    XHR.addEventListener('timeout',()=>{
        console.log(`thread timeout ${retry} - ${this.config.retry}`);
        if(++retry > this.config.retry){
            this.state ='timeout';
            this.dispatch('fail' ,new PxerFailInfo({
                task :this.task,
                url  :URL,
                type :'timeout',
                xhr  :XHR,
            }));
            return false;
        }else{
            this.sendRequest(URL);
        }
    });
    XHR.addEventListener("load" ,()=>{
        if(XHR.status.toString()[0]!=='2' &&XHR.status!==304){
            this.state ='fail';
            this.dispatch('fail' ,new PxerFailInfo({
                task :this.task,
                url  :URL,
                type :'http:'+XHR.status,
            }));
            return false;
        };
        // 判断是否真的请求成功
        var msg =PxerThread.checkRequest(URL ,XHR.responseText);
        if(msg !==true){
            this.dispatch('fail' ,{
                task :this.task,
                url  :URL,
                type :msg,
            });
            return false;
        };

        // 执行成功回调
        if(this.task instanceof PxerWorksRequest){
            this.task.html[URL] =XHR.responseText;
        }else{
            this.task.html =XHR.responseText;
        };
        this.run();//递归
        return true;
    });
    XHR.addEventListener("error" ,()=>{
        this.state ='error';
        this.dispatch('error' ,{
            task :this.task,
            url  :URL,
        });
    });

    this.sendRequest(URL);

};

class PxerThreadManager extends PxerEvent{
    constructor({timeout=5000,retry=3,thread=8}={}){
        super(['load' ,'error' ,'fail' ,'warn']);

        this.config ={timeout,retry,thread};

        this.taskList =[];
        this.resultSet =[];
        this.runtime={};
        this.threads=[];

    };
};


PxerThreadManager.prototype['stop'] =function(){
    this.taskList =[];
};


PxerThreadManager.prototype['init'] =function(taskList){
    if(! this.taskList.every(request=>request instanceof PxerRequest)){
        this.dispatch('error' ,'PxerThreadManager.init: taskList is illegal');
        return false;
    }


    // 初始任务与结果
    this.taskList=taskList;
    this.failList =[];
    this.resultSet=[];
    this.runtime ={};

    // 建立线程对象
    this.threads =[];
    for(let i=0 ;i<this.config.thread ;i++){
        this.threads.push(new PxerThread({
            id:i,
            config:{
                timeout :this.config.timeout,
                retry :this.config.retry,
            },
            task:null,
        }));
    };

    return this;
};
PxerThreadManager.prototype['run'] =function(){
    if(this.taskList.length ===0){
        this.dispatch('warn','PxerApp#run: taskList.length is 0');
        this.dispatch('load',[]);
        return false;
    };



    for(let thread of this.threads){
        let task =this.taskList.shift();
        if(!task) break;

        thread.on('load' ,data=>{
            this.resultSet.push(data);
            next(this,thread);
        });
        thread.on('fail' ,(...argn)=>{
            console.log('thread fail');
            this.dispatch('fail',...argn);
            next(this,thread);
        });
        thread.on('error' ,this.dispatch.bind(this ,'error'));
        thread.init(task);
        thread.run();
    };

    function next(ptm ,thread){
        var task =ptm.taskList.shift();
        if(task){
            thread.init(task);
            setTimeout(thread.run.bind(thread));
        }else if(ptm.threads.every(thread=>['free','timeout'].indexOf(thread.state)!==-1)){
            ptm.dispatch('load' ,ptm.resultSet);
        };
    }

};











// 测试代码

// var ptm =new PxerThreadManager({
//     timeout:3000,
//     retry:2,
//     thread:2,
// })
//
// ptm.run([
//     new PxerWorksRequest({
//         url:[
//             'sleep.js.php?sleep=1',
//             'sleep.js.php?sleep=2',
//         ]
//     }),
//     new PxerWorksRequest({
//         url:[
//             'sleep.css.php?sleep=3&bg=green',
//             'sleep.css.php?sleep=5&bg=red',
//         ]
//     }),
//     new PxerWorksRequest({
//         url:[
//             'sleep.css.php?sleep=3&bg=green',
//             'sleep.js.php?sleep=1',
//             'sleep.js.php?sleep=2',
//             'sleep.css.php?sleep=5&bg=red',
//         ]
//     }),
// ])
//
// ptm.on('load' ,data=>console.log(data));


// 测试代码
// var taskList =[{"url":["/member_illust.php?mode=medium&illust_id=59070428"],"html":{},"type":"ugoira","isMultiple":false,"id":"59070428"},{"url":["/member_illust.php?mode=medium&illust_id=57532250"],"html":{},"type":"ugoira","isMultiple":false,"id":"57532250"},{"url":["/member_illust.php?mode=medium&illust_id=57532237"],"html":{},"type":"ugoira","isMultiple":false,"id":"57532237"},{"url":["/member_illust.php?mode=medium&illust_id=57507348"],"html":{},"type":"illust","isMultiple":false,"id":"57507348"},{"url":["/member_illust.php?mode=medium&illust_id=57506863","/member_illust.php?mode=manga&illust_id=57506863","/member_illust.php?mode=manga_big&page=0&illust_id=57506863"],"html":{},"type":"manga","isMultiple":true,"id":"57506863"},{"url":["/member_illust.php?mode=medium&illust_id=57506780","/member_illust.php?mode=manga&illust_id=57506780","/member_illust.php?mode=manga_big&page=0&illust_id=57506780"],"html":{},"type":"illust","isMultiple":true,"id":"57506780"},{"url":["http://www.pixiv.net/member_illust.php?mode=medium&illust_id=57506727"],"html":{},"type":"manga","isMultiple":false,"id":"57506727"},{"url":["/member_illust.php?mode=medium&illust_id=53413990","/member_illust.php?mode=manga&illust_id=53413990","/member_illust.php?mode=manga_big&page=0&illust_id=53413990"],"html":{},"type":"illust","isMultiple":true,"id":"53413990"},{"url":["/member_illust.php?mode=medium&illust_id=43717780"],"html":{},"type":"illust","isMultiple":false,"id":"43717780"}]
// .map(task=>new PxerWorksRequest(task));
//
// var ptm =new PxerThreadManager({
//     timeout:6000,
//     retry:2,
//     thread:2,
// });
//
// ptm.run(taskList);
// ptm.on('load' ,data=>console.log(data));










'use strict';

class PxerApp extends PxerEvent{
    constructor(){
        /**
         * 绑定的标签事件，提供给UI的API，有以下事件：
         * - stop 被强行终止
         * - hasNoTask 读取不到任何任务
         * - timerRunning 每秒被调用1次，记录pxer运行时间
         * - finishTask 完成所有任务
         * - executeIllustParseTask 开始执行作品队列
         * - executePageParseTask 开始遍历所有页面获取作品队列
         * - upDateConfigFromPredefine 通过预定义的window.predefinePxerConfig修改参数
         * - upDateConfigFromMethod 通过提供的Pxer::upDateConfig修改参数
         * - upDateConfig 更新参数
         * - analyzePage 分析页面信息完成
         * */
        super([
            'executeWroksTask','executePageTask',
            'finishWorksTask','finishPageTask',
            'error','stop',
        ]);

        /**
         * 当前页面类型。可能的值
         * - member 个人资料页
         * - member_illust 作品列表页
         * - search 搜索页
         * - bookmark 收藏页
         * - medium 作品详情查看
         * */
        this.pageType =PxerApp.getPageType();
        /*!页面的作品数量*/
        this.worksNum =PxerApp.getWorksNum();


        /**
         * 任务队列
         * @type {PxerRequest[]}
         * */
        this.taskList=[];
        /**
         * 失败的任务信息
         * @type {PxerFailInfo[]}
         * */
        this.failList=[];
        /**
         * 抓取到的结果集
         * @type {PxerWorks[]}
         * */
        this.resultSet=[];
        /**
         * 过滤得到的结果集
         * @type {PxerWorks[]}
         * */
        this.filterResult=[];

        // 配置参数
        this.ptmConfig ={//PxerThreadManager
            timeout:5000,
            retry:3,
            thread:8,
        };
        this.ppConfig =PxerPrinter.defaultConfig();//PxerPrinter
        this.pfConfig =PxerFilter.defaultConfig();//PxerFilter

        // 使用的PxerThreadManager实例
        this.ptm =null;


    };

    stop(){
        this.dispatch('stop');
        this.ptm.stop();
    };
    initPageTask(){
        if(typeof this.pageType !=='string' || typeof this.worksNum!=='number'){
            this.dispatch('error','PxerApp.initPageTask: pageType or number illegal');
            return false;
        };

        var separator =/\?/.test(document.URL)?"&":"?";
        for(var i=0 ;i<Math.ceil(this.worksNum/20) ;i++){
            this.taskList.push(new PxerPageRequest({
                url:document.URL+separator+"p="+(i+1),
            }));
        };
    };
    executePageTask(){
        if(this.taskList.length ===0){
            this.dispatch('error','PxerApp.executePageTask: taskList is empty');
            return false;
        };
        if(! this.taskList.every(request=>request instanceof PxerPageRequest)){
            this.dispatch('error' ,'PxerApp.executePageTask: taskList is illegal');
            return false;
        };

        this.dispatch('executePageTask');

        var ptm =this.ptm =new PxerThreadManager(this.ptmConfig);
        ptm.on('load',(resultSet)=>{
            var parseResult =[];
            for(let result of resultSet){
                // @@ 容错处理
                parseResult.push(...PxerHtmlParser.parsePage(result));
            };
            this.resultSet.push(...parseResult);
            this.dispatch('finishPageTask' ,parseResult);
        });
        ptm.on('fail',({task})=>{
            ptm.taskList.push(task);
        });
        ptm.on('error',this.dispatch.bind(this,'error'));
        ptm.on('warn',this.dispatch.bind(this,'error'));
        ptm.init(this.taskList);
        ptm.run();

    };
    executeWroksTask(){
        if(this.taskList.length ===0){
            this.dispatch('error','PxerApp.executeWroksTask: taskList is empty');
            return false;
        };
        if(! this.taskList.every(request=>request instanceof PxerWorksRequest)){
            this.dispatch('error' ,'PxerApp.executeWroksTask: taskList is illegal');
            return false;
        };

        this.dispatch('executeWroksTask');

        var ptm =this.ptm =new PxerThreadManager(this.ptmConfig);
        ptm.on('load',(resultSet)=>{
            var parseResult =resultSet.map(item=>PxerHtmlParser.parseWorks(item));
            this.resultSet.push(...parseResult);
            this.dispatch('finishWorksTask' ,parseResult);
        });
        ptm.on('fail' ,pfi=>{
            console.log('ptm fail');
            this.failList.push(pfi);
        });
        ptm.init(this.taskList);
        ptm.run();

        return true;

    };
    switchPage2Works(len=this.resultSet.length){
        this.taskList =this.resultSet.slice(0 ,len);
        this.resultSet =[];
    };
    switchFail2Task(list=this.failList){
        this.taskList =list.map(item=>item.task);
        if(list===this.failList)this.failList =[];
    };
    getWorksInfo(){
        var pp =new PxerPrinter(this.ppConfig);
        var pf =new PxerFilter(this.pfConfig);
        pp.fillTaskInfo(pf.filter(this.resultSet));
        return pp.taskInfo;
    };
    printWorks(){
        var pp =new PxerPrinter(this.ppConfig);
        var pf =new PxerFilter(this.pfConfig);
        var works =pf.filter(this.resultSet);
        pp.fillTaskInfo(works);
        pp.fillAddress(works);
        pp.print();
    };
};


PxerApp.prototype['getThis'] =function(){
    // 生成任务对象
    var pwr =PxerWorksRequest({
        isMultiple  :!!document.querySelector('.multiple ._icon-files'),
        id          :document.URL.match(/illust_id=(\d+)/)[1],
    });//[manga|ugoira|illust]
    if(!pwr.isMultiple){
        pwr.type =document.querySelector('.wrapper .original-image')?'illust':'manga';
    }else if(document.documentElement.innerHTML.indexOf('600x600.zip')!==-1){
        pwr.type ='ugoira';
    }else{
        pwr.type ='manga';
    }
    pwr.url =PxerHtmlParser.getUrlList(pwr);
    if(pwr.url.length ===1){
        pwr.html[pwr.url[0]]=document.documentElement.outerHTML;
        var pw =this.php.parseWorks(pwr);
        this.pp.countAddress([pw]);
        return '@@';
    }

    // h
    var pt =new PxerThread();
    pt.init(pwr);
    pt.run();
    pt.on('load',task=>{
        var php =new PxerHtmlParser();
        php.parseWorks(task);
    });

};

PxerApp.prototype["autoSwitch"]=function(){
    this.one('finishPageTask' ,()=>{
        this.taskList =this.php.parseAll(this.resultSet);
        this.resultSet =[];
        this.executeWroksTask();
    });

    this.one('finishWorksTask' ,()=>{
        this.pp.works =this.php.parseAll(this.resultSet);
        this.taskList =[];
    });

};
PxerApp.prototype["queryExecute"]=function(){
    this.autoSwitch();
    this.one('finishWorksTask' ,()=>{
        this.pp.queryPrint();
    });
    this.executePageTask();
};





PxerApp.version ='6.1.4';
PxerApp.getWorksNum =function(dom=document){
    var elt =dom.querySelector(".count-badge");
    if(!elt) return null;
    return parseInt(elt.innerHTML);
};
PxerApp.getPageType =function(dom=document){
    var typeAnalyzer={
        "member"        :function(url){
            return /member\.php/.test(url);
        },
        "member_illust" :function(url){
            return /member_illust\.php/.test(url);
        },
        "search"        :function(url){
            return /search\.php/.test(url);
        },
        "bookmark"      :function(url){
            return /bookmark\.php/.test(url);
        },
        "illust_medium" :function(url){
            return /member_illust\.php/.test(url)
                && /illust_id/.test(url)
                ;
        }
    };
    for(var key in typeAnalyzer){
        if(typeAnalyzer[key](dom.URL)){
            return key;
        }
    }
    return null
};

