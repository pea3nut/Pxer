import React, { Component } from 'react';
import {PxerImageDataHead, PxerImageDataLine} from './PxerImageData';
class PxerImageDataTable extends Component {
    constructor(props){
        super(props);
        this.state = {};
        this.workDataLine = [];
        for (let work of this.props.workData) {

            this.workDataLine.push((()=>{
                var obj = {
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
                            />
                }
                return obj;
            })())

        }
        this.gatherSelectedWorksInfo = this.gatherSelectedWorksInfo.bind(this);
        this.sortWithKey = this.sortWithKey.bind(this);
        this.changeAllSelection = this.changeAllSelection.bind(this);
        this.getAllWorksRef = this.getAllWorksRef.bind(this);
    }
    componentDidMount() {
        this.props.onRef(this)
    }
    componentWillUnmount() {
        this.props.onRef(undefined)
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
                                    return "none"
                                    case this.props.workData.length:
                                    return "all"
                                    default:
                                    return "indeterminate"
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
    gatherSelectedWorksInfo(){
        var res = [];
        for (let dl of this.workDataLine) {
            if (dl.ref && !dl.ref.state.checked) continue;
            res.push(dl.elem);
        }
        return res;
    }
    getAllWorksRef(){
        return this.workDataLine.map(wk=>wk.ref)
    }
    sortWithKey(key, reverse=false){
        this.workDataLine.sort((a,b)=>(
            ((a.ref.state[key]>b.ref.state[key]) ^ reverse)?1:-1
        ))
        this.forceUpdate();
    }
    changeAllSelection(opt){
        this.workDataLine.forEach(el=>{
            el.ref.setState(prev=>{
                return {checked: opt}
            })
        })
    }
}

export default PxerImageDataTable