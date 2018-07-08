'use strict';

class PxerHtmlParser{
    constructor(){
        throw new Error('PxerHtmlParse could not construct');
    };
};


/**
 * 解析页码任务对象
 * @param {PxerPageRequest} task - 抓取后的页码任务对象
 * @return {PxerWorksRequest[]|false} - 解析得到的作品任务对象
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

    // old method
    var taskList =[];
    
    var searchResult =dom.body.querySelector("input#js-mount-point-search-result-list");
    if (searchResult) {
        var searchData = JSON.parse(searchResult.getAttribute('data-items'));
        for (var searchItem of searchData) {
            var task =new PxerWorksRequest({
                html    :{},
                type    :searchItem.illustType==2?'ugoira'
                        :searchItem.illustType==1?'manga'
                        :'illust'
                        ,
                isMultiple  :searchItem.pageCount>1,
                id  :searchItem.illustId
            });
            task.url =PxerHtmlParser.getUrlList(task);
            
            taskList.push(task);
        };
    } else {
        var elts =dom.body.querySelectorAll('a.work._work');
    
        for(let elt of elts){
            var task =new PxerWorksRequest({
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
    }

    if ((elts.length ===0)&&(!searchResult)) {
        window['PXER_ERROR'] ='PxerHtmlParser.parsePage: result empty';
        return false;
    }

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
        try{
            switch (true){
                case url.indexOf('mode=medium')!==-1:
                    PxerHtmlParser.parseMediumHtml(data);
                    break;
                case url.indexOf('mode=manga')!==-1:
                    PxerHtmlParser.parseMangaHtml(data);
                    break;
                default:
                    return false;
                    window['PXER_ERROR'] =`PxerHtmlParser.parsePage: count not parse task url "${url}"`;
            };
        }catch(e){
            window['PXER_ERROR'] =`${task.id}:${e.message}`;
            if(window['PXER_MODE']==='dev')console.error(task ,e);
            return false;
        }
    };

    return pw;

};



/**
 * @param {PxerWorksRequest} task
 * @return {Array}
 * */
PxerHtmlParser.getUrlList =function(task){

        return ["https://www.pixiv.net/member_illust.php?mode=medium&illust_id="+task.id];

    };

PxerHtmlParser.parseMangaHtml =function({task,dom,url,pw}){
    pw.multiple =+(
        dom.body.querySelector('img[data-src]')
    ).innerHTML;
};
PxerHtmlParser.parseMediumHtml =function({task,dom,url,pw}){
    pw.id           =task.id;
    pw.type         =task.type;
    
    var illustData = dom.head.innerHTML.match(this.REGEXP['getInitData'])[0];
    illustData = illustData.replace(this.REGEXP['jsonify'][0][0], this.REGEXP['jsonify'][0][1]);
    illustData = illustData.replace(this.REGEXP['jsonify'][1][0], this.REGEXP['jsonify'][1][1]);
    illustData = JSON.parse(illustData).preload.illust[pw.id];

    pw.tagList = illustData.tags.tags.map(e=>e.tag);
    pw.viewCount = illustData.viewCount;
    pw.ratedCount = illustData.bookmarkCount;
    if (pw instanceof PxerMultipleWorks) {
        pw.multiple = illustData.pageCount;
    }
    
    
    if (pw.type ==="ugoira"){
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "https://www.pixiv.net/ajax/illust/"+ task.id + "/ugoira_meta", false);
            xhr.send();
            var meta = JSON.parse(xhr.responseText);
            let src = meta['body']['originalSrc'];
            console.log("Catch ugoira src="+src);
            let URLObj = parseURL(src);

            pw.domain = URLObj.domain;
            pw.date   =src.match(PxerHtmlParser.REGEXP['getDate'])[1];
            pw.frames =meta['frames'];
    } else {
            let src = illustData.urls.original;
            let URLObj = parseURL(src);

            pw.domain = URLObj.domain;
            pw.date = src.match(PxerHtmlParser.REGEXP['getDate'])[1];
            pw.fileFormat =src.match(/\.(jpg|gif|png)$/)[1];    
    };

};


PxerHtmlParser.REGEXP ={
    'getDate':/img\/((?:\d+\/){5}\d+)/,
    'getInitData':/(?<=\()\{token:.*\}(?=\);)/,
    'jsonify':[
        [/(\{\s*|,\s*)(\w+):/g,"$1\"$2\":"],
        [/,\s*\}/g,"}"]
    ]
};

PxerHtmlParser.HTMLParser =function(aHTMLString){
    var dom =document.implementation.createHTMLDocument('');
    dom.documentElement.innerHTML =aHTMLString;
    return dom;
};

/**@param {Element} img*/
PxerHtmlParser.getImageUrl =function(img){
    return img.getAttribute('src')||img.getAttribute('data-src');
};
