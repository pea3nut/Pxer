import React, { Component } from 'react';
import AutoSuggestControl from '../AutoSuggestControl.class'
import { PxerWorks } from '../../pxer/pxerapp/PxerWorksDef.-1';
import { PxerImageDataLine } from './PxerImageData';
interface IPxerAdvancedFilterModalState {
    opened: boolean,
    minLike: number,
    minView: number,
    minRate: number,
    illust: boolean,
    manga: boolean,
    ugoira: boolean,
    single: boolean,
    multiple: boolean,
    no_tag_any: string[],
    has_tag_any: string[],
    has_tag_all: string[],
}
interface IPxerAdvancedFilterModalProps {
    filterReceiver: (filterfn: (work: PxerImageDataLine)=>boolean)=>void,
    tagList: string[],
}
class PxerAdvancedFilterModal extends Component<IPxerAdvancedFilterModalProps, IPxerAdvancedFilterModalState> {
    constructor(props: IPxerAdvancedFilterModalProps){
        super(props);
        this.state = {
            opened: false,
            minLike: 0,
            minView: 0,
            minRate: 0,
            illust: true,
            manga: true,
            ugoira: true,
            single: true,
            multiple: true,
            no_tag_any: [],
            has_tag_any: [],
            has_tag_all: [],
        }
        this.onApply = this.onApply.bind(this);
    }
    componentDidMount(){
        new AutoSuggestControl("no_tag_any", ()=>this.props.tagList);
        new AutoSuggestControl("has_tag_all", ()=>this.props.tagList);
        new AutoSuggestControl("has_tag_any", ()=>this.props.tagList);
    }
    render(){
        return (
            <div className="filter">
                <div className="modal">
                    <input id="modal_filter" type="checkbox" checked={this.state.opened}/>
                    <label htmlFor="modal_filter" className="overlay"></label>
                    <div className="openup">
                        <form>
                            <div id="filter-params" className="oneline">
                                点赞数 ≥
                                <input type="number" defaultValue={"0"} onChange={e=>{
                                    var newValue = e.target.valueAsNumber || 0;
                                    this.setState(()=>{
                                            return {minLike: newValue};
                                        })
                                    }} />
                            </div>
                            <div id="filter-params" className="oneline">
                                浏览数 ≥
                                <input type="number" defaultValue={"0"} onChange={e=>{
                                    var newValue = e.target.valueAsNumber || 0;
                                    this.setState(()=>{
                                            return {minView: newValue};
                                        })
                                    }} />
                            </div>
                            <div id="filter-params" className="oneline">
                                收藏数 ≥
                                <input type="number" defaultValue={"0"} onChange={e=>{
                                    var newValue = e.target.valueAsNumber || 0;
                                    this.setState(()=>{
                                            return {minRate: newValue};
                                        })
                                    }} />
                            </div>
                            <div id="filter-params" className="oneline align">
                                类型：
                                <label>
                                    <input type="checkbox" checked={this.state.illust} onChange={()=>{
                                            this.setState(prev=>{
                                                return {illust: !prev.illust};
                                            })
                                        }}
                                    />
                                    Illust
                                </label>
                                <label>
                                    <input type="checkbox" checked={this.state.manga} onChange={()=>{
                                            this.setState(prev=>{
                                                return {manga: !prev.manga};
                                            })
                                        }}
                                    />
                                    Manga
                                </label>
                                <label>
                                    <input type="checkbox" checked={this.state.ugoira} onChange={()=>{
                                            this.setState(prev=>{
                                                return {ugoira: !prev.ugoira};
                                            })
                                        }}
                                    />
                                    Ugoira
                                </label>
                            
                            </div>

                            <div id="filter-params" className="oneline">
                                张数：
                                <label>
                                    <input type="checkbox" checked={this.state.single} onChange={()=>{
                                            this.setState(prev=>{
                                                return {single: !prev.single};
                                            })
                                        }}
                                    />
                                    单张
                                </label>
                                <label>
                                    <input type="checkbox" checked={this.state.multiple} onChange={()=>{
                                            this.setState(prev=>{
                                                return {multiple: !prev.multiple};
                                            })
                                        }}
                                    />
                                    多张
                                </label>
                            </div>

                            <div id="filter-params">
                                <label>作品中<strong>不能</strong>含有以下<strong>任意一个</strong>标签</label>
                                <input id="no_tag_any" defaultValue={""} ref="no_tag_any"/>
                            </div>
                            <div id="filter-params">
                                <label>作品中<strong>必须</strong>含有以下<strong>任意一个</strong>标签</label>
                                <input id="has_tag_any" defaultValue={""} ref="has_tag_any"/>
                            </div>
                            <div id="filter-params">
                                <label>作品中<strong>必须同时</strong>含有以下<strong>所有</strong>标签</label>
                                <input id="has_tag_all" defaultValue={""} ref="has_tag_all"/>
                            </div>

                            <label htmlFor="modal_filter" className="button" onClick={this.onApply}>
                                Apply
                            </label>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
    onApply(){
        this.setState(prev=>{
            return {
                no_tag_any: (this.refs.no_tag_any as HTMLInputElement).value? (this.refs.no_tag_any as HTMLInputElement).value.split(" "): [],
                has_tag_any: (this.refs.has_tag_any as HTMLInputElement).value? (this.refs.has_tag_any as HTMLInputElement).value.split(" "): [],
                has_tag_all: (this.refs.has_tag_all as HTMLInputElement).value? (this.refs.has_tag_all as HTMLInputElement).value.split(" "): [],
                opened: false,
            }
        }, ()=>{
            this.props.filterReceiver((work)=>{
                if (work.props.likeCount<this.state.minLike) return false;
                if (work.props.viewCount<this.state.minView) return false;
                if (work.props.rateCount<this.state.minRate) return false;
                if (!((this.state as any)[work.props.illustType] as boolean)) return false;
                if (this.state.no_tag_any.length>0  &&  !this.state.no_tag_any.every(notag=>work.props.tagList.indexOf(notag)===-1)) return false;
                if (this.state.has_tag_any.length>0 && this.state.has_tag_any.every(hastag=>work.props.tagList.indexOf(hastag)===-1)) return false;
                if (this.state.has_tag_all.length>0 && !this.state.has_tag_all.every(hastag=>work.props.tagList.indexOf(hastag)!==-1)) return false;
                if (!this.state.multiple && work.props.pageCount>1) return false;
                if (!this.state.single && work.props.pageCount==1) return false;
                return true;
            })
        })
    }
}
export default PxerAdvancedFilterModal