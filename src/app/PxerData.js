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
        this.completed =false;
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
        this.type = argn[0].type;
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
    }
}


/**
 * 作品任务对象
 * @constructor
 * @extends {PxerRequest}
 * */
class PxerFailInfo{
    constructor({url,type,task}={}){
        this.url  =url;
        this.type =type;
        this.task =task;
    }
}



/**
 * 抓取到的作品对象
 * @constructor
 * */
class PxerWorks{
    constructor({id ,type ,date ,domain ,tagList ,viewCount ,ratedCount ,fileFormat}={},strict=true){
        /**作品ID*/
        this.id =id;
        /**
         * 投稿日期，格式：Y/m/d/h/m/s
         * @type {string}
         * */
        this.date =date;
        this.type =type;//[manga|ugoira|illust]
        /**作品存放的域名*/
        this.domain =domain;
        /**
         * 作品标签列表
         * @type {Array}
         * */
        this.tagList =tagList;
        /**作品被浏览的次数*/
        this.viewCount =viewCount;
        /**作品被赞的次数*/
        this.ratedCount =ratedCount;
        /**作品的图片文件扩展名*/
        this.fileFormat =fileFormat;
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
        /**作品的图片张数*/
        this.multiple =data.multiple;
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
        /**动图动画参数*/
        this.frames =data.frames;
    }
};
