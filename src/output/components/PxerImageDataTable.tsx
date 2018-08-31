import React, { Component } from 'react';
import {PxerImageDataHead, PxerImageDataLine, IPxerImageDataLineState} from './PxerImageData';
import { PxerIndeterminatableBoxState, PxerSelectableWorks } from '../lib';
interface IPxerImageDataTableProps {
    workData: PxerSelectableWorks[],
    tagFoldLength: number,
    onChange: ()=>void,
}
class PxerImageDataTable extends Component<IPxerImageDataTableProps> {
    constructor(props: IPxerImageDataTableProps){
        super(props);
        this.state = {};
        this.sortWithKey = this.sortWithKey.bind(this);
        this.changeAllSelection = this.changeAllSelection.bind(this);
    }
    render(){
        return (
            <table className="primary">
                <thead>
                    <PxerImageDataHead 
                        onSort={this.sortWithKey} 
                        onSetAllSelectedState={this.changeAllSelection}
                        boxState={
                            (()=>{
                                var len = this.props.workData.filter(wk=>wk.checked).length
                                switch (len) {
                                    case 0:
                                    return PxerIndeterminatableBoxState.none
                                    case this.props.workData.length:
                                    return PxerIndeterminatableBoxState.all
                                    default:
                                    return PxerIndeterminatableBoxState.indeterminate
                                }
                            })()
                        }
                    />
                </thead>
                <tbody>
                    {this.props.workData.map(work=>(
                        <PxerImageDataLine
                            work={work}
                            tagFoldLength={this.props.tagFoldLength}
                            onChange={this.props.onChange}
                            key={work.id}
                        />
                    ))}
                </tbody>
            </table>
        )
    }
    sortWithKey(key: keyof PxerSelectableWorks, reverse=false){
        this.props.workData.sort((a,b)=>(
            (a[key]>b[key] !== reverse)?1:-1
        ))
        this.forceUpdate();
    }
    changeAllSelection(opt: boolean){
        this.props.workData.forEach(el=>{
            el.checked = opt
        })
        this.props.onChange();
        this.forceUpdate();
    }
}

export default PxerImageDataTable