function PxerPrint(pxer){
    /*!对pxer对象的引用**/
    this.pxer =pxer;
    /*!全部的作品集合*/
    this.dataSet;
    /*!过滤后得到的作品集合*/
    this.passWorks =new Array();

    /*!计算得到的下载地址*/
    this.address =new Array();
    /*!动图参数*/
    this.ugoira_frames =new Object();

    /*!输出配置信息*/
    this.config ={
        "manga_single"  :"600p",//[max|600p|no]
        "manga_medium"  :"max",//[max|1200p|cover_600p|no]
        "illust_single" :"max",//[max|600p|no]
        "illust_medium" :"max",//[max|1200p|cover_600p|no]
        "ugoira_zip"    :"no",//[max|600p|no]
        "ugoira_frames" :"no",//[yes|no]
        "task_inf"      :"yes",//[yes|no]
    };
    /*!过滤配置信息*/
    this.filter ={
        "score"     :0,
        "bookmark"  :0,
        "yes_and_tag"   :new Array(),
        "yes_or_tag"    :new Array(),
        "no_and_tag"    :new Array(),
        "ne_or_tag"     :new Array(),
        "tagExp"    :null, //new RegExp()
        "callback"  :null,//new Function()
    };
};
PxerPrint.prototype ={
    /*!过滤dataSet填充passWorks。注意，过滤仅读取filter参数*/
    "sieve" :function(){},
    /*!输出信息*/
    "print" :function(){},
    /*!计算passWorks中的下载地址。注意，计算仅读取config参数*/
    "countAddress" :function(){},

    /*!更新Config*/
    "changeConfig" :function(con){},
    /*!更新Filter*/
    "changeFilter" :function(fil){},


    /*!渲染下载地址的模板*/
    "_addressTemplate" :new Object(),
    /*!通过作品和模板渲染下载地址*/
    "_renderer" :function(){},
    /*!检查过滤器是否为空*/
    "_filterIsEmpty" :function(){},

    /*!作品信息过滤器*/
    "_scoreSieve"   :function(works){return true},
    /*!匹配标签过滤器*/
    "_tagSieve"     :function(works){return true},
    /*!不匹配标签过滤器*/
    "_unTagSieve"   :function(works){return true},
    /*!标签表达式过滤器*/
    "_tagExpSieve"  :function(works){return true},
    /*!回调函数过滤器*/
    "_callbackSieve":function(works){return true},
};


PxerPrint.prototype["sieve"] =function(){
    /*!检查过滤器是否为空*/
    if(this._filterIsEmpty()){
        this.passWorks =this.dataSet;
        return true;
    };

    /*!遍历获取符合要求的作品*/
    this.passWorks=new Array();
    for(var i=0 ;i<this.dataSet.length ;i++){
        if(!this._scoreSieve(this.dataSet[i]))   continue;
        if(!this._tagSieve(this.dataSet[i]))     continue;
        if(!this._unTagSieve(this.dataSet[i]))   continue;
        if(!this._tagExpSieve(this.dataSet[i]))  continue;
        if(!this._callbackSieve(this.dataSet[i]))continue;
        this.passWorks.push(this.dataSet[i]);
    };
};
PxerPrint.prototype["print"] =function(){
    /*!判断输出动图参数*/
    if(this.config['ugoira_frames'] ==="yes"){
        var win =window.open();
        win.document.write("/*! 这个页面是动图压缩包的动画参数，目前pxer还无法将动图压缩包打包成GIF，请寻找其他第三方软件 */\n<br /><br />");

        var frames =JSON.stringify(this.ugoira_frames ,null ,4);
        win.document.write("<pre>\n"+frames+"\n</pre>");
    };

    /*!输出下载地址*/
    var win =window.open();
    if(this.config.task_inf ==="yes"){
        win.document.write(_task_inf(this.pxer)+"<br /><br />");
    };
    win.document.write(this.address.join("<br />"));

    function _task_inf(pxer){
        return '';
    };
};
PxerPrint.prototype["countAddress"] =function(){
    this.address =new Array();
    for(var i=0 ;i<this.passWorks.length ;i++){
        /*!获取要渲染的下载地址模板*/
        var tpl =null;
        if(this.passWorks[i] instanceof UgoiraWorks){
            tpl =this._addressTemplate.zip[ this.config['ugoira_zip'] ];
            this.ugoira_frames[this.passWorks[i].id] =this.passWorks[i].frames;
        }else if(this.passWorks[i] instanceof IllustWorks){
            if(this.passWorks[i].multiple >1){
                tpl =this._addressTemplate.ids[ this.config['illust_medium'] ];
            }else{
                tpl =this._addressTemplate.pic[ this.config['illust_single'] ];
            };
        }else if(this.passWorks[i] instanceof MangaWorks){
            if(this.passWorks[i].multiple >1){
                tpl =this._addressTemplate.ids[ this.config['manga_medium'] ];
            }else{
                if(this.pxer.config.singleMangaMode !=="ignore"){
                    tpl =this._addressTemplate.pic[ this.config['manga_single'] ];
                };
            };
        }else{
            this.fail("can not count address" ,this.passWorks[i]);
            continue;
        };

        /*!渲染填充地址*/
        var ars =this._renderer(this.passWorks[i] ,tpl);
        if(ars) this.address =this.address.concat(ars)
    };
};

PxerPrint.prototype["changeConfig"] =function(con){
    for(var key in con){
        if(key in this.config) this.config[key]=con[key];
    };
};
PxerPrint.prototype["changeFilter"] =function(fil){
    for(var key in fil){
        if(key in this.config) this.config[key]=fil[key];
    };
};

PxerPrint.prototype["_addressTemplate"] ={
    'pic':{
        "max"   :"http://#server#.pixiv.net/img-original/img/#date#/#workid#_p0.#fx#",
        "600p"  :"http://#server#.pixiv.net/c/600x600/img-master/img/#date#/#workid#_p0_master1200.jpg",
    },
    'ids':{
        "max"        :"http://#server#.pixiv.net/img-original/img/#date#/#workid#_p#picnum#.#fx#",
        "1200p"      :"http://#server#.pixiv.net/c/1200x1200/img-master/img/#date#/#workid#_p#picnum#_master1200.jpg",
        "cover_600p" :"http://#server#.pixiv.net/c/600x600/img-master/img/#date#/#workid#_p0_master1200.jpg",
    },
    'zip':{
        "max"   :"http://#server#.pixiv.net/img-zip-ugoira/img/#date#/#workid#_ugoira1920x1080.zip",
        "600p"  :"http://#server#.pixiv.net/img-zip-ugoira/img/#date#/#workid#_ugoira600x600.zip",
    }
};
PxerPrint.prototype["_renderer"] =function(works ,tpl){
    if(!tpl) return null;

    var address=tpl
        .replace("#fx#"     ,works.fileFormat)
        .replace("#workid#" ,works.id)
        .replace("#date#"   ,works.date.join("/"))
        .replace("#server#" ,works.server)
    ;

    if(works.multiple>1 && /#picnum#/.test(tpl)){
        var address_arr =new Array();
        for(var i=0 ;i<works.multiple ;i++){
            address_arr.push( address.replace("#picnum#" ,i) );
        };
        return address_arr;
    }else{
        return address;
    };
};
PxerPrint.prototype["_filterIsEmpty"] =function(){
    return !this.filter.tagExp
        && !this.filter.score
        && !this.filter.bookmark
        && !this.filter.callback
        && this.filter["yes_and_tag"].length ===0
        && this.filter["yes_or_tag"].length ===0
        && this.filter["no_and_tag"].length ===0
        && this.filter["ne_or_tag"].length ===0
    ;
}

PxerPrint.prototype["_scoreSieve"] =function(works){
    if( (works.scoreCount<this.filter.score) || (works.bookmarkCount<this.filter.bookmark) ){
        return false;
    }else{
        return true;
    };
};


