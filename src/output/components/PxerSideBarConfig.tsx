import React, { Component } from 'react';
import { PxerWorks, PxerWorkUrl, PxerUgoiraWorksUrl } from '../../pxer/pxerapp/PxerWorksDef.-1';
import {IPxerOutputConfig} from '../lib'

type  IPxerSideBarConfigProps = {
    config: IPxerOutputConfig,
    applyConfig: (key: keyof IPxerOutputConfig, value: (keyof PxerWorkUrl | keyof PxerUgoiraWorksUrl))=>void,
}
class PxerSideBarConfig extends Component<IPxerSideBarConfigProps> {
    constructor(props: IPxerSideBarConfigProps){
        super(props)
    }
    render(){
        return (
            <div id="output-sidebar-config">
                <div id="illust_single">
                    <h2>Illust_Single</h2>
                    <select onChange={e=>{
                        var newvalue = e.target.value;
                        this.props.applyConfig("illust_single", newvalue as keyof PxerWorkUrl)
                    }}>
                        <option value="original">Original</option>
                        <option value="regular">Regular</option>
                        <option value="thumb">Thumb</option>
                        <option value="mini">Mini</option>
                        <option value="small">Small</option>

                    </select>
                </div>
                <div id="illust_multiple">
                    <h2>Illust_Multiple</h2>
                    <select onChange={e=>{
                        var newvalue = e.target.value;
                        this.props.applyConfig("illust_multiple", newvalue as keyof PxerWorkUrl)
                    }}>
                        <option value="original">Original</option>
                        <option value="regular">Regular</option>
                        <option value="thumb">Thumb</option>
                        <option value="mini">Mini</option>
                        <option value="small">Small</option>

                    </select>
                </div>
                <div id="manga_single">
                    <h2>manga_Single</h2>
                    <select onChange={e=>{
                        var newvalue = e.target.value;
                        this.props.applyConfig("manga_single", newvalue as keyof PxerWorkUrl)
                    }}>
                        <option value="original">Original</option>
                        <option value="regular">Regular</option>
                        <option value="thumb">Thumb</option>
                        <option value="mini">Mini</option>
                        <option value="small">Small</option>

                    </select>
                </div>
                <div id="manga_multiple">
                    <h2>manga_Multiple</h2>
                    <select onChange={e=>{
                        var newvalue = e.target.value;
                        this.props.applyConfig("manga_multiple", newvalue as keyof PxerWorkUrl)
                    }}>
                        <option value="original">Original</option>
                        <option value="regular">Regular</option>
                        <option value="thumb">Thumb</option>
                        <option value="mini">Mini</option>
                        <option value="small">Small</option>

                    </select>
                </div>
                <div id="ugoira_single">
                    <h2>ugoira</h2>
                    <select onChange={e=>{
                        var newvalue = e.target.value;
                        this.props.applyConfig("ugoira", newvalue as keyof PxerUgoiraWorksUrl)
                    }}>
                        <option value="ugoira_master">Original</option>
                        <option value="ugoira_600p">600p</option>
                        <option value="original">Cover_Original</option>
                        <option value="regular">Cover_Regular</option>
                        <option value="thumb">Cover_Thumb</option>
                        <option value="mini">Cover_Mini</option>
                        <option value="small">Cover_Small</option>

                    </select>
                </div>
            </div>
        )
    }
}
export {PxerSideBarConfig, IPxerSideBarConfigProps}