import React, { Component } from 'react';
import Sidebar from "react-sidebar";
import clipboard from "clipboard-polyfill"
import 'picnic/picnic.min.css';
import '../assets/custom.css'

import PxerOutputNavbar from './PxerOutputNavbar'
import PxerImageDataTable from './PxerImageDataTable'
import PxerSideBarConfig from './PxerSideBarConfig'
import PxerAdvancedFilterModal from './PxerAdvancedFilterModal'
import PxerCopyFallbackModal from './PxerCopyFallbackModal';

class PxerOutputApp extends Component {
    constructor(props){
        super(props);
        this.state = {
            configsidebarOpen: false,
            output_conf: {
                illust_single: "original",
                illust_multiple: "original",
                manga_single: "original",
                manga_multiple: "original",
                ugoira_single: "master",
            }
        }
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
        this.copyLinks = this.copyLinks.bind(this);
        this.handleUpdateConf = this.handleUpdateConf.bind(this);
        this.onAdvancedFilter = this.onAdvancedFilter.bind(this);
        this.applyWorkFilter = this.applyWorkFilter.bind(this);
        this.getLinks = this.getLinks.bind(this);
        
        this.imageDataTable = null;
        this.sidebarConfig = null;
        this.tags = [].concat.apply([], this.props.resultData.map((res)=>res.tagList));;
    }
    onSetSidebarOpen() {
        this.setState(prev=>{
            return { configsidebarOpen: !prev.configsidebarOpen }
        });
    }
    render() {
        return (
            <div className="Pxer-Output">
                <Sidebar
                    sidebar={<PxerSideBarConfig onRef={ref=>{this.sidebarConfig=ref}}/>}
                    open={this.state.configsidebarOpen}
                    onSetOpen={this.onSetSidebarOpen}
                    styles={{
                        sidebar: {
                            background: "white",
                            marginTop: "40px",
                            padding: "10px",
                        }
                    }}
                    pullRight={true}
                    updateConf={this.handleUpdateConf}
                >
                    <div>
                        <PxerOutputNavbar 
                            onCopy={this.copyLinks} 
                            onOutputConfig={this.onSetSidebarOpen}
                            onAdvancedFilter={this.onAdvancedFilter}
                            linkCount={this.imageDataTable? this.imageDataTable.gatherSelectedWorksInfo().length:0}
                        />
                        <PxerAdvancedFilterModal 
                            ref="filtermodal"
                            filterReceiver={this.applyWorkFilter}
                            tagList={this.tags}
                        />
                        <PxerCopyFallbackModal
                            getText={()=>this.getLinks().join("\n")}
                            ref="copyfallback"
                        />
                    </div>
                    <main>
                        <div className="main">
                            <PxerImageDataTable 
                                workData={this.props.resultData} 
                                tagFoldLength={6}
                                onRef={ref => {this.imageDataTable = ref; this.forceUpdate();}} 
                                onChange={()=>{this.forceUpdate()}}
                            />
                        </div>
                    </main>
                </Sidebar>
            </div>
        );
    }
    getLinks(){
        if (!this.imageDataTable) return [];
        var works = this.imageDataTable.gatherSelectedWorksInfo();
        var urls = [];
        for (var work of works) {
            var url;
            if (work.props.illustType==="ugoira") {
                url = work.props.urls[
                    this.sidebarConfig.state.ugoira
                ]
                if (url) urls.push(url)
            } else {
                url = work.props.urls[
                    this.sidebarConfig.state[
                        work.props.illustType+"_"+
                        (work.props.pageCount>1?"multiple":"single")
                    ]
                ]
                if (!url) continue;
                for (var i=0;i<work.props.pageCount;i++) {
                    urls.push(url.replace("_p0","_p"+i))
                }
            }
        }
        return urls;
    }
    copyLinks(){
        return new Promise((res, rej)=>{
            let urls = null;
            urls = this.getLinks();
            clipboard.writeText(urls.join("\n")).then(()=>{
                res(urls.length);
            }).catch(e=>{
                this.refs.copyfallback.toggle(e);
                rej(e);
            });
        })
    }
    handleUpdateConf(newconf){
        this.setState({
            output_conf: newconf,
        })
    }
    onAdvancedFilter(e){
        this.refs.filtermodal.setState(prev=>{
            return {opened: !prev.opened}
        })
    }
    applyWorkFilter(filterfn){
        for (var work of this.imageDataTable.getAllWorksRef()) {
            let res = filterfn(work)
            work.setState(prev=>{
                return {
                    checked: res,
                }
            })
        }
    }
}

export default PxerOutputApp;
