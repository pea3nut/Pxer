/**
 * 抓取到的作品对象
 * @constructor
 * */
function PxerWorks(){
    /*!作品ID*/
    this.id;
    /**
     * 投稿日期，格式：[Y,m,d,h,m,s]
     * @type {Array}
     * */
    this.date;
    /*!作品存放的P站服务器*/
    this.server;//i\d
    /**
     * 作品标签列表
     * @type {Array}
     * */
    this.tagList;
    /*!作品被浏览的次数*/
    this.viewCount;
    /*!作品被评价的次数*/
    this.ratedCount;
    /*!作品的总分*/
    this.scoreCount;
    /*!作品被收藏的次数*/
    this.bookmarkCount;
};

/**
 * 抓取到的插画作品对象
 * @extends {PxerWorks}
 * @constructor
 * */
function IllustWorks(){
    PxerWorks.call(this);
    /*!作品的图片文件扩展名*/
    this.fileFormat;//[jpg|gif|png]
    /*!作品的图片张数*/
    this.multiple;
};
IllustWorks.prototype =new PxerWorks();

/**
 * 抓取到的漫画作品对象
 * @extends {PxerWorks}
 * @constructor
 * */
function MangaWorks(){
    PxerWorks.call(this);
    /*!作品的图片文件扩展名*/
    this.fileFormat;//[jpg|gif|png]
    /*!作品的图片张数*/
    this.multiple;
};
MangaWorks.prototype =new PxerWorks();

/**
 * 抓取到的动图作品对象
 * @extends {PxerWorks}
 * @constructor
 * */
function UgoiraWorks(){
    PxerWorks.call(this);
    /*!动图动画参数*/
    this.frames;
};
UgoiraWorks.prototype =new PxerWorks();