import React, { Component } from 'react';

function PxerTextModal(props: {
    text: string,
    headElem: JSX.Element|null,
    opened: boolean,
    onClose: ()=>void,
}){
    return (
        <div className="modal">
            <input id="modal_1" type="checkbox" checked={props.opened}/>
            <label htmlFor="modal_1" className="overlay"></label>
            <div className="openup openup-more">
                <label htmlFor="modal_1" className="close" onClick={props.onClose}>&times;</label>
                {props.headElem}
                <textarea value={props.text} data-gramm_editor={false} readOnly={true}/>
            </div>
        </div>
    )
}
export default PxerTextModal