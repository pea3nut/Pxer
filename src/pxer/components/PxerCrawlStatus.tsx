import React, { Component } from 'react';
import PxerMainApp from './PxerMainApp';
import { PxerPageType } from '../pxerapp/PxerData.-1';
import {I18n} from 'react-i18next'

function cap(timesec: number):number|null{
    if (!timesec) return null;
    const maxtime =  9*60*60 + 59*60 + 59
    return Math.min(maxtime, timesec);
}
function fmtTime(sec: number) :string{
    function addZero(n: number, ndigit: number=2) :string{
        var str = n.toString();
        while (str.length<ndigit){
            str = "0"+str
        }
        return str
    }
    var displayhour = sec > 59*60+59
    if (displayhour){
        return `${addZero(Math.floor(sec/3600))}:${addZero(Math.floor(sec/60)%60)}:${addZero(Math.floor(sec%60))}`
    } else {
        return `${addZero(Math.floor(sec/60)%60)}:${addZero(Math.floor(sec%60))}`
    }
}
function PxerCrawlStatus(props : {
    version :string,
    status: PxerMainApp.PxerStatus,
    runtime: number|null,
    pageType: PxerPageType,
    downCount: number,
    pageCount: number,
    finishCount: number,
    lockConf: boolean,
    handleMaxID: (id :string)=>void,
    handleMaxWorkCount: (count: number)=>void,
}){
    return (
        <I18n ns="pxerapp">
            {
                (t) => (
                    <div className="pxer-info">
                    <div className="pi-item">
                        <div className="pii-title">{t("tab_generic")}</div>
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td>{t("app_version")}</td>
                                    <td>{props.version}</td>
                                </tr>
                                <tr>
                                    <td>{t("current_status")}</td>
                                    <td>{
                                        (()=>{
                                            switch (props.status){
                                                case PxerMainApp.PxerStatus.config:
                                                return t("status_standby")
                                                case PxerMainApp.PxerStatus.running_page:
                                                return t("status_running_page")
                                                case PxerMainApp.PxerStatus.running_work:
                                                return t("status_running_work")
                                                case PxerMainApp.PxerStatus.running_parse:
                                                return t("status_running_parse")
                                            }
                                        })()
                                    }</td>
                                </tr>
                                <tr>
                                    <td>{t("runtime")}</td>
                                    <td>{props.runtime?fmtTime(props.runtime as number):"--:--"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="pi-item">
                        <div className="pii-title">{t("tab_filter")}</div>
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td>{t("filter_minID")}</td>
                                    <td><input disabled={props.lockConf} size={9} min={0} style={{width: "8em"}} type="number" defaultValue={""} onChange={e=>props.handleMaxID(e.target.value)}/></td>
                                </tr><tr>
                                    <td>{t("filter_maxWorkCount")}</td>
                                    <td><input disabled={props.lockConf} size={9} min={0} style={{width: "8em"}} type="number" defaultValue={""} onChange={e=>props.handleMaxWorkCount(e.target.valueAsNumber)}/></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="pi-item">
                        <div className="pii-title">{t("tab_pageStatus")}</div>
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td>{t("PageType")}</td>
                                    <td>{
                                        (()=>{
                                            switch(props.pageType){
                                            case PxerPageType.member_works     :return t("pagetype_member_works")
                                            case PxerPageType.search           :return t("pagetype_search")
                                            case PxerPageType.bookmark_works   :return t("pagetype_bookmark_works")
                                            case PxerPageType.rank             :return t("pagetype_rank")
                                            case PxerPageType.bookmark_new     :return t("pagetype_bookmark_new")
                                            case PxerPageType.discovery        :return t("pagetype_discovery")
                                            case PxerPageType.unknown          :return t("pagetype_unknown")
                                            }
                                        })()
                                    }</td>
                                </tr>
                                <tr>
                                    <td>{t("downCount")}</td>
                                    <td>{(props.downCount)||t("Unknown")}</td>
                                </tr>
                                <tr>
                                    <td>{t("pageCount")}</td>
                                    <td>{(props.pageCount)||t("Unknown")}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="pi-item">
                        <div className="pii-title">{t("tab_progress")}</div>
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td>{t("job_total")}</td>
                                    <td>{(props.downCount+props.pageCount)||t("Unknown")}</td>
                                </tr>
                                <tr>
                                    <td>{t("finish_count")}</td>
                                    <td>{props.finishCount}</td>
                                </tr>
                                <tr>
                                    <td>{t("ETA")}</td>
                                    <td>
                                    {
                                        (()=>{
                                            var time = cap((props.downCount+props.pageCount-props.finishCount)
                                                       /
                                                       (props.finishCount/(props.runtime as number)));
                                            return time?fmtTime(time):"--:--"
                                            
                                        })()
                                    }
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                )
            }
        </I18n>
    )
}
export default PxerCrawlStatus