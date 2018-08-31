'use strict';
import PxerEvent from './PxerEvent.-1.class'
import PxerThreadManager from './PxerThreadManager.2.class'
import {parseURL, getPageType} from './common';
import {PxerHtmlParser, JsObjStringLiteralParser} from './PxerHtmlParser.class';
import {PxerMode, PxerWorkType, PxerPageType, PxerRequest, PxerPageRequest, PxerWorksRequest, PxerFailType, PxerFailInfo} from './PxerData.-1'
import {IPxerWorks, IPxerSingleWorks, IPxerMultipleWorks, IPxerUgoiraWorks, IPxerUgoiraFrameData, PxerWorks, PxerSingleWorks, PxerMultipleWorks, PxerUgoiraWorks} from './PxerWorksDef.-1'

/**
 * Pxer主程序对象，与所有模块都是强耦合关系
 * 若你想阅读源码，建议不要从这个类开始
 * @class
 * */
class PxerApp extends PxerEvent{
    pageType : PxerPageType;
    worksNum ?: number;
    pageRequestSet : PxerPageRequest[];
    failList : PxerFailInfo[];
    workResultSet: PxerWorks[];
    workRequestSet: PxerWorksRequest[];
    filterResult: PxerWorks[];
    taskOption: {limit: number|null, stopId:string|null};
    ptmConfig : {timeout:number, retry:number, thread:number};
    pageBeforeMiddleWares: PxerThreadManager.IPTMBeforeMiddleWare[];
    workBeforeMiddleWares: PxerThreadManager.IPTMBeforeMiddleWare[];
    pageFinishMiddleWares: PxerThreadManager.IPTMFinishMiddleWare[];
    workFinishMiddleWares: PxerThreadManager.IPTMFinishMiddleWare[];
    readonly version :string = "7.1.0";
    private ptm: PxerThreadManager|null;
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
            'error','stop','finishParse',
            'tick',
        ]);

        /**
         * 当前页面类型。可能的值
         * @type {string}
         * */
        this.pageType =getPageType();
        /**
         * 页面的作品数量
         * @type {number|undefined}
         * @see PxerApp.init
         * */
        this.worksNum =undefined;


        /**
         * 任务队列
         * @type {PxerRequest[]}
         * */
        this.pageRequestSet=[];
        /**
         * 失败的任务信息
         * @type {PxerFailInfo[]}
         * */
        this.failList=[];
        this.workRequestSet=[];
        /**
         * 抓取到的结果集
         * @type {PxerWorks[]}
         * */
        this.workResultSet=[];
        /**
         * 过滤得到的结果集
         * @type {PxerWorks[]}
         * */
        this.filterResult=[];
        
        this.pageBeforeMiddleWares=[];
        this.workBeforeMiddleWares=[];
        this.pageFinishMiddleWares=[];
        this.workFinishMiddleWares=[];

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

        // 使用的PxerThreadManager实例
        this.ptm =null;


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
        (<PxerThreadManager>this.ptm).stop();
    };
    canDirectCrawl(){
        return this.pageType===PxerPageType.works_medium;
    }
    static parsePageType(){
        return getPageType();
    }
    isSupported(){
        //['bookmark_works','member_works','search','works_medium','bookmark_new','rank','discovery']
        return [
            PxerPageType.bookmark_works,
            PxerPageType.member_works,
            PxerPageType.search,
            PxerPageType.works_medium,
            PxerPageType.bookmark_new,
            PxerPageType.rank,
            PxerPageType.discovery,
        ].indexOf(this.pageType)!==-1
    }
    /**初始化批量任务*/
    initPageTask() :boolean{
        if(typeof this.pageType !=='string' || typeof this.worksNum!=='number'){
            this.dispatch('error','PxerApp.initPageTask: pageType or number illegal');
            return false;
        };

        let onePageWorksNumber :number = PxerApp.getOnePageWorkCount(this.pageType);

        var pageNum =Math.ceil(
            this.taskOption.limit
            ? this.taskOption.limit
            : this.worksNum
        )/onePageWorksNumber;

        if (this.pageType==="discovery") {
            var mode;
            var modematch = document.URL.match(/mode=(r18|safe|all)/);
            switch (true) {
                case modematch===null: mode = "all"; break;
                default: mode = (<RegExpMatchArray>modematch)[1]; break;
            }
            var recomCount = (this.taskOption.limit? this.taskOption.limit: this.worksNum);
            this.pageRequestSet.push(new PxerPageRequest(
                [`https://www.pixiv.net/rpc/recommender.php?type=illust&sample_illusts=auto&num_recommendations=${recomCount}&page=discovery&mode=${mode}`],
                {},
                this.pageType,
            ));
        } else {
            var separator =document.URL.includes("?")?"&":"?";
            var extraparam = this.pageType==='rank'? "&format=json" : "";
            for(var i=0 ;i<pageNum ;i++){
                this.pageRequestSet.push(new PxerPageRequest(
                    [document.URL+separator+"p="+(i+1)+extraparam],
                    {},
                    this.pageType,
                ));
            };
        };
        return true;
    };
    /**抓取页码*/
    executePageTask() :boolean{
        if(this.pageRequestSet.length ===0){
            this.dispatch('error','PxerApp.executePageTask: pageRequestSet is empty');
            return false;
        };
        if(! this.pageRequestSet.every(request=>request instanceof PxerPageRequest)){
            this.dispatch('error' ,'PxerApp.executePageTask: pageRequestSet is illegal');
            return false;
        };

        this.dispatch('executePageTask');

        var ptm =this.ptm =new PxerThreadManager(this.ptmConfig);
        ptm.on('error'  ,(...argn)=>this.dispatch('error',argn));
        ptm.on('warn'   ,(...argn)=>this.dispatch('error',argn));
        ptm.on('load',()=>{
            var parseResult =[];
            for(let result of this.pageRequestSet){
                let parseresult =PxerHtmlParser.parsePage(<PxerPageRequest>result);
                if(!parseresult){
                    this.dispatch('error',window.PXER_ERROR);
                    continue;
                }
                parseResult.push(...parseresult);
            };
            this.workRequestSet =parseResult;
            this.dispatch('finishPageTask' ,parseResult);
        });
        ptm.on('fail',(pfi)=>{
            ptm.pointer--;//失败就不停的尝试
        });
        ptm.on('tick', ()=>{
            this.dispatch("tick");
        })
        ptm.init(this.pageRequestSet);
        ptm.middleware.push(...this.pageBeforeMiddleWares);
        ptm.finishmiddleware.push(...this.pageFinishMiddleWares);
        ptm.run();
        return true;
    };
    /**
     * 抓取作品
     * @param {PxerWorksRequest[]} tasks - 要执行的作品请求数组
     * */
    executeWroksTask(tasks=this.workRequestSet) : boolean{
        if(tasks.length ===0){
            this.dispatch('error','PxerApp.executeWroksTask: pageRequestSet is empty');
            return false;
        };
        if(! tasks.every(request=>request instanceof PxerWorksRequest)){
            this.dispatch('error' ,'PxerApp.executeWroksTask: pageRequestSet is illegal');
            return false;
        };

        this.dispatch('executeWroksTask');

        var ptm =this.ptm =new PxerThreadManager(this.ptmConfig);
        ptm.on('error'  ,(...argn)=>this.dispatch('error',argn));
        ptm.on('warn'   ,(...argn)=>this.dispatch('error',argn));
        // 根据taskOption添加ptm中间件
        if(this.taskOption.limit){
            ptm.middleware.push((task)=>{
                return ptm.pointer<(<number>this.taskOption.limit);
            });
        }
        if(this.taskOption.stopId){
            ptm.middleware.push((task)=>{
                if(task instanceof PxerWorksRequest && (<PxerWorksRequest>task).id==this.taskOption.stopId){
                    ptm.stop();
                    return false;
                }
                return true;
            });
        }

        ptm.on('load',()=>{
            this.workResultSet =[];
            var tl =this.workRequestSet.slice(//限制结果集条数
                0,
                this.taskOption.limit
                ? this.taskOption.limit
                : undefined
            );
            this.dispatch('finishWorksTask');
            var pwps : Promise<false| PxerWorks>[] = [];
            for(let pwr of tl){
                if(!pwr.completed)continue;//跳过未完成的任务
                let pwp = PxerHtmlParser.parseWorks(<PxerWorksRequest>pwr)
                pwp.then(pw=>{
                    if(!pw){
                        pwr.completed=false;
                        ptm.dispatch('fail',new PxerFailInfo(
                            pwr.url[0],
                            PxerFailType.parse,
                            pwr,
                            "PxerHtmlParser.parseWorks returned invalid value."
                        ));
                        this.dispatch('error',window['PXER_ERROR']);
                    } else {
                        this.workResultSet.push(pw);
                    }
                });
                pwps.push(pwp);
            }
            var finish = ()=>{this.dispatch('finishParse' ,this.workResultSet)};
            Promise.all(pwps).then(finish).catch(finish);
        });
        ptm.on('fail' ,pfi=>{
            this.failList.push(pfi);
        });
        ptm.on('tick', ()=>{
            this.dispatch("tick");
        })
        ptm.init(tasks);
        ptm.middleware.push(...this.workBeforeMiddleWares);
        ptm.finishmiddleware.push(...this.workFinishMiddleWares);
        ptm.run();

        return true;

    };
    /**对失败的作品进行再抓取*/
    executeFailWroks(list=this.failList) :void{
        // 把重试的任务从失败列表中减去
        this.failList =this.failList.filter(pfi=>list.indexOf(pfi)===-1);
        // 执行抓取
        this.executeWroksTask(list.filter(pfi=>pfi.task instanceof PxerWorksRequest).map(pfi=><PxerWorksRequest>pfi.task))
    };
    /**
     * 输出抓取到的作品
     * */
    printWorks() :void{
        let win =window.open(document.URL ,'_blank');
        if(!win){
            alert('Pxer:\n浏览器拦截了弹出窗口，请检查浏览器提示，设置允许此站点的弹出式窗口。');
            return;
        };
        (<any>win).resultData = JSON.parse(JSON.stringify(this.workResultSet));
        let str =[
            "<body>",
            "<div id=\"pxer-output\"></div>",
            "<script src=\""+window['PXER_URL']+"dist/pxer_output.js\"></script>",
            "</body>",
        ];
        win.document.write(str.join('\n'));
        win.document.close();
    };
    /**
     * 获取当前页面的总作品数
     * @param {Document=document} dom - 页面的document对象
     * @return {number} - 作品数
     * */
    static getWorksNum(dom=document) : Promise<number>{
        return new Promise((resolve, reject)=>{
            if (getPageType() === "rank") {
                var queryurl = dom.URL + "&format=json";
                var xhr = new XMLHttpRequest();
                xhr.open("GET", queryurl);
                xhr.onload = (e) => resolve(JSON.parse(xhr.responseText)['rank_total']);
                xhr.send();
            } else if (getPageType() === "bookmark_new") {
                // 关注的新作品页数最多100页
                // 因为一般用户关注的用户数作品都足够填满100页，所以从100开始尝试页数
                // 如果没有100页进行一次二分查找
                var currpage = parseInt((<Element>dom.querySelector("ul.page-list>li.current")).innerHTML);
                PxerApp.getFollowingBookmarkWorksNum(currpage, 100, 100).then((res) => resolve(res));
            } else if (getPageType() === "discovery"){
                resolve(3000);
            } else {
                var elt = dom.querySelector(".count-badge");
                if (!elt) reject("count-badge not found");
                resolve(parseInt((<Element>elt).innerHTML));
            }
        })
    };

    /**直接抓取本页面的作品*/
    getThis() :Promise<boolean>{
        return new Promise((resolve, reject)=>{
            var initdatastr = (<RegExpMatchArray>document.head.innerHTML.match(PxerHtmlParser.REGEXP['getInitData']))[0];
            var id = (<RegExpMatchArray>document.URL.match(/illust_id=(\d+)/))[1];
    
            initdatastr = <string>JsObjStringLiteralParser.getKeyFromStringObjectLiteral(initdatastr, "preload");
            initdatastr = <string>JsObjStringLiteralParser.getKeyFromStringObjectLiteral(initdatastr, 'illust');
            initdatastr = <string>JsObjStringLiteralParser.getKeyFromStringObjectLiteral(initdatastr, id);
    
            var pwr =new PxerWorksRequest(
                [],
                {},
                id,
            );
            pwr.url =PxerHtmlParser.getUrlList(pwr);
            // 添加执行
            this.workRequestSet = [pwr];
            this.one('finishParse',()=>{
                this.printWorks();
                resolve(true);
            });
            this.executeWroksTask();
        })
    };
    /**
     * 获取关注的新作品页的总作品数
     * @param {number} min - 最小页数
     * @param {number} max - 最大页数
     * @param {number} cur - 当前页数
     * @return {number} - 作品数
     */
    static getFollowingBookmarkWorksNum(min:number, max:number, cur:number) :Promise<number>{
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "https://www.pixiv.net/bookmark_new_illust.php?p=" + cur);
            xhr.onload = (e) => {
                var html = xhr.responseText;
                var el = document.createElement("div");
                el.innerHTML = html;
                if (min === max) {
                    var lastworkcount = JSON.parse(
                        (<string>(<Element>el.querySelector("div#js-mount-point-latest-following"))
                          .getAttribute("data-items"))).length;
                    resolve((min - 1) * 20 + lastworkcount);
                } else {
                    if (!!el.querySelector("div._no-item")) {
                        this.getFollowingBookmarkWorksNum(min, cur - 1, Math.floor((min + cur) / 2)).then((res) => resolve(res));
                    } else {
                        this.getFollowingBookmarkWorksNum(cur, max, Math.floor((cur + max + 1) / 2)).then((res) => resolve(res));
                    }
                }
            }
            xhr.send();
        })
    };
    static getOnePageWorkCount(type: PxerPageType) :number {
        switch (type) {
            case PxerPageType.search:return 40
            case PxerPageType.rank:return 50
            case PxerPageType.discovery:return 3000
            default:return 20
        };
    }
};
export default PxerApp