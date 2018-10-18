'use strict';

/**
 * Pxer主程序对象，与所有模块都是强耦合关系
 * 若你想阅读源码，建议不要从这个类开始
 * @class
 * */
class PxerApp extends PxerEvent{
    constructor(){
        /**
         * 可能被触发的事件
         * - stop 被终止时
         * - error 出错时
         * - executeWroksTask 执行作品抓取时
         * - finishWorksTask  完成作品抓取时
         * - executePageTask  执行页码抓取时
         * - finishPageTask   完成页码抓取时
         * - finishTask 完成所有任务
         * */
        super([
            'executeWroksTask','executePageTask',
            'finishWorksTask','finishPageTask',
            'error','stop',
        ]);

        /**
         * 当前页面类型。可能的值
         * @type {string}
         * */
        this.pageType =getPageType();
        /**
         * 页面的作品数量
         * @type {number|null}
         * @see PxerApp.init
         * */
        this.worksNum =null;


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

        /**
         * 任务配置选项，用来指派任务执行过程中的一些逻辑
         * 必须在PxerApp#initPageTask调用前配置
         * */
        this.taskOption={
            /**仅抓取前几副作品*/
            limit  :null,
            /**遇到id为x的作品停止后续，不包括本id*/
            stopId :null,
        };

        // 其他对象的配置参数
        this.ptmConfig ={//PxerThreadManager
            timeout:5000,
            retry:3,
            thread:8,
        };
        this.ppConfig =this.pageType.startsWith("works_")? PxerPrinter.printAllConfig() : PxerPrinter.defaultConfig();//PxerPrinter
        this.pfConfig =PxerFilter.defaultConfig();//PxerFilter

        // 使用的PxerThreadManager实例
        this.ptm =null;

        if(window['PXER_MODE']==='dev') window['PXER_APP']=this;


    };


    /**
     * 初始化时的耗时任务
     */
    async init(){
        this.worksNum = await PxerApp.getWorksNum(document);
    }

    /**
     * 停止执行当前任务
     * 调用后仍会触发对应的finish*事件
     * */
    stop(){
        this.dispatch('stop');
        this.ptm.stop();
    };

    /**初始化批量任务*/
    initPageTask(){
        if(typeof this.pageType !=='string' || typeof this.worksNum!=='number'){
            this.dispatch('error','PxerApp.initPageTask: pageType or number illegal');
            return false;
        };

        let onePageWorksNumber = getOnePageWorkCount(this.pageType);

        var pageNum =Math.ceil(
            this.taskOption.limit
            ? this.taskOption.limit
            : this.worksNum
        )/onePageWorksNumber;

        if (this.pageType==="discovery") {
            var mode;
            switch (true) {
                case document.URL.match(/mode=(r18|safe|all)/)===null: mode = "all"; break;
                default: mode = document.URL.match(/mode=(r18|safe|all)/)[1]; break;
            }
            var recomCount = (this.taskOption.limit? this.taskOption.limit: this.worksNum);
            this.taskList.push(new PxerPageRequest({
                url : `https://www.pixiv.net/rpc/recommender.php?type=illust&sample_illusts=auto&num_recommendations=${recomCount}&page=discovery&mode=${mode}&tt=${pixiv.context.token}`,
                type:this.pageType,
            }));
        } else if (this.pageType==="member_works_new"){
            var uid = getIDfromURL()
            var type = document.URL.match(/type=(\w+)/)?document.URL.match(/type=(\w+)/)[1]:"all"
            this.taskList.push(new PxerPageRequest({
                url: `https://www.pixiv.net/ajax/user/${uid}/profile/all`,
                type: type?`userprofile_${type}`:"userprofile_all",
            }))
        } else if (this.pageType==="bookmark_works"){
            for (let offset =0;offset<48*pageNum;offset+=48) {
                let id = getIDfromURL() || getIDfromURL("id", document.querySelector("a.user-name").getAttribute("href")) // old bookmark page
                this.taskList.push(new PxerPageRequest({
                    type:this.pageType,
                    url: `https://www.pixiv.net/ajax/user/${id}/illusts/bookmarks?tag=&offset=${offset}&limit=48&rest=show`
                }))
            }
        } else {
            var separator =document.URL.includes("?")?"&":"?";
            var extraparam = this.pageType==='rank'? "&format=json" : "";
            for(var i=0 ;i<pageNum ;i++){
                this.taskList.push(new PxerPageRequest({
                    type:this.pageType,
                    url :document.URL+separator+"p="+(i+1)+extraparam,
                }));
            };
        };
    };
    /**抓取页码*/
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
        ptm.on('error'  ,(...argn)=>this.dispatch('error',argn));
        ptm.on('warn'   ,(...argn)=>this.dispatch('error',argn));
        ptm.on('load',()=>{
            var parseResult =[];
            for(let result of this.taskList){
                result =PxerHtmlParser.parsePage(result);
                if(!result){
                    this.dispatch('error',window['PXER_ERROR']);
                    continue;
                }
                parseResult.push(...result);
            };
            this.resultSet =parseResult;
            this.dispatch('finishPageTask' ,parseResult);
        });
        ptm.on('fail',(pfi)=>{
            ptm.pointer--;//失败就不停的尝试
        });
        ptm.init(this.taskList);
        ptm.run();

    };
    /**
     * 抓取作品
     * @param {PxerWorksRequest[]} tasks - 要执行的作品请求数组
     * */
    executeWroksTask(tasks=this.taskList){
        if(tasks.length ===0){
            this.dispatch('error','PxerApp.executeWroksTask: taskList is empty');
            return false;
        };
        if(! tasks.every(request=>request instanceof PxerWorksRequest)){
            this.dispatch('error' ,'PxerApp.executeWroksTask: taskList is illegal');
            return false;
        };
        
        // 任务按ID降序排列(#133)
        tasks.sort((a,b)=>Number(b.id)-Number(a.id));

        this.dispatch('executeWroksTask');

        var ptm =this.ptm =new PxerThreadManager(this.ptmConfig);
        ptm.on('error'  ,(...argn)=>this.dispatch('error',argn));
        ptm.on('warn'   ,(...argn)=>this.dispatch('error',argn));
        // 根据taskOption添加ptm中间件
        if(this.taskOption.limit){
            ptm.middleware.push((task)=>{
                return ptm.pointer<this.taskOption.limit;
            });
        }
        if(this.taskOption.stopId){
            ptm.middleware.push((task)=>{
                if(task.id==this.taskOption.stopId){
                    ptm.stop();
                    return false;
                }
                return true;
            });
        }

        ptm.on('load',()=>{
            this.resultSet =[];
            var tl =this.taskList.slice(//限制结果集条数
                0,
                this.taskOption.limit
                ? this.taskOption.limit
                : undefined
            );
            for(let pwr of tl){
                if(!pwr.completed)continue;//跳过未完成的任务
                let pw =PxerHtmlParser.parseWorks(pwr);
                if(!pw){
                    pwr.completed=false;
                    ptm.dispatch('fail',new PxerFailInfo({
                        type :'parse',
                        task :pwr,
                        url  :pwr.url[0],
                    }));
                    this.dispatch('error',window['PXER_ERROR']);
                    continue;
                }
                this.resultSet.push(pw);
            }
            this.dispatch('finishWorksTask' ,this.resultSet);
        });
        ptm.on('fail' ,pfi=>{
            this.failList.push(pfi);
        });
        ptm.init(tasks);
        ptm.run();

        return true;

    };
    /**对失败的作品进行再抓取*/
    executeFailWroks(list=this.failList){
        // 把重试的任务从失败列表中减去
        this.failList =this.failList.filter(pfi=>list.indexOf(pfi)===-1);
        // 执行抓取
        this.executeWroksTask(list.map(pfi=>pfi.task))
    };
    /**抓取页码完成后，初始化，准备抓取作品*/
    switchPage2Works(len=this.resultSet.length){
        this.taskList =this.resultSet.slice(0 ,len);
        this.resultSet =[];
    };
    /**
     * 获取当前抓取到的可读的任务信息
     * @return {string}
     * */
    getWorksInfo(){
        var pp =new PxerPrinter(this.ppConfig);
        var pf =new PxerFilter(this.pfConfig);
        pp.fillTaskInfo(pf.filter(this.resultSet));
        return pp.taskInfo;
    };
    /**
     * 输出抓取到的作品
     * */
    printWorks(){
        var pp =new PxerPrinter(this.ppConfig);
        var pf =new PxerFilter(this.pfConfig);
        var works =pf.filter(this.resultSet);
        pp.fillTaskInfo(works);
        pp.fillAddress(works);
        pp.print();
    };
};

/**直接抓取本页面的作品*/
PxerApp.prototype['getThis'] =async function(){
    // 生成任务对象
    var initdata = document.head.innerHTML.match(PxerHtmlParser.REGEXP['getInitData'])[0];
    var id = getIDfromURL("illust_id");

    initdata = PxerHtmlParser.getKeyFromStringObjectLiteral(initdata, "preload");
    initdata = PxerHtmlParser.getKeyFromStringObjectLiteral(initdata, 'illust');
    initdata = PxerHtmlParser.getKeyFromStringObjectLiteral(initdata, id);
    
    if (initdata) {
        initdata = JSON.parse(initdata);
    } else {
        initdata = (await (await fetch("https://www.pixiv.net/ajax/illust/"+ id, {credentials:'include'})).json())['body'];
    };

    var type = initdata.illustType;
    var pageCount = initdata.pageCount;
    var pwr =new PxerWorksRequest({
        isMultiple  :pageCount>1,
        id          :id,
    });//[manga|ugoira|illust]
    switch (type) {
        case 2: pwr.type ='ugoira'; break;
        case 1: pwr.type ='illust'; break;
        case 0: pwr.type ='manga';  break;
        default:throw new Error("Unknown work type. id:" +id);
    }
    pwr.url =PxerHtmlParser.getUrlList(pwr);
    // 添加执行
    this.taskList = [pwr];
    this.one('finishWorksTask',()=>this.printWorks());
    this.executeWroksTask();
    return true;
};

/**
 * 获取当前页面的总作品数
 * @param {Document=document} dom - 页面的document对象
 * @return {number} - 作品数
 * */
PxerApp.getWorksNum =function(dom=document){
    return new Promise((resolve, reject)=>{
        if (getPageType() === "rank") {
            let queryurl = dom.URL + "&format=json";
            let xhr = new XMLHttpRequest();
            xhr.open("GET", queryurl);
            xhr.onload = (e) => resolve(JSON.parse(xhr.responseText)['rank_total']);
            xhr.send();
        } else if (getPageType() === "bookmark_new") {
            // 关注的新作品页数最多100页
            // 因为一般用户关注的用户数作品都足够填满100页，所以从100开始尝试页数
            // 如果没有100页进行一次二分查找
            let currpage = parseInt(dom.querySelector("ul.page-list>li.current").innerHTML);
            this.getFollowingBookmarkWorksNum(currpage, 100, 100).then((res) => resolve(res));
        } else if (getPageType() === "discovery"){
            resolve(3000);
        } else if (getPageType() === "bookmark_works"){
            let id =  getIDfromURL("id", dom.URL)  || getIDfromURL("id", dom.querySelector("a.user-name").getAttribute("href")) // old bookmark page
            let queryurl = `https://www.pixiv.net/ajax/user/${id}/illusts/bookmarks?tag=&offset=0&limit=48&rest=show`;
            let xhr = new XMLHttpRequest();
            xhr.open("GET", queryurl);
            xhr.onload = (e) => {
                resolve(JSON.parse(xhr.responseText).body.total)
            };
            xhr.send();
        } else if (getPageType() === "member_works_new") {
            let queryurl = `https://www.pixiv.net/ajax/user/${getIDfromURL()}/profile/all`;
            let xhr = new XMLHttpRequest();
            xhr.open("GET", queryurl);
            xhr.onload = (e) => {
                var resp = JSON.parse(xhr.responseText).body;
                var type = dom.URL.match(/type=(manga|illust)/);
                var getKeyCount = function(obj) {
                    return Object.keys(obj).length
                }
                if (!type) {
                    resolve(getKeyCount(resp.illusts)+getKeyCount(resp.manga))
                } else if (type[1]==="illust") {
                    resolve(getKeyCount(resp.illusts))
                } else {
                    resolve(getKeyCount(resp.manga))
                }
            };
            xhr.send();
        } else {
            let elt = dom.querySelector(".count-badge");
            if (!elt) resolve(null);
            resolve(parseInt(elt.innerHTML));
        }
    })
};

/**
 * 获取关注的新作品页的总作品数
 * @param {number} min - 最小页数
 * @param {number} max - 最大页数
 * @param {number} cur - 当前页数
 * @return {number} - 作品数
 */
PxerApp.getFollowingBookmarkWorksNum =function(min, max, cur){
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.pixiv.net/bookmark_new_illust.php?p=" + cur);
        xhr.onload = (e) => {
            var html = xhr.response;
            var el = document.createElement("div");
            el.innerHTML = html;
            if (min === max) {
                var lastworkcount = JSON.parse(el.querySelector("div#js-mount-point-latest-following").getAttribute("data-items")).length;
                resolve((min - 1) * 20 + lastworkcount);
            } else {
                if (!!el.querySelector("div._no-item")) {
                    this.getFollowingBookmarkWorksNum(min, cur - 1, parseInt((min + cur) / 2)).then((res) => resolve(res));
                } else {
                    this.getFollowingBookmarkWorksNum(cur, max, parseInt((cur + max + 1) / 2)).then((res) => resolve(res));
                }
            }
        }
        xhr.send();
    })
}
