import React, { Component } from 'react';
import Sidebar from "react-sidebar";
import clipboard from "clipboard-polyfill"
import 'picnic/picnic.min.css';
import '../assets/custom.css'

import PxerOutputNavbar from './PxerOutputNavbar'
import PxerImageDataTable from './PxerImageDataTable'
import {PxerSideBarConfig} from './PxerSideBarConfig'
import PxerAdvancedFilterModal from './PxerAdvancedFilterModal'
import PxerCopyFallbackModal from './PxerCopyFallbackModal';

import {PxerSelectableWorks, IPxerOutputConfig} from '../lib'
import { PxerWorkType } from '../../pxer/pxerapp/PxerData.-1';

interface IPxerOutputAppProps {
    resultData: PxerSelectableWorks[];
}
interface IPxerOutputAppState {
    configsidebarOpen: boolean,
    outputConfig: IPxerOutputConfig,
}

class PxerOutputApp extends Component<IPxerOutputAppProps, IPxerOutputAppState> {
    tags: string[];
    constructor(props: IPxerOutputAppProps){
        super(props);
        this.state = {
            configsidebarOpen: false,
            outputConfig: {
                illust_single: "original",
                illust_multiple: "original",
                manga_single: "original",
                manga_multiple: "original",
                ugoira: "ugoira_master",
            },
        }
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
        this.copyLinks = this.copyLinks.bind(this);
        this.onAdvancedFilter = this.onAdvancedFilter.bind(this);
        this.applyWorkFilter = this.applyWorkFilter.bind(this);
        this.getLinks = this.getLinks.bind(this);
        
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
                                config={this.state.outputConfig}
                                applyConfig={(key, value)=>{this.state.outputConfig[key]=value;}}
                            />
                    }
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
                            linkCount={this.props.resultData.filter(wk=>wk.checked).length}
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
                                onChange={()=>{this.forceUpdate();}}
                            />
                        </div>
                    </main>
                </Sidebar>
            </div>
        );
    }
    getLinks(): string[]{
        var works = this.props.resultData.filter(wk=>wk.checked);
        var urls = [];
        for (var work of works) {
            var url: string;
            if (work.type===PxerWorkType.Ugoira) {
                url = (work.urls as any)[
                    this.state.outputConfig.ugoira
                ] as string;
                if (url) urls.push(url)
            } else {
                url = (work.urls as any)[
                    ((this.state.outputConfig as any)[
                        work.type+
                        "_"+
                        (work.isMultiple?"multiple":"single")
                    ] as string)
                ] as string
                if (!url) continue;
                for (var i=0;i<work.multiple;i++) {
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
    applyWorkFilter(filterfn: (wk: PxerSelectableWorks)=>boolean){
        for (var work of this.props.resultData) {
            let res = filterfn(work)
            work.checked = res
        }
        this.forceUpdate();
    }
}

export default PxerOutputApp;
