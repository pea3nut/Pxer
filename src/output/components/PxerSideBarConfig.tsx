import React, { Component } from 'react';
import { PxerWorks, PxerWorkUrl, PxerUgoiraWorksUrl } from '../../pxer/pxerapp/PxerWorksDef.-1';
import {IPxerOutputConfig} from '../lib'
import {I18n} from 'react-i18next'


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
            <I18n ns="pxeroutput">
            {
                (t)=>(
                    <div id="output-sidebar-config">
                    <div id="illust_single">
                        <h2>{t("illust_single")}</h2>
                        <select onChange={e=>{
                            var newvalue = e.target.value;
                            this.props.applyConfig("illust_single", newvalue as keyof PxerWorkUrl)
                        }}>
                            <option value="original">{t("url_original")}</option>
                            <option value="regular">{t("url_regular")}</option>
                            <option value="thumb">{t("url_thumb")}</option>
                            <option value="mini">{t("url_mini")}</option>
                            <option value="small">{t("url_small")}</option>
    
                        </select>
                    </div>
                    <div id="illust_multiple">
                        <h2>{t("illust_multiple")}</h2>
                        <select onChange={e=>{
                            var newvalue = e.target.value;
                            this.props.applyConfig("illust_multiple", newvalue as keyof PxerWorkUrl)
                        }}>
                            <option value="original">{t("url_original")}</option>
                            <option value="regular">{t("url_regular")}</option>
                            <option value="thumb">{t("url_thumb")}</option>
                            <option value="mini">{t("url_mini")}</option>
                            <option value="small">{t("url_small")}</option>
    
                        </select>
                    </div>
                    <div id="manga_single">
                        <h2>{t("manga_single")}</h2>
                        <select onChange={e=>{
                            var newvalue = e.target.value;
                            this.props.applyConfig("manga_single", newvalue as keyof PxerWorkUrl)
                        }}>
                            <option value="original">{t("url_original")}</option>
                            <option value="regular">{t("url_regular")}</option>
                            <option value="thumb">{t("url_thumb")}</option>
                            <option value="mini">{t("url_mini")}</option>
                            <option value="small">{t("url_small")}</option>
    
                        </select>
                    </div>
                    <div id="manga_multiple">
                        <h2>{t("manga_multiple")}</h2>
                        <select onChange={e=>{
                            var newvalue = e.target.value;
                            this.props.applyConfig("manga_multiple", newvalue as keyof PxerWorkUrl)
                        }}>
                            <option value="original">{t("url_original")}</option>
                            <option value="regular">{t("url_regular")}</option>
                            <option value="thumb">{t("url_thumb")}</option>
                            <option value="mini">{t("url_mini")}</option>
                            <option value="small">{t("url_small")}</option>
    
                        </select>
                    </div>
                    <div id="ugoira_single">
                        <h2>{t("ugoira")}</h2>
                        <select onChange={e=>{
                            var newvalue = e.target.value;
                            this.props.applyConfig("ugoira", newvalue as keyof PxerUgoiraWorksUrl)
                        }}>
                            <option value="ugoira_master">{t("url_ugoira_original")}</option>
                            <option value="ugoira_600p">{t("url_ugoira_600p")}</option>
                            <option value="original">{t("url_cover_original")}</option>
                            <option value="regular">{t("url_cover_regular")}</option>
                            <option value="thumb">{t("url_cover_thumb")}</option>
                            <option value="mini">{t("url_cover_mini")}</option>
                            <option value="small">{t("url_cover_small")}</option>
                        </select>
                    </div>
                </div>
                )
            }
            </I18n>

        )
    }
}
export {PxerSideBarConfig, IPxerSideBarConfigProps}