import React, { Component } from 'react';

class PxerOutputNavbar extends Component {
    constructor(props){
        super(props);
        this.state = {
            activeindex: -1,
            copyPromiseStatus: "standby",
            lastSucessCount: 0,
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
                            (()=>{
                                switch (this.state.copyPromiseStatus) {
                                    case "ongoing":
                                        return <a className="button disabled">...</a>
                                    case "standby":
                                        return <a className="button" onClick={this.doCopy}>复制{this.props.linkCount}个作品的链接</a>
                                    case "error":
                                        return <a className="button warning">错误</a>
                                    case "success":
                                        return <a className="button success">成功复制{this.state.lastSucessCount}个链接</a>
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
                copyPromiseStatus: "ongoing",
            }
        })
        this.props.onCopy().then(count=>{
            this.setState(prev=>{
                return {
                    copyPromiseStatus: "success",
                    lastSucessCount: count,
                }
            })
        }).catch(()=>{
            this.setState(prev=>{
                return {
                    copyPromiseStatus: "error",
                }
            })
        }).finally(()=>{
            setTimeout(()=>{
                this.setState(prev=>{
                    return {
                        copyPromiseStatus: "standby",
                    }
                })
            }, 2000)
        })
    }
}

export default PxerOutputNavbar