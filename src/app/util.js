'use strict';

pxer.util = pxer.util || {};

// 全局函数
pxer.util.blinkTitle =function(addMsg ,spaceMsg){
    var addMsg =addMsg ||'[ ＯＫ ] ';
    var spaceMsg =spaceMsg ||'[ 　　 ] ';
    var timer =setInterval(()=>{
        if(document.title.indexOf(addMsg) !==-1){
            document.title =document.title.replace(addMsg ,spaceMsg);
        }else if(document.title.indexOf(spaceMsg) !==-1){
            document.title =document.title.replace(spaceMsg ,addMsg);
        }else{
            document.title =addMsg+document.title;
        };
    },500);
    window.addEventListener('mousemove' ,function _self(){
        window.addEventListener('mousemove' ,_self);
        clearInterval(timer);
        document.title =document.title.replace(spaceMsg ,"").replace(addMsg ,"");
    });
};
pxer.util.parseURL =function(url=document.URL){
    var arr  =url.match(/^(?:(https?):)?\/\/([\w_\d.:\-]+?)((?:\/[^\/?]*)*)\/?(?:\?(.+))?$/);
    var data ={
        protocol:arr[1],
        domain:arr[2],
        path:arr[3],
        query:arr[4],
    };
    if(data.query && data.query.indexOf('=')!==-1){
        data.query ={};
        for(let item of arr[4].split('&')){
            let tmp =item.split('=');
            data.query[tmp[0]]=tmp[1];
        };
    }
    return data;
};
pxer.util.createScript =function(url){
    if(!/^(https?:)?\/\//.test(url))url =window['PXER_URL']+url;
    var elt =document.createElement('script');
    elt.charset='utf-8';
    return function(resolve,reject){
        elt.addEventListener('load',resolve);
        elt.addEventListener('load',function(){
            if(window['PXER_MODE']==='dev') console.log('Loaded '+url);
        });
        elt.addEventListener('error',reject);
        elt.src =url;
        document.documentElement.appendChild(elt);
        return elt;
    };
};
pxer.util.createResource =function(url){
    if(!/^(https?:)?\/\//.test(url))url =window['PXER_URL']+url;
    let fx =url.match(/\.([^\.]+?)$/)[1];
    let elt =document.createElement('link');
    switch(fx){
        case 'css':
            elt.rel ='stylesheet';
            break;
        case 'ico':
            elt.rel ='shortcut icon';
            elt.type ='image/x-icon';
            break;
        default:
            throw new Error(`unknown filename extension "${fx}"`)
    }
    return function(resolve,reject){
        elt.href =url;
        document.documentElement.appendChild(elt);
        if(window['PXER_MODE']==='dev') console.log('Linked '+url);
        resolve();
    };
};
pxer.util.execPromise =function(taskList,call){
    var promise =Promise.resolve();
    if(Array.isArray(taskList)&&Array.isArray(taskList[0])){
        for(let array of taskList){
            promise =promise.then(()=>Promise.all(array.map(item=>new Promise(call(item)))));
        }
    }else if(Array.isArray(taskList)){
        for(let item of taskList){
            promise =promise.then(()=>new Promise(call(item)));
        }
    }else{
        promise =promise.then(()=>new Promise(call(taskList)));
    };
    return promise;
};

/**
 * 当前页面类型。可能的值
 * - bookmark_user  自己/其他人关注的用户列表
 * - bookmark_works 自己/其他人收藏的作品
 * - member_info    自己/其他人的主页
 * - works_medium   查看某个作品
 * - works_manga    查看某个多张作品的多张页
 * - works_big      查看某个作品的某张图片的大图
 * - member_works   自己/其他人作品列表页
 * - search         检索页
 * - index          首页
 * - discovery      探索
 * - rank           排行榜
 * - bookmark_new   关注的新作品
 * - unknown        未知
 * @param {Document} doc
 * @return {string} - 页面类型
 * */
pxer.util.getPageType =function(doc = document){
    const url = doc.URL;
    var URLData = pxer.util.parseURL(url);

    switch (true) {
        case pxer.regexp.urlWorkDetail.test(URLData.path): return 'works_medium';
    }


    var type =null;
    var isnew =!(Boolean(document.querySelector(".count-badge"))||Boolean(document.querySelector(".profile")));
    if(URLData.domain !=='www.pixiv.net')return 'unknown';

    if (pxer.regexp.isBookmarksUrl.test(URLData.path)) {
        type = 'bookmark_works'
    } else if (URLData.path.startsWith('/users/')) {
        type = 'member_works_new'
    } else if (URLData.path.startsWith('/tags/')) {
        type = 'search_tag'
    } else if(URLData.path==='/bookmark.php'){
        if(URLData.query &&URLData.query.type){
            switch(URLData.query.type){
                case 'user':
                    type ='bookmark_user';
                    break;
                default:
                    type ='unknown';
            };
        }else{
            type ='bookmark_works';
        }
    }else if(URLData.path==='/bookmark_new_illust.php'){
        type ='bookmark_new';
    }else if(URLData.path==='/member.php'){
        type =isnew?'member_works_new':"member_info";
    }else if(URLData.path==='/ranking.php'){
        type ='rank';
    }else if(URLData.path==='/member_illust.php'){
        if(URLData.query&&URLData.query.mode){
            switch(URLData.query.mode){
                case 'medium':
                    type ='works_medium';
                    break;
                case 'manga':
                    type ='works_manga';
                    break;
                case 'manga_big':
                    type ='works_big';
                    break;
                default:
                    type ='unknown';
            };
        }else{
            type =isnew?'member_works_new':"member_works";
        }
    }else if(URLData.path==='/search.php'){
        // TODO: Not all of search is carried in SPA
        //       But new version seems batter?
        type ='search_spa';
    }else if(URLData.path==='/discovery'){
        type ='discovery';
    }else if(URLData.path==='/'){
        type ='index';
    }else{
        type ='unknown';
    }
    return type;
};
/**
 * 查询对应页面类型每页作品数量
 * @param {string} type - 作品类型
 * @return {number} - 每页作品数
 */
pxer.util.getOnePageWorkCount =function(type) {
    switch (type) {
        case "search_spa":return 48
        case "search_tag":return 60
        case "search":return 40
        case "rank":return 50
        case "discovery":return 3000
        case "bookmark_works":return 48
        case "bookmark_new":return 60
        case "member_works_new": return Number.MAX_SAFE_INTEGER
        default:return 20
    };
}
pxer.util.getIDfromURL =function(key='id', url=document.URL) {
    const urlInfo = new URL(url, document.URL);
    var query = urlInfo.search;
    var params = new URLSearchParams(query);

    const result = params.get(key);

    if (result) return result;

    // read id from url
    const matchResult = url.match(/\d{4,}/);

    return matchResult ? matchResult[0] : null;
};
pxer.util.fetchPixivApi = async function(url) {
    return (
        await (
            await fetch(
                url,
                { credentials: 'include' },
            )
        ).json()
    ).body;
};

Object.assign(window, pxer.util);