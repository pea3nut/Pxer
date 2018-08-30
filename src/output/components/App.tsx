import React, { Component } from 'react';
import Sidebar from "react-sidebar";
import clipboard from "clipboard-polyfill"
import 'picnic/picnic.min.css';
import '../assets/custom.css'

import PxerOutputNavbar from './PxerOutputNavbar'
import PxerImageDataTable from './PxerImageDataTable'
import {PxerSideBarConfig, IPxerSideBarConfigProps, IPxerSideBarConfigState} from './PxerSideBarConfig'
import PxerAdvancedFilterModal from './PxerAdvancedFilterModal'
import PxerCopyFallbackModal from './PxerCopyFallbackModal';
import { PxerWorks } from '../../pxer/pxerapp/PxerWorksDef.-1';
import {PxerImageDataHead, PxerImageDataLine} from './PxerImageData'

interface IPxerOutputAppProps {
    resultData: PxerWorks[];
}
interface IPxerOutputAppState {
    configsidebarOpen: boolean,
}

class PxerOutputApp extends Component<IPxerOutputAppProps, IPxerOutputAppState> {
    imageDataTable: PxerImageDataTable|null;
    sidebarConfig: PxerSideBarConfig|null;
    tags: string[];
    constructor(props: IPxerOutputAppProps){
        super(props);
        this.state = {
            configsidebarOpen: false,
        }
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
        this.copyLinks = this.copyLinks.bind(this);
        this.onAdvancedFilter = this.onAdvancedFilter.bind(this);
        this.applyWorkFilter = this.applyWorkFilter.bind(this);
        this.getLinks = this.getLinks.bind(this);
        
        this.imageDataTable = null
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
                    sidebar={<PxerSideBarConfig 
                    onRef={(ref: PxerSideBarConfig|null)=>{this.sidebarConfig=ref}}/>}
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
    getLinks(): string[]{
        if (!this.imageDataTable) return [];
        var works = this.imageDataTable.gatherSelectedWorksInfo();
        var urls = [];
        for (var work of works) {
            var url: string;
            if ((work.props as any).illustType==="ugoira") {
                url = ((work.props as any).urls as any)[
                    (this.sidebarConfig as PxerSideBarConfig).state.ugoira
                ] as string;
                if (url) urls.push(url)
            } else {
                url = ((work.props as any).urls as any)[
                    ((this.sidebarConfig as PxerSideBarConfig).state as IPxerSideBarConfigState as any)[
                        (work.props as any).illustType+"_"+
                        ((work.props as any).pageCount>1?"multiple":"single")
                    ] as string
                ] as string
                if (!url) continue;
                for (var i=0;i<(work.props as any).pageCount;i++) {
                    urls.push(url.replace("_p0","_p"+i))
                }
            }
        }
        return urls;
    }
    copyLinks(): Promise<number>{
        return new Promise((res, rej)=>{
            let urls = this.getLinks();
            clipboard.writeText(urls.join("\n")).then(()=>{
                res(urls.length);
            }).catch(e=>{
                (this.refs.copyfallback as PxerCopyFallbackModal).toggle(e);
                rej(e);
            });
        })
    }
    onAdvancedFilter(){
        (this.refs.filtermodal as PxerAdvancedFilterModal).setState(prev=>{
            return {opened: !prev.opened}
        })
    }
    applyWorkFilter(filterfn: (wk: PxerImageDataLine)=>boolean){
        for (var work of (this.imageDataTable as PxerImageDataTable).getAllWorksRef()) {
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
