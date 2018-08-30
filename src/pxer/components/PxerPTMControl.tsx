import React, { Component } from 'react';
function PxerPTMControl(props: {
    handleThreadCount: (n: number)=>void,
    handleTimeOut: (ms: number)=>void,
    handleRetry: (count: number)=>void,
    defaultThreadCount: number,
    defaultTimeout: number,
    defaultRetry: number,
}){
    return (
        <div className="pxer-task-option form-inline">
            <div className="form-group">
                <label className="pcf-title">线程数：</label>
                <input max={99} type="number" defaultValue={props.defaultThreadCount.toString()} onChange={e=>props.handleThreadCount(e.target.valueAsNumber)}/>
            </div>
            <div className="form-group">
                <label className="pcf-title">超时时间：</label>
                <input max={99999} type="number" defaultValue={props.defaultTimeout.toString()} onChange={e=>props.handleTimeOut(e.target.valueAsNumber)}/>
            </div>
            <div className="form-group">
                <label className="pcf-title">重试次数：</label>
                <input max={99} style={{width:"8em"}} type="number" defaultValue={props.defaultRetry.toString()} onChange={e=>props.handleRetry(e.target.valueAsNumber)}/>
            </div>
        </div>
    )
}
export default PxerPTMControl