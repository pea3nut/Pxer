'use strict';

/**
 * Pxer任务队列中的任务对象
 * @constructor
 * */
class PxerRequest{
    constructor({url ,html}){
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
    }
}
/**
 * 作品任务对象
 * @constructor
 * @extends {PxerRequest}
 * */
class PxerWorksRequest extends PxerRequest{
    constructor({url ,html ,type ,isMultiple ,id}){
        super({url ,html});
        this.type =type;//[manga|ugoira|illust]
        this.isMultiple =isMultiple;//[true|false]
        this.id =id;
    }
}



/**
 * 抓取到的作品对象
 * @constructor
 * */
class PxerWorks{
    constructor({id ,type ,date ,server ,tagList ,viewCount ,ratedCount ,scoreCount ,fileFormat}){
        /*!作品ID*/
        this.id =id;
        /**
         * 投稿日期，格式：[Y,m,d,h,m,s]
         * @type {Array}
         * */
        this.type =type;//[manga|ugoira|illust]
        this.date =date;
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

    }
}
/**
 * 抓取到的多张插画/漫画作品对象
 * @extends {PxerWorks}
 * @constructor
 * */
class PxerMultipleWorks extends PxerWorks{
    constructor(data){
        super(data);
        /*!作品的图片张数*/
        this.multiple =data.multiple;
    }
};
/**
 * 抓取到的动图作品对象
 * @extends {PxerWorks}
 * @constructor
 * */
class PxerUgoiraWorks extends PxerWorks{
    constructor(data){
        super(data);
        this.fileFormat='zip';
        /*!动图动画参数*/
        this.frames =data.frames;
    }
};


