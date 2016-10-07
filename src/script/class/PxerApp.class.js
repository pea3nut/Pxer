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
            'hasNoTask','timerRunning','finishTask','upDateConfigFromPredefine','analyzePage'
        ]);


        this.runtime={
            /**
             * 当前页面类型。可能的值
             * - member 个人资料页
             * - member_illust 个人作品页
             * - search 搜索页
             * - bookmark 收藏页
             * - medium 作品详情查看
             * */
            "pageType":'',
            /*!页面的作品数量*/
            "illust_number":0,
        };

        /*!抓取到的结果集*/
        this.resultSet=[];
        /*!任务队列*/
        this.taskList=[];


        /*!内置的PxerPrint对象*/
        this.pp =new PxerPrint();
        /*!PxerPrint过滤配置参数*/
        this.printConfig =this.pp.config;
        /*!PxerPrint配置参数*/
        this.printFilter =this.pp.filter;

        /*!内置的PxerThreadManager对象*/
        this.ptm =new PxerThreadManager();
        /*!threadManagerConfig配置参数*/
        this.threadManagerConfig =this.ptm.config;

        /*!内置的PxerHtmlParser对象*/
        this.php =new PxerHtmlParser();

        this.ptm.on("error" ,task=>console.error(err));
        this.ptm.on("fail" ,task=>console.warn(err));
        this.on('error' ,err=>console.error(err));

    };

};

PxerApp.prototype["stop"]=function(){
    this.ptm.stop();
    this.dispatch('finishWorksTask');
    this.dispatch('stop');
};


PxerApp.prototype["autoSwitch"]=function(){
    this.one('finishPageTask' ,()=>{
        this.taskList =this.php.parseAll(this.resultSet);
        this.resultSet =[];
        this.executeWroksTask();
    });

    this.one('finishWorksTask' ,()=>{
        this.pp.works =this.php.parseAll(this.resultSet);
    });

};

PxerApp.prototype["queryExecute"]=function(){
    this.autoSwitch();
    this.one('finishWorksTask' ,()=>{
        this.pp.queryPrint();
    });
    this.executePageTask();
};

PxerApp.prototype["executePageTask"]=function(){

    //检查任务数目
    if(this.taskList.length ===0){
        this.dispatch('error' ,'Could not find request!');
        return false;
    };

    if(! this.taskList.every(request=>request instanceof PxerPageRequest)){
        this.dispatch('error' ,'Task list is not every instance PxerPageRequest');
        return false;
    };

    this.dispatch('executePageTask');

    this.ptm.one('load' ,(data)=>{
        this.resultSet =data;
        setTimeout(this.dispatch.bind(this ,'finishPageTask'));
    });

    this.ptm.init(this.taskList);
    this.ptm.run();

    return true;

};
PxerApp.prototype["executeWroksTask"]=function(){

    //检查任务数目
    if(this.taskList.length ===0){
        this.dispatch('error' ,'Could not find request!');
        return false;
    };

    if(! this.taskList.every(request=>request instanceof PxerWorksRequest)){
        this.dispatch('error' ,'Task list is not every instance PxerWorksRequest');
        return false;
    };

    this.dispatch('executeWroksTask');

    this.ptm.one('load' ,(data)=>{
        this.resultSet =data;
        setTimeout(this.dispatch.bind(this ,'finishWorksTask'));
    });

    this.ptm.init(this.taskList);
    this.ptm.run();

    return true;

};

PxerApp.prototype["analyzePage"]=function(){
    switch(this.runtime.pageType){
        case "member_illust":
        case "search":
        case "bookmark":
            //读取作品信息
            this.runtime.illust_number =parseInt(document.querySelector(".count-badge").innerHTML);

            //初始化队列任务
            var separator =/\?/.test(document.URL)?"&":"?";
            for(var i=0 ;i<Math.ceil(this.runtime.illust_number/20) ;i++){
                this.taskList.push(new PxerPageRequest({
                    url:document.URL+separator+"p="+(i+1),
                }));
            };
            break;
        default:
            return false;
    };

    return true;

};

PxerApp.prototype["getPageType"]=function(){
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
            return this.runtime.pageType =key;
        }
    }
    return false;
};

PxerApp.version ='6.0.0';


