'use strict';

class PxerHtmlParser{
    constructor(){
        throw new Error('PxerHtmlParse could not construct');
    };
};


/**
 * 解析页码任务对象
 * @param {PxerPageRequest} task - 抓取后的页码任务对象
 * @return {PxerWorksRequest[]|false} - 解析得到的作品任务对象
 * */
PxerHtmlParser.parsePage =function(task){
    if(!(task instanceof PxerPageRequest)){
        window['PXER_ERROR'] ='PxerHtmlParser.parsePage: task is not PxerPageRequest';
        return false;
    }
    if(!task.url || !task.html){
        window['PXER_ERROR'] ='PxerHtmlParser.parsePage: task illegal';
        return false;
    }

    var URLData =parseURL(task.url);
    var dom =PxerHtmlParser.HTMLParser(task.html);

    // old method
    var taskList =[];
    
    var searchResult =dom.body.querySelector("input#js-mount-point-search-result-list");
    var elts =null;
    if (searchResult) {
        var searchData = JSON.parse(searchResult.getAttribute('data-items'));
        for (var searchItem of searchData) {
            var task =new PxerWorksRequest({
                html    :{},
                type    :searchItem.illustType==2?'ugoira'
                        :searchItem.illustType==1?'manga'
                        :'illust'
                        ,
                isMultiple  :searchItem.pageCount>1,
                id  :searchItem.illustId
            });
            task.url =PxerHtmlParser.getUrlList(task);
            
            taskList.push(task);
        };
    } else {
        elts =dom.body.querySelectorAll('a.work._work');
    
        for(let elt of elts){
            var task =new PxerWorksRequest({
                html        :{},
                type        :elt.matches('.ugoku-illust')?'ugoira'
                            :elt.matches(".manga")?'manga'
                            :"illust"
                            ,
                isMultiple  :elt.matches(".multiple"),
                id          :elt.getAttribute('href').match(/illust_id=(\d+)/)[1]
           });
    
           task.url =PxerHtmlParser.getUrlList(task);
    
           taskList.push(task);
        };
    }

    if ( (elts !== null && elts.length === 0) && !searchResult) {
        window['PXER_ERROR'] ='PxerHtmlParser.parsePage: result empty';
        return false;
    }

    return taskList;

};

/**
 * 解析作品任务对象
 * @param {PxerWorksRequest} task - 抓取后的页码任务对象
 * @return {PxerWorks} - 解析得到的作品任务对象
 * */
PxerHtmlParser.parseWorks =function(task){
    if(!(task instanceof PxerWorksRequest)){
        window['PXER_ERROR'] ='PxerHtmlParser.parseWorks: task is not PxerWorksRequest';
        return false;
    }
    if(!task.url.every(item=>task.html[item]) || !task.type){
        window['PXER_ERROR'] ='PxerHtmlParser.parsePage: task illegal';
        return false;
    }

    var pw;
    if(task.type ==='ugoira'){
        pw =new PxerUgoiraWorks();
    }else if(task.isMultiple){
        pw =new PxerMultipleWorks();
    }else{
        pw =new PxerWorks();
    };

    for(let url in task.html){
        let data ={
            dom :PxerHtmlParser.HTMLParser(task.html[url]),
            url,pw,task,
        };
        try{
            switch (true){
                case url.indexOf('mode=medium')!==-1:
                    PxerHtmlParser.parseMediumHtml(data);
                    break;
                case url.indexOf('mode=manga')!==-1:
                    PxerHtmlParser.parseMangaHtml(data);
                    break;
                default:
                    return false;
                    window['PXER_ERROR'] =`PxerHtmlParser.parsePage: count not parse task url "${url}"`;
            };
        }catch(e){
            window['PXER_ERROR'] =`${task.id}:${e.message}`;
            if(window['PXER_MODE']==='dev')console.error(task ,e);
            return false;
        }
    };

    return pw;

};



/**
 * @param {PxerWorksRequest} task
 * @return {Array}
 * */
PxerHtmlParser.getUrlList =function(task){

        return ["https://www.pixiv.net/member_illust.php?mode=medium&illust_id="+task.id];

    };

PxerHtmlParser.parseMangaHtml =function({task,dom,url,pw}){
    pw.multiple =+(
        dom.body.querySelector('img[data-src]')
    ).innerHTML;
};
PxerHtmlParser.parseMediumHtml =function({task,dom,url,pw}){
    pw.id           =task.id;
    pw.type         =task.type;
    
    var illustData = dom.head.innerHTML.match(this.REGEXP['getInitData'])[0];
    illustData = this.getKeyFromStringObjectLiteral(illustData, "preload");
    illustData = this.getKeyFromStringObjectLiteral(illustData, 'illust');
    illustData = this.getKeyFromStringObjectLiteral(illustData, pw.id);
    illustData = JSON.parse(illustData);

    pw.tagList = illustData.tags.tags.map(e=>e.tag);
    pw.viewCount = illustData.viewCount;
    pw.ratedCount = illustData.bookmarkCount;
    if (pw instanceof PxerMultipleWorks) {
        pw.multiple = illustData.pageCount;
    }
    
    
    if (pw.type ==="ugoira"){
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "https://www.pixiv.net/ajax/illust/"+ task.id + "/ugoira_meta", false);
            xhr.send();
            var meta = JSON.parse(xhr.responseText);
            let src = meta['body']['originalSrc'];
            let URLObj = parseURL(src);

            pw.domain = URLObj.domain;
            pw.date   =src.match(PxerHtmlParser.REGEXP['getDate'])[1];
            pw.frames =meta['body']['frames'];
    } else {
            let src = illustData.urls.original;
            let URLObj = parseURL(src);

            pw.domain = URLObj.domain;
            pw.date = src.match(PxerHtmlParser.REGEXP['getDate'])[1];
            pw.fileFormat =src.match(/\.(jpg|gif|png)$/)[1];    
    };

};


PxerHtmlParser.REGEXP ={
    'getDate':/img\/((?:\d+\/){5}\d+)/,
    'getInitData':/\{token:.*\}(?=\);)/
};

PxerHtmlParser.HTMLParser =function(aHTMLString){
    var dom =document.implementation.createHTMLDocument('');
    dom.documentElement.innerHTML =aHTMLString;
    return dom;
};

/**@param {Element} img*/
PxerHtmlParser.getImageUrl =function(img){
    return img.getAttribute('src')||img.getAttribute('data-src');
};

PxerHtmlParser.parseObjectLiteral = function() {
    // Javascript object literal parser
    // Splits an object literal string into a set of top-level key-value pairs
    // (c) Michael Best (https://github.com/mbest)
    // License: MIT (http://www.opensource.org/licenses/mit-license.php)
    // Version 2.1.0
    // https://github.com/mbest/js-object-literal-parse
    // This parser is inspired by json-sans-eval by Mike Samuel (http://code.google.com/p/json-sans-eval/)

    // These two match strings, either with double quotes or single quotes
    var stringDouble = '"(?:[^"\\\\]|\\\\.)*"',
        stringSingle = "'(?:[^'\\\\]|\\\\.)*'",
        // Matches a regular expression (text enclosed by slashes), but will also match sets of divisions
        // as a regular expression (this is handled by the parsing loop below).
        stringRegexp = '/(?:[^/\\\\]|\\\\.)*/\w*',
        // These characters have special meaning to the parser and must not appear in the middle of a
        // token, except as part of a string.
        specials = ',"\'{}()/:[\\]',
        // Match text (at least two characters) that does not contain any of the above special characters,
        // although some of the special characters are allowed to start it (all but the colon and comma).
        // The text can contain spaces, but leading or trailing spaces are skipped.
        everyThingElse = '[^\\s:,/][^' + specials + ']*[^\\s' + specials + ']',
        // Match any non-space character not matched already. This will match colons and commas, since they're
        // not matched by "everyThingElse", but will also match any other single character that wasn't already
        // matched (for example: in "a: 1, b: 2", each of the non-space characters will be matched by oneNotSpace).
        oneNotSpace = '[^\\s]',

        // Create the actual regular expression by or-ing the above strings. The order is important.
        token = RegExp(stringDouble + '|' + stringSingle + '|' + stringRegexp + '|' + everyThingElse + '|' + oneNotSpace, 'g'),

        // Match end of previous token to determine whether a slash is a division or regex.
        divisionLookBehind = /[\])"'A-Za-z0-9_$]+$/,
        keywordRegexLookBehind = {'in':1,'return':1,'typeof':1};

    function trim(string) {
        return string == null ? '' :
            string.trim ?
                string.trim() :
                string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
    }

    return function(objectLiteralString) {
        // Trim leading and trailing spaces from the string
        var str = trim(objectLiteralString);

        // Trim braces '{' surrounding the whole object literal
        if (str.charCodeAt(0) === 123)
            str = str.slice(1, -1);

        // Split into tokens
        var result = [],
            toks = str.match(token),
            key, values = [], depth = 0;

        if (toks) {
            // Append a comma so that we don't need a separate code block to deal with the last item
            toks.push(',');

            for (var i = 0, tok; tok = toks[i]; ++i) {
                var c = tok.charCodeAt(0);
                // A comma signals the end of a key/value pair if depth is zero
                if (c === 44) { // ","
                    if (depth <= 0) {
                        if (!key && values.length === 1) {
                            key = values.pop();
                        }
                        result.push([key, values.length ? values.join('') : undefined]);
                        key = undefined;
                        values = [];
                        depth = 0;
                        continue;
                    }
                // Simply skip the colon that separates the name and value
                } else if (c === 58) { // ":"
                    if (!depth && !key && values.length === 1) {
                        key = values.pop();
                        continue;
                    }
                // A set of slashes is initially matched as a regular expression, but could be division
                } else if (c === 47 && i && tok.length > 1) {  // "/"
                    // Look at the end of the previous token to determine if the slash is actually division
                    var match = toks[i-1].match(divisionLookBehind);
                    if (match && !keywordRegexLookBehind[match[0]]) {
                        // The slash is actually a division punctuator; re-parse the remainder of the string (not including the slash)
                        str = str.substr(str.indexOf(tok) + 1);
                        toks = str.match(token);
                        toks.push(',');
                        i = -1;
                        // Continue with just the slash
                        tok = '/';
                    }
                // Increment depth for parentheses, braces, and brackets so that interior commas are ignored
                } else if (c === 40 || c === 123 || c === 91) { // '(', '{', '['
                    ++depth;
                } else if (c === 41 || c === 125 || c === 93) { // ')', '}', ']'
                    --depth;
                // The key will be the first token; if it's a string, trim the quotes
                } else if (!key && !values.length && (c === 34 || c === 39)) { // '"', "'"
                    tok = tok.slice(1, -1);
                }
                values.push(tok);
            }
        }
        return result;
    }
}()

PxerHtmlParser.getKeyFromStringObjectLiteral =function(s, key) {
    var resolvedpairs = this.parseObjectLiteral(s);
    for (var pair of resolvedpairs) {
        if (pair[0] ===key) return pair[1];
    }
    throw new Error("Key not found.");
}
