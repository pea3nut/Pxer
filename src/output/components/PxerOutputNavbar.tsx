import React, { Component } from 'react';
import {I18n} from 'react-i18next'


enum PxerCopyPromistStatus {
    standby,
    ongoing,
    error,
    success,
}
interface IPxerOutputNavBarProps {
    onCopy: ()=>Promise<any>;
    onOutputConfig: ()=>void;
    onAdvancedFilter: ()=>void;
    onUgoiraScript: ()=>void;
    linkCount: number;
    showUgoiraScript: boolean;
}
interface IPxerOutputNavBarState {
    copyPromiseStatus: PxerCopyPromistStatus,
    lastSuccessCount: number
}
class PxerOutputNavbar extends Component<IPxerOutputNavBarProps, IPxerOutputNavBarState> {
    constructor(props: IPxerOutputNavBarProps){
        super(props);
        this.state = {
            copyPromiseStatus: PxerCopyPromistStatus.standby,
            lastSuccessCount: 0,
        }
        
        this.doCopy = this.doCopy.bind(this);
    }
    render(){
        return (
            <I18n ns="pxeroutput">
            {
                (t)=>(
                    <nav className="" style={{position: "absolute"}}>
                    <a className="brand" href="http://pxer.pea3nut.org" target="_blank">{t("pxer_brandname")}</a>
                    <div className="menu">
                        <a className="pseudo button" onClick={this.props.onAdvancedFilter}>{t("advanced_filter")}</a>
                        <a className="pseudo button" onClick={this.props.onOutputConfig}>{t("output_config")}</a>
                        {
                            this.props.showUgoiraScript?
                            <a className="pseudo button" onClick={this.props.onUgoiraScript}>{t("ugoira_concat")}</a>
                            :null
                        }
                            {
                                (()=>{
                                    switch (this.state.copyPromiseStatus) {
                                        case PxerCopyPromistStatus.ongoing:
                                            return <a className="button disabled">...</a>
                                        case PxerCopyPromistStatus.standby:
                                            return <a className="button" onClick={this.doCopy}>{t("copy_prompt", {count: this.props.linkCount})}</a>
                                        case PxerCopyPromistStatus.error:
                                            return <a className="button warning">{t("copy_fail")}</a>
                                        case PxerCopyPromistStatus.success:
                                            return <a className="button success">{t("copy_success", {count:this.state.lastSuccessCount})}</a>
                                    }
                                })()
                            }
                    </div>
                </nav>
                )
            }
            </I18n>

        )
    }
    doCopy(){
        this.setState(prev=>{
            return {
                copyPromiseStatus: PxerCopyPromistStatus.ongoing,
            }
        })
        this.props.onCopy().then(count=>{
            this.setState(prev=>{
                return {
                    copyPromiseStatus: PxerCopyPromistStatus.success,
                    lastSuccessCount: count,
                }
            })
            setTimeout(()=>{
                this.setState(prev=>{
                    return {
                        copyPromiseStatus: PxerCopyPromistStatus.standby,
                    }
                })
            }, 2000)
        }).catch(()=>{
            this.setState(prev=>{
                return {
                    copyPromiseStatus: PxerCopyPromistStatus.error,
                }
            })
            setTimeout(()=>{
                this.setState(prev=>{
                    return {
                        copyPromiseStatus: PxerCopyPromistStatus.standby,
                    }
                })
            }, 2000)
        })
    }
}

export default PxerOutputNavbar