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
