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
    var elts =null;
    if(URLData.path==='/search.php'){
        elts =dom.querySelectorAll('.column-search-result a.work._work');
    }else{
        elts =dom.querySelectorAll('a.work._work');
    }
    if(elts.length ===0){
        window['PXER_ERROR'] ='PxerHtmlParser.parsePage: a.work._work empty';
        return false;
    }



    var taskList =[];
    for(let elt of elts){
        let task =new PxerWorksRequest({
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
                case url.indexOf('mode=big')!==-1:
                case url.indexOf('mode=manga_big')!==-1:
                    PxerHtmlParser.parseMangaBigHtml(data);
                    break;
                case url.indexOf('mode=manga&')!==-1:
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
    if(
        task.type ==="ugoira"
        ||(
            task.type ==="illust"
            && !task.isMultiple
        )
    ){
        return ["http://www.pixiv.net/member_illust.php?mode=medium&illust_id="+task.id];
    }else if(task.isMultiple){
        return [
            "http://www.pixiv.net/member_illust.php?mode=medium&illust_id="+task.id,
            "http://www.pixiv.net/member_illust.php?mode=manga&illust_id="+task.id,
            "http://www.pixiv.net/member_illust.php?mode=manga_big&page=0&illust_id="+task.id
        ];
    }else if(task.type ==="manga" && !task.isMultiple){
        return [
            "http://www.pixiv.net/member_illust.php?mode=medium&illust_id="+task.id,
            "http://www.pixiv.net/member_illust.php?mode=big&illust_id="+task.id,
        ];
    }else{
        console.warn('miss task '+task.id);
        return [];
    };
};

PxerHtmlParser.parseMangaHtml =function({task,dom,url,pw}){
    pw.multiple =+(
        dom.querySelector('.page .total')
        || dom.querySelector('.position .total')
    ).innerHTML;
};
PxerHtmlParser.parseMangaBigHtml =function({task,dom,url,pw}){
    var src =dom.getElementsByTagName('img')[0].src;
    var URLObj =parseURL(src);
    pw.domain     =URLObj.domain;
    pw.date       =src.match(PxerHtmlParser.REGEXP['getDate'])[1];
    pw.fileFormat =src.match(/\.(jpg|gif|png)$/)[1];
};
PxerHtmlParser.parseMediumHtml =function({task,dom,url,pw}){
    pw.id           =task.id;
    pw.type         =task.type;
    pw.tagList      =[...dom.querySelectorAll(".tag a.text")].map(elt=>elt.innerHTML);
    pw.viewCount    =+dom.querySelector(".view-count").innerHTML;
    pw.ratedCount   =+dom.querySelector(".rated-count").innerHTML;
    pw.scoreCount   =+dom.querySelector(".score-count").innerHTML;

    if(task.type ==='ugoira'){
        let script =[...dom.querySelectorAll("script")]
                .filter(tag=>/zip/.test(tag.innerHTML))[0]
                .innerHTML
            ;
        let exp =/"src":"([^"<>]*?600x600\.zip)"[^<>]*?"frames":(\[.*?\])/mi;
        let arr =script.match(exp);
        let src =arr[1].replace(/\\\//g ,'\/');
        let URLObj =parseURL(src);

        pw.domain =URLObj.domain;
        pw.date   =src.match(PxerHtmlParser.REGEXP['getDate'])[1];
        pw.frames =JSON.parse(arr[2]);

    };

    if(task.type ==='illust' &&!task.isMultiple){
        let src =dom.querySelector(".ui-modal-close-box img.original-image").getAttribute("data-src");
        let URLObj =parseURL(src);
        pw.domain     =URLObj.domain;
        pw.date       =src.match(PxerHtmlParser.REGEXP['getDate'])[1];
        pw.fileFormat =src.match(/\.(jpg|gif|png)$/)[1];
    }

    if(task.type ==='manga' &&!task.isMultiple){
        let src =dom.querySelector("a._work.manga img").src;
        let URLObj =parseURL(src);
        pw.domain =URLObj.domain;
        pw.date   =src.match(PxerHtmlParser.REGEXP['getDate'])[1];
    }

};


PxerHtmlParser.REGEXP ={
    'getDate':/img\/((?:\d+\/){5}\d+)/,
};

PxerHtmlParser.HTMLParser =function(aHTMLString){
    var dom =document.implementation.createHTMLDocument('');
    dom.documentElement.innerHTML =aHTMLString;
    return dom.body;
};


