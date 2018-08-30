import React, { Component } from 'react';
import PxerMainApp from './PxerMainApp';
import { PxerPageType } from '../pxerapp/PxerData.-1';

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
let pageTypeMap: {[x in keyof typeof PxerPageType]?: string} = {
    member_works     :'作品列表页',
    search           :'检索页',
    bookmark_works   :'收藏列表页',
    rank             :'排行榜',
    bookmark_new     :'关注的新作品',
    discovery        :'探索',
    unknown          :'未知',
};

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
        <div className="pxer-info">
            <div className="pi-item">
                <div className="pii-title">程序状态</div>
                <table className="table">
                    <tbody>
                        <tr>
                            <td>主程序版本：</td>
                            <td>{props.version}</td>
                        </tr>
                        <tr>
                            <td>当前状态：</td>
                            <td>{props.status}</td>
                        </tr>
                        <tr>
                            <td>已运行时间：</td>
                            <td>{props.runtime?fmtTime(props.runtime as number):"--:--"}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="pi-item">
                <div className="pii-title">筛选设置</div>
                <table className="table">
                    <tbody>
                        <tr>
                            <td>停止ID：</td>
                            <td><input disabled={props.lockConf} size={9} type="number" defaultValue={""} onChange={e=>props.handleMaxID(e.target.value)}/></td>
                        </tr><tr>
                            <td>最大作品数：</td>
                            <td><input disabled={props.lockConf} size={9} type="number" defaultValue={""} onChange={e=>props.handleMaxWorkCount(e.target.valueAsNumber)}/></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="pi-item">
                <div className="pii-title">当前页面信息</div>
                <table className="table">
                    <tbody>
                        <tr>
                            <td>页面类型：</td>
                            <td>{pageTypeMap[props.pageType]}</td>
                        </tr>
                        <tr>
                            <td>下载数量：</td>
                            <td>{(props.downCount)||"未知"}</td>
                        </tr>
                        <tr>
                            <td>页面数量：</td>
                            <td>{(props.pageCount)||"未知"}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="pi-item">
                <div className="pii-title">执行进度</div>
                <table className="table">
                    <tbody>
                        <tr>
                            <td>总任务数：</td>
                            <td>{(props.downCount+props.pageCount)||"未知"}</td>
                        </tr>
                        <tr>
                            <td>已完成：</td>
                            <td>{props.finishCount}</td>
                        </tr>
                        <tr>
                            <td>剩余时间：</td>
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
export default PxerCrawlStatus