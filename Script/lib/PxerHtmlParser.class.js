
function PxerHtmlParser(config ,task ,html){
    this.config =config;
    this.task =task;
    this.html =html;
    this.dom =$(html);
};
PxerHtmlParser.prototype ={
    "parse" :function(){},
    "pageParse" :function(){},
    "illustParse" :function(){},
    "ugoiraParse" :function(){},

    "multipleMediumParse" :function(){},
    "multipleParse" :function(){},
    "multipleBigParse" :function(){},

    "_getTagList" :function(){},
    "_getViewConut" :function(){},
    "_getRatedConut" :function(){},
    "_getScoreConut" :function(){},

    "_getServer" :function(){},
    "_getDate" :function(){},
    "_getId" :function(){},
    "_getFileFormat" :function(){},

    "fail" :function(){},
};

PxerHtmlParser.prototype["getInformation"] =function(pi){
    pi.tagList =this._getTagList();
    pi.viewCount =this._getViewConut();
    pi.ratedCount =this._getRatedConut();
    pi.scoreCount =this._getScoreConut();
    pi.bookmarkCount =this._getBookmarkCount();
};
PxerHtmlParser.prototype["_getBookmarkCount"] =function(){
    var html =$(".bookmark-count").html();
    return parseInt(html.match(/\d+/)[0]);
};
PxerHtmlParser.prototype["_getTagList"] =function(){
    var tagList =new Array();
    this.dom.find(".tags-container a.text").html(function(index ,html){
        tagList.push(html);
    });
    return tagList;
};
PxerHtmlParser.prototype["_getViewConut"] =function(){
    return parseInt(this.dom.find(".score .view-count").html());
};
PxerHtmlParser.prototype["_getRatedConut"] =function(){
    return parseInt(this.dom.find(".score .rated-count").html());
};
PxerHtmlParser.prototype["_getScoreConut"] =function(){
    return parseInt(this.dom.find(".score .score-count").html());
};

PxerHtmlParser.prototype["_getServer"] =function(imgSrc){
    return "i"+imgSrc.match(/i(\d+)\.pixiv\.net/)[1];
};
PxerHtmlParser.prototype["_getDate"] =function(imgSrc){
    var str =imgSrc.match(/img\/((?:\d+\/){6})/)[1];
    var arr =str.split("/");
    arr.length =6;
    return arr;
};
PxerHtmlParser.prototype["_getId"] =function(imgSrc){
    if(!imgSrc){
        console.log(this);
        alert();
    };
    return imgSrc.match(/\/(\d+)_(?:p|ugoira)/)[1];
};
PxerHtmlParser.prototype["_getFileFormat"] =function(imgSrc){
    return imgSrc.match(/\.(jpg|gif|png)$/)[1];
};

PxerHtmlParser.prototype["ugoiraParse"] =function(){
    var works =new UgoiraWorks();
    this.getInformation(works);

    var data =getUgoiraData(this);
    works.frames =data.frames;
    works.id     =this._getId(data.src);
    works.server =this._getServer(data.src);
    works.date   =this._getDate(data.src);

    return works;

    function getUgoiraData(php){
        var script =php.dom.find("script:contains('zip')").html();
        var exp =/"src":"([^"<>]*?600x600\.zip)"[^<>]*?"frames":(\[.*?\])/mi;
        var arr =script.match(exp);
        console.log(arr);
        console.log(JSON.parse(arr[2]));
        return {
            "src":arr[1].replace(/\\/g,""),
            "frames":JSON.parse(arr[2])
        };
    };
};
PxerHtmlParser.prototype["illustParse"] =function(){
    var works =new IllustWorks();
    this.getInformation(works);

    var imgSrc =this.dom.find(".ui-modal-close-box img.original-image").attr("data-src");
    works.id        =this._getId(imgSrc);
    works.server    =this._getServer(imgSrc);
    works.date      =this._getDate(imgSrc);
    works.fileFormat=this._getFileFormat(imgSrc);
    return works;
};
PxerHtmlParser.prototype["singleMangaParse"] =function(){
    var works =new MangaWorks();
    this.getInformation(works);

    var imgSrc =this.dom.find("._layout-thumbnail img").attr("src");
    works.id =this._getId(imgSrc);
    works.server =this._getServer(imgSrc);
    works.date =this._getDate(imgSrc);
    return works;
};

PxerHtmlParser.prototype["multipleMultipleIllustParse"] =function(){
    var works =new IllustWorks();
    works.multiple =parseInt(this.dom.find(".page .total").html());
    return works;
};
PxerHtmlParser.prototype["multipleMediumIllustParse"] =function(){
    var works =new IllustWorks();
    this.getInformation(works);
    return works;
};
PxerHtmlParser.prototype["multipleBigIllustParse"] =function(){
    var imgSrc =this.dom.find("img").prop("src") ||this.dom.filter("img").prop("src");
    var works =new IllustWorks();
    works.id        =this._getId(imgSrc);
    works.server    =this._getServer(imgSrc);
    works.date      =this._getDate(imgSrc);
    works.fileFormat=this._getFileFormat(imgSrc);
    return works;
};

