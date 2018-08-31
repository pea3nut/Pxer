import React, { Component } from 'react';

enum PxerCopyPromistStatus {
    standby,
    ongoing,
    error,
    success,
}
interface IPxerOutputNavBarProps {
    onCopy: ()=>Promise<any>;
    onOutputConfig: ()=>void;
    onAdvancedFilter: ()=>void;
    onUgoiraScript: ()=>void;
    linkCount: number;
    showUgoiraScript: boolean;
}
interface IPxerOutputNavBarState {
    copyPromiseStatus: PxerCopyPromistStatus,
    lastSuccessCount: number
}
class PxerOutputNavbar extends Component<IPxerOutputNavBarProps, IPxerOutputNavBarState> {
    constructor(props: IPxerOutputNavBarProps){
        super(props);
        this.state = {
            copyPromiseStatus: PxerCopyPromistStatus.standby,
            lastSuccessCount: 0,
        }
        
        this.doCopy = this.doCopy.bind(this);
    }
    render(){
        return (
            <nav className="" style={{position: "absolute"}}>
                <a className="brand" href="http://pxer.pea3nut.org" target="_blank">Pxer 7</a>
                <div className="menu">
                    <a className="pseudo button" onClick={this.props.onAdvancedFilter}>高级筛选</a>
                    <a className="pseudo button" onClick={this.props.onOutputConfig}>输出配置</a>
                    {
                        this.props.showUgoiraScript?
                        <a className="pseudo button" onClick={this.props.onUgoiraScript}>动图合成</a>
                        :null
                    }
                        {
                            (()=>{
                                switch (this.state.copyPromiseStatus) {
                                    case PxerCopyPromistStatus.ongoing:
                                        return <a className="button disabled">...</a>
                                    case PxerCopyPromistStatus.standby:
                                        return <a className="button" onClick={this.doCopy}>复制{this.props.linkCount}个作品的链接</a>
                                    case PxerCopyPromistStatus.error:
                                        return <a className="button warning">错误</a>
                                    case PxerCopyPromistStatus.success:
                                        return <a className="button success">成功复制{this.state.lastSuccessCount}个链接</a>
                                }
                            })()
                        }
                </div>
            </nav>
        )
    }
    doCopy(){
        this.setState(prev=>{
            return {
                copyPromiseStatus: PxerCopyPromistStatus.ongoing,
            }
        })
        this.props.onCopy().then(count=>{
            this.setState(prev=>{
                return {
                    copyPromiseStatus: PxerCopyPromistStatus.success,
                    lastSuccessCount: count,
                }
            })
            setTimeout(()=>{
                this.setState(prev=>{
                    return {
                        copyPromiseStatus: PxerCopyPromistStatus.standby,
                    }
                })
            }, 2000)
        }).catch(()=>{
            this.setState(prev=>{
                return {
                    copyPromiseStatus: PxerCopyPromistStatus.error,
                }
            })
            setTimeout(()=>{
                this.setState(prev=>{
                    return {
                        copyPromiseStatus: PxerCopyPromistStatus.standby,
                    }
                })
            }, 2000)
        })
    }
}

export default PxerOutputNavbar