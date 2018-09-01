import React, { Component } from 'react';
import PxerTextModal from './PxerTextModal';
import {I18n} from 'react-i18next'

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
            <I18n ns="pxeroutput">
                {
                    (t)=>(
                        <div id="copy-fail">
                        <PxerTextModal
                            text={this.props.getText()}
                            opened={this.props.opened}
                            onClose={this.props.onClose}
                            headElem={
                                <div>
                                    <p>{t("copy_fail_notice")}</p>
                                    <i className="shy">{this.props.errorDef}</i>
                                </div>
                            }
                        />
                    </div>
                    )
                }
            </I18n>
        )
    }
}

export default PxerCopyFallBackModal