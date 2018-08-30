'use strict';

enum PxerMode {
    dev = "dev",
    master = "master",
}

enum PxerWorkType {
    Illust = "illust",
    Manga = "manga",
    Ugoira = "ugoira",
    Unknown = "unknown",
}
enum PxerPageType {
    bookmark_works =  'bookmark_works',
    member_works =  'member_works',
    search = 'search',
    works_medium = 'works_medium',
    bookmark_new = 'bookmark_new',
    bookmark_user = 'bookmark_user',
    rank = 'rank',
    discovery = 'discovery',
    unknown = "unknown",
    index = "index",
    works_manga = "works_manga",
    works_big = "works_big",
    member_info = "member_info",

}

/**
 * Pxer任务队列中的任务对象
 * @constructor
 * @abstract
 * */
class PxerRequest{
    public url : string[];
    public html: {[url: string]:string};
    public completed: boolean;
    constructor(url: string[], html:{[url: string]:string}){
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
    constructor(url: string[], html:{[url: string]:string}, public type: PxerPageType){
        super(url, html);
    }
}
/**
 * 作品任务对象
 * @constructor
 * @extends {PxerRequest}
 * */
class PxerWorksRequest extends PxerRequest{
    //constructor({url=[] ,html={} ,type ,isMultiple ,id}={}){
    public id: string;
    constructor(public url: string[], public html: {[url: string]:string}, id: string){
        super(url ,html);
        this.id =id;
    }
}


enum PxerFailType {
    parse = "parse",
    urlempty = "empty",
    timeout = "timeout",
    mypixiv = "mypixiv",
    r18 = "r-18",
    r18g = "r-18g",
    HTTPCode = "httpcode",
}
class PxerFailInfo{
    constructor(public url:string, public type:PxerFailType, public task:PxerRequest, public msg:string){
    }
}

export {PxerMode, PxerWorkType, PxerPageType, PxerRequest, PxerPageRequest, PxerWorksRequest, PxerFailType, PxerFailInfo}
