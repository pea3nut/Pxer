'use strict';

class PxerApp extends PxerEvent{
    constructor(){
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
        super([
            'executeWroksTask','executePageTask',
            'finishWorksTask','finishPageTask',
            'error','stop',
        ]);

        /**
         * 当前页面类型。可能的值
         * - member 个人资料页
         * - member_illust 作品列表页
         * - search 搜索页
         * - bookmark 收藏页
         * - medium 作品详情查看
         * */
        this.pageType =PxerApp.getPageType();
        /*!页面的作品数量*/
        this.worksNum =PxerApp.getWorksNum();


        /**
         * 任务队列
         * @type {PxerRequest[]}
         * */
        this.taskList=[];
        /**
         * 失败的任务信息
         * @type {PxerFailInfo[]}
         * */
        this.failList=[];
        /**
         * 抓取到的结果集
         * @type {PxerWorks[]}
         * */
        this.resultSet=[];
        /**
         * 过滤得到的结果集
         * @type {PxerWorks[]}
         * */
        this.filterResult=[];

        // 配置参数
        this.ptmConfig ={//PxerThreadManager
            timeout:5000,
            retry:3,
            thread:8,
        };
        this.ppConfig =PxerPrinter.defaultConfig();//PxerPrinter
        this.pfConfig =PxerFilter.defaultConfig();//PxerFilter

        // 使用的PxerThreadManager实例
        this.ptm =null;


    };

    stop(){
        this.dispatch('stop');
        this.ptm.stop();
    };
    initPageTask(){
        if(typeof this.pageType !=='string' || typeof this.worksNum!=='number'){
            this.dispatch('error','PxerApp.initPageTask: pageType or number illegal');
            return false;
        };

        var separator =/\?/.test(document.URL)?"&":"?";
        for(var i=0 ;i<Math.ceil(this.worksNum/20) ;i++){
            this.taskList.push(new PxerPageRequest({
                url:document.URL+separator+"p="+(i+1),
            }));
        };
    };
    executePageTask(){
        if(this.taskList.length ===0){
            this.dispatch('error','PxerApp.executePageTask: taskList is empty');
            return false;
        };
        if(! this.taskList.every(request=>request instanceof PxerPageRequest)){
            this.dispatch('error' ,'PxerApp.executePageTask: taskList is illegal');
            return false;
        };

        this.dispatch('executePageTask');

        var ptm =this.ptm =new PxerThreadManager(this.ptmConfig);
        ptm.on('load',(resultSet)=>{
            var parseResult =[];
            for(let result of resultSet){
                // @@ 容错处理
                parseResult.push(...PxerHtmlParser.parsePage(result));
            };
            this.resultSet.push(...parseResult);
            this.dispatch('finishPageTask' ,parseResult);
        });
        ptm.on('fail',({task})=>{
            ptm.taskList.push(task);
        });
        ptm.on('error',this.dispatch.bind(this,'error'));
        ptm.on('warn',this.dispatch.bind(this,'error'));
        ptm.init(this.taskList);
        ptm.run();

    };
    executeWroksTask(){
        if(this.taskList.length ===0){
            this.dispatch('error','PxerApp.executeWroksTask: taskList is empty');
            return false;
        };
        if(! this.taskList.every(request=>request instanceof PxerWorksRequest)){
            this.dispatch('error' ,'PxerApp.executeWroksTask: taskList is illegal');
            return false;
        };

        this.dispatch('executeWroksTask');

        var ptm =this.ptm =new PxerThreadManager(this.ptmConfig);
        ptm.on('load',(resultSet)=>{
            var parseResult =resultSet.map(item=>PxerHtmlParser.parseWorks(item));
            this.resultSet.push(...parseResult);
            this.dispatch('finishWorksTask' ,parseResult);
        });
        ptm.on('fail' ,pfi=>{
            console.log('ptm fail');
            this.failList.push(pfi);
        });
        ptm.init(this.taskList);
        ptm.run();

        return true;

    };
    switchPage2Works(len=this.resultSet.length){
        this.taskList =this.resultSet.slice(0 ,len);
        this.resultSet =[];
    };
    switchFail2Task(list=this.failList){
        this.taskList =list.map(item=>item.task);
        if(list===this.failList)this.failList =[];
    };
    getWorksInfo(){
        var pp =new PxerPrinter(this.ppConfig);
        var pf =new PxerFilter(this.pfConfig);
        pp.fillTaskInfo(pf.filter(this.resultSet));
        return pp.taskInfo;
    };
    printWorks(){
        var pp =new PxerPrinter(this.ppConfig);
        var pf =new PxerFilter(this.pfConfig);
        var works =pf.filter(this.resultSet);
        pp.fillTaskInfo(works);
        pp.fillAddress(works);
        pp.print();
    };
};


PxerApp.prototype['getThis'] =function(){
    // 生成任务对象
    var pwr =PxerWorksRequest({
        isMultiple  :!!document.querySelector('.multiple ._icon-files'),
        id          :document.URL.match(/illust_id=(\d+)/)[1],
    });//[manga|ugoira|illust]
    if(!pwr.isMultiple){
        pwr.type =document.querySelector('.wrapper .original-image')?'illust':'manga';
    }else if(document.documentElement.innerHTML.indexOf('600x600.zip')!==-1){
        pwr.type ='ugoira';
    }else{
        pwr.type ='manga';
    }
    pwr.url =PxerHtmlParser.getUrlList(pwr);
    if(pwr.url.length ===1){
        pwr.html[pwr.url[0]]=document.documentElement.outerHTML;
        var pw =this.php.parseWorks(pwr);
        this.pp.countAddress([pw]);
        return '@@';
    }

    // h
    var pt =new PxerThread();
    pt.init(pwr);
    pt.run();
    pt.on('load',task=>{
        var php =new PxerHtmlParser();
        php.parseWorks(task);
    });

};

PxerApp.prototype["autoSwitch"]=function(){
    this.one('finishPageTask' ,()=>{
        this.taskList =this.php.parseAll(this.resultSet);
        this.resultSet =[];
        this.executeWroksTask();
    });

    this.one('finishWorksTask' ,()=>{
        this.pp.works =this.php.parseAll(this.resultSet);
        this.taskList =[];
    });

};
PxerApp.prototype["queryExecute"]=function(){
    this.autoSwitch();
    this.one('finishWorksTask' ,()=>{
        this.pp.queryPrint();
    });
    this.executePageTask();
};





PxerApp.version ='6.1.4';
PxerApp.getWorksNum =function(dom=document){
    var elt =dom.querySelector(".count-badge");
    if(!elt) return null;
    return parseInt(elt.innerHTML);
};
PxerApp.getPageType =function(dom=document){
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
        if(typeAnalyzer[key](dom.URL)){
            return key;
        }
    }
    return null
};

