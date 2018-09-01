import React, { Component } from 'react';
import AutoSuggestControl from '../AutoSuggestControl.class'
import { PxerWorks } from '../../pxer/pxerapp/PxerWorksDef.-1';
import { PxerImageDataLine } from './PxerImageData';
import { PxerSelectableWorks } from '../lib';
import { PxerWorkType } from '../../pxer/pxerapp/PxerData.-1';

import {I18n} from 'react-i18next'

interface IPxerAdvancedFilterModalState {
    opened: boolean,
    minLike: number,
    minView: number,
    minRate: number,
    no_tag_any: string[],
    has_tag_any: string[],
    has_tag_all: string[],
    single: boolean,
    multiple: boolean,
    illust: boolean,
    manga: boolean,
    ugoira: boolean,
}
interface IPxerAdvancedFilterModalProps {
    filterReceiver: (filterfn: (work: PxerSelectableWorks)=>boolean)=>void,
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
            no_tag_any: [],
            has_tag_all: [],
            has_tag_any: [],
            single: true,
            multiple: true,
            illust: true,
            manga: true,
            ugoira: true,
        }
        this.onApply = this.onApply.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.open = this.open.bind(this);
    }
    render(){
        return (
            <I18n ns="pxeroutput">
            {
                (t)=>(
                    <div className="filter">
                    <div className="modal">
                        <input id="modal_filter" type="checkbox" checked={this.state.opened}/>
                        <label htmlFor="modal_filter" className="overlay"></label>
                        <div className="openup">
                            <form>
                                <div id="filter-params" className="oneline">
                                    {t("filter_like_ge")}
                                    <input 
                                    type="number" 
                                    value={this.state.minLike}
                                    onChange={e=>{
                                        var newValue = e.target.valueAsNumber || 0;
                                        this.setState(prev=>{
                                            return {
                                                minLike: newValue
                                            }
                                        });
                                    }}
                                    />
                                </div>
                                <div id="filter-params" className="oneline">
                                    {t("filter_view_ge")}
                                    <input 
                                    type="number" 
                                    value={this.state.minView}
                                    onChange={e=>{
                                        var newValue = e.target.valueAsNumber || 0;
                                        this.setState(prev=>{
                                            return {
                                                minView: newValue
                                            }
                                        });
                                    }}
                                    />
                                </div>
                                <div id="filter-params" className="oneline">
                                    {t("filter_bookmark_ge")}
                                    <input 
                                    type="number" 
                                    value={this.state.minRate}
                                    onChange={e=>{
                                        var newValue = e.target.valueAsNumber || 0;
                                        this.setState(prev=>{
                                            return {
                                                minRate: newValue
                                            }
                                        });
                                    }}
                                    />
                                </div>
                                <div id="filter-params" className="oneline align">
                                    {t("filter_worktype")}
                                    <label>
                                        <input type="checkbox" checked={this.state.illust} onChange={()=>{
                                                this.setState(prev=>{
                                                    return {illust: !prev.illust};
                                                })
                                            }}
                                        />
                                        {t("illust")}
                                    </label>
                                    <label>
                                        <input type="checkbox" checked={this.state.manga} onChange={()=>{
                                                this.setState(prev=>{
                                                    return {manga: !prev.manga};
                                                })
                                            }}
                                        />
                                        {t("manga")}
                                    </label>
                                    <label>
                                        <input type="checkbox" checked={this.state.ugoira} onChange={()=>{
                                                this.setState(prev=>{
                                                    return {ugoira: !prev.ugoira};
                                                })
                                            }}
                                        />
                                        {t("ugoira")}
                                    </label>
                                
                                </div>
    
                                <div id="filter-params" className="oneline">
                                    {t("filter_pagecount")}
                                    <label>
                                        <input type="checkbox" checked={this.state.single} onChange={()=>{
                                                this.setState(prev=>{
                                                    return {single: !prev.single};
                                                })
                                            }}
                                        />
                                        {t("single_page")}
                                    </label>
                                    <label>
                                        <input type="checkbox" checked={this.state.multiple} onChange={()=>{
                                                this.setState(prev=>{
                                                    return {multiple: !prev.multiple};
                                                })
                                            }}
                                        />
                                        {t("multiple_page")}
                                    </label>
                                </div>
    
                                <div id="filter-params">
                                    <label dangerouslySetInnerHTML={{__html: t("filter_no_tag_any")}}></label>
                                    <input id="no_tag_any" defaultValue={""} ref="no_tag_any" className="tag-suggest"/>
                                </div>
                                <div id="filter-params">
                                    <label dangerouslySetInnerHTML={{__html: t("filter_has_tag_any")}}></label>
                                    <input id="has_tag_any" defaultValue={""} ref="has_tag_any" className="tag-suggest"/>
                                </div>
                                <div id="filter-params">
                                    <label dangerouslySetInnerHTML={{__html: t("filter_has_tag_all")}}></label>
                                    <input id="has_tag_all" defaultValue={""} ref="has_tag_all" className="tag-suggest"/>
                                </div>
    
                                <label htmlFor="modal_filter" className="button" onClick={this.onApply}>
                                    {t("filter_apply")}
                                </label>
                                <label htmlFor="modal_filter" className="button error pull-right" onClick={this.onCancel}>
                                    {t("filter_cancel")}
                                </label>
                            </form>
                        </div>
                    </div>
                </div>
                )
            }
            </I18n>
        )
    }
    onCancel(){
        this.setState(prev=>{
            return {
                opened: false,
            }
        })
    }
    open(){
        this.setState(prev=>{
            return {
                opened: true,
            }
        })
        new AutoSuggestControl("no_tag_any", ()=>this.props.tagList);
        new AutoSuggestControl("has_tag_all", ()=>this.props.tagList);
        new AutoSuggestControl("has_tag_any", ()=>this.props.tagList);
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
                if (work.likeCount<this.state.minLike) return false;
                if (work.viewCount<this.state.minView) return false;
                if (work.ratedCount<this.state.minRate) return false;
                if (!((this.state as any)[work.type] as boolean)) return false;
                if (this.state.no_tag_any.length>0  &&  !this.state.no_tag_any.every(notag=>work.tagList.indexOf(notag)===-1)) return false;
                if (this.state.has_tag_any.length>0 && this.state.has_tag_any.every(hastag=>work.tagList.indexOf(hastag)===-1)) return false;
                if (this.state.has_tag_all.length>0 && !this.state.has_tag_all.every(hastag=>work.tagList.indexOf(hastag)!==-1)) return false;
                if (!this.state.multiple && work.isMultiple) return false;
                if (!this.state.single && !work.isMultiple) return false;
                return true;
            })
        })
    }
}
export default PxerAdvancedFilterModal