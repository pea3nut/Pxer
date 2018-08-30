import React, { Component } from 'react';
import {PxerMode, PxerWorkType, PxerPageType, PxerRequest, PxerPageRequest, PxerWorksRequest, PxerFailType, PxerFailInfo} from '../pxerapp/PxerData.-1'

interface IPxerFailDisplayProps {
    onDoRetry: (tasks: PxerFailInfo[])=>void,
    failList: PxerFailInfo[],
}
class PxerFailDisplay extends Component<IPxerFailDisplayProps, any> {
    selectedworks: string[];
    typeadvicemap: {[x in keyof typeof PxerFailType]:string};
    constructor(props: IPxerFailDisplayProps){
        super(props);
        this.selectedworks = [];
        this.typeadvicemap = {
            HTTPCode: "稍后再试",
            mypixiv: "添加画师好友再尝试",
            parse: '再试一次，若问题依旧，请<a href="https://github.com/pea3nut/Pxer/issues/5" target="_blank">反馈</a>给花生',
            timeout: "增加最大等待时间再试一次~",
            urlempty: "点击左侧链接确认内容正确，再试一次~",
            r18:'开启账号R-18选项',
            r18g:'开启账号R-18G选项',
        };
    }
    render(){
        return (
            <div className="pxer-fail">
            <table className="table">
                <thead className="pft-head"><tr>
                    <td>图片ID</td>
                    <td style={{width: "100px"}}>失败原因</td>
                    <td>解决方案</td>
                    <td style={{width: "170px"}} className="text-right">
                        <button 
                            className="btn btn-outline-secondary" 
                            onClick={()=>{
                                        this.selectedworks = this.props.failList.map(fail=>((fail.task as PxerWorksRequest).id))
                                        this.forceUpdate();
                                    }
                        }>
                            全选
                        </button>
                        <button 
                            className="btn btn-outline-success" 
                            onClick={()=>{
                                this.props.onDoRetry(
                                    this.props.failList.filter(
                                        fail=>this.selectedworks.indexOf((fail.task as PxerWorksRequest).id)!==-1
                                    )
                                )
                            }}
                        >
                            重试选中
                        </button>
                    </td>
                </tr></thead>
                <tbody>
                    {
                        this.props.failList.map(fail=>(
                            <tr key={(fail.task as PxerWorksRequest).id}>
                                <td><a href={fail.url}>{(fail.task as PxerWorksRequest).id}</a></td>
                                <td>{fail.type}</td>
                                <td dangerouslySetInnerHTML={{__html: (this.typeadvicemap as any)[fail.type]}} />
                                <td className="text-right">
                                    <input 
                                        type="checkbox" 
                                        checked={this.selectedworks.indexOf((fail.task as PxerWorksRequest).id)!==-1}
                                        onChange={()=>{
                                            if (this.selectedworks.indexOf((fail.task as PxerWorksRequest).id)!==-1) {
                                                this.selectedworks = this.selectedworks.filter(elem=>{
                                                    elem!==(fail.task as PxerWorksRequest).id
                                                })
                                            } else {
                                                this.selectedworks.push((fail.task as PxerWorksRequest).id)
                                            }
                                            this.forceUpdate();
                                        }}
                                    />
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
        )
    }
}


export default PxerFailDisplay