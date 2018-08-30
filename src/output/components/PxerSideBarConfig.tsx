import React, { Component } from 'react';
import { PxerWorks, PxerWorkUrl, PxerUgoiraWorksUrl } from '../../pxer/pxerapp/PxerWorksDef.-1';

interface IPxerSideBarConfigProps {
    onRef: (ref: PxerSideBarConfig|null)=>void;
}
interface IPxerSideBarConfigState {
    illust_single: keyof PxerWorkUrl
    illust_multiple: keyof PxerWorkUrl
    manga_single: keyof PxerWorkUrl
    manga_multiple: keyof PxerWorkUrl
    ugoira: keyof PxerUgoiraWorksUrl
}
class PxerSideBarConfig extends Component<IPxerSideBarConfigProps, IPxerSideBarConfigState> {
    constructor(props: IPxerSideBarConfigProps){
        super(props)
        this.state = {
            illust_single: "original",
            illust_multiple: "original",
            manga_single: "original",
            manga_multiple: "original",
            ugoira: "ugoira_master",
        }
    }
    componentDidMount() {
        this.props.onRef(this)
    }
    componentWillUnmount() {
        this.props.onRef(null)
    }
    render(){
        return (
            <div id="output-sidebar-config">
                <div id="illust_single">
                    <h2>Illust_Single</h2>
                    <select onChange={e=>{
                        var newvalue = e.target.value;
                        this.setState(prev=>({
                            illust_single: newvalue as keyof PxerWorkUrl,
                        }))
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
                        this.setState(prev=>({
                            illust_multiple: newvalue as keyof PxerWorkUrl,
                        }))
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
                        this.setState(prev=>({
                            manga_single: newvalue as keyof PxerWorkUrl,
                        }))
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
                        this.setState(prev=>({
                            manga_multiple: newvalue as keyof PxerWorkUrl,
                        }))
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
                        this.setState(prev=>({
                            ugoira: newvalue as keyof PxerUgoiraWorksUrl,
                        }))
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
export {PxerSideBarConfig, IPxerSideBarConfigProps, IPxerSideBarConfigState}