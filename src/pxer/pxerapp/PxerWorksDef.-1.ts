import {PxerMode, PxerWorkType, PxerPageType, PxerRequest, PxerPageRequest, PxerWorksRequest, PxerFailType, PxerFailInfo} from './PxerData.-1'
interface PxerWorkUrl {
    original :string,
    regular :string,
    thumb :string,
    mini :string,
    small :string,
}
interface PxerUgoiraWorksUrl extends PxerWorkUrl {
    ugoira_600p :string,
    ugoira_master :string,
}
interface IPxerWorks {
    id:string,
    type:PxerWorkType,
    date:Date,
    domain:string,
    tagList:string[],
    viewCount:number,
    ratedCount:number,
    likeCount:number,
    fileFormat:string,
    urls: PxerWorkUrl,
    title: string
}
interface IPxerSingleWorks extends IPxerWorks {

}
interface IPxerMultipleWorks extends IPxerWorks {
    multiple: number,
}
interface IPxerUgoiraFrameData {
    readonly width: number,
    readonly height: number,
    readonly framedef: {delay: number,file:string}[],
}
interface IPxerUgoiraWorks extends IPxerWorks{
    readonly frames: IPxerUgoiraFrameData,
}

abstract class PxerWorks implements IPxerWorks {
    public readonly id:string;
    public readonly type:PxerWorkType;
    public readonly date:Date;
    public readonly domain:string;
    public readonly tagList:string[];
    public readonly viewCount:number;
    public readonly ratedCount:number;
    public readonly likeCount:number;
    public readonly multiple:number = 1;
    public readonly fileFormat:string;
    public readonly title:string;
    public readonly isMultiple:boolean = false;
    public urls:PxerWorkUrl
    constructor(data: IPxerWorks){
        this.id = data.id;
        this.type = data.type;
        this.date = data.date;
        this.domain = data.domain;
        this.tagList = data.tagList;
        this.viewCount = data.viewCount;
        this.ratedCount = data.ratedCount;
        this.fileFormat = data.fileFormat;
        this.likeCount = data.likeCount;
        this.urls = data.urls;
        this.title = data.title;
    }
}

/**
 * 抓取到的作品对象
 * @constructor
 * */
class PxerSingleWorks extends PxerWorks implements IPxerWorks {
    public readonly isMultiple:boolean = false;
    constructor(data: IPxerWorks){
        super(data);
    }
}
/**
 * 抓取到的多张插画/漫画作品对象
 * @extends {PxerWorks}
 * @constructor
 * */
class PxerMultipleWorks extends PxerWorks implements IPxerMultipleWorks{
    public readonly isMultiple = true;
    multiple: number;
    constructor(data : IPxerMultipleWorks){
        super(data);
        /**作品的图片张数*/
        this.multiple =data.multiple;
    }
};
/**
 * 抓取到的动图作品对象
 * @extends {PxerWorks}
 * @constructor
 * */
class PxerUgoiraWorks extends PxerWorks implements IPxerUgoiraWorks{
    public readonly frames : IPxerUgoiraFrameData
    constructor(data: IPxerUgoiraWorks){
        super(data);
        /**动图动画参数*/
        this.frames =data.frames;
    }
};

export {IPxerWorks, IPxerSingleWorks, IPxerMultipleWorks, IPxerUgoiraWorks, IPxerUgoiraFrameData, PxerWorks, PxerSingleWorks, PxerMultipleWorks, PxerUgoiraWorks, PxerWorkUrl, PxerUgoiraWorksUrl}