import React, { Component } from 'react';
import PxerTextModal from './PxerTextModal';

interface IPxerCopyFallBackModalProps {
    getText: ()=>string,
    onClose: ()=>void,
    opened: boolean,
    errorDef: string,
}
class PxerCopyFallBackModal extends Component<IPxerCopyFallBackModalProps>{
    constructor(props: IPxerCopyFallBackModalProps){
        super(props)
    }
    render(){
        return (
            <div id="copy-fail">
                <PxerTextModal
                    text={this.props.getText()}
                    opened={this.props.opened}
                    onClose={this.props.onClose}
                    headElem={
                        <div>
                            Copy Failed. Please copy it yourself:(
                            <i className="shy">{this.props.errorDef}</i>
                        </div>
                    }
                />
            </div>
        )
    }
}

export default PxerCopyFallBackModal