PxerHtmlParser.prototype["multipleMangaMangaParse"] =function(){
    var works =new MangaWorks();
    $.extend(works ,this.multipleMultipleIllustParse());
    return works;
};
PxerHtmlParser.prototype["multipleMediumMangaParse"] =function(){
    var works =new MangaWorks();
    $.extend(works ,this.multipleMediumIllustParse());
    return works;
};
PxerHtmlParser.prototype["multipleBigMangaParse"] =function(){
    var works =new MangaWorks();
    $.extend(works ,this.multipleBigIllustParse());
    return works;
};

PxerHtmlParser.prototype["pageParse"] =function(){
    var aElt =this.dom.find("a.work._work");
    var dataSet =Array();
    for(var i=0 ;i<aElt.length ;i++){
        var req =new IllustRequest();
        req.type        =getType(aElt.get(i));
        req.isMultiple  =getIsMultiple(aElt.get(i));
        req.id          =getId(aElt.get(i));
        req.url.list    =getUrlList(req ,this.config.singleMangaMode) ||this.fail("PxerHtmlParser::pageParse() getUrlList()" ,req);
        dataSet.push(req);
    };
    return dataSet;


    function getType(elt){
        var type="";
        elt =$(elt);
        switch(true){
            case elt.is(".ugoku-illust"):
                type="ugoira";
                break;
            case elt.is(".manga"):
                type="manga";
                break;
            default:
                type="illust";
                break;
        };
        return type;
    };
    function getIsMultiple(elt){
        if($(elt).is(".multiple")){
            return true;
        }else{
            return false;
        }
    };
    function getId(elt){
        return elt.href.match(/illust_id=(\d+)/)[1];
    };
    function getUrlList(req ,singleMangaMode){
        if(
            req.type ==="ugoira"
            ||(
                req.type ==="illust"
                && !req.isMultiple
            )
        ){
            return ["http://www.pixiv.net/member_illust.php?mode=medium&illust_id="+req.id];
        }else if(req.isMultiple){
            return [
                "http://www.pixiv.net/member_illust.php?mode=medium&illust_id="+req.id,
                "http://www.pixiv.net/member_illust.php?mode=manga&illust_id="+req.id,
                "http://www.pixiv.net/member_illust.php?mode=manga_big&page=0&illust_id="+req.id
            ];
        }else if(req.type ==="manga" && !req.isMultiple){
            switch(singleMangaMode){
                default:
                case "ignore":
                case "lower":
                case "fileFormat":
                    return ["http://www.pixiv.net/member_illust.php?mode=medium&illust_id="+req.id];
                case "server":
                    return [
                        "http://www.pixiv.net/member_illust.php?mode=medium&illust_id="+req.id,
                        "http://pxer.nutjs.com/singleManga/"+req.id
                    ];
            };
        }else{
            return false;
        };
    };
};

PxerHtmlParser.prototype["parse"] =function(){
    if(this.task instanceof PageRequest){
        return this.pageParse();
    }else if(this.task instanceof IllustRequest){
        switch(this.task.type){
            case "ugoira":
                return this.ugoiraParse();
            case "manga":
                if(this.task.isMultiple){
                    if(/mode=manga_big/.test(this.task.nowUrl())){
                        return this.multipleBigMangaParse();
                    }else if(/mode=medium/.test(this.task.nowUrl())){
                        return this.multipleMediumMangaParse();
                    }else if(/mode=manga($|[^_])/.test(this.task.nowUrl())){
                        return this.multipleMangaMangaParse();
                    }else{
                        this.fail("PxerHtmlParser::parse() manga-Multiple" ,this.task.nowUrl());
                        return;
                    };
                }else{
                    switch(this.config.singleMangaMode){
                        default:
                        case "fileFormat":
                        case "ignore":
                        case "lower":
                            return this.singleMangaParse();
                        case "server":
                            if(/singleManga/i.test(this.task.nowUrl())){
                                return this.multipleBigMangaParse();
                            }else if(/mode=medium($|[^_])/.test(this.task.nowUrl())){
                                return this.multipleMediumMangaParse();
                            }else{
                                this.fail("PxerHtmlParser::parse() manga-single" ,this.task.nowUrl());
                        return;
                            };
                    };
                };
            case "illust":
                if(this.task.isMultiple){
                    if(/mode=manga_big/.test(this.task.nowUrl())){
                        return this.multipleBigIllustParse();
                    }else if(/mode=medium/.test(this.task.nowUrl())){
                        return this.multipleMediumIllustParse();
                    }else if(/mode=manga($|[^_])/.test(this.task.nowUrl())){
                        return this.multipleMultipleIllustParse();
                    }else{
                        this.fail("PxerHtmlParser::parse() illust-Multiple" ,this.task.nowUrl());
                        return;
                    };
                }else{
                    return this.illustParse();
                };
        };
    }else{
        this.fail("PxerHtmlParser::task" ,this.task);
        return;
    };
};
