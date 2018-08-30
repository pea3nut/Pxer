import React, { Component } from 'react';
import {PxerMode, PxerWorkType, PxerPageType, PxerRequest, PxerPageRequest, PxerWorksRequest, PxerFailType, PxerFailInfo} from '../pxerapp/PxerData.-1'

interface IPxerNavBarProps {
    onLoad: ()=>void,
    onRun: ()=>void,
    onStop: ()=>void,
    onShowErr: ()=>void,
    onPrint: ()=>void,
    showButton?: PxerNavBar.PxerNavBarButtonType,
    errInfo: string,
    showWarn: boolean,
    errCount: number,
} 

class PxerNavBar extends Component<IPxerNavBarProps, any> {
    constructor(props: IPxerNavBarProps) {
        super(props);
    }
    render() {
        return (
            <div className="pxer-nav">
                <div className="pn-header">
                    <a href="http://pxer.pea3nut.org/" target="_blank">Pxer 7</a>
                </div>
                <div className="pn-message">
                    {this.props.errInfo}
                </div>
                <div className="pn-buttons">
                    {
                        (()=>{
                            switch(this.props.showButton){
                                case PxerNavBar.PxerNavBarButtonType.load:
                                return <button className="btn btn-outline-success" onClick={this.props.onLoad}>Load</button>
                                case PxerNavBar.PxerNavBarButtonType.run:
                                return <button className="btn btn-outline-primary" onClick={this.props.onRun}>Run</button>
                                case PxerNavBar.PxerNavBarButtonType.init:
                                <div id="wave">
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                </div>
                                case PxerNavBar.PxerNavBarButtonType.stop:
                                return <button className="btn btn-outline-danger" onClick={this.props.onStop}>Stop</button>
                                case PxerNavBar.PxerNavBarButtonType.print:
                                return <button className="btn btn-outline-success" onClick={this.props.onPrint}>Print</button>
                            }
                        })()
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