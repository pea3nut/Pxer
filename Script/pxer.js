/**
 * Pxer对象构造函数，UI开发仅需了解本构造方法即可
 * @constructor
 * @return {Pxer}
 * */
function Pxer(){
    /*!页面信息*/
    this.page={
        /**
         * 当前页面类型。可能的值
         * - member 个人资料页
         * - member_illust 个人作品页
         * - search 搜索页
         * - bookmark 收藏页
         * - medium 作品详情查看
         * */
        "type":new String(),
        /*!页面的作品数量*/
        "illust_number":0,
    };
    /*!运行配置参数*/
    this.config={
        /*同时发起的ajax数量*/
        "thread":4,
        /**
         * 对于单副漫画采取的策略
         * - lower 将max降级为600p输出
         * - server 通过第三方服务器中转抓取
         * - fileFormat 输出max时输出所有可能的文件扩展名
         * - ignore 直接跳过该作品
         * */
        "singleMangaMode":"lower",//[lower|server|fileFormat|ignore]
        /*!每个ajax超时时间*/
        "timeout":3,
        /*!每个ajax的最大重试次数*/
        "maxRetry":5,
        /*!输出配置参数*/
        "printConfig":{},
        /*!过滤配置参数*/
        "printFilter":{},
    };

    /*!程序运行的时间（秒）*/
    this.runTime=0;

    /*!抓取到的结果集*/
    this.resultSet=new Array(),
    /*!任务队列*/
    this.taskList=new Array(),


    /*!内置的输出器*/
    this.pp=new PxerPrint(this);
    /*!使用的PxerThreadManager对象*/
    this.ptm;

    /**
     * 绑定的标签事件，提供给UI的API，有以下事件：
     * - stop 被强行终止
     * - hasNoTask 读取不到任何任务
     * - timerRunning 每秒被调用1次，记录pxer运行时间
     * - finishTask 完成所有任务
     * - executeIllustParseTask 开始执行作品队列
     * - executePageParseTask 开始遍历所有页面获取作品队列
     * - upDateConfigFromPredefine 通过预定义的window.predefinePxerConfig修改参数
     * - upDateConfigFromMethod 通过提供的Pxer::upDateConfig修改参数
     * - upDateConfig 更新参数
     * - analyzePage 分析页面信息完成
     * */
    this._tagEvent ={};
    /*!内部计时器*/
    this._timer;

};
Pxer.prototype={
    /*!Pxer内核版本*/
    "version" :"5.0.1",
    /*!获取页面类型*/
    "getPageType":function(){},
    /*!分析页面信息*/
    "analyzePage":function(){},
    /*!更新配置*/
    "upDateConfig":function(newConfig){},
    /*!开始执行任务*/
    "executeTask":function(){},
    /*!完成任务后执行的回调函数*/
    "finishTask":function(resultSet){},
    /*!终止执行*/
    "stop":function(){},

    /**
     * 绑定标签事件，面向UI提供的API，使用方法和jQuery.on类似
     * @param {String} tagName 要绑定的标签名称，有以下标签：
     * - stop 被强行终止
     * - hasNoTask 读取不到任何任务
     * - timerRunning 每秒被调用1次，记录pxer运行时间
     * - finishTask 完成所有任务
     * - executeIllustParseTask 开始执行作品队列
     * - executePageParseTask 开始遍历所有页面获取作品队列
     * - upDateConfigFromPredefine 通过预定义的window.predefinePxerConfig修改参数
     * - upDateConfigFromMethod 通过提供的Pxer::upDateConfig修改参数
     * - upDateConfig 更新参数
     * - analyzePage 分析页面信息完成
     * @param {Function} fn 绑定的事件函数
     * */
    "on":function(tagName ,fn){},

    /*!程序内部标记标签*/
    "_tag":function(tagName){},
};


Pxer.prototype["on"]=function(tagName ,fn){
    if(!this._tagEvent[tagName]){
        this._tagEvent[tagName] =new Array();
    };
    this._tagEvent[tagName].push(fn);
};
Pxer.prototype["_tag"]=function(tagName){
    console.log(arguments);
    if( (this._tagEvent) && (this._tagEvent[tagName] instanceof Array) ){
        for(var i=0 ;i<this._tagEvent[tagName].length ;i++){
            this._tagEvent[tagName][i].apply(this ,arguments);
        };
    };
};
Pxer.prototype["stop"]=function(){
    this.ptm.stop();
    clearInterval(this._timer);
    this._tag("stop");
};
Pxer.prototype["finishTask"]=function(resultSet){
    clearInterval(this._timer);
    this.pp.dataSet =this.resultSet =resultSet;
    this._tag("finishTask");
};
Pxer.prototype["executeTask"]=function(newConfig){

    //检查任务数目
    if(this.taskList.length ===0){
        this._tag("hasNoTask");
        return true;
    };

    //启动内部计时器
    this._timer =setInterval(function(pxer){
        pxer._tag("timerRunning");
        pxer.runTime++;
    },1000,this);

    //初始化PxerThreadManager
    this.ptm =new PxerThreadManager(this.config ,this.taskList);
    var pxer_this =this;
    var ptm_this =this.ptm;
    this.ptm.callback =function(){
        ptm_this.callback =function(){
            pxer_this.finishTask.call(pxer_this ,ptm_this.resultSet);
        };

        ptm_this.taskList =ptm_this.resultSet;
        ptm_this.resultSet =new Array();
        ptm_this.execute();
        pxer_this._tag("executeIllustParseTask");
    };
    this.ptm.execute();

    this._tag("executePageParseTask");

};

Pxer.prototype["upDateConfig"]=function(newConfig){
    if(window.predefinePxerConfig){
        for(var key in window.predefinePxerConfig){
            if(key in this.config) this.config[key]=window.predefinePxerConfig[key];
        };
        delete window.predefinePxerConfig;
        this._tag("upDateConfigFromPredefine");
    }
    if(newConfig){
        for(var key in newConfig){
            if(key in this.config) this.config[key]=newConfig[key];
        };
        this._tag(this.config);
        this._tag("upDateConfigFromMethod");
    };
    this._tag("upDateConfig");
};

Pxer.prototype["analyzePage"]=function(){
    switch(this.page.type){
        case "member_illust":
        case "search":
        case "bookmark":
            //读取作品信息
            this.page.illust_number =parseInt($(".count-badge").html());

            //初始化队列任务
            var separator =/\?/.test(document.URL)?"&":"?";
            for(var i=0 ;i<Math.ceil(this.page.illust_number/20) ;i++){
                var pageRequest =new PageRequest();
                    pageRequest.url =document.URL+separator+"p="+(i+1);
                this.taskList.push(pageRequest);
            };
            break;
    }

    this._tag("analyzePage" ,this.page.type);
}

Pxer.prototype["getPageType"]=function(){
    var typeAnalyzer={
        "member"        :function(url){
            return /member\.php/.test(url);
        },
        "member_illust" :function(url){
            return /member_illust\.php/.test(url);
        },
        "search"        :function(url){
            return /search\.php/.test(url);
        },
        "bookmark"      :function(url){
            return /bookmark\.php/.test(url);
        },
        "illust_medium" :function(url){
            return /member_illust\.php/.test(url)
                && /illust_id/.test(url)
            ;
        }
    };
    for(var key in typeAnalyzer){
        if(typeAnalyzer[key](document.URL)){
            this.page.type =key;
            return true;
        }
    }
    return false;
};