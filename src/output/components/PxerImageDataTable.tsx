import React, { Component } from 'react';
import {PxerImageDataHead, PxerImageDataLine, IPxerImageDataLineState} from './PxerImageData';
import { PxerWorks } from '../../pxer/pxerapp/PxerWorksDef.-1';
import { PxerIndeterminatableBoxState } from './lib';
interface IPxerImageDataTableProps {
    workData: PxerWorks[],
    tagFoldLength: number,
    onRef: (ref: PxerImageDataTable)=>void,
    onChange: ()=>void,
}
interface IWorkDataLineElem {
    elem: React.ReactElement<PxerImageDataLine>,
    ref: PxerImageDataLine|null,
}
class PxerImageDataTable extends Component<IPxerImageDataTableProps> {
    workDataLine : IWorkDataLineElem[]
    constructor(props: IPxerImageDataTableProps){
        super(props);
        this.state = {};
        this.workDataLine= [];
        for (let work of this.props.workData) {
            this.workDataLine.push((()=>{
                var obj : IWorkDataLineElem= {
                    elem:   <PxerImageDataLine
                                key={work.id}
                                illustId={work.id}
                                illustType={work.type}
                                tagList={work.tagList}
                                likeCount={work.likeCount}
                                viewCount={work.viewCount}
                                rateCount={work.ratedCount}
                                pageCount={work.multiple || 1}
                                workDate={work.date}
                                workTitle={work.title}
                                urls={work.urls}
                                onRef={ref=>{obj.ref=ref}}
                                onChange={this.props.onChange}
                                tagFoldLength={this.props.tagFoldLength}
                            />,
                    ref: null,
                }
                return obj;
            })())

        }
        this.gatherSelectedWorksInfo = this.gatherSelectedWorksInfo.bind(this);
        this.sortWithKey = this.sortWithKey.bind(this);
        this.changeAllSelection = this.changeAllSelection.bind(this);
        this.getAllWorksRef = this.getAllWorksRef.bind(this);
    }
    componentWillMount(){
        this.props.onRef(this)
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
                                var len = this.gatherSelectedWorksInfo().length
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
                    {this.workDataLine.map(obj=>obj.elem)}
                </tbody>
            </table>
        )
    }
    gatherSelectedWorksInfo(): React.ReactElement<PxerImageDataLine>[]{
        var res :React.ReactElement<PxerImageDataLine>[] = [];
        for (let dl of this.workDataLine) {
            if (dl.ref && !dl.ref.state.checked) continue;
            res.push(dl.elem);
        }
        return res;
    }
    getAllWorksRef(): PxerImageDataLine[]{
        return this.workDataLine.map(wk=>(wk.ref as PxerImageDataLine))
    }
    sortWithKey(key: keyof IPxerImageDataLineState, reverse=false){
        this.workDataLine.sort((a,b)=>(
            ((((a.ref as PxerImageDataLine).state[key]) as any) > (((b.ref as PxerImageDataLine).state[key]) as any)) !== reverse)?1:-1
        )
        this.forceUpdate();
    }
    changeAllSelection(opt: boolean){
        this.workDataLine.forEach(el=>{
            (el.ref as PxerImageDataLine).setState(prev=>{
                return {checked: opt}
            })
        })
    }
}

export default PxerImageDataTable