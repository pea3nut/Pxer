'use strict';
/*!
* Copyright (c) 2013 Profoundis Labs Pvt. Ltd., and individual contributors.
*
* All rights reserved.
*/
/*
* Redistribution and use in source and binary forms, with or without modification,
* are permitted provided that the following conditions are met:
*
*     1. Redistributions of source code must retain the above copyright notice,
*        this list of conditions and the following disclaimer.
*
*     2. Redistributions in binary form must reproduce the above copyright
*        notice, this list of conditions and the following disclaimer in the
*        documentation and/or other materials provided with the distribution.
*
*     3. Neither the name of autojs nor the names of its contributors may be used
*        to endorse or promote products derived from this software without
*        specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
* ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
* ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*
* reuses a lot of code from Nicholas C. Zakas textfield autocomplete example found here
* http://oak.cs.ucla.edu/cs144/projects/javascript/suggest1.html
*
*/

/*
 * An autosuggest textbox control.
 * @class
 * @scope public
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AutoSuggestControl = function AutoSuggestControl(id_or_element, provider) {
    _classCallCheck(this, AutoSuggestControl);

    this.provider = provider;
    /**
     * The textbox to capture, specified by element_id.
     * @scope private
     */
    this.textbox /*:HTMLInputElement*/ = typeof id_or_element == "string" ? document.getElementById(id_or_element) : id_or_element;

    //initialize the control
    this.init();
};

/**
 * Autosuggests one or more suggestions for what the user has typed.
 * If no suggestions are passed in, then no autosuggest occurs.
 * @scope private
 * @param aSuggestions An array of suggestion strings.
 */


AutoSuggestControl.prototype.autosuggest = function (aSuggestions /*:Array*/) {

    //make sure there's at least one suggestion

    if (aSuggestions.length > 0) {
        this.typeAhead(aSuggestions[0]);
    }
};

/**
 * Handles keyup events.
 * @scope private
 * @param oEvent The event object for the keyup event.
 */
AutoSuggestControl.prototype.handleKeyUp = function (oEvent /*:Event*/) {

    var iKeyCode = oEvent.keyCode;
    var evtobj = oEvent;
    window.eventobj = evtobj;
    if (iKeyCode != 16 && iKeyCode < 32 || iKeyCode >= 33 && iKeyCode <= 46 || iKeyCode >= 112 && iKeyCode <= 123 || iKeyCode == 65 && evtobj.ctrlKey || iKeyCode == 90 && evtobj.ctrlKey) {
        //ignore
        if (iKeyCode == 90 && evtobj.ctrlKey) {
            // window.getSelection().deleteFromDocument();
            // TODO: need to find a way to select the rest of the text and delete.
        }
    } else {
        //request suggestions from the suggestion provider
        this.requestSuggestions(this);
    }
};

/**
 * Initializes the textarea with event handlers for
 * auto suggest functionality.
 * @scope private
 */
AutoSuggestControl.prototype.init = function () {

    //save a reference to this object
    var oThis = this;
    //assign the onkeyup event handler
    var lastDate = new Date();
    oThis.textbox.onkeyup = function (oEvent) {

        //check for the proper location of the event object
        if (!oEvent) {
            oEvent = window.event;
        }
        var newDate = new Date();
        if (newDate.getTime() > lastDate.getTime() + 200) {
            oThis.handleKeyUp(oEvent);
            lastDate = newDate;
        }
    };
};

/**
 * Selects a range of text in the textarea.
 * @scope public
 * @param iStart The start index (base 0) of the selection.
 * @param iLength The number of characters to select.
 */
AutoSuggestControl.prototype.selectRange = function (iStart /*:int*/, iLength /*:int*/) {
    //use text ranges for Internet Explorer
    if (this.textbox.createTextRange) {
        var oRange = this.textbox.createTextRange();
        oRange.moveStart("character", iStart);
        oRange.moveEnd("character", iLength);
        oRange.select();

        //use setSelectionRange() for Mozilla
    } else if (this.textbox.setSelectionRange) {
        this.textbox.setSelectionRange(iStart, iLength);
    }

    //set focus back to the textbox
    this.textbox.focus();
};

/**
 * Inserts a suggestion into the textbox, highlighting the
 * suggested part of the text.
 * @scope private
 * @param sSuggestion The suggestion for the textbox.
 */
AutoSuggestControl.prototype.typeAhead = function (sSuggestion /*:String*/) {

    //check for support of typeahead functionality
    if (this.textbox.createTextRange || this.textbox.setSelectionRange) {
        var lastSpace = this.textbox.value.lastIndexOf(" ");
        var lastQuote = this.textbox.value.lastIndexOf("'");
        var lastHypen = this.textbox.value.lastIndexOf("-");
        var lastDoubleQuote = this.textbox.value.lastIndexOf('"');
        var lastEnter = this.textbox.value.lastIndexOf("\n");
        var lastIndex = Math.max(lastSpace, lastEnter, lastQuote, lastHypen, lastDoubleQuote) + 1;
        var contentStripped = this.textbox.value.substring(0, lastIndex);
        var lastWord = this.textbox.value.substring(lastIndex, this.textbox.value.length);
        this.textbox.value = contentStripped + sSuggestion; //.replace(lastWord,"");
        var start = this.textbox.value.length - sSuggestion.replace(lastWord, "").length;
        var end = this.textbox.value.length;
        this.selectRange(start, end);
    }
};

/**
 * Request suggestions for the given autosuggest control.
 */
AutoSuggestControl.prototype.requestSuggestions = function () {
    this.words = this.provider();
    var aSuggestions = [];
    var sTextbox = this.textbox.value;
    var sTextboxSplit = sTextbox.split(/\s+/);
    var sTextboxLast = sTextboxSplit[sTextboxSplit.length - 1];
    var sTextboxValue = sTextboxLast;
    if (sTextboxValue.length > 0) {
        //search for matching words
        for (var i = 0; i < this.words.length; i++) {
            if (this.words[i].indexOf(sTextboxValue.toLowerCase()) == 0) {
                if (this.words[i].indexOf(sTextboxValue) == 0) {
                    aSuggestions.push(this.words[i]);
                } else if (this.words[i].indexOf(sTextboxValue.charAt(0).toLowerCase() + sTextboxValue.slice(1)) == 0) {
                    aSuggestions.push(this.words[i].charAt(0).toUpperCase() + this.words[i].slice(1));
                }
            }
        }
    }

    //provide suggestions to the control
    this.autosuggest(aSuggestions);
};