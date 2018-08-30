import {PxerMode, PxerWorkType, PxerPageType, PxerRequest, PxerPageRequest, PxerWorksRequest, PxerFailType, PxerFailInfo} from './PxerData.-1'
var parseURL =function(url :string) :PxerUrlData{
    var arr :RegExpMatchArray =<RegExpMatchArray>url.match(/^(?:(https?)\:)?\/\/([\w\_\.]+)((?:\/[^\/?]*)*)\/?(?:\?(.+))?$/);
    var data :PxerUrlData={
        protocol:arr[1],
        domain:arr[2],
        path:arr[3],
        query:arr[4],
    };
    if(data.query && (<string>data.query).indexOf('=')!==-1){
        data.query ={};
        for(let item of arr[4].split('&')){
            let tmp =item.split('=');
            data.query[tmp[0]]=tmp[1];
        };
    }
    return data;
}
var getPageType =function(url: string =document.URL) :PxerPageType{
    var URLData =parseURL(url);
    var type: PxerPageType;
    if(URLData.domain !=='www.pixiv.net')return PxerPageType.unknown;
    if(URLData.path==='/bookmark.php'){
        if(URLData.query &&(<PxerUrlQueryMap>URLData.query).type){
            switch((<PxerUrlQueryMap>URLData.query).type){
                case 'user':
                    type =PxerPageType.bookmark_user;
                    break;
                default:
                    type =PxerPageType.unknown;
            };
        }else{
            type =PxerPageType.bookmark_works;
        }
    }else if(URLData.path==='/bookmark_new_illust.php'){
        type =PxerPageType.bookmark_new;
    }else if(URLData.path==='/member.php'){
        type =PxerPageType.member_info;
    }else if(URLData.path==='/ranking.php'){
        type =PxerPageType.rank;
    }else if(URLData.path==='/member_illust.php'){
        if(URLData.query&&(<PxerUrlQueryMap>URLData.query).mode){
            switch((<PxerUrlQueryMap>URLData.query).mode){
                case 'medium':
                    type =PxerPageType.works_medium;
                    break;
                case 'manga':
                    type =PxerPageType.works_manga;
                    break;
                case 'manga_big':
                    type =PxerPageType.works_big;
                    break;
                default:
                    type =PxerPageType.unknown;
            };
        }else{
            type =PxerPageType.member_works;
        }
    }else if(URLData.path==='/search.php'){
        type =PxerPageType.search;
    }else if(URLData.path==='/discovery'){
        type =PxerPageType.discovery;
    }else if(URLData.path==='/'){
        type =PxerPageType.index;
    }else{
        type =PxerPageType.unknown;
    }
    return type;
}
export {parseURL, getPageType}