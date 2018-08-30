'use strict';
import {parseURL, getPageType} from './common';
import {PxerMode, PxerWorkType, PxerPageType, PxerRequest, PxerPageRequest, PxerWorksRequest, PxerFailType, PxerFailInfo} from './PxerData.-1'
import {IPxerWorks, IPxerSingleWorks, IPxerMultipleWorks, IPxerUgoiraWorks, IPxerUgoiraFrameData, PxerWorks, PxerSingleWorks, PxerMultipleWorks, PxerUgoiraWorks,  PxerWorkUrl, PxerUgoiraWorksUrl} from './PxerWorksDef.-1'
interface PxerMediumHtmlJsonWorkObj {
    illustType: number,
    title: string,
    tags: {
        tags: [
            {tag: string}
        ],
    },
    viewCount: number,
    bookmarkCount: number,
    likeCount: number,
    commentCount: number,
    createDate: string,
    uploadDate: string,
    description: string,
    pageCount: number,
    height: number,
    width: number,
    urls: PxerWorkUrl
    userAccount: string,
    userId: string,
    userName: string,
}

class PxerHtmlParser{
    static REGEXP ={
        'getDate':/img\/((?:\d+\/){5}\d+)/,
        'getInitData':/\{token:.*\}(?=\);)/
    };
    constructor(){
        throw new Error('PxerHtmlParse could not construct');
    };
    /**
     * @param {PxerWorksRequest} task
     * @return {Array}
     * */
    static getUrlList(task: PxerWorksRequest){

        return ["https://www.pixiv.net/member_illust.php?mode=medium&illust_id="+task.id];
    };
    /**
     * 解析页码任务对象
     * @param {PxerPageRequest} task - 抓取后的页码任务对象
     * @return {PxerWorksRequest[]|false} - 解析得到的作品任务对象
     * */
    static parsePage(task: PxerPageRequest) :PxerWorksRequest[]|false {
        if (!(task instanceof PxerPageRequest)) {
            window['PXER_ERROR'] = 'PxerHtmlParser.parsePage: task is not PxerPageRequest';
            return false;
        }
        if (!task.url || !task.html) {
            window['PXER_ERROR'] = 'PxerHtmlParser.parsePage: task illegal';
            return false;
        }
        var html = task.html[task.url[0]];

        var taskList : PxerWorksRequest[] = [];
        switch (task.type) {
            case "bookmark_works":
            case "member_works":
                var dom = PxerHtmlParser.HTMLParser(html);
                var elts = dom.body.querySelectorAll('a.work._work');
                for (let elt of elts) {
                    var pwr = new PxerWorksRequest(
                        [],
                        {},
                        (<RegExpMatchArray>(<string>elt.getAttribute('href')).match(/illust_id=(\d+)/))[1]
                    );

                    pwr.url = PxerHtmlParser.getUrlList(pwr);

                    taskList.push(pwr);
                };
                break;
            case "rank":
                var data = JSON.parse(html);
                for (var rankitem of data['contents']) {

                    var tsk = new PxerWorksRequest(
                        [],
                        {},
                        rankitem['illust_id'].toString(),
                    );
                    tsk.url = PxerHtmlParser.getUrlList(tsk);

                    taskList.push(tsk);
                };
                break;
            case "discovery":
                var data =JSON.parse(html);
                for (var id of data.recommendations) {
                    var pwr = new PxerWorksRequest(
                        [],
                        {},
                        id.toString(),
                    );
                    pwr.url = PxerHtmlParser.getUrlList(pwr);
                    
                    taskList.push(pwr);
                };
                break;
            case "search":
                var dom = PxerHtmlParser.HTMLParser(html);
                var searchResult = <Element>dom.body.querySelector("input#js-mount-point-search-result-list");
                var searchData = JSON.parse(<string>searchResult.getAttribute('data-items'));
                for (var searchItem of searchData) {
                    var pwr = new PxerWorksRequest(
                    [],
                    {},
                    searchItem.illustId,
                    );
                    pwr.url = PxerHtmlParser.getUrlList(pwr);
                    taskList.push(pwr);
                };
                break;
            case "bookmark_new":
                var dom = PxerHtmlParser.HTMLParser(html);
                var data = JSON.parse(<string>(<Element>dom.body.querySelector("div#js-mount-point-latest-following")).getAttribute("data-items"));
                for (var work of data) {
                    
                    var pwr = new PxerWorksRequest(
                        [],
                        {},
                        work.illustId.toString(),
                    );
                    pwr.url = PxerHtmlParser.getUrlList(pwr);

                    taskList.push(pwr);
                };
                break;
            default:
                throw new Error(`Unknown PageWorks type ${task.type}`);
        };
        
        if (taskList.length<1) {
            window['PXER_ERROR'] = 'PxerHtmlParser.parsePage: result empty';
            return false;
        };

        return taskList;

    };
    /**
     * 解析作品任务对象
     * @param {PxerWorksRequest} task - 抓取后的页码任务对象
     * @return {PxerWorks} - 解析得到的作品任务对象
     * */
    static async parseWorks(task : PxerWorksRequest) :Promise<PxerWorks|false>{
        if(!(task instanceof PxerWorksRequest)){
            window['PXER_ERROR'] ='PxerHtmlParser.parseWorks: task is not PxerWorksRequest';
            return false;
        }
        if(!task.url.every(item=>!!task.html[item])){
            window['PXER_ERROR'] ='PxerHtmlParser.parseWorks: task illegal';
            return false;
        }

        var pw: PxerWorks|false = false;
        for(let url in task.html){
            let data ={
                dom :PxerHtmlParser.HTMLParser(task.html[url]),
                task: task,
            };
            try{
                switch (true){
                    case url.indexOf('mode=medium')!==-1:
                        pw=await PxerHtmlParser.parseMediumHtml(data.dom, data.task);
                        break;
                    default:
                        throw new Error(`PxerHtmlParser.parsePage: count not parse task url "${url}"`);
                };
            }catch(e){
                window['PXER_ERROR'] =`${task.id}:${e.message}`;
                if(window['PXER_MODE']==='dev')console.error(task ,e);
                return false;
            }
        };
        return pw;

    };

    static dateParse(dtstr: string):Date {
        var res = dtstr.split("/")
        var resint = res.map(elem=>parseInt(elem))
        return new Date(resint[0],resint[1]-1,...resint.slice(2))
    }
    static async parseMediumHtml(dom: Document, task:PxerWorksRequest) :Promise<PxerWorks>{
        var illustDataMatch = dom.head.innerHTML.match(PxerHtmlParser.REGEXP['getInitData']);
        if (illustDataMatch===null) {
            throw new Error("getInitData failed.")
        }
        var illustDataStr = (<RegExpMatchArray>illustDataMatch)[0];
        illustDataStr = <string>JsObjStringLiteralParser.getKeyFromStringObjectLiteral(illustDataStr, "preload");
        illustDataStr = <string>JsObjStringLiteralParser.getKeyFromStringObjectLiteral(illustDataStr, 'illust');
        illustDataStr = <string>JsObjStringLiteralParser.getKeyFromStringObjectLiteral(illustDataStr, task.id);
        var illustData: PxerMediumHtmlJsonWorkObj = JSON.parse(illustDataStr);
        
        var id = task.id;
        var type = PxerHtmlParser.parseIllustType(illustData.illustType);
        var title = illustData.title;
        var tagList = illustData.tags.tags.map(e=>e.tag);
        var viewCount = illustData.viewCount;
        var ratedCount = illustData.bookmarkCount;
        var likeCount = illustData.likeCount;
        var pageCount = illustData.pageCount;
        var urls = illustData.urls;
        
        
        if (type ===PxerWorkType.Ugoira){
                var meta = await (await fetch("https://www.pixiv.net/ajax/illust/"+ task.id + "/ugoira_meta", {credentials:'include'})).json()
                let src = meta['body']['originalSrc'];
                (<PxerUgoiraWorksUrl>urls).ugoira_600p=meta['body']['src'];
                (<PxerUgoiraWorksUrl>urls).ugoira_master = src;
                let URLObj = parseURL(src);
    
                var domain = URLObj.domain;
                var date   =PxerHtmlParser.dateParse((<RegExpMatchArray>src.match(PxerHtmlParser.REGEXP['getDate']))[1]);
                var frames :IPxerUgoiraFrameData={
                    framedef:meta['body']['frames'],
                    height:illustData.height,
                    width:illustData.width,
                };
                return new PxerUgoiraWorks({
                    id,
                    type,
                    date,
                    domain,
                    tagList,
                    viewCount,
                    ratedCount,
                    likeCount,
                    frames,
                    title,
                    urls,
                    fileFormat: "zip",
                });
        } else{
                let src = illustData.urls.original;
                let URLObj = parseURL(src);
    
                var domain = URLObj.domain;
                var date = PxerHtmlParser.dateParse((<RegExpMatchArray>src.match(PxerHtmlParser.REGEXP['getDate']))[1]);
                var fileFormat =(<RegExpMatchArray>src.match(/\.(jpg|gif|png)$/))[1];   
                
                if (pageCount>1) {
                    return new PxerMultipleWorks({
                        id,
                        type,
                        date,
                        domain,
                        tagList,
                        viewCount,
                        ratedCount,
                        likeCount,
                        title,
                        multiple: pageCount,
                        fileFormat,
                        urls,
                    })
                } else {
                    return new PxerSingleWorks({
                        id,
                        type,
                        date,
                        domain,
                        tagList,
                        viewCount,
                        ratedCount,
                        title,
                        likeCount,
                        fileFormat,
                        urls,
                    })
                }
        };
    };

    static parseIllustType(type: string|number) : PxerWorkType{
        switch (type.toString()) {
            case "0":
            case "illust":
                return PxerWorkType.Illust;
            case "1":
            case "manga":
                return PxerWorkType.Manga;
            case "2":
            case "ugoira":
                return PxerWorkType.Ugoira;
        }
        throw new Error(`Unknown work type: ${type.toString()}`);
    };

    static HTMLParser(aHTMLString :string){
        var dom =document.implementation.createHTMLDocument('');
        dom.documentElement.innerHTML =aHTMLString;
        return dom;
    };

    static getImageUrl(img : HTMLElement) : string|null{
        return img.getAttribute('src')||img.getAttribute('data-src');
    };
};

namespace JsObjStringLiteralParser {
    let parseObjectLiteral = function() {
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
    
        function trim(string: string|null) {
            return string == null ? '' :
                string.trim ?
                    string.trim() :
                    string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
        }
    
        return function(objectLiteralString: string) {
            // Trim leading and trailing spaces from the string
            var str = trim(objectLiteralString);
    
            // Trim braces '{' surrounding the whole object literal
            if (str.charCodeAt(0) === 123)
                str = str.slice(1, -1);
    
            // Split into tokens
            var result = [],
                toks = <RegExpMatchArray>str.match(token),
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
                        var match = <RegExpMatchArray>toks[i-1].match(divisionLookBehind);
                        if (match && (match[0] in keywordRegexLookBehind)) {
                            // The slash is actually a division punctuator; re-parse the remainder of the string (not including the slash)
                            str = str.substr(str.indexOf(tok) + 1);
                            toks = <RegExpMatchArray>str.match(token);
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
    
    export function getKeyFromStringObjectLiteral(s: string, key: string) :string{
        var resolvedpairs = parseObjectLiteral(s);
        for (var pair of resolvedpairs) {
            if (pair[0] ===key) return <string>pair[1];
        }
        return "";
    }    
}

export {PxerHtmlParser, JsObjStringLiteralParser}