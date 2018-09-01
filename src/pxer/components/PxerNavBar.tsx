import React, { Component } from 'react';
import {PxerMode, PxerWorkType, PxerPageType, PxerRequest, PxerPageRequest, PxerWorksRequest, PxerFailType, PxerFailInfo} from '../pxerapp/PxerData.-1'
import {I18n} from 'react-i18next'

interface IPxerNavBarProps {
    onLoad: ()=>void,
    onRun: ()=>void,
    onStop: ()=>void,
    onShowErr: ()=>void,
    onReset: ()=>void,
    onPrint: ()=>void,
    showButton?: PxerNavBar.PxerNavBarButtonType,
    errInfo: string,
    showWarn: boolean,
    showReset: boolean,
    errCount: number,
} 

class PxerNavBar extends Component<IPxerNavBarProps, any> {
    constructor(props: IPxerNavBarProps) {
        super(props);
    }
    render() {
        return (
            <I18n ns="pxerapp">
            {
                (t)=>(
                    <div className="pxer-nav">
                    <div className="pn-header">
                        <a href="http://pxer.pea3nut.org/" target="_blank">{t("pxer_brandname")}</a>
                    </div>
                    <div className="pn-message">
                        {this.props.errInfo}
                    </div>
                    <div className="pn-buttons">
                        {
                            (()=>{
                                switch(this.props.showButton){
                                    case PxerNavBar.PxerNavBarButtonType.load:
                                    return <button className="btn btn-outline-success" onClick={this.props.onLoad}>{t("btn_load")}</button>
                                    case PxerNavBar.PxerNavBarButtonType.run:
                                    return <button className="btn btn-outline-primary" onClick={this.props.onRun}>{t("btn_run")}</button>
                                    case PxerNavBar.PxerNavBarButtonType.init:
                                    <div id="wave">
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                    </div>
                                    case PxerNavBar.PxerNavBarButtonType.stop:
                                    return <button className="btn btn-outline-danger" onClick={this.props.onStop}>{t("btn_stop")}</button>
                                    case PxerNavBar.PxerNavBarButtonType.print:
                                    return <button className="btn btn-outline-success" onClick={this.props.onPrint}>{t("btn_print")}</button>
                                }
                            })()
                        }
                        {
                            this.props.showReset?
                            <button className="btn btn-outline-danger" onClick={this.props.onReset}>{t("btn_reset")}</button>
                            :null
                        }
                        {
                            this.props.showWarn?
                            <button className="btn btn-outline-warning" onClick={this.props.onShowErr}>Warn</button>
                            :null
                        }
                        {
                            this.props.showWarn?
                            <span className="pnb-warn-number">{Math.min(this.props.errCount, 99)}</span>
                            :null
                        }
                    </div>
                </div>
                )
            }
            </I18n>

        )
    }
}

namespace PxerNavBar {
    export enum PxerNavBarButtonType {
        load,
        run,
        init,
        stop,
        print,
    }
}
export default PxerNavBar