/*{
  "illustId": "67394923",
  "illustTitle": "miku 吃",
  "illustType": "0",
  "url": "https://i.pximg.net/c/240x240/img-master/img/2018/02/22/01/40/13/67394923_p0_master1200.jpg",
  "tags": [
    "女の子",
    "VOCALOID",
    "初音ミク",
    "miku",
    "VOCALOID10000users入り",
    "デフォルメ"
  ],
  "userId": "7210261",
  "userName": "千夜QYS3",
  "userImage": "https://i.pximg.net/user-profile/img/2017/11/28/00/46/09/13503196_920df8e84e4d1061e4dcdbc9ce9a4f7b_50.png",
  "isBookmarkable": true,
  "isBookmarked": false,
  "width": 1000,
  "height": 1607,
  "pageCount": 1,
  "bookmarkCount": 22722,
  "responseCount": 0
}*/
interface RawIllustData{
    height:number;
    width:number;

    illustId:string;
    illustTitle:string;
    url:string;
    illustType:IllustType;
    tags:string[];

    isBookmarkable:true;
    isBookmarked:false;
    bookmarkCount:number;

    pageCount:number;
    responseCount:number;

    userId:string;
    userImage:string;
    userName:string;
};
const enum IllustType{
    illust ='0',
    manga  ='1',
    ugoira ='2',
}
interface IPxerWorksRequest{
    url         :string[];
    html        :{[p:string]:string};
    type        :'manga'|'ugoira'|'illust';
    isMultiple  :boolean;
    id          :string;
}

declare type PxerHtmlParser =any;
declare var PxerHtmlParser:any;
declare type PxerWorksRequest =any;
declare var PxerWorksRequest:any;

namespace Patch{
    export function existIllustData(htmlString:string):boolean{
        return htmlString.indexOf('js-mount-point-search-result-list')!==-1;
    };
    export function getIllustDataList(htmlString:string):RawIllustData[]{
        return JSON.parse(
            htmlString
                .match(/<[^<>]+id="js-mount-point-search-result-list"[^<>]+>/im)![0]
                .match(/data-items="([^"]+)"/im)![1]
                .replace(/&quot;/g,'"')
        );
    };
    //JSON.stringify(JSON.parse(document.getElementById('js-mount-point-search-result-list').dataset.items)[0])

    export function rid2pwr(data:RawIllustData):IPxerWorksRequest{
        var illustTypeMap:{[p in IllustType]:'manga'|'ugoira'|'illust'} ={
            '0':'illust',
            '1':'manga',
            '2':'ugoira',
        };
        var pwr ={
            url         :[],
            html        :{},
            type        :illustTypeMap[data.illustType],
            isMultiple  :Number(data)>1,
            id          :data.illustId,
        };
        pwr.url =PxerHtmlParser.getUrlList(pwr);
        return new PxerWorksRequest(pwr);
    };
}
