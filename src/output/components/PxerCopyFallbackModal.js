import React, { Component } from 'react';

class PxerCopyFallBackModal extends Component{
    constructor(props){
        super(props)
        this.state ={
            opened: false,
            error: "",
        }
        this.toggle = this.toggle.bind(this);
    }
    render(){
        return (
            <div id="copy-fail">
                <div className="modal">
                    <input id="modal_1" type="checkbox" checked={this.state.opened}/>
                    <label htmlFor="modal_1" className="overlay"></label>
                    <div className="openup openup-more">
                        Copy Failed. Please copy it yourself:(
                        <i className="shy">{this.state.error}</i>
                        <label className="button" onClick={this.toggle}>Close</label>
                        <textarea value={this.props.getText()} data-gramm_editor={false}/>
                    </div>
                </div>
            </div>
        )
    }
    toggle(e){
        this.setState(prev=>{
            return {
                opened: !prev.opened,
                error: e.toString(),
            }
        })
    }
}

export default PxerCopyFallBackModal