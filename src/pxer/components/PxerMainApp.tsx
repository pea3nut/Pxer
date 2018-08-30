import React, { Component } from 'react';

import PxerNavBar from './PxerNavBar';
import PxerFailDisplay from './PxerFailDisplay'
import PxerCrawlStatus from './PxerCrawlStatus'
import PxerPTMControl from './PxerPTMControl'

import PxerApp from '../pxerapp/PxerApp.3.class'
import PxerAnalytics from '../../analytics/PxerAnalytics.class'
import PxerScriptor from '../pxerapp/PxerScriptor.class'
import {PxerMode, PxerWorkType, PxerPageType, PxerRequest, PxerPageRequest, PxerWorksRequest, PxerFailType, PxerFailInfo} from '../pxerapp/PxerData.-1'
import PxerThreadManager from '../pxerapp/PxerThreadManager.2.class';

interface IPxerMainAppState {
    status: PxerMainApp.PxerStatus,
    startTime: Date,
    showErr: boolean,
}

class PxerMainApp extends Component{
    private pxer :PxerApp
    private analytics :PxerAnalytics
    private middlewares :{
        before: PxerThreadManager.IPTMBeforeMiddleWare[],
        finish: PxerThreadManager.IPTMFinishMiddleWare[],
    }
    state: IPxerMainAppState
    constructor(props: any){
        super(props)
        this.state = {
            status: PxerMainApp.PxerStatus.standby,
            startTime: new Date(),
            showErr: false,
        }

        this.onLoad = this.onLoad.bind(this)
        this.onRun = this.onRun.bind(this)
        this.onShowErr = this.onShowErr.bind(this)
        this.onStop = this.onStop.bind(this)
        this.onPrint = this.onPrint.bind(this)
        this.onMaxID = this.onMaxID.bind(this)
        this.onMaxWorkCount = this.onMaxWorkCount.bind(this)
        this.onRetry = this.onRetry.bind(this);

        this.pxer = new PxerApp();
        this.analytics = new PxerAnalytics();
        if ((window as any)['PXER_MODE']=="dev") (window as any)['PXER_APP']=this.pxer;
        this.middlewares = {
            before: [],
            finish: [],
        };
    }
    componentWillMount(){
        this.pxer.on("tick", ()=>{
            this.forceUpdate();
        })
    }
    render(){
        return (
            <div id="pxerApp" className="pxer-app">
                <PxerNavBar 
                    showButton={
                        (()=>{
                            switch (this.state.status){
                                case PxerMainApp.PxerStatus.standby:
                                return PxerNavBar.PxerNavBarButtonType.load;
                                case PxerMainApp.PxerStatus.finish:
                                return PxerNavBar.PxerNavBarButtonType.print;
                                case PxerMainApp.PxerStatus.init:
                                return PxerNavBar.PxerNavBarButtonType.init;
                                case PxerMainApp.PxerStatus.running_page:
                                case PxerMainApp.PxerStatus.running_parse:
                                case PxerMainApp.PxerStatus.running_work:
                                return PxerNavBar.PxerNavBarButtonType.stop;
                                case PxerMainApp.PxerStatus.config:
                                return PxerNavBar.PxerNavBarButtonType.run;
                                default:
                                return PxerNavBar.PxerNavBarButtonType.init;
                            }
                        })()
                    }
                    onLoad={this.onLoad}
                    onRun={this.onRun}
                    onStop={this.onStop}
                    onShowErr={this.onShowErr}
                    onPrint={this.onPrint}
                    showWarn={this.pxer.failList.length!==0 && this.state.status===PxerMainApp.PxerStatus.finish}
                    errInfo={""}
                    errCount={this.pxer.failList.length}
                />
                {
                    this.state.status===PxerMainApp.PxerStatus.finish && this.pxer.failList.length>0 && this.state.showErr?
                    <PxerFailDisplay
                        failList={this.pxer.failList}
                        onDoRetry={this.onRetry}
                    />:null
                }
                {
                    this.state.status===PxerMainApp.PxerStatus.config?
                    <PxerPTMControl
                        defaultThreadCount={5}
                        defaultTimeout={5000}
                        defaultRetry={3}
                        handleThreadCount={count=>this.pxer.ptmConfig.thread=count}
                        handleTimeOut={time=>this.pxer.ptmConfig.timeout=time}
                        handleRetry={count=>this.pxer.ptmConfig.retry=count}
                    />:null
                }
                {
                    [   PxerMainApp.PxerStatus.config, 
                        PxerMainApp.PxerStatus.running_page,
                        PxerMainApp.PxerStatus.running_parse,
                        PxerMainApp.PxerStatus.running_work,
                    ].indexOf(this.state.status)!==-1?
                    <PxerCrawlStatus
                        version={this.pxer.version}
                        status={this.state.status}
                        runtime={[PxerMainApp.PxerStatus.running_work, PxerMainApp.PxerStatus.running_page, PxerMainApp.PxerStatus.running_page].indexOf(this.state.status)!==-1?Math.floor((new Date().getTime()-this.state.startTime.getTime())/1000):null}
                        pageType={this.pxer.pageType}
                        downCount={this.downCount()}
                        pageCount={this.pageCount()}
                        finishCount={this.finishCount()}
                        handleMaxID={this.onMaxID}
                        handleMaxWorkCount={this.onMaxWorkCount}
                        lockConf={this.state.status!==PxerMainApp.PxerStatus.config}
                    />:null
                }
            </div>
        )
    }
    finishCount(): number{
        return this.pxer.pageRequestSet.filter(work=>work.completed).length + this.pxer.workRequestSet.filter(work=>work.completed).length
    }
    downCount(): number{
        return this.pxer.taskOption.limit?Math.min(this.pxer.taskOption.limit, this.pxer.worksNum as number)
                                          :this.pxer.worksNum as number
    }
    pageCount() :number{
        return Math.ceil(this.downCount()/PxerApp.getOnePageWorkCount(this.pxer.pageType))
    }
    onMaxID(minid: string){
        this.pxer.taskOption.stopId = minid;
        this.forceUpdate();
    }
    onMaxWorkCount(minwork: number){
        this.pxer.taskOption.limit = minwork;
        this.forceUpdate();
    }
    onLoad(){
        this.analytics.postData("pxer.app.load", {
            page_type:this.pxer.pageType,
        });

        this.setState((prev: IPxerMainAppState)=>{
            return {
                status: PxerMainApp.PxerStatus.init,
            }
        })
        if (this.pxer.canDirectCrawl()){
            this.pxer.getThis().then(()=>{
                this.setState((prev: IPxerMainAppState)=>{
                    return {
                        status: PxerMainApp.PxerStatus.standby,
                    }
                })
            })
        } else {
            this.pxer.init().then(()=>{
                this.setState((prev: IPxerMainAppState)=>{
                    return {
                        status: PxerMainApp.PxerStatus.config,
                    }
                })
            })
        }
    }
    onRun(){
        this.analytics.postData("pxer.app.start", {
            ptm_config:this.pxer.ptmConfig,
            task_option:this.pxer.taskOption,
            vm_state:this.state,
        });
        
        this.pxer.initPageTask()
        this.pxer.one("finishPageTask", ()=>{
            this.setState((prev : IPxerMainAppState)=>{
                return {
                    status: PxerMainApp.PxerStatus.running_work,
                }
            })
            this.pxer.one("finishWorksTask", ()=>{
                this.setState((prev :IPxerMainAppState)=>{
                    return {
                        status: PxerMainApp.PxerStatus.running_parse,
                    }
                })
            })
            this.pxer.one('finishParse', ()=>{
                this.analytics.postData("pxer.app.finish", {
                    result_count:this.pxer.workResultSet.length,
                    ptm_config:this.pxer.ptmConfig,
                    task_option:this.pxer.taskOption,
                    error_count:this.pxer.failList.length,
                });
                this.onPrint();
                this.setState((prev :IPxerMainAppState)=>{
                    return {
                        status: PxerMainApp.PxerStatus.finish,
                    }
                })
            })
            this.pxer.executeWroksTask()
        })
        this.setState((prev : IPxerMainAppState)=>{
            return {
                startTime: new Date(),
                status: PxerMainApp.PxerStatus.running_page,
            }
        })
        this.pxer.executePageTask()
    }
    onStop(){
        this.analytics.postData("pxer.app.halt", {
            task_count:this.pageCount()+this.downCount(),
            finish_count:this.finishCount(),
        });

        this.setState((prev: IPxerMainAppState)=>{
            return {
                status: PxerMainApp.PxerStatus.stopping,
            }
        })
        this.pxer.stop()
    }
    onRetry(tasks: PxerFailInfo[]){
        this.analytics.postData("pxer.app.reready", {
            checked_works:tasks,
        });
        
        this.pxer.one("finishWorksTask", ()=>{
            this.setState((prev :IPxerMainAppState)=>{
                return {
                    status: PxerMainApp.PxerStatus.running_parse,
                }
            })
        })
        this.pxer.one('finishParse', ()=>{
            this.onPrint();
            this.setState((prev :IPxerMainAppState)=>{
                return {
                    status: PxerMainApp.PxerStatus.finish,
                }
            })
        })
        this.pxer.executeFailWroks(tasks)
        this.setState((prev :IPxerMainAppState)=>{
            return {
                showErr: false,
                status: PxerMainApp.PxerStatus.running_work,
            }
        })
    }
    onShowErr(){
        this.setState(function (prev : IPxerMainAppState){
            return {
                showErr: !prev.showErr,
            }
        })
    }
    onPrint(){
        this.analytics.postData("pxer.app.print", {
            task_option:this.pxer.taskOption,
            result_count:this.pxer.workResultSet.length,
        });
        
        this.pxer.printWorks();
    }
}

namespace PxerMainApp {
    export enum PxerStatus {
        standby,
        init = "初始化",
        config = "待命",
        running_page = "抓取页码中",
        running_work = "抓取作品中",
        running_parse = "解析页面中",
        finish = "完成",
        stopping = "停止",
    }
}
export default PxerMainApp