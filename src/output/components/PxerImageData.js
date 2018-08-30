import React, { Component } from 'react';

class PxerSortableTH extends Component {
    constructor(props){
        super(props);
    }
    render(){
        return (
            <th
                onClick={
                    e=>{
                        if (e.target!==e.currentTarget) return;
                        this.props.sortFunc(this.props.sortKey)
                    }
                }
                className={
                    this.props.currentKey===this.props.sortKey?"sorting oneline":"oneline"
                }
            >
            {this.props.innerContent}
            {this.props.currentKey===this.props.sortKey?(this.props.reverse?"↓":"↑"):null}
            </th>
        )
    }
}


class PxerImageDataHead extends Component {
    constructor(props){
        super(props);
        this.state = {
            sortKey: null,
            sortReverse: true,
            selectAll: true,
            inDeterminate: false,
        }
        this.doSort = this.doSort.bind(this);
        this.handleCheckedState = this.handleCheckedState.bind(this);
    }
    static getDerivedStateFromProps(props, state) {
        switch (props.boxState) {
        case "all":
            return {
                selectAll: true,
                inDeterminate: false,
            }
        case "indeterminate":
            return {
                selectAll: false,
                inDeterminate: true,
            }
        case "none":
            return{
                selectAll: false,
                inDeterminate: false,
            }
        }
    }
    componentDidUpdate(){
        this.refs.selall.indeterminate = this.state.inDeterminate;
    }
    render(){
        return (
            <tr>
                <PxerSortableTH
                    sortKey="checked"
                    sortFunc={this.doSort}
                    currentKey={this.state.sortKey}
                    reverse={this.state.sortReverse}
                    innerContent={<input type="checkbox" checked={this.state.selectAll} onChange={this.handleCheckedState} ref="selall"></input>}
                />
                <PxerSortableTH
                    sortKey="illustId"
                    sortFunc={this.doSort}
                    currentKey={this.state.sortKey}
                    reverse={this.state.sortReverse}
                    innerContent="illustID"
                />
                <PxerSortableTH
                    sortKey="illustType"
                    sortFunc={this.doSort}
                    currentKey={this.state.sortKey}
                    reverse={this.state.sortReverse}
                    innerContent="Type"
                />
                <th>Thumb</th>
                <th>Tags</th>
                <PxerSortableTH
                    sortKey="PageCount"
                    sortFunc={this.doSort}
                    currentKey={this.state.sortKey}
                    reverse={this.state.sortReverse}
                    innerContent="PageCount"
                />
                <PxerSortableTH
                    sortKey="LikeCount"
                    sortFunc={this.doSort}
                    currentKey={this.state.sortKey}
                    reverse={this.state.sortReverse}
                    innerContent="LikeCount"
                />
                <PxerSortableTH
                    sortKey="ViewCount"
                    sortFunc={this.doSort}
                    currentKey={this.state.sortKey}
                    reverse={this.state.sortReverse}
                    innerContent="ViewCount"
                />
                <PxerSortableTH
                    sortKey="RateCount"
                    sortFunc={this.doSort}
                    currentKey={this.state.sortKey}
                    reverse={this.state.sortReverse}
                    innerContent="RateCount"
                />
                <th>WorkTitle</th>
                <PxerSortableTH
                    sortKey="Date"
                    sortFunc={this.doSort}
                    currentKey={this.state.sortKey}
                    reverse={this.state.sortReverse}
                    innerContent="Date"
                />
            </tr>
        )
    }
    doSort(key){
        var reverse = this.state.sortKey===key?!this.state.sortReverse:true;
        this.props.onSort(key, reverse)
        this.setState(prev=>{
            return {
                sortKey: key,
                sortReverse: reverse,
            }
        })
    }
    handleCheckedState(e){
        this.setState(prev=>{
            this.props.onSetAllSelectedState(!prev.selectAll);
            return {selectAll: !prev.selectAll}
        })
    }
}

class PxerImageDataLine extends Component {
    constructor(props){
        super(props);
        this.state = {
            checked: true,
            illustId: props.illustId,
            illustType: props.illustType,
            imgSrc: props.urls.thumb,
            tagList: props.tagList,
            LikeCount: props.likeCount,
            ViewCount: props.viewCount,
            RateCount: props.rateCount,
            WorkTitle: props.workTitle,
            PageCount: props.pageCount,
            Date: props.workDate,
        }
        this.handleCheckedState = this.handleCheckedState.bind(this);
        this.toggleCheckedState = this.toggleCheckedState.bind(this);
    }
    componentDidMount() {
        this.props.onRef(this)
    }
    componentWillUnmount() {
        this.props.onRef(undefined)
    }
    componentDidUpdate(){
        this.props.onChange();
    }
    render(){
        return (
            <tr className={this.state.checked?"checked":""} onClick={this.toggleCheckedState}>
                <td><input type="checkbox" checked={this.state.checked} onChange={this.handleCheckedState}></input></td>
                <td>{this.state.illustId}</td>
                <td>{this.state.illustType}</td>
                <td>
                    <img src={this.state.imgSrc} className="table-img"></img>
                </td>
                <td 
                    data-tooltip={this.state.tagList.join(" ")}
                >
                    {
                        this.state.tagList.slice(0, this.props.tagFoldLength).map(tag=><p key={this.state.illustId+"_"+tag}>{tag}</p>)
                    }
                    {
                        this.state.tagList.length>this.props.tagFoldLength?<i className="shy">{this.state.tagList.length-this.props.tagFoldLength} not shown. Mouseover for more information.</i>:null
                    }
                </td>
                <td>{this.state.PageCount}</td>
                <td>{this.state.LikeCount}</td>
                <td>{this.state.ViewCount}</td>
                <td>{this.state.RateCount}</td>
                <td>{this.state.WorkTitle}</td>
                <td className="oneline">{this.state.Date}</td>
            </tr>
        )
    }
    handleCheckedState(e){
        var nowstate = e.target.checked;
        this.setState(prev=>{
            return {checked: nowstate}
        });
    }
    toggleCheckedState(){
        this.setState(prev=>{
            return {checked: !prev.checked}
        })
    }
}

export {PxerImageDataHead, PxerImageDataLine}