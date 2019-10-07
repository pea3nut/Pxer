// ==UserScript==
// @name           Pxer
// @name:zh        Pxer
// @name:en        Pxer
// @description    Maybe the best tool for pixiv.net for capture pictures
// @description:zh 可能是目前最好用的P站批量抓图工具
// @description:en Maybe the best tool for pixiv.net for capture pictures
// @version        7
// @namespace      http://pxer.pea3nut.org/sfp
// @supportURL     http://pxer.pea3nut.org
// @author         pea3nut / eternal-flame-AD
// @grant          none
// @noframes
// @updateURL      https://pxer-app.pea3nut.org/pxer-sfp.user.js
// @require        https://cdn.jsdelivr.net/npm/vue@2.6/dist/vue.min.js
// @include        https://www.pixiv.net*
// @include        http://www.pixiv.net**
// @include        http://pxer.pea3nut.org*
// @include        https://pxer.pea3nut.org*
// ==/UserScript==
javascript: void(function() {

window['PXER_URL'] = 'https://127.0.0.1:8125/';
window['PXER_MODE'] = 'sfp';

(async function(){
    window['PXER_URL'] = window['PXER_URL'] || 'https://pxer-app.pea3nut.org/';
    window['PXER_MODE'] = window['PXER_MODE'] || 'native';
    window['pxer'] = window['pxer'] || {};

    pxer.url = PXER_URL;
    pxer.mode = PXER_MODE;
    pxer.log = (...msg) => console.log('[Pxer]', ...msg);
    pxer.addFile = async function (url) {
        if (!/^(https?:)?\/\//.test(url)) url = pxer.url + url;

        const createScript = () => new Promise(function (resolve, reject) {
            const elt = document.createElement('script');
            elt.addEventListener('error', reject);
            elt.addEventListener('load', resolve);
            elt.addEventListener('load', () => pxer.log('Loaded ' + url));
            elt.src = url;
            document.documentElement.appendChild(elt);
            return elt;
        });
        const createCss = () => new Promise(function (resolve) {
            const elt = document.createElement('link');
            elt.rel = 'stylesheet';
            elt.href = url;
            document.documentElement.appendChild(elt);
            pxer.log('Link ' + url);
            resolve();
        });
        const createIcon = () => new Promise(function (resolve) {
            const elt = document.createElement('link');
            elt.rel = 'shortcut icon';
            elt.type = 'image/x-icon';
            elt.href = url;
            document.documentElement.appendChild(elt);
            pxer.log('Link ' + url);
            resolve();
        });

        switch (true) {
            case url.endsWith('.js'):
                return createScript();
            case url.endsWith('.css'):
                return createCss();
            case url.endsWith('.ico'):
                return createIcon();
            case url.endsWith('.json'):
                return fetch(url).then(res => res.json());
            default:
                return fetch(url).then(res => res.text());
        }
    };

    switch (PXER_MODE) {
        case 'dev':
        case 'master':
        case 'native':
            await pxer.addFile('native.js');
            break;
        case 'local':
            await pxer.addFile('src/local.js');
            break;
        case 'sfp':
            break;
    }
})();

// src/view/template.html
pxer['uiTemplate'] = `<div id="pxerApp" class="pxer-app">

    <div class="pxer-nav">
        <div class="pn-header">
            <a href="http://pxer.pea3nut.org/" target="_blank">Pxer 7</a>
        </div>
        <div class="pn-message" v-text="errmsg" v-show="errmsg">
            oops~ get some error
        </div>
        <div class="pn-buttons">
            <button class="btn btn-outline-success"
                    @click="load"
                    v-show="state==='standby'&&showLoadBtn"
            >Load</button>
            <button class="btn btn-outline-primary"
                    @click="run"
                    v-show="state==='ready' || (state==='re-ready'&&pxer.taskList.length)"
            >Run</button>
            <button class="btn btn-outline-danger"
                    @click="stop"
                    v-show="isRunning"
            >Stop</button>
            <div id="wave"	
                 v-show="state==='init'"	
            >
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
            <template v-if="showFailTaskList.length">
                <button class="btn btn-outline-warning"
                        @click="showPxerFailWindow=!showPxerFailWindow"
                >Warn</button><span class="pnb-warn-number"
                                    v-text="showFailTaskList.length>99?99:showFailTaskList.length"></span>
            </template>
        </div>
    </div>

    <div class="pxer-fail" v-show="showAll ||(showPxerFailWindow &&showFailTaskList.length)">
        <table class="table">
            <thead class="pft-head"><tr>
                <td>图片ID</td>
                <td width="100">失败原因</td>
                <td>解决方案</td>
                <td width="170" class="text-right">
                    <button class="btn btn-outline-secondary"
                            @click="checkedFailWorksList =pxer.failList">全选</button>
                    <button class="btn btn-outline-success" @click="tryCheckedPfi">重试选中</button>
                </td>
            </tr></thead>
            <tbody><tr v-for="pfi of showFailTaskList">
                    <td><a :href="pfi.url">{{pfi.task.id}}</a></td>
                    <td v-text="formatFailType(pfi.type)"></td>
                    <td v-html="formatFailSolution(pfi.type)"></td>
                    <td class="text-right"><input type="checkbox" :value="pfi" v-model="checkedFailWorksList"></td>
            </tr></tbody>
        </table>
    </div>


    <div class="pxer-task-option form-inline" v-show="showAll ||(showTaskOption&&state==='ready')">
        <div class="form-group">
            <label class="pcf-title">仅抓取前x副：</label>
            <input type="number" class="form-control" v-model="taskOption.limit" />
        </div>
        <div class="form-group">
            <label class="pcf-title">仅抓取id为x之前的：</label>
            <input type="number" class="form-control" v-model="taskOption.stopId" />
        </div>
        <div class="form-group ptp-buttons">
            <button class="btn btn-outline-success" @click="useTaskOption">Use it</button>
        </div>
    </div>


    <div class="pxer-info" v-show="showAll ||isRunning||['ready','re-ready'].indexOf(state)!==-1">
        <div class="pi-item">
            <div class="pii-title">程序状态</div>
            <table class="table">
                <tr>
                    <td>主程序版本：</td>
                    <td v-text="pxerVersion"></td>
                </tr>
                <tr>
                    <td>当前状态：</td>
                    <td v-text="stateMap[state]"></td>
                </tr>
                <tr>
                    <td>已运行时间：</td>
                    <td v-text="formatTime(runTimeTimestamp)"></td>
                </tr>
            </table>
        </div>
        <div class="pi-item">
            <div class="pii-title">配置信息</div>
            <table class="table"><tr>
                    <td>线程数：</td>
                    <td><input v-model="pxer.ptmConfig.thread" class="form-control" type="text" /></td>
                </tr><tr>
                    <td>等待时间：</td>
                    <td><input v-model="pxer.ptmConfig.timeout" class="form-control" type="text" /></td>
                </tr><tr>
                    <td>重试次数：</td>
                    <td><input v-model="pxer.ptmConfig.retry" class="form-control" type="text" /></td>
            </tr></table>
        </div>
        <div class="pi-item">
            <div class="pii-title">当前页面信息</div>
            <table class="table">
                <tr>
                    <td>页面类型：</td>
                    <td v-text="pageType"></td>
                </tr>
                <tr>
                    <td>下载数量：</td>
                    <td v-text="worksNum"></td>
                </tr>
                <tr>
                    <td colspan="2" class="text-right"><button
                            :disabled="state!=='ready'"
                            @click="showTaskOption=!showTaskOption"
                            class="btn btn-outline-info"
                    >Option</button></td>
                </tr>
            </table>
        </div>
        <div class="pi-item">
            <div class="pii-title">执行进度</div>
            <table class="table">
                <tr>
                    <td>总任务数：</td>
                    <td v-text="taskCount"></td>
                </tr>
                <tr>
                    <td>已完成：</td>
                    <td v-text="finishCount>=0?finishCount:'-'"></td>
                </tr>
                <tr>
                    <td>剩余时间：</td>
                    <td v-text="forecastTime>=0?formatTime(forecastTime):'-'"></td>
                </tr>
            </table>
        </div>
    </div>





    <div class="pxer-print" v-show="showAll ||['finish'].indexOf(state)!==-1">
        <div class="pp-filter pxer-class-fieldset">
            <div class="ppf-title pcf-title">过滤选项</div>
            <div class="ppf-form">
                <div class="form-group">
                    <label>点赞数 ≥</label>
                    <input type="number" class="form-control" v-model.number="pxer.pfConfig.rated" />
                </div>
                <div class="form-group">
                    <label>浏览数 ≥</label>
                    <input type="number" class="form-control" v-model.number="pxer.pfConfig.view" />
                </div>
                <div class="form-group">
                    <label>点赞率 ≥</label>
                    <input type="number" class="form-control" v-model.number="pxer.pfConfig.rated_pro" placeholder="若输入，则必须为一个小于1的数字" />
                </div>
                <div class="form-group">
                    <label>作品中<strong>不能</strong>含有以下<strong>任意一个</strong>标签</label>
                    <input v-model="no_tag_any" id="no_tag_any" type="text" class="form-control" placeholder="可以有多个，空格分割" />
                </div>
                <div class="form-group">
                    <label>作品中<strong>不能同时</strong>含有以下<strong>所有</strong>标签</label>
                    <input v-model="no_tag_every" id="no_tag_every" type="text" class="form-control" placeholder="可以有多个，空格分割" />
                </div>
                <div class="form-group">
                    <label>作品中<strong>必须</strong>含有以下<strong>任意一个</strong>标签</label>
                    <input v-model="has_tag_some" id="has_tag_some" type="text" class="form-control" placeholder="可以有多个，空格分割" />
                </div>
                <div class="form-group">
                    <label>作品中<strong>必须同时</strong>含有以下<strong>所有</strong>标签</label>
                    <input v-model="has_tag_every" id="has_tag_every" type="text" class="form-control" placeholder="可以有多个，空格分割" />
                </div>
            </div>
        </div>
        <div class="pp-print pxer-class-fieldset">
            <div class="ppp-title pcf-title">输出选项</div>
            <div class="ppp-form">
                <div class="form-group">
                    <label>单张插画</label>
                    <select class="form-control" v-model="pxer.ppConfig.illust_single">
                        <option value="max">最大</option>
                        <option value="600p">600p</option>
                        <option value="no">不输出</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>多张插画</label>
                    <select class="form-control" v-model="pxer.ppConfig.illust_multiple">
                        <option value="max">最大</option>
                        <option value="1200p">1200p</option>
                        <option value="cover_600p">仅封面（600p）</option>
                        <option value="no">不输出</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>单张漫画</label>
                    <select class="form-control" v-model="pxer.ppConfig.manga_single">
                        <option value="max">最大</option>
                        <option value="600p">600p</option>
                        <option value="no">不输出</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>多张漫画</label>
                    <select class="form-control" v-model="pxer.ppConfig.manga_multiple">
                        <option value="max">最大</option>
                        <option value="1200p">1200p</option>
                        <option value="cover_600p">仅封面（600p）</option>
                        <option value="no">不输出</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>动图</label>
                    <select class="form-control" v-model="printConfigUgoira">
                        <option value="max-no">最大压缩包</option>
                        <option value="600p-no">600p压缩包</option>
                        <option value="max-yes">最大压缩包 + 参数</option>
                        <option value="600p-yes">600p压缩包 + 参数</option>
                        <option value="no-no">不输出</option>
                    </select>
                </div>
                <div class="pppf-buttons">
                    <p class="pppfb-msg" v-html="taskInfo" v-show="taskInfo"></p>
                    <button class="btn btn-outline-info" @click="count">Count</button>
                    <button class="btn btn-outline-success" @click="printWorks">Print</button>
                </div>
            </div>
        </div>
    </div>

</div>`
;


// src/view/style.css
document.documentElement.appendChild(
    document.createElement('style')
).innerHTML = `.pxer-app {
  max-width: 970px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  color: #212529;
  font-size: 14px; }
  .pxer-app *,
  .pxer-app *::before,
  .pxer-app *::after {
    box-sizing: border-box; }
  .pxer-app html {
    font-family: sans-serif;
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0); }
  .pxer-app article, .pxer-app aside, .pxer-app figcaption, .pxer-app figure, .pxer-app footer, .pxer-app header, .pxer-app hgroup, .pxer-app main, .pxer-app nav, .pxer-app section {
    display: block; }
  .pxer-app body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    text-align: left;
    background-color: #fff; }
  .pxer-app [tabindex="-1"]:focus {
    outline: 0 !important; }
  .pxer-app hr {
    box-sizing: content-box;
    height: 0;
    overflow: visible; }
  .pxer-app h1, .pxer-app h2, .pxer-app h3, .pxer-app h4, .pxer-app h5, .pxer-app h6 {
    margin-top: 0;
    margin-bottom: 0.5rem; }
  .pxer-app p {
    margin-top: 0;
    margin-bottom: 1rem; }
  .pxer-app abbr[title],
  .pxer-app abbr[data-original-title] {
    text-decoration: underline;
    text-decoration: underline dotted;
    cursor: help;
    border-bottom: 0;
    text-decoration-skip-ink: none; }
  .pxer-app address {
    margin-bottom: 1rem;
    font-style: normal;
    line-height: inherit; }
  .pxer-app ol,
  .pxer-app ul,
  .pxer-app dl {
    margin-top: 0;
    margin-bottom: 1rem; }
  .pxer-app ol ol,
  .pxer-app ul ul,
  .pxer-app ol ul,
  .pxer-app ul ol {
    margin-bottom: 0; }
  .pxer-app dt {
    font-weight: 700; }
  .pxer-app dd {
    margin-bottom: .5rem;
    margin-left: 0; }
  .pxer-app blockquote {
    margin: 0 0 1rem; }
  .pxer-app b,
  .pxer-app strong {
    font-weight: bolder; }
  .pxer-app small {
    font-size: 80%; }
  .pxer-app sub,
  .pxer-app sup {
    position: relative;
    font-size: 75%;
    line-height: 0;
    vertical-align: baseline; }
  .pxer-app sub {
    bottom: -.25em; }
  .pxer-app sup {
    top: -.5em; }
  .pxer-app a {
    color: #007bff;
    text-decoration: none;
    background-color: transparent; }
    .pxer-app a:hover {
      color: #0056b3;
      text-decoration: underline; }
  .pxer-app a:not([href]):not([tabindex]) {
    color: inherit;
    text-decoration: none; }
    .pxer-app a:not([href]):not([tabindex]):hover, .pxer-app a:not([href]):not([tabindex]):focus {
      color: inherit;
      text-decoration: none; }
    .pxer-app a:not([href]):not([tabindex]):focus {
      outline: 0; }
  .pxer-app pre,
  .pxer-app code,
  .pxer-app kbd,
  .pxer-app samp {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 1em; }
  .pxer-app pre {
    margin-top: 0;
    margin-bottom: 1rem;
    overflow: auto; }
  .pxer-app figure {
    margin: 0 0 1rem; }
  .pxer-app img {
    vertical-align: middle;
    border-style: none; }
  .pxer-app svg {
    overflow: hidden;
    vertical-align: middle; }
  .pxer-app table {
    border-collapse: collapse; }
  .pxer-app caption {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    color: #6c757d;
    text-align: left;
    caption-side: bottom; }
  .pxer-app th {
    text-align: inherit; }
  .pxer-app label {
    display: inline-block;
    margin-bottom: 0.5rem; }
  .pxer-app button {
    border-radius: 0; }
  .pxer-app button:focus {
    outline: 1px dotted;
    outline: 5px auto -webkit-focus-ring-color; }
  .pxer-app input,
  .pxer-app button,
  .pxer-app select,
  .pxer-app optgroup,
  .pxer-app textarea {
    margin: 0;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit; }
  .pxer-app button,
  .pxer-app input {
    overflow: visible; }
  .pxer-app button,
  .pxer-app select {
    text-transform: none; }
  .pxer-app select {
    word-wrap: normal; }
  .pxer-app button,
  .pxer-app [type="button"],
  .pxer-app [type="reset"],
  .pxer-app [type="submit"] {
    -webkit-appearance: button; }
  .pxer-app button:not(:disabled),
  .pxer-app [type="button"]:not(:disabled),
  .pxer-app [type="reset"]:not(:disabled),
  .pxer-app [type="submit"]:not(:disabled) {
    cursor: pointer; }
  .pxer-app button::-moz-focus-inner,
  .pxer-app [type="button"]::-moz-focus-inner,
  .pxer-app [type="reset"]::-moz-focus-inner,
  .pxer-app [type="submit"]::-moz-focus-inner {
    padding: 0;
    border-style: none; }
  .pxer-app input[type="radio"],
  .pxer-app input[type="checkbox"] {
    box-sizing: border-box;
    padding: 0; }
  .pxer-app input[type="date"],
  .pxer-app input[type="time"],
  .pxer-app input[type="datetime-local"],
  .pxer-app input[type="month"] {
    -webkit-appearance: listbox; }
  .pxer-app textarea {
    overflow: auto;
    resize: vertical; }
  .pxer-app fieldset {
    min-width: 0;
    padding: 0;
    margin: 0;
    border: 0; }
  .pxer-app legend {
    display: block;
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin-bottom: .5rem;
    font-size: 1.5rem;
    line-height: inherit;
    color: inherit;
    white-space: normal; }
  .pxer-app progress {
    vertical-align: baseline; }
  .pxer-app [type="number"]::-webkit-inner-spin-button,
  .pxer-app [type="number"]::-webkit-outer-spin-button {
    height: auto; }
  .pxer-app [type="search"] {
    outline-offset: -2px;
    -webkit-appearance: none; }
  .pxer-app [type="search"]::-webkit-search-decoration {
    -webkit-appearance: none; }
  .pxer-app ::-webkit-file-upload-button {
    font: inherit;
    -webkit-appearance: button; }
  .pxer-app output {
    display: inline-block; }
  .pxer-app summary {
    display: list-item;
    cursor: pointer; }
  .pxer-app template {
    display: none; }
  .pxer-app [hidden] {
    display: none !important; }
  .pxer-app .table {
    width: 100%;
    margin-bottom: 1rem;
    color: #212529; }
    .pxer-app .table th,
    .pxer-app .table td {
      padding: 0.75rem;
      vertical-align: top;
      border-top: 1px solid #dee2e6; }
    .pxer-app .table thead th {
      vertical-align: bottom;
      border-bottom: 2px solid #dee2e6; }
    .pxer-app .table tbody + tbody {
      border-top: 2px solid #dee2e6; }
  .pxer-app .table-sm th,
  .pxer-app .table-sm td {
    padding: 0.3rem; }
  .pxer-app .table-bordered {
    border: 1px solid #dee2e6; }
    .pxer-app .table-bordered th,
    .pxer-app .table-bordered td {
      border: 1px solid #dee2e6; }
    .pxer-app .table-bordered thead th,
    .pxer-app .table-bordered thead td {
      border-bottom-width: 2px; }
  .pxer-app .table-borderless th,
  .pxer-app .table-borderless td,
  .pxer-app .table-borderless thead th,
  .pxer-app .table-borderless tbody + tbody {
    border: 0; }
  .pxer-app .table-striped tbody tr:nth-of-type(odd) {
    background-color: rgba(0, 0, 0, 0.05); }
  .pxer-app .table-hover tbody tr:hover {
    color: #212529;
    background-color: rgba(0, 0, 0, 0.075); }
  .pxer-app .table-primary,
  .pxer-app .table-primary > th,
  .pxer-app .table-primary > td {
    background-color: #b8daff; }
  .pxer-app .table-primary th,
  .pxer-app .table-primary td,
  .pxer-app .table-primary thead th,
  .pxer-app .table-primary tbody + tbody {
    border-color: #7abaff; }
  .pxer-app .table-hover .table-primary:hover {
    background-color: #9fcdff; }
    .pxer-app .table-hover .table-primary:hover > td,
    .pxer-app .table-hover .table-primary:hover > th {
      background-color: #9fcdff; }
  .pxer-app .table-secondary,
  .pxer-app .table-secondary > th,
  .pxer-app .table-secondary > td {
    background-color: #d6d8db; }
  .pxer-app .table-secondary th,
  .pxer-app .table-secondary td,
  .pxer-app .table-secondary thead th,
  .pxer-app .table-secondary tbody + tbody {
    border-color: #b3b7bb; }
  .pxer-app .table-hover .table-secondary:hover {
    background-color: #c8cbcf; }
    .pxer-app .table-hover .table-secondary:hover > td,
    .pxer-app .table-hover .table-secondary:hover > th {
      background-color: #c8cbcf; }
  .pxer-app .table-success,
  .pxer-app .table-success > th,
  .pxer-app .table-success > td {
    background-color: #c3e6cb; }
  .pxer-app .table-success th,
  .pxer-app .table-success td,
  .pxer-app .table-success thead th,
  .pxer-app .table-success tbody + tbody {
    border-color: #8fd19e; }
  .pxer-app .table-hover .table-success:hover {
    background-color: #b1dfbb; }
    .pxer-app .table-hover .table-success:hover > td,
    .pxer-app .table-hover .table-success:hover > th {
      background-color: #b1dfbb; }
  .pxer-app .table-info,
  .pxer-app .table-info > th,
  .pxer-app .table-info > td {
    background-color: #bee5eb; }
  .pxer-app .table-info th,
  .pxer-app .table-info td,
  .pxer-app .table-info thead th,
  .pxer-app .table-info tbody + tbody {
    border-color: #86cfda; }
  .pxer-app .table-hover .table-info:hover {
    background-color: #abdde5; }
    .pxer-app .table-hover .table-info:hover > td,
    .pxer-app .table-hover .table-info:hover > th {
      background-color: #abdde5; }
  .pxer-app .table-warning,
  .pxer-app .table-warning > th,
  .pxer-app .table-warning > td {
    background-color: #ffeeba; }
  .pxer-app .table-warning th,
  .pxer-app .table-warning td,
  .pxer-app .table-warning thead th,
  .pxer-app .table-warning tbody + tbody {
    border-color: #ffdf7e; }
  .pxer-app .table-hover .table-warning:hover {
    background-color: #ffe8a1; }
    .pxer-app .table-hover .table-warning:hover > td,
    .pxer-app .table-hover .table-warning:hover > th {
      background-color: #ffe8a1; }
  .pxer-app .table-danger,
  .pxer-app .table-danger > th,
  .pxer-app .table-danger > td {
    background-color: #f5c6cb; }
  .pxer-app .table-danger th,
  .pxer-app .table-danger td,
  .pxer-app .table-danger thead th,
  .pxer-app .table-danger tbody + tbody {
    border-color: #ed969e; }
  .pxer-app .table-hover .table-danger:hover {
    background-color: #f1b0b7; }
    .pxer-app .table-hover .table-danger:hover > td,
    .pxer-app .table-hover .table-danger:hover > th {
      background-color: #f1b0b7; }
  .pxer-app .table-light,
  .pxer-app .table-light > th,
  .pxer-app .table-light > td {
    background-color: #fdfdfe; }
  .pxer-app .table-light th,
  .pxer-app .table-light td,
  .pxer-app .table-light thead th,
  .pxer-app .table-light tbody + tbody {
    border-color: #fbfcfc; }
  .pxer-app .table-hover .table-light:hover {
    background-color: #ececf6; }
    .pxer-app .table-hover .table-light:hover > td,
    .pxer-app .table-hover .table-light:hover > th {
      background-color: #ececf6; }
  .pxer-app .table-dark,
  .pxer-app .table-dark > th,
  .pxer-app .table-dark > td {
    background-color: #c6c8ca; }
  .pxer-app .table-dark th,
  .pxer-app .table-dark td,
  .pxer-app .table-dark thead th,
  .pxer-app .table-dark tbody + tbody {
    border-color: #95999c; }
  .pxer-app .table-hover .table-dark:hover {
    background-color: #b9bbbe; }
    .pxer-app .table-hover .table-dark:hover > td,
    .pxer-app .table-hover .table-dark:hover > th {
      background-color: #b9bbbe; }
  .pxer-app .table-active,
  .pxer-app .table-active > th,
  .pxer-app .table-active > td {
    background-color: rgba(0, 0, 0, 0.075); }
  .pxer-app .table-hover .table-active:hover {
    background-color: rgba(0, 0, 0, 0.075); }
    .pxer-app .table-hover .table-active:hover > td,
    .pxer-app .table-hover .table-active:hover > th {
      background-color: rgba(0, 0, 0, 0.075); }
  .pxer-app .table .thead-dark th {
    color: #fff;
    background-color: #343a40;
    border-color: #454d55; }
  .pxer-app .table .thead-light th {
    color: #495057;
    background-color: #e9ecef;
    border-color: #dee2e6; }
  .pxer-app .table-dark {
    color: #fff;
    background-color: #343a40; }
    .pxer-app .table-dark th,
    .pxer-app .table-dark td,
    .pxer-app .table-dark thead th {
      border-color: #454d55; }
    .pxer-app .table-dark.table-bordered {
      border: 0; }
    .pxer-app .table-dark.table-striped tbody tr:nth-of-type(odd) {
      background-color: rgba(255, 255, 255, 0.05); }
    .pxer-app .table-dark.table-hover tbody tr:hover {
      color: #fff;
      background-color: rgba(255, 255, 255, 0.075); }
  @media (max-width: 575.98px) {
    .pxer-app .table-responsive-sm {
      display: block;
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch; }
      .pxer-app .table-responsive-sm > .table-bordered {
        border: 0; } }
  @media (max-width: 767.98px) {
    .pxer-app .table-responsive-md {
      display: block;
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch; }
      .pxer-app .table-responsive-md > .table-bordered {
        border: 0; } }
  @media (max-width: 991.98px) {
    .pxer-app .table-responsive-lg {
      display: block;
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch; }
      .pxer-app .table-responsive-lg > .table-bordered {
        border: 0; } }
  @media (max-width: 1199.98px) {
    .pxer-app .table-responsive-xl {
      display: block;
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch; }
      .pxer-app .table-responsive-xl > .table-bordered {
        border: 0; } }
  .pxer-app .table-responsive {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch; }
    .pxer-app .table-responsive > .table-bordered {
      border: 0; }
  .pxer-app .form-control {
    display: block;
    width: 100%;
    height: calc(1.5em + 0.75rem + 2px);
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }
    @media (prefers-reduced-motion: reduce) {
      .pxer-app .form-control {
        transition: none; } }
    .pxer-app .form-control::-ms-expand {
      background-color: transparent;
      border: 0; }
    .pxer-app .form-control:focus {
      color: #495057;
      background-color: #fff;
      border-color: #80bdff;
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); }
    .pxer-app .form-control::placeholder {
      color: #6c757d;
      opacity: 1; }
    .pxer-app .form-control:disabled, .pxer-app .form-control[readonly] {
      background-color: #e9ecef;
      opacity: 1; }
  .pxer-app select.form-control:focus::-ms-value {
    color: #495057;
    background-color: #fff; }
  .pxer-app .form-control-file,
  .pxer-app .form-control-range {
    display: block;
    width: 100%; }
  .pxer-app .col-form-label {
    padding-top: calc(0.375rem + 1px);
    padding-bottom: calc(0.375rem + 1px);
    margin-bottom: 0;
    font-size: inherit;
    line-height: 1.5; }
  .pxer-app .col-form-label-lg {
    padding-top: calc(0.5rem + 1px);
    padding-bottom: calc(0.5rem + 1px);
    font-size: 1.25rem;
    line-height: 1.5; }
  .pxer-app .col-form-label-sm {
    padding-top: calc(0.25rem + 1px);
    padding-bottom: calc(0.25rem + 1px);
    font-size: 0.875rem;
    line-height: 1.5; }
  .pxer-app .form-control-plaintext {
    display: block;
    width: 100%;
    padding-top: 0.375rem;
    padding-bottom: 0.375rem;
    margin-bottom: 0;
    line-height: 1.5;
    color: #212529;
    background-color: transparent;
    border: solid transparent;
    border-width: 1px 0; }
    .pxer-app .form-control-plaintext.form-control-sm, .pxer-app input.form-control-plaintext.form-control, .pxer-app select.form-control-plaintext.form-control, .pxer-app .form-control-plaintext.form-control-lg {
      padding-right: 0;
      padding-left: 0; }
  .pxer-app .form-control-sm, .pxer-app input.form-control, .pxer-app select.form-control {
    height: calc(1.5em + 0.5rem + 2px);
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    line-height: 1.5;
    border-radius: 0.2rem; }
  .pxer-app .form-control-lg {
    height: calc(1.5em + 1rem + 2px);
    padding: 0.5rem 1rem;
    font-size: 1.25rem;
    line-height: 1.5;
    border-radius: 0.3rem; }
  .pxer-app select.form-control[size], .pxer-app select.form-control[multiple] {
    height: auto; }
  .pxer-app textarea.form-control {
    height: auto; }
  .pxer-app .form-group {
    margin-bottom: 1rem; }
  .pxer-app .form-text {
    display: block;
    margin-top: 0.25rem; }
  .pxer-app .form-row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -5px;
    margin-left: -5px; }
    .pxer-app .form-row > .col,
    .pxer-app .form-row > [class*="col-"] {
      padding-right: 5px;
      padding-left: 5px; }
  .pxer-app .form-check {
    position: relative;
    display: block;
    padding-left: 1.25rem; }
  .pxer-app .form-check-input {
    position: absolute;
    margin-top: 0.3rem;
    margin-left: -1.25rem; }
    .pxer-app .form-check-input:disabled ~ .form-check-label {
      color: #6c757d; }
  .pxer-app .form-check-label {
    margin-bottom: 0; }
  .pxer-app .form-check-inline {
    display: inline-flex;
    align-items: center;
    padding-left: 0;
    margin-right: 0.75rem; }
    .pxer-app .form-check-inline .form-check-input {
      position: static;
      margin-top: 0;
      margin-right: 0.3125rem;
      margin-left: 0; }
  .pxer-app .valid-feedback {
    display: none;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 80%;
    color: #28a745; }
  .pxer-app .valid-tooltip {
    position: absolute;
    top: 100%;
    z-index: 5;
    display: none;
    max-width: 100%;
    padding: 0.25rem 0.5rem;
    margin-top: .1rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #fff;
    background-color: rgba(40, 167, 69, 0.9);
    border-radius: 0.25rem; }
  .was-validated .pxer-app .form-control:valid, .pxer-app .form-control.is-valid {
    border-color: #28a745;
    padding-right: calc(1.5em + 0.75rem);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: center right calc(0.375em + 0.1875rem);
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem); }
    .was-validated .pxer-app .form-control:valid:focus, .pxer-app .form-control.is-valid:focus {
      border-color: #28a745;
      box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25); }
    .was-validated .pxer-app .form-control:valid ~ .valid-feedback,
    .was-validated .pxer-app .form-control:valid ~ .valid-tooltip, .pxer-app .form-control.is-valid ~ .valid-feedback,
    .pxer-app .form-control.is-valid ~ .valid-tooltip {
      display: block; }
  .was-validated .pxer-app textarea.form-control:valid, .pxer-app textarea.form-control.is-valid {
    padding-right: calc(1.5em + 0.75rem);
    background-position: top calc(0.375em + 0.1875rem) right calc(0.375em + 0.1875rem); }
  .was-validated .pxer-app .custom-select:valid, .pxer-app .custom-select.is-valid {
    border-color: #28a745;
    padding-right: calc((1em + 0.75rem) * 3 / 4 + 1.75rem);
    background: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3e%3cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e") no-repeat right 0.75rem center/8px 10px, url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e") #fff no-repeat center right 1.75rem/calc(0.75em + 0.375rem) calc(0.75em + 0.375rem); }
    .was-validated .pxer-app .custom-select:valid:focus, .pxer-app .custom-select.is-valid:focus {
      border-color: #28a745;
      box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25); }
    .was-validated .pxer-app .custom-select:valid ~ .valid-feedback,
    .was-validated .pxer-app .custom-select:valid ~ .valid-tooltip, .pxer-app .custom-select.is-valid ~ .valid-feedback,
    .pxer-app .custom-select.is-valid ~ .valid-tooltip {
      display: block; }
  .was-validated .pxer-app .form-control-file:valid ~ .valid-feedback,
  .was-validated .pxer-app .form-control-file:valid ~ .valid-tooltip, .pxer-app .form-control-file.is-valid ~ .valid-feedback,
  .pxer-app .form-control-file.is-valid ~ .valid-tooltip {
    display: block; }
  .was-validated .pxer-app .form-check-input:valid ~ .form-check-label, .pxer-app .form-check-input.is-valid ~ .form-check-label {
    color: #28a745; }
  .was-validated .pxer-app .form-check-input:valid ~ .valid-feedback,
  .was-validated .pxer-app .form-check-input:valid ~ .valid-tooltip, .pxer-app .form-check-input.is-valid ~ .valid-feedback,
  .pxer-app .form-check-input.is-valid ~ .valid-tooltip {
    display: block; }
  .was-validated .pxer-app .custom-control-input:valid ~ .custom-control-label, .pxer-app .custom-control-input.is-valid ~ .custom-control-label {
    color: #28a745; }
    .was-validated .pxer-app .custom-control-input:valid ~ .custom-control-label::before, .pxer-app .custom-control-input.is-valid ~ .custom-control-label::before {
      border-color: #28a745; }
  .was-validated .pxer-app .custom-control-input:valid ~ .valid-feedback,
  .was-validated .pxer-app .custom-control-input:valid ~ .valid-tooltip, .pxer-app .custom-control-input.is-valid ~ .valid-feedback,
  .pxer-app .custom-control-input.is-valid ~ .valid-tooltip {
    display: block; }
  .was-validated .pxer-app .custom-control-input:valid:checked ~ .custom-control-label::before, .pxer-app .custom-control-input.is-valid:checked ~ .custom-control-label::before {
    border-color: #34ce57;
    background-color: #34ce57; }
  .was-validated .pxer-app .custom-control-input:valid:focus ~ .custom-control-label::before, .pxer-app .custom-control-input.is-valid:focus ~ .custom-control-label::before {
    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25); }
  .was-validated .pxer-app .custom-control-input:valid:focus:not(:checked) ~ .custom-control-label::before, .pxer-app .custom-control-input.is-valid:focus:not(:checked) ~ .custom-control-label::before {
    border-color: #28a745; }
  .was-validated .pxer-app .custom-file-input:valid ~ .custom-file-label, .pxer-app .custom-file-input.is-valid ~ .custom-file-label {
    border-color: #28a745; }
  .was-validated .pxer-app .custom-file-input:valid ~ .valid-feedback,
  .was-validated .pxer-app .custom-file-input:valid ~ .valid-tooltip, .pxer-app .custom-file-input.is-valid ~ .valid-feedback,
  .pxer-app .custom-file-input.is-valid ~ .valid-tooltip {
    display: block; }
  .was-validated .pxer-app .custom-file-input:valid:focus ~ .custom-file-label, .pxer-app .custom-file-input.is-valid:focus ~ .custom-file-label {
    border-color: #28a745;
    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25); }
  .pxer-app .invalid-feedback {
    display: none;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 80%;
    color: #dc3545; }
  .pxer-app .invalid-tooltip {
    position: absolute;
    top: 100%;
    z-index: 5;
    display: none;
    max-width: 100%;
    padding: 0.25rem 0.5rem;
    margin-top: .1rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #fff;
    background-color: rgba(220, 53, 69, 0.9);
    border-radius: 0.25rem; }
  .was-validated .pxer-app .form-control:invalid, .pxer-app .form-control.is-invalid {
    border-color: #dc3545;
    padding-right: calc(1.5em + 0.75rem);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='%23dc3545' viewBox='-2 -2 7 7'%3e%3cpath stroke='%23dc3545' d='M0 0l3 3m0-3L0 3'/%3e%3ccircle r='.5'/%3e%3ccircle cx='3' r='.5'/%3e%3ccircle cy='3' r='.5'/%3e%3ccircle cx='3' cy='3' r='.5'/%3e%3c/svg%3E");
    background-repeat: no-repeat;
    background-position: center right calc(0.375em + 0.1875rem);
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem); }
    .was-validated .pxer-app .form-control:invalid:focus, .pxer-app .form-control.is-invalid:focus {
      border-color: #dc3545;
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25); }
    .was-validated .pxer-app .form-control:invalid ~ .invalid-feedback,
    .was-validated .pxer-app .form-control:invalid ~ .invalid-tooltip, .pxer-app .form-control.is-invalid ~ .invalid-feedback,
    .pxer-app .form-control.is-invalid ~ .invalid-tooltip {
      display: block; }
  .was-validated .pxer-app textarea.form-control:invalid, .pxer-app textarea.form-control.is-invalid {
    padding-right: calc(1.5em + 0.75rem);
    background-position: top calc(0.375em + 0.1875rem) right calc(0.375em + 0.1875rem); }
  .was-validated .pxer-app .custom-select:invalid, .pxer-app .custom-select.is-invalid {
    border-color: #dc3545;
    padding-right: calc((1em + 0.75rem) * 3 / 4 + 1.75rem);
    background: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3e%3cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e") no-repeat right 0.75rem center/8px 10px, url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='%23dc3545' viewBox='-2 -2 7 7'%3e%3cpath stroke='%23dc3545' d='M0 0l3 3m0-3L0 3'/%3e%3ccircle r='.5'/%3e%3ccircle cx='3' r='.5'/%3e%3ccircle cy='3' r='.5'/%3e%3ccircle cx='3' cy='3' r='.5'/%3e%3c/svg%3E") #fff no-repeat center right 1.75rem/calc(0.75em + 0.375rem) calc(0.75em + 0.375rem); }
    .was-validated .pxer-app .custom-select:invalid:focus, .pxer-app .custom-select.is-invalid:focus {
      border-color: #dc3545;
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25); }
    .was-validated .pxer-app .custom-select:invalid ~ .invalid-feedback,
    .was-validated .pxer-app .custom-select:invalid ~ .invalid-tooltip, .pxer-app .custom-select.is-invalid ~ .invalid-feedback,
    .pxer-app .custom-select.is-invalid ~ .invalid-tooltip {
      display: block; }
  .was-validated .pxer-app .form-control-file:invalid ~ .invalid-feedback,
  .was-validated .pxer-app .form-control-file:invalid ~ .invalid-tooltip, .pxer-app .form-control-file.is-invalid ~ .invalid-feedback,
  .pxer-app .form-control-file.is-invalid ~ .invalid-tooltip {
    display: block; }
  .was-validated .pxer-app .form-check-input:invalid ~ .form-check-label, .pxer-app .form-check-input.is-invalid ~ .form-check-label {
    color: #dc3545; }
  .was-validated .pxer-app .form-check-input:invalid ~ .invalid-feedback,
  .was-validated .pxer-app .form-check-input:invalid ~ .invalid-tooltip, .pxer-app .form-check-input.is-invalid ~ .invalid-feedback,
  .pxer-app .form-check-input.is-invalid ~ .invalid-tooltip {
    display: block; }
  .was-validated .pxer-app .custom-control-input:invalid ~ .custom-control-label, .pxer-app .custom-control-input.is-invalid ~ .custom-control-label {
    color: #dc3545; }
    .was-validated .pxer-app .custom-control-input:invalid ~ .custom-control-label::before, .pxer-app .custom-control-input.is-invalid ~ .custom-control-label::before {
      border-color: #dc3545; }
  .was-validated .pxer-app .custom-control-input:invalid ~ .invalid-feedback,
  .was-validated .pxer-app .custom-control-input:invalid ~ .invalid-tooltip, .pxer-app .custom-control-input.is-invalid ~ .invalid-feedback,
  .pxer-app .custom-control-input.is-invalid ~ .invalid-tooltip {
    display: block; }
  .was-validated .pxer-app .custom-control-input:invalid:checked ~ .custom-control-label::before, .pxer-app .custom-control-input.is-invalid:checked ~ .custom-control-label::before {
    border-color: #e4606d;
    background-color: #e4606d; }
  .was-validated .pxer-app .custom-control-input:invalid:focus ~ .custom-control-label::before, .pxer-app .custom-control-input.is-invalid:focus ~ .custom-control-label::before {
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25); }
  .was-validated .pxer-app .custom-control-input:invalid:focus:not(:checked) ~ .custom-control-label::before, .pxer-app .custom-control-input.is-invalid:focus:not(:checked) ~ .custom-control-label::before {
    border-color: #dc3545; }
  .was-validated .pxer-app .custom-file-input:invalid ~ .custom-file-label, .pxer-app .custom-file-input.is-invalid ~ .custom-file-label {
    border-color: #dc3545; }
  .was-validated .pxer-app .custom-file-input:invalid ~ .invalid-feedback,
  .was-validated .pxer-app .custom-file-input:invalid ~ .invalid-tooltip, .pxer-app .custom-file-input.is-invalid ~ .invalid-feedback,
  .pxer-app .custom-file-input.is-invalid ~ .invalid-tooltip {
    display: block; }
  .was-validated .pxer-app .custom-file-input:invalid:focus ~ .custom-file-label, .pxer-app .custom-file-input.is-invalid:focus ~ .custom-file-label {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25); }
  .pxer-app .form-inline {
    display: flex;
    flex-flow: row wrap;
    align-items: center; }
    .pxer-app .form-inline .form-check {
      width: 100%; }
    @media (min-width: 576px) {
      .pxer-app .form-inline label {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0; }
      .pxer-app .form-inline .form-group {
        display: flex;
        flex: 0 0 auto;
        flex-flow: row wrap;
        align-items: center;
        margin-bottom: 0; }
      .pxer-app .form-inline .form-control {
        display: inline-block;
        width: auto;
        vertical-align: middle; }
      .pxer-app .form-inline .form-control-plaintext {
        display: inline-block; }
      .pxer-app .form-inline .input-group,
      .pxer-app .form-inline .custom-select {
        width: auto; }
      .pxer-app .form-inline .form-check {
        display: flex;
        align-items: center;
        justify-content: center;
        width: auto;
        padding-left: 0; }
      .pxer-app .form-inline .form-check-input {
        position: relative;
        flex-shrink: 0;
        margin-top: 0;
        margin-right: 0.25rem;
        margin-left: 0; }
      .pxer-app .form-inline .custom-control {
        align-items: center;
        justify-content: center; }
      .pxer-app .form-inline .custom-control-label {
        margin-bottom: 0; } }
  .pxer-app .btn {
    display: inline-block;
    font-weight: 400;
    color: #212529;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    background-color: transparent;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }
    @media (prefers-reduced-motion: reduce) {
      .pxer-app .btn {
        transition: none; } }
    .pxer-app .btn:hover {
      color: #212529;
      text-decoration: none; }
    .pxer-app .btn:focus, .pxer-app .btn.focus {
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); }
    .pxer-app .btn.disabled, .pxer-app .btn:disabled {
      opacity: 0.65; }
  .pxer-app a.btn.disabled,
  .pxer-app fieldset:disabled a.btn {
    pointer-events: none; }
  .pxer-app .btn-primary {
    color: #fff;
    background-color: #007bff;
    border-color: #007bff; }
    .pxer-app .btn-primary:hover {
      color: #fff;
      background-color: #0069d9;
      border-color: #0062cc; }
    .pxer-app .btn-primary:focus, .pxer-app .btn-primary.focus {
      box-shadow: 0 0 0 0.2rem rgba(38, 143, 255, 0.5); }
    .pxer-app .btn-primary.disabled, .pxer-app .btn-primary:disabled {
      color: #fff;
      background-color: #007bff;
      border-color: #007bff; }
    .pxer-app .btn-primary:not(:disabled):not(.disabled):active, .pxer-app .btn-primary:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-primary.dropdown-toggle {
      color: #fff;
      background-color: #0062cc;
      border-color: #005cbf; }
      .pxer-app .btn-primary:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-primary:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-primary.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(38, 143, 255, 0.5); }
  .pxer-app .btn-secondary {
    color: #fff;
    background-color: #6c757d;
    border-color: #6c757d; }
    .pxer-app .btn-secondary:hover {
      color: #fff;
      background-color: #5a6268;
      border-color: #545b62; }
    .pxer-app .btn-secondary:focus, .pxer-app .btn-secondary.focus {
      box-shadow: 0 0 0 0.2rem rgba(130, 138, 145, 0.5); }
    .pxer-app .btn-secondary.disabled, .pxer-app .btn-secondary:disabled {
      color: #fff;
      background-color: #6c757d;
      border-color: #6c757d; }
    .pxer-app .btn-secondary:not(:disabled):not(.disabled):active, .pxer-app .btn-secondary:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-secondary.dropdown-toggle {
      color: #fff;
      background-color: #545b62;
      border-color: #4e555b; }
      .pxer-app .btn-secondary:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-secondary:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-secondary.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(130, 138, 145, 0.5); }
  .pxer-app .btn-success {
    color: #fff;
    background-color: #28a745;
    border-color: #28a745; }
    .pxer-app .btn-success:hover {
      color: #fff;
      background-color: #218838;
      border-color: #1e7e34; }
    .pxer-app .btn-success:focus, .pxer-app .btn-success.focus {
      box-shadow: 0 0 0 0.2rem rgba(72, 180, 97, 0.5); }
    .pxer-app .btn-success.disabled, .pxer-app .btn-success:disabled {
      color: #fff;
      background-color: #28a745;
      border-color: #28a745; }
    .pxer-app .btn-success:not(:disabled):not(.disabled):active, .pxer-app .btn-success:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-success.dropdown-toggle {
      color: #fff;
      background-color: #1e7e34;
      border-color: #1c7430; }
      .pxer-app .btn-success:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-success:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-success.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(72, 180, 97, 0.5); }
  .pxer-app .btn-info {
    color: #fff;
    background-color: #17a2b8;
    border-color: #17a2b8; }
    .pxer-app .btn-info:hover {
      color: #fff;
      background-color: #138496;
      border-color: #117a8b; }
    .pxer-app .btn-info:focus, .pxer-app .btn-info.focus {
      box-shadow: 0 0 0 0.2rem rgba(58, 176, 195, 0.5); }
    .pxer-app .btn-info.disabled, .pxer-app .btn-info:disabled {
      color: #fff;
      background-color: #17a2b8;
      border-color: #17a2b8; }
    .pxer-app .btn-info:not(:disabled):not(.disabled):active, .pxer-app .btn-info:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-info.dropdown-toggle {
      color: #fff;
      background-color: #117a8b;
      border-color: #10707f; }
      .pxer-app .btn-info:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-info:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-info.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(58, 176, 195, 0.5); }
  .pxer-app .btn-warning {
    color: #212529;
    background-color: #ffc107;
    border-color: #ffc107; }
    .pxer-app .btn-warning:hover {
      color: #212529;
      background-color: #e0a800;
      border-color: #d39e00; }
    .pxer-app .btn-warning:focus, .pxer-app .btn-warning.focus {
      box-shadow: 0 0 0 0.2rem rgba(222, 170, 12, 0.5); }
    .pxer-app .btn-warning.disabled, .pxer-app .btn-warning:disabled {
      color: #212529;
      background-color: #ffc107;
      border-color: #ffc107; }
    .pxer-app .btn-warning:not(:disabled):not(.disabled):active, .pxer-app .btn-warning:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-warning.dropdown-toggle {
      color: #212529;
      background-color: #d39e00;
      border-color: #c69500; }
      .pxer-app .btn-warning:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-warning:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-warning.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(222, 170, 12, 0.5); }
  .pxer-app .btn-danger {
    color: #fff;
    background-color: #dc3545;
    border-color: #dc3545; }
    .pxer-app .btn-danger:hover {
      color: #fff;
      background-color: #c82333;
      border-color: #bd2130; }
    .pxer-app .btn-danger:focus, .pxer-app .btn-danger.focus {
      box-shadow: 0 0 0 0.2rem rgba(225, 83, 97, 0.5); }
    .pxer-app .btn-danger.disabled, .pxer-app .btn-danger:disabled {
      color: #fff;
      background-color: #dc3545;
      border-color: #dc3545; }
    .pxer-app .btn-danger:not(:disabled):not(.disabled):active, .pxer-app .btn-danger:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-danger.dropdown-toggle {
      color: #fff;
      background-color: #bd2130;
      border-color: #b21f2d; }
      .pxer-app .btn-danger:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-danger:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-danger.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(225, 83, 97, 0.5); }
  .pxer-app .btn-light {
    color: #212529;
    background-color: #f8f9fa;
    border-color: #f8f9fa; }
    .pxer-app .btn-light:hover {
      color: #212529;
      background-color: #e2e6ea;
      border-color: #dae0e5; }
    .pxer-app .btn-light:focus, .pxer-app .btn-light.focus {
      box-shadow: 0 0 0 0.2rem rgba(216, 217, 219, 0.5); }
    .pxer-app .btn-light.disabled, .pxer-app .btn-light:disabled {
      color: #212529;
      background-color: #f8f9fa;
      border-color: #f8f9fa; }
    .pxer-app .btn-light:not(:disabled):not(.disabled):active, .pxer-app .btn-light:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-light.dropdown-toggle {
      color: #212529;
      background-color: #dae0e5;
      border-color: #d3d9df; }
      .pxer-app .btn-light:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-light:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-light.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(216, 217, 219, 0.5); }
  .pxer-app .btn-dark {
    color: #fff;
    background-color: #343a40;
    border-color: #343a40; }
    .pxer-app .btn-dark:hover {
      color: #fff;
      background-color: #23272b;
      border-color: #1d2124; }
    .pxer-app .btn-dark:focus, .pxer-app .btn-dark.focus {
      box-shadow: 0 0 0 0.2rem rgba(82, 88, 93, 0.5); }
    .pxer-app .btn-dark.disabled, .pxer-app .btn-dark:disabled {
      color: #fff;
      background-color: #343a40;
      border-color: #343a40; }
    .pxer-app .btn-dark:not(:disabled):not(.disabled):active, .pxer-app .btn-dark:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-dark.dropdown-toggle {
      color: #fff;
      background-color: #1d2124;
      border-color: #171a1d; }
      .pxer-app .btn-dark:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-dark:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-dark.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(82, 88, 93, 0.5); }
  .pxer-app .btn-outline-primary {
    color: #007bff;
    border-color: #007bff; }
    .pxer-app .btn-outline-primary:hover {
      color: #fff;
      background-color: #007bff;
      border-color: #007bff; }
    .pxer-app .btn-outline-primary:focus, .pxer-app .btn-outline-primary.focus {
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5); }
    .pxer-app .btn-outline-primary.disabled, .pxer-app .btn-outline-primary:disabled {
      color: #007bff;
      background-color: transparent; }
    .pxer-app .btn-outline-primary:not(:disabled):not(.disabled):active, .pxer-app .btn-outline-primary:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-outline-primary.dropdown-toggle {
      color: #fff;
      background-color: #007bff;
      border-color: #007bff; }
      .pxer-app .btn-outline-primary:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-outline-primary:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-outline-primary.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5); }
  .pxer-app .btn-outline-secondary {
    color: #6c757d;
    border-color: #6c757d; }
    .pxer-app .btn-outline-secondary:hover {
      color: #fff;
      background-color: #6c757d;
      border-color: #6c757d; }
    .pxer-app .btn-outline-secondary:focus, .pxer-app .btn-outline-secondary.focus {
      box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.5); }
    .pxer-app .btn-outline-secondary.disabled, .pxer-app .btn-outline-secondary:disabled {
      color: #6c757d;
      background-color: transparent; }
    .pxer-app .btn-outline-secondary:not(:disabled):not(.disabled):active, .pxer-app .btn-outline-secondary:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-outline-secondary.dropdown-toggle {
      color: #fff;
      background-color: #6c757d;
      border-color: #6c757d; }
      .pxer-app .btn-outline-secondary:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-outline-secondary:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-outline-secondary.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.5); }
  .pxer-app .btn-outline-success {
    color: #28a745;
    border-color: #28a745; }
    .pxer-app .btn-outline-success:hover {
      color: #fff;
      background-color: #28a745;
      border-color: #28a745; }
    .pxer-app .btn-outline-success:focus, .pxer-app .btn-outline-success.focus {
      box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5); }
    .pxer-app .btn-outline-success.disabled, .pxer-app .btn-outline-success:disabled {
      color: #28a745;
      background-color: transparent; }
    .pxer-app .btn-outline-success:not(:disabled):not(.disabled):active, .pxer-app .btn-outline-success:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-outline-success.dropdown-toggle {
      color: #fff;
      background-color: #28a745;
      border-color: #28a745; }
      .pxer-app .btn-outline-success:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-outline-success:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-outline-success.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5); }
  .pxer-app .btn-outline-info {
    color: #17a2b8;
    border-color: #17a2b8; }
    .pxer-app .btn-outline-info:hover {
      color: #fff;
      background-color: #17a2b8;
      border-color: #17a2b8; }
    .pxer-app .btn-outline-info:focus, .pxer-app .btn-outline-info.focus {
      box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.5); }
    .pxer-app .btn-outline-info.disabled, .pxer-app .btn-outline-info:disabled {
      color: #17a2b8;
      background-color: transparent; }
    .pxer-app .btn-outline-info:not(:disabled):not(.disabled):active, .pxer-app .btn-outline-info:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-outline-info.dropdown-toggle {
      color: #fff;
      background-color: #17a2b8;
      border-color: #17a2b8; }
      .pxer-app .btn-outline-info:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-outline-info:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-outline-info.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.5); }
  .pxer-app .btn-outline-warning {
    color: #ffc107;
    border-color: #ffc107; }
    .pxer-app .btn-outline-warning:hover {
      color: #212529;
      background-color: #ffc107;
      border-color: #ffc107; }
    .pxer-app .btn-outline-warning:focus, .pxer-app .btn-outline-warning.focus {
      box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.5); }
    .pxer-app .btn-outline-warning.disabled, .pxer-app .btn-outline-warning:disabled {
      color: #ffc107;
      background-color: transparent; }
    .pxer-app .btn-outline-warning:not(:disabled):not(.disabled):active, .pxer-app .btn-outline-warning:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-outline-warning.dropdown-toggle {
      color: #212529;
      background-color: #ffc107;
      border-color: #ffc107; }
      .pxer-app .btn-outline-warning:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-outline-warning:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-outline-warning.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.5); }
  .pxer-app .btn-outline-danger {
    color: #dc3545;
    border-color: #dc3545; }
    .pxer-app .btn-outline-danger:hover {
      color: #fff;
      background-color: #dc3545;
      border-color: #dc3545; }
    .pxer-app .btn-outline-danger:focus, .pxer-app .btn-outline-danger.focus {
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5); }
    .pxer-app .btn-outline-danger.disabled, .pxer-app .btn-outline-danger:disabled {
      color: #dc3545;
      background-color: transparent; }
    .pxer-app .btn-outline-danger:not(:disabled):not(.disabled):active, .pxer-app .btn-outline-danger:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-outline-danger.dropdown-toggle {
      color: #fff;
      background-color: #dc3545;
      border-color: #dc3545; }
      .pxer-app .btn-outline-danger:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-outline-danger:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-outline-danger.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5); }
  .pxer-app .btn-outline-light {
    color: #f8f9fa;
    border-color: #f8f9fa; }
    .pxer-app .btn-outline-light:hover {
      color: #212529;
      background-color: #f8f9fa;
      border-color: #f8f9fa; }
    .pxer-app .btn-outline-light:focus, .pxer-app .btn-outline-light.focus {
      box-shadow: 0 0 0 0.2rem rgba(248, 249, 250, 0.5); }
    .pxer-app .btn-outline-light.disabled, .pxer-app .btn-outline-light:disabled {
      color: #f8f9fa;
      background-color: transparent; }
    .pxer-app .btn-outline-light:not(:disabled):not(.disabled):active, .pxer-app .btn-outline-light:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-outline-light.dropdown-toggle {
      color: #212529;
      background-color: #f8f9fa;
      border-color: #f8f9fa; }
      .pxer-app .btn-outline-light:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-outline-light:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-outline-light.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(248, 249, 250, 0.5); }
  .pxer-app .btn-outline-dark {
    color: #343a40;
    border-color: #343a40; }
    .pxer-app .btn-outline-dark:hover {
      color: #fff;
      background-color: #343a40;
      border-color: #343a40; }
    .pxer-app .btn-outline-dark:focus, .pxer-app .btn-outline-dark.focus {
      box-shadow: 0 0 0 0.2rem rgba(52, 58, 64, 0.5); }
    .pxer-app .btn-outline-dark.disabled, .pxer-app .btn-outline-dark:disabled {
      color: #343a40;
      background-color: transparent; }
    .pxer-app .btn-outline-dark:not(:disabled):not(.disabled):active, .pxer-app .btn-outline-dark:not(:disabled):not(.disabled).active,
    .show > .pxer-app .btn-outline-dark.dropdown-toggle {
      color: #fff;
      background-color: #343a40;
      border-color: #343a40; }
      .pxer-app .btn-outline-dark:not(:disabled):not(.disabled):active:focus, .pxer-app .btn-outline-dark:not(:disabled):not(.disabled).active:focus,
      .show > .pxer-app .btn-outline-dark.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(52, 58, 64, 0.5); }
  .pxer-app .btn-link {
    font-weight: 400;
    color: #007bff;
    text-decoration: none; }
    .pxer-app .btn-link:hover {
      color: #0056b3;
      text-decoration: underline; }
    .pxer-app .btn-link:focus, .pxer-app .btn-link.focus {
      text-decoration: underline;
      box-shadow: none; }
    .pxer-app .btn-link:disabled, .pxer-app .btn-link.disabled {
      color: #6c757d;
      pointer-events: none; }
  .pxer-app .btn-lg {
    padding: 0.5rem 1rem;
    font-size: 1.25rem;
    line-height: 1.5;
    border-radius: 0.3rem; }
  .pxer-app .btn-sm, .pxer-app .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    line-height: 1.5;
    border-radius: 0.2rem; }
  .pxer-app .btn-block {
    display: block;
    width: 100%; }
    .pxer-app .btn-block + .btn-block {
      margin-top: 0.5rem; }
  .pxer-app input[type="submit"].btn-block,
  .pxer-app input[type="reset"].btn-block,
  .pxer-app input[type="button"].btn-block {
    width: 100%; }
  .pxer-app > * {
    background-color: #fff;
    border: 1px solid #d6dee5;
    border-radius: 5px;
    margin-top: 10px;
    margin-bottom: 10px;
    min-height: 40px;
    display: flex; }
  .pxer-app .pxer-nav {
    background-color: #fff;
    justify-content: space-between;
    padding: 5px 12px;
    align-items: center; }
    .pxer-app .pxer-nav .pn-header a, .pxer-app .pxer-nav .pn-header a:active, .pxer-app .pxer-nav .pn-header a:hover {
      text-decoration: none;
      color: #258fb8;
      font-family: sans-serif;
      font-size: 24px; }
    .pxer-app .pxer-nav .pn-header a:hover {
      color: #24749c; }
    .pxer-app .pxer-nav .pn-buttons .pnb-warn-number {
      background-color: #fd7e14;
      font-family: sans-serif;
      width: 20px;
      height: 20px;
      font-size: 14px;
      transform: scale(0.7);
      line-height: 20px;
      color: #fff;
      border-radius: 1000px;
      display: inline-block;
      text-align: center;
      margin-left: -20px;
      position: relative;
      top: -10px;
      left: 8px; }
  .pxer-app .pxer-fail > table thead tr td {
    padding: 3px 12px;
    vertical-align: middle;
    font-size: 16px; }
  .pxer-app .pxer-info {
    padding: 5px 12px; }
    .pxer-app .pxer-info .pi-item {
      border: 1px solid #ccc;
      position: relative;
      flex-grow: 1;
      flex-shrink: 0;
      margin: 0.8em 5px; }
      .pxer-app .pxer-info .pi-item .pii-title {
        background-color: #fff;
        display: inline-block;
        position: absolute;
        top: -0.75em;
        left: 0.45em;
        font-size: 16px; }
      .pxer-app .pxer-info .pi-item > table td {
        vertical-align: middle !important;
        height: 45px;
        padding-top: 0;
        padding-bottom: 0; }
      .pxer-app .pxer-info .pi-item > table tr:nth-child(1) td {
        box-sizing: content-box;
        padding-top: 3px; }
        .pxer-app .pxer-info .pi-item > table tr:nth-child(1) td * {
          box-sizing: border-box; }
      .pxer-app .pxer-info .pi-item input[type='text'] {
        width: 5em; }
  .pxer-app .pxer-task-option {
    padding: 5px 0; }
    .pxer-app .pxer-task-option > * {
      margin-left: 12px; }
    .pxer-app .pxer-task-option .ptp-buttons {
      margin-left: auto;
      margin-right: 12px; }
      .pxer-app .pxer-task-option .ptp-buttons button {
        margin-left: 10px; }
  .pxer-app .pxer-print > * {
    flex-grow: 1;
    margin: 12px; }
  .pxer-app .pxer-print .pp-filter, .pxer-app .pxer-print .pp-print {
    margin-top: 1.5em;
    padding: 12px; }
  .pxer-app .pxer-print .pp-print {
    width: 35%; }
    .pxer-app .pxer-print .pp-print .pppf-buttons {
      text-align: right; }
      .pxer-app .pxer-print .pp-print .pppf-buttons .pppfb-msg {
        padding: 5px;
        text-align: left;
        border: 1px solid #e9ecef;
        color: #6c757d;
        border-radius: 1px; }
  .pxer-app .pxer-print .pp-filter {
    width: 55%; }
  .pxer-app input.form-control, .pxer-app select.form-control {
    height: 24px;
    padding-top: 1px;
    padding-bottom: 1px;
    line-height: 1em; }
  .pxer-app .pxer-class-fieldset {
    border: 1px solid #ccc;
    position: relative;
    padding-top: 1em;
    margin-top: 1em; }
    .pxer-app .pxer-class-fieldset .pcf-title {
      background-color: #fff;
      display: inline-block;
      position: absolute;
      top: -0.75em;
      left: 0.45em;
      font-size: 16px; }
  .pxer-app .text-right {
    text-align: right; }

div#wave {
  position: relative;
  margin-left: auto;
  margin-right: auto; }
  div#wave .dot {
    display: inline-block;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    margin-right: 3px;
    background: #303131;
    animation: wave 1.3s linear infinite; }
    div#wave .dot:nth-child(2) {
      animation-delay: -1.1s; }
    div#wave .dot:nth-child(3) {
      animation-delay: -0.9s; }

@keyframes wave {
  0%, 60%, 100% {
    transform: initial; }
  30% {
    transform: translateY(-8px); } }
`;

;


// ./public/favicon.ico
pxer.addFile('./public/favicon.ico')
;


// http://point.pea3nut.org/sdk/1.0/browser.js
"use strict";
var EventSender = /** @class */ (function () {
    function EventSender(remoteUrl, userOptions) {
        this.remoteUrl = remoteUrl;
        this.userOptions = userOptions;
        this.startTime = new Date;
        this.content = {};
        var that = this;
        this.defaultOptions = {
            sdk_version: '1.0',
            get time() { return new Date; },
            get duration() { return new Date().getTime() - that.startTime.getTime(); },
        };
    }
    EventSender.prototype.setContent = function (content) {
        Object.assign(this.content, content);
    };
    EventSender.prototype.send = function (eventFlag, content) {
        var mergedContent = Object.assign({}, this.content, content);
        var body = Object.assign({}, this.defaultOptions, this.userOptions, {
            content: JSON.stringify(content),
            event_flag: eventFlag,
        });
        this.sendRequest(body);
    };
    EventSender.prototype.sendRequest = function (body) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', this.remoteUrl);
        xhr.onload = function () {
            if (['2', '3'].includes(xhr.status.toString()[0])) {
                var res = JSON.parse(xhr.responseText);
                if (res.errcode) {
                    console.error("Error in point sent! Server response " + xhr.responseText);
                }
            }
            else {
                console.error("Error in point sent! Server response HTTP code " + xhr.status);
            }
        };
        xhr.send(JSON.stringify(body));
    };
    return EventSender;
}());
//# sourceMappingURL=browser.js.map
;


// src/app/util.js
'use strict';

pxer.util = {};

// 全局函数
pxer.util.afterLoad =function(fn){
    if(document.readyState !=='loading'){
        setTimeout(fn);
    }else{
        document.addEventListener('DOMContentLoaded' ,fn);
    };
};
pxer.util.blinkTitle =function(addMsg ,spaceMsg){
    var addMsg =addMsg ||'[完成] ';
    var spaceMsg =spaceMsg ||'[　　] ';
    var timer =setInterval(()=>{
        if(document.title.indexOf(addMsg) !==-1){
            document.title =document.title.replace(addMsg ,spaceMsg);
        }else if(document.title.indexOf(spaceMsg) !==-1){
            document.title =document.title.replace(spaceMsg ,addMsg);
        }else{
            document.title =addMsg+document.title;
        };
    },500);
    window.addEventListener('mousemove' ,function _self(){
        window.addEventListener('mousemove' ,_self);
        clearInterval(timer);
        document.title =document.title.replace(spaceMsg ,"").replace(addMsg ,"");
    });
};
pxer.util.parseURL =function(url=document.URL){
    var arr  =url.match(/^(?:(https?)\:)?\/\/([\w\_\.]+)((?:\/[^\/?]*)*)\/?(?:\?(.+))?$/);
    var data ={
        protocol:arr[1],
        domain:arr[2],
        path:arr[3],
        query:arr[4],
    };
    if(data.query && data.query.indexOf('=')!==-1){
        data.query ={};
        for(let item of arr[4].split('&')){
            let tmp =item.split('=');
            data.query[tmp[0]]=tmp[1];
        };
    }
    return data;
};
pxer.util.createScript =function(url){
    if(!/^(https?:)?\/\//.test(url))url =window['PXER_URL']+url;
    var elt =document.createElement('script');
    elt.charset='utf-8';
    return function(resolve,reject){
        elt.addEventListener('load',resolve);
        elt.addEventListener('load',function(){
            if(window['PXER_MODE']==='dev') console.log('Loaded '+url);
        });
        elt.addEventListener('error',reject);
        elt.src =url;
        document.documentElement.appendChild(elt);
        return elt;
    };
};
pxer.util.createResource =function(url){
    if(!/^(https?:)?\/\//.test(url))url =window['PXER_URL']+url;
    let fx =url.match(/\.([^\.]+?)$/)[1];
    let elt =document.createElement('link');
    switch(fx){
        case 'css':
            elt.rel ='stylesheet';
            break;
        case 'ico':
            elt.rel ='shortcut icon';
            elt.type ='image/x-icon';
            break;
        default:
            throw new Error(`unknown filename extension "${fx}"`)
    }
    return function(resolve,reject){
        elt.href =url;
        document.documentElement.appendChild(elt);
        if(window['PXER_MODE']==='dev') console.log('Linked '+url);
        resolve();
    };
};
pxer.util.execPromise =function(taskList,call){
    var promise =Promise.resolve();
    if(Array.isArray(taskList)&&Array.isArray(taskList[0])){
        for(let array of taskList){
            promise =promise.then(()=>Promise.all(array.map(item=>new Promise(call(item)))));
        }
    }else if(Array.isArray(taskList)){
        for(let item of taskList){
            promise =promise.then(()=>new Promise(call(item)));
        }
    }else{
        promise =promise.then(()=>new Promise(call(taskList)));
    };
    return promise;
};

/**
 * 当前页面类型。可能的值
 * - bookmark_user  自己/其他人关注的用户列表
 * - bookmark_works 自己/其他人收藏的作品
 * - member_info    自己/其他人的主页
 * - works_medium   查看某个作品
 * - works_manga    查看某个多张作品的多张页
 * - works_big      查看某个作品的某张图片的大图
 * - member_works   自己/其他人作品列表页
 * - search         检索页
 * - index          首页
 * - discovery      探索
 * - rank           排行榜
 * - bookmark_new   关注的新作品
 * - unknown        未知
 * @param {string} url
 * @return {string} - 页面类型
 * */
pxer.util.getPageType =function(url=document.URL){
    var URLData =parseURL(url);
    var type =null;
    var isnew =!(Boolean(document.querySelector(".count-badge"))||Boolean(document.querySelector(".profile")));
    if(URLData.domain !=='www.pixiv.net')return 'unknown';
    if(URLData.path==='/bookmark.php'){
        if(URLData.query &&URLData.query.type){
            switch(URLData.query.type){
                case 'user':
                    type ='bookmark_user';
                    break;
                default:
                    type ='unknown';
            };
        }else{
            type ='bookmark_works';
        }
    }else if(URLData.path==='/bookmark_new_illust.php'){
        type ='bookmark_new';
    }else if(URLData.path==='/member.php'){
        type =isnew?'member_works_new':"member_info";
    }else if(URLData.path==='/ranking.php'){
        type ='rank';
    }else if(URLData.path==='/member_illust.php'){
        if(URLData.query&&URLData.query.mode){
            switch(URLData.query.mode){
                case 'medium':
                    type ='works_medium';
                    break;
                case 'manga':
                    type ='works_manga';
                    break;
                case 'manga_big':
                    type ='works_big';
                    break;
                default:
                    type ='unknown';
            };
        }else{
            type =isnew?'member_works_new':"member_works";
        }
    }else if(URLData.path==='/search.php'){
        type ='search';
    }else if(URLData.path==='/discovery'){
        type ='discovery';
    }else if(URLData.path==='/'){
        type ='index';
    }else{
        type ='unknown';
    }
    return type;
};
/**
 * 查询对应页面类型每页作品数量
 * @param {string} type - 作品类型
 * @return {number} - 每页作品数
 */
pxer.util.getOnePageWorkCount =function(type) {
    switch (type) {
        case "search":return 40
        case "rank":return 50
        case "discovery":return 3000
        case "bookmark_works":return 48
        case "member_works_new": return Number.MAX_SAFE_INTEGER
        default:return 20
    };
}
pxer.util.getIDfromURL =function(key='id', url=document.URL) {
    url = new URL(url, document.URL);
    var query = url.search;
    var params = new URLSearchParams(query);
    return params.get(key);
};

Object.assign(window, pxer.util);
;


// src/app/PxerData.js
'use strict';

/**
 * Pxer任务队列中的任务对象
 * @constructor
 * @abstract
 * */
class PxerRequest{
    constructor({url ,html}={}){
        this.url=url;
        this.html =html;
        this.completed =false;
    };
}
/**
 * 页面任务对象
 * @constructor
 * @extends {PxerRequest}
 * */
class PxerPageRequest extends PxerRequest{
    constructor(...argn){
        super(...argn);
        this.type = argn[0].type;
    }
}
/**
 * 作品任务对象
 * @constructor
 * @extends {PxerRequest}
 * */
class PxerWorksRequest extends PxerRequest{
    constructor({url=[] ,html={} ,type ,isMultiple ,id}={}){
        super({url ,html});
        this.type =type;//[manga|ugoira|illust]
        this.isMultiple =isMultiple;//[true|false]
        this.id =id;
    }
}


/**
 * 作品任务对象
 * @constructor
 * @extends {PxerRequest}
 * */
class PxerFailInfo{
    constructor({url,type,task}={}){
        this.url  =url;
        this.type =type;
        this.task =task;
    }
}



/**
 * 抓取到的作品对象
 * @constructor
 * */
class PxerWorks{
    constructor({id ,type ,date ,domain ,tagList ,viewCount ,ratedCount ,fileFormat}={},strict=true){
        /**作品ID*/
        this.id =id;
        /**
         * 投稿日期，格式：Y/m/d/h/m/s
         * @type {string}
         * */
        this.date =date;
        this.type =type;//[manga|ugoira|illust]
        /**作品存放的域名*/
        this.domain =domain;
        /**
         * 作品标签列表
         * @type {Array}
         * */
        this.tagList =tagList;
        /**作品被浏览的次数*/
        this.viewCount =viewCount;
        /**作品被赞的次数*/
        this.ratedCount =ratedCount;
        /**作品的图片文件扩展名*/
        this.fileFormat =fileFormat;
    }
}
/**
 * 抓取到的多张插画/漫画作品对象
 * @extends {PxerWorks}
 * @constructor
 * */
class PxerMultipleWorks extends PxerWorks{
    constructor(data={}){
        super(data,false);
        /**作品的图片张数*/
        this.multiple =data.multiple;
    }
};
/**
 * 抓取到的动图作品对象
 * @extends {PxerWorks}
 * @constructor
 * */
class PxerUgoiraWorks extends PxerWorks{
    constructor(data={}){
        super(data,false);
        this.fileFormat='zip';
        /**动图动画参数*/
        this.frames =data.frames;
    }
};

;


// src/app/PxerEvent.js
'use strict';

class PxerEvent{
    constructor(eventList=[] ,shortName =true){
        this._pe_eventList =eventList;

        this._pe_event ={};
        this._pe_oneEvent ={};


        if(!shortName||typeof Proxy==='undefined') return this
        else return new Proxy(this ,{
            get(target ,property){
                if(property in target){
                    return target[property];
                }else if(target._pe_eventList.indexOf(property) !==-1){
                    return target.dispatch.bind(target ,property);
                }else{
                    return target[property];
                };
            },
        });

    };
    on(type, listener){
        if(!PxerEvent.check(this ,type ,listener))return false;
        if(!this._pe_event[type]) this._pe_event[type]=[];
        this._pe_event[type].push(listener);
        return true;
    };
    one(type, listener){
        if(!PxerEvent.check(this ,type ,listener))return false;
        if(!this._pe_oneEvent[type]) this._pe_oneEvent[type]=[];
        this._pe_oneEvent[type].push(listener);
        return true;
    };
    dispatch(type ,...data){
        if(this._pe_eventList.indexOf(type) ===-1) return false;
        if(this._pe_event[type]) this._pe_event[type].forEach(fn=>fn(...data));
        if(this._pe_oneEvent[type]){
            this._pe_oneEvent[type].forEach(fn=>fn(...data));
            delete this._pe_oneEvent[type];
        }
        if(this._pe_event['*']) this._pe_event['*'].forEach(fn=>fn(...data));
        if(this._pe_oneEvent['*']){
            this._pe_oneEvent['*'].forEach(fn=>fn(...data));
            delete this._pe_oneEvent['*'];
        }
        return true;
    };
    off(eventType, listener){
        if(!PxerEvent.checkEvent(this ,eventType)) return false;
        if(listener &&!PxerEvent.checkListener(listener)) return false;

        if(eventType ===true){
            this._pe_event ={};
            this._pe_oneEvent ={};
            return true;
        };

        if(listener===true || listener==='*'){
            delete this._pe_event[eventType];
            delete this._pe_oneEvent[eventType];
            return true;
        };

        let index1 = this._pe_event[type].lastIndexOf(listener);
        if (index1 !== -1) {
            this._pe_event[type].splice(index1, 1);
        };

        let index2 =this._pe_oneEvent[type].lastIndexOf(listener);
        if(index2 !== -1){
            this._pe_oneEvent[type].splice(index2 ,1);
        };

        return true;

    };
};

PxerEvent.check =function(pe ,eventType ,listener){
    return PxerEvent.checkEvent(pe ,eventType)&&PxerEvent.checkListener(listener);
};
PxerEvent.checkEvent =function(pe ,eventType){
    if(eventType !=='*' &&pe._pe_eventList.indexOf(eventType) ===-1){
        console.warn(`PxerEvent : "${eventType}" is not in eventList[${pe._pe_eventList}]`);
        return false;
    };
    return true;
};
PxerEvent.checkListener =function(listener){
    if(!(listener instanceof Function || listener===true || listener==='*')){
        console.warn(`PxerEvent: "${listener}" is not a function`);
        return false;
    };
    return true;
};



;


// src/app/PxerFilter.js
'use strict';

class PxerFilter{
    /**
     * @param {Object} config - 过滤参数
     * @see PxerFilter.filterInfo
     * @see PxerFilter.filterTag
     * */
    constructor(config){
        /**
         * 每次过滤后得到的累计的作品集合
         * @type {PxerWorks[]}
         * */
        this.passWorks =[];

        /**
         * 过滤的配置信息
         * @see PxerFilter.filterInfo
         * @see PxerFilter.filterTag
         * */
        this.config =Object.assign(PxerFilter.defaultConfig(),config);
    };

    /**
     * 对作品进行过滤
     * @param {PxerWorks[]} worksList - 要过滤的作品数组
     * @return {PxerWorks[]} - 过滤后的结果
     * */
    filter(worksList){
        var resultSet =PxerFilter.filterInfo(PxerFilter.filterTag(worksList,this.config) ,this.config);
        this.passWorks.push(...resultSet);
        return resultSet;
    };
};

/**
 * 返回PxerFilter的默认配置参数
 * @see PxerFilter.filterInfo
 * @see PxerFilter.filterTag
 * */
PxerFilter.defaultConfig =function(){
    return{
        "rated"     :0,//赞的数量
        "rated_pro" :0,//点赞率
        "view"      :0,//浏览数
        "has_tag_every" :[],
        "has_tag_some"  :[],
        "no_tag_any"    :[],
        "no_tag_every"  :[],
    };
};

/**
 * 根据标签作品信息过滤作品
 * @param {PxerWorks[]} worksList
 * @param {number} rated      - 作品不小于的赞的数量
 * @param {number} rated_pro  - 作品不小于的点赞率，小于0的数字
 * @param {number} view       - 作品不小于的浏览数
 * @return {PxerWorks[]}
 * */
PxerFilter.filterInfo =function(worksList ,{rated=0,rated_pro=0,view=0}){
    return worksList.filter(function(works){
        return works.ratedCount >= rated
        && works.viewCount >= view
        && (works.ratedCount/works.viewCount) >= rated_pro
    });
};

/**
 * 根据标签过滤作品
 * @param {PxerWorks[]} worksList
 * @param {string[]} no_tag_any    - 作品中不能含有里面的任意一个标签
 * @param {string[]} no_tag_every  - 作品中不能同时含有里面的所有标签
 * @param {string[]} has_tag_some  - 作品中必须含有有里面的任意一个标签
 * @param {string[]} has_tag_every - 作品中必须同时含有里面的所有标签
 * @return {PxerWorks[]}
 * */
PxerFilter.filterTag =function(worksList ,{has_tag_every,has_tag_some,no_tag_any,no_tag_every}){
    var passWorks =worksList;

    if(has_tag_every && has_tag_every.length !==0){
        passWorks =passWorks.filter(function(works){
            return has_tag_every.every(tag=>works.tagList.indexOf(tag)!==-1);
        });
    };

    if(has_tag_some && has_tag_some.length !==0){
        passWorks =passWorks.filter(function(works){
            return has_tag_some.some(tag=>works.tagList.indexOf(tag)!==-1);
        });
    };

    if(no_tag_any && no_tag_any.length !==0){
        passWorks =passWorks.filter(function(works){
            return !no_tag_any.some(tag=>works.tagList.indexOf(tag)!==-1);
        });
    };

    if(no_tag_every && no_tag_every.length !==0){
        passWorks =passWorks.filter(function(works){
            return !no_tag_every.every(tag=>works.tagList.indexOf(tag)!==-1);
        });
    };

    return passWorks;

};


;


// src/app/PxerHtmlParser.js
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
PxerHtmlParser.parsePage = function (task) {
    if (!(task instanceof PxerPageRequest)) {
        window['PXER_ERROR'] = 'PxerHtmlParser.parsePage: task is not PxerPageRequest';
        return false;
    }
    if (!task.url || !task.html) {
        window['PXER_ERROR'] = 'PxerHtmlParser.parsePage: task illegal';
        return false;
    }

    const parseList = function (elt) {
        return JSON.parse(elt.getAttribute('data-items'))
            .filter(i => !i.isAdContainer) // skip AD
        ;
    };

    var taskList = [];
    switch (task.type) {
        case "userprofile_manga":
        case "userprofile_illust":
        case "userprofile_all":
            var response = JSON.parse(task.html).body
            if (task.type!=="userprofile_illust") {
                for (let elt in response.manga) {
                    let tsk = new PxerWorksRequest({
                        html: {},
                        type: null,
                        isMultiple: null,
                        id: elt,
                    })
                    tsk.url = PxerHtmlParser.getUrlList(tsk)
                    taskList.push(tsk)
                }
            }

            if (task.type!=="userprofile_manga") {
                for (let elt in response.illusts) {
                    var tsk = new PxerWorksRequest({
                        html: {},
                        type: null,
                        isMultiple: null,
                        id: elt,
                    })
                    tsk.url = PxerHtmlParser.getUrlList(tsk)
                    taskList.push(tsk)
                }
            }
            break;

        case "bookmark_works":
            var response = JSON.parse(task.html).body
            for (let worki in response.works) {
                let work = response.works[worki];
                let tsk = new PxerWorksRequest({
                    html: {},
                    type: this.parseIllustType(work.illustType),
                    isMultiple: work.pageCount>1,
                    id: work.id,
                })
                tsk.url = PxerHtmlParser.getUrlList(tsk)
                taskList.push(tsk)
            }
            break;
        case "member_works":
            var dom = PxerHtmlParser.HTMLParser(task.html);
            var elts = dom.body.querySelectorAll('a.work._work');
            for (let elt of elts) {
                var task = new PxerWorksRequest({
                    html: {},
                    type: function(elt) {
                        switch (true) {
                            case elt.matches('.ugoku-illust'): return "ugoira";
                            case elt.matches('.manga'): return "manga";
                            default: return "illust";
                        }
                    }(elt),
                    isMultiple: elt.matches(".multiple"),
                    id: elt.getAttribute('href').match(/illust_id=(\d+)/)[1]
                });

                task.url = PxerHtmlParser.getUrlList(task);

                taskList.push(task);
            };
            break;
        case "rank":
            var data = JSON.parse(task.html);
            for (var task of data['contents']) {

                var task = new PxerWorksRequest({
                    html: {},
                    type: this.parseIllustType(task['illust_type']),
                    isMultiple: task['illust_page_count'] > 1,
                    id: task['illust_id'].toString(),
                });
                task.url = PxerHtmlParser.getUrlList(task);

                taskList.push(task);
            };
            break;
        case "discovery":
            var data =JSON.parse(task.html);
            for (var id of data.recommendations) {
                var task = new PxerWorksRequest({
                    html: {},
                    type: null,
                    isMultiple: null,
                    id  : id.toString(),
                });
                task.url = PxerHtmlParser.getUrlList(task);

                taskList.push(task);
            };
            break;
        case "search":
            var dom = PxerHtmlParser.HTMLParser(task.html);
            var searchData = parseList(dom.body.querySelector("input#js-mount-point-search-result-list"));
            for (var searchItem of searchData) {
                var task = new PxerWorksRequest({
                    html: {},
                    type: this.parseIllustType(searchItem.illustType),
                    isMultiple: searchItem.pageCount > 1,
                    id: searchItem.illustId
                });
                task.url = PxerHtmlParser.getUrlList(task);
                taskList.push(task);
            };
            break;
        case "bookmark_new":
            var dom = PxerHtmlParser.HTMLParser(task.html);
            var data = parseList(dom.body.querySelector("div#js-mount-point-latest-following"));
            for (var task of data) {

                var task = new PxerWorksRequest({
                    html      : {},
                    type      : this.parseIllustType(task.illustType),
                    isMultiple: task.pageCount > 1,
                    id        : task.illustId.toString(),
                });
                task.url = PxerHtmlParser.getUrlList(task);

                taskList.push(task);
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
PxerHtmlParser.parseWorks =function(task){
    if(!(task instanceof PxerWorksRequest)){
        window['PXER_ERROR'] ='PxerHtmlParser.parseWorks: task is not PxerWorksRequest';
        return false;
    }
    if(!task.url.every(item=>task.html[item])){
        window['PXER_ERROR'] ='PxerHtmlParser.parseWorks: task illegal';
        return false;
    }

    for(let url in task.html){
        let data ={
            dom :PxerHtmlParser.HTMLParser(task.html[url]),
            task: task,
        };
        try{
            switch (true){
                case url.indexOf('mode=medium')!==-1:
                    var pw=PxerHtmlParser.parseMediumHtml(data);
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



/**
 * @param {PxerWorksRequest} task
 * @return {Array}
 * */
PxerHtmlParser.getUrlList =function(task){

        return ["https://www.pixiv.net/member_illust.php?mode=medium&illust_id="+task.id];

    };


PxerHtmlParser.parseMediumHtml =function({task,dom}){
    var illustData = dom.head.innerHTML.match(this.REGEXP['getInitData'])[0];
    illustData = this.getKeyFromStringObjectLiteral(illustData, "preload");
    illustData = this.getKeyFromStringObjectLiteral(illustData, 'illust');
    illustData = this.getKeyFromStringObjectLiteral(illustData, task.id);
    illustData = JSON.parse(illustData);

    var pw;
    switch (true) {
        case illustData.illustType===2: pw = new PxerUgoiraWorks(); break;
        case illustData.pageCount>1: pw = new PxerMultipleWorks(); break;
        default: pw = new PxerWorks(); break;
    }

    pw.id = task.id;
    pw.type = this.parseIllustType(illustData.illustType);
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
            pw.frames ={
                framedef:meta['body']['frames'],
                height:illustData.height,
                width:illustData.width,
            };
    } else {
            let src = illustData.urls.original;
            let URLObj = parseURL(src);

            pw.domain = URLObj.domain;
            pw.date = src.match(PxerHtmlParser.REGEXP['getDate'])[1];
            pw.fileFormat =src.match(/\.(jpg|gif|png)$/)[1];
    };
    return pw;
};

PxerHtmlParser.parseIllustType =function(type){
    switch (type.toString()) {
        case "0":
        case "illust":
            return "illust";
        case "1":
        case "manga":
            return "manga";
        case "2":
        case "ugoira":
            return "ugoira";
    }
    return null;
}

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
    return false;
}

;


// src/app/PxerPrinter.js
﻿class PxerPrinter{
    constructor(config){

        /**
         * 计算得到的下载地址
         * @type {string[]}
         * */
        this.address =[];
        /**计算得到的任务信息*/
        this.taskInfo ='';
        /**剥离的动图参数*/
        this.ugoiraFrames ={};

        /**配置信息*/
        this.config =PxerPrinter.defaultConfig();
        config &&this.setConfig(config);

    };

    /**
     * 设置配置信息
     * @param {string|Object} key - 要设置的key或是一个将被遍历合并的对象
     * @param {string} [value] - 要设置的value
     * */
    setConfig(key ,value){
        if(arguments.length ===1 && typeof key ==='object'){
            let obj =key;
            for(let objKey in obj){
                if(objKey in this.config) this.config[objKey] =obj[objKey];
                else console.warn(`PxerPrinter.setConfig: skip key "${objKey}"`);
            };
        }else{
            if(!(key in this.config)) throw new Error(`PxerPrinter.setConfig: ${key} is not in config`);
            this.config[key]=value;
        }
        return this;
    };
};

/**
 * 根据作品列表将下载地址填充到PxerPrinter#address
 * @param {PxerWorks[]} worksList
 * @return {void}
 * */
PxerPrinter.prototype['fillAddress'] =function(worksList){
    for(let works of worksList){
        let configKey =PxerPrinter.getWorksKey(works);
        if(configKey==='ugoira_zip' &&this.config['ugoira_frames']==='yes'){
            this.ugoiraFrames[works.id] =works.frames
        }
        if(!(configKey in this.config)) throw new Error(`PxerPrinter.fillAddress: ${configKey} in not in config`);
        if(this.config[configKey]==='no') continue;
        this.address.push(...PxerPrinter.countAddress(works,this.config[configKey]));
    }
};

/**
 * 根据作品将可读的下载信息填充到PxerPrinter#taskInfo
 * @param {PxerWorks[]} worksList
 * @return {void}
 * */
PxerPrinter.prototype['fillTaskInfo'] =function(worksList){
    var [manga,ugoira,illust,multiple,single,worksNum,address] =new Array(20).fill(0);
    for(let works of worksList){
        let configKey =PxerPrinter.getWorksKey(works);
        if(this.config[configKey]==='no') continue;

        worksNum++;

        switch(works.type){
            case 'manga':
                manga++;
                break;
            case 'ugoira':
                ugoira++;
                break;
            case 'illust':
                illust++;
                break;
            default:
                console.error(works);
                throw new Error(`PxerPrinter.fillTaskInfo: works.type illegal`);
                break;
        };

        if(works instanceof PxerMultipleWorks){
            multiple++;
            address +=works.multiple;
        }else if(works instanceof PxerWorks){//动图
            address++;
            single++;
        }else{
            console.error(works);
            throw new Error(`PxerPrinter.fillTaskInfo: works instanceof illegal`);
        };
    }


    this.taskInfo =`
共计${worksNum}个作品，${address}个下载地址。<br />
单张图片作品占 ${(single/worksNum*100).toFixed(1)}%<br />
多张图片作品占 ${(multiple/worksNum*100).toFixed(1)}%<br />
`.trim();
};
/**
 * 将结果输出
 * 确保下载地址和任务信息已被填充
 * */
PxerPrinter.prototype['print'] =function(){

    /**判断输出动图参数*/
    if((this.config['ugoira_frames'] ==="yes")&&(Object.keys(this.ugoiraFrames).length !==0)){
        let win =window.open(document.URL ,'_blank');
        if(!win){
            alert('Pxer:\n浏览器拦截了弹出窗口，请检查浏览器提示，设置允许此站点的弹出式窗口。');
            return;
        };

        var scriptname="";
        switch (navigator.platform) {
            case "Win32":scriptname="bat批处理"; break;
            default:scriptname="bash"; break;
        }
        let str =[
            '<p>/** 这个页面是自动生成的使用FFmpeg自行合成动图的'+scriptname+'脚本，详细使用教程见<a href="http://pxer.pea3nut.org/md/ugoira_concat" target="_blank" >http://pxer.pea3nut.org/md/ugoira_concat</a> */</p>',
            '<textarea style="height:100%; width:100%" readonly>',
            ...this.generateUgoiraScript(this.ugoiraFrames),
            '</textarea>',
        ];
        win.document.write(str.join('\n'));
    };

    {/**输出下载地址*/
        let win = window.open(document.URL ,'_blank');
        if(!win){
            alert('Pxer:\n浏览器拦截了弹出窗口，请检查浏览器提示，设置允许此站点的弹出式窗口。');
            return;
        };
        let str = [
            '<p>' ,
            '/** 这个页面是抓取到的下载地址，你可以将它们复制到第三方下载工具如QQ旋风中下载 */<br />' ,
            this.taskInfo,
            '</p>',
            '<textarea style="height:100%; width:100%" readonly>' ,
            this.address.join('\n') ,
            '</textarea>' ,
        ];
        win.document.write(str.join('\n'));
    }


};

/**
 * 根据作品类型，生成配置信息的key
 * @param {PxerWorks} works
 * @return {string}
 * @see PxerPrinter.defaultConfig
 * */
PxerPrinter.getWorksKey =function(works){
    var configKey =null;
    if(works instanceof PxerUgoiraWorks){
        configKey ='ugoira_zip';
    }else{
        configKey =works.type+(
                works instanceof PxerMultipleWorks
                    ?'_multiple'
                    :'_single'
            );
    };
    return configKey;
};

/**
 * 根据动图参数，生成ffmpeg脚本
 * @param 动图参数
 * @return {String[]} 生成的脚本行
 * @see PxerPrinter.prototype['print']
 */
PxerPrinter.prototype['generateUgoiraScript'] =function(frames) {
    var lines=[];
    var resstring;
    var ffmpeg;
    var isWindows = ['Win32', 'Win64', 'Windows', 'WinCE'].indexOf(navigator.platform)!==-1;
    switch (this.config.ugoira_zip) {
        case "max": resstring = "1920x1080"; break;
        case "600p": resstring = "600x338"; break;
    }
    var slashstr = "";
    if (isWindows) {
        slashstr="^";
        ffmpeg="ffmpeg";
        lines.push("@echo off");
        lines.push("set /p ext=请输入输出文件扩展名(mp4/gif/...):");
    } else {
        slashstr="\\";
        ffmpeg="$ffmpeg";
        lines.push("#!/bin/bash");
        lines.push("");
        lines.push("{ hash ffmpeg 2>/dev/null && ffmpeg=ffmpeg;} || { [ -x ./ffmpeg ] && ffmpeg=./ffmpeg;} || { echo >&2 \"Failed to locate ffmpeg executable. Aborting.\"; exit 1;}");
        lines.push("read -p '请输入输出文件扩展名(mp4/gif/...):' ext");
    }
    for (let key in frames) {
        var foldername = key + "_ugoira" + resstring;
        var confpath = foldername + "/config.txt";
        var height = frames[key].height;
        var width = frames[key].width;
        if (this.config.ugoira_zip==="600p") {
            var scale = Math.max(height, width)/600;
            height = parseInt(height/scale);
            width = parseInt(width/scale);
        }
        lines.push(isWindows?("del "+ foldername + "\\config.txt >nul 2>nul"):("rm "+ foldername + "/config.txt &> /dev/null"));
        for (let frame of frames[key].framedef) {
            lines.push("echo file "+slashstr+"'" + frame['file']+ slashstr +"' >> "+confpath);
            lines.push("echo duration " + frame['delay']/1000 + " >> "+ confpath);
        }
        lines.push("echo file "+ slashstr + "'" +frames[key].framedef[frames[key].framedef.length-1]['file'] + slashstr + "' >> "+confpath);
        lines.push(isWindows? "if %ext%==gif (":"if [ $ext == \"gif\"]; then");
        lines.push(ffmpeg+" -f concat -i "+confpath+" -vf palettegen "+foldername+"/palette.png");
        lines.push(ffmpeg+" -f concat -i "+confpath+" -i "+foldername+"/palette.png -lavfi paletteuse -framerate 30 -vsync -1 -s "+width+"x"+height+" "+foldername+"/remux." + (isWindows? "%ext%":"$ext"));
        lines.push(isWindows? ") else (":"else");
        lines.push(ffmpeg+" -f concat -i "+confpath+" -framerate 30 -vsync -1 -s "+width+"x"+height+" "+foldername+"/remux." + (isWindows? "%ext%":"$ext"));
        lines.push(isWindows? ")":"fi");
    }
    if (isWindows) {
        lines.push("echo 完成 & pause");
    } else {
        lines.push("read  -n 1 -p \"完成，按任意键退出\" m && echo");
    }
    return lines;
}

/**返回默认的配置对象*/
PxerPrinter.defaultConfig =function(){
    return{
        "manga_single"    :"max",//[max|600p|no]
        "manga_multiple"  :"max",//[max|1200p|cover_600p|no]
        "illust_single"   :"max",//[max|600p|no]
        "illust_multiple" :"max",//[max|1200p|cover_600p|no]
        "ugoira_zip"      :"no",//[max|600p|no]
        "ugoira_frames"   :"no",//[yes|no]
    };
};
/**作品页跳过过滤 */
PxerPrinter.printAllConfig =function(){
    return{
        "manga_single"    :"max",//[max|600p|no]
        "manga_multiple"  :"max",//[max|1200p|cover_600p|no]
        "illust_single"   :"max",//[max|600p|no]
        "illust_multiple" :"max",//[max|1200p|cover_600p|no]
        "ugoira_zip"      :"max",//[max|600p|no]
        "ugoira_frames"   :"yes",//[yes|no]
    };
}






/**
 * 拼装动图原始地址
 * @param {PxerUgoiraWorks} works - 作品
 * @param {string} [type] - 拼装类型 [max|600p]
 * @return {Array}
 * */
PxerPrinter.getUgoira =function(works ,type='max'){
    const tpl ={
        "max"   :"https://#domain#/img-zip-ugoira/img/#date#/#id#_ugoira1920x1080.zip",
        "600p"  :"https://#domain#/img-zip-ugoira/img/#date#/#id#_ugoira600x600.zip",
    };

    var address =tpl[type];
    if(!address) throw new Error(`PxerPrint.getUgoira: unknown type "${type}"`);

    for(let key in works){
        address =address.replace(`#${key}#` ,works[key]);
    };

    return [address];

};
/**
 * 拼装多副原始地址
 * @param {PxerMultipleWorks} works - 作品
 * @param {string} [type] - 拼装类型 [max|1200p|cover_600p]
 * @return {Array}
 * */
PxerPrinter.getMultiple =function(works ,type='max'){
    const tpl ={
        "max"        :"https://#domain#/img-original/img/#date#/#id#_p#index#.#fileFormat#",
        "1200p"      :"https://#domain#/c/1200x1200/img-master/img/#date#/#id#_p#index#_master1200.jpg",
        "cover_600p" :"https://#domain#/c/600x600/img-master/img/#date#/#id#_p0_master1200.jpg",
    };

    var address =tpl[type];
    if(!address) throw new Error(`PxerPrint.getMultiple: unknown type "${type}"`);

    for(let key in works){
        address =address.replace(`#${key}#` ,works[key]);
    };

    //渲染多张
    var addressList =[];
    for(let i=0 ;i<works.multiple ;i++){
        addressList.push(address.replace('#index#' ,i));
    };

    return addressList;

};
/**
 * 拼装单副原始地址
 * @param {PxerWorks} works - 作品
 * @param {string=max} [type] - 拼装类型 [max|600p]
 * @return {Array}
 * */
PxerPrinter.getWorks =function (works ,type='max'){
    const tpl ={
        "max"   :"https://#domain#/img-original/img/#date#/#id#_p0.#fileFormat#",
        "600p"  :"https://#domain#/c/600x600/img-master/img/#date#/#id#_p0_master1200.jpg",
    };

    var address =tpl[type];
    if(!address) throw new Error(`PxerPrint.getWorks: unknown type "${type}"`);

    for(let key in works){
        address =address.replace(`#${key}#` ,works[key]);
    }

    return [address];

};
/**
 * 智能拼装原始地址，对上述的简单封装
 * @param {PxerWorks} [works]
 * @param {...arguments} [argn]
 * @return {Array}
 * */
PxerPrinter.countAddress =function(works,argn){
    switch(true){
        case works instanceof PxerUgoiraWorks:
            return PxerPrinter.getUgoira(...arguments);
        case works instanceof PxerMultipleWorks:
            return PxerPrinter.getMultiple(...arguments);
        case works instanceof PxerWorks:
            return PxerPrinter.getWorks(...arguments);
        default:
            throw new Error('PxerPrinter.countAddress: unknown works');
    };
};

;


// src/app/PxerThread.js
class PxerThread extends PxerEvent{
    /**
     * @param id {string} 线程的ID，便于调试
     * @param {Object} config 线程的配置信息
     * */
    constructor({id ,config}={}){
        super(['load','error','fail']);
        /**当前线程的ID*/
        this.id =id;
        /**
         * 当前线程的状态
         * - free
         * - ready
         * - error
         * - fail
         * - running
         * */
        this.state='free';
        /**线程执行的任务*/
        this.task =null;

        /**
         *
         * */
        this.config =config ||{
            /**ajax超时重试时间*/
            timeout:8000,
            /**最多重试次数*/
            retry:5,
        };

        /**运行时参数*/
        this.runtime ={};

        /**使用的xhr对象*/
        this.xhr =null;

    };
};

/**
 * 对抓取到的URL和HTML进行校验
 * @param {string} url
 * @param {string} html
 * @return {string|true} 返回字符串表示失败
 * */
PxerThread.checkRequest =function(url ,html){
    if(!html) return 'empty';
    if(html.indexOf("_no-item _error") !==-1){
        if(html.indexOf("sprites-r-18g-badge") !==-1) return 'r-18g';
        if(html.indexOf("sprites-r-18-badge") !==-1) return 'r-18';
    };
    if(html.indexOf("sprites-mypixiv-badge") !==-1) return 'mypixiv';
    return true;
};

/**终止线程的执行*/
PxerThread.prototype['stop'] =function(){
    this.xhr.abort();
};

/**
 * 初始化线程
 * @param {PxerRequest} task
 * */
PxerThread.prototype['init'] =function(task){
    this.task=task;

    this.runtime ={};
    this.state ='ready';

    // 必要的检查
    if(Number.isNaN(+this.config.timeout)||Number.isNaN(+this.config.retry)){
        throw new Error(`PxerThread#init: ${this.id} config illegal`);
    }

    //判断行为，读取要请求的URL
    if(this.task instanceof PxerWorksRequest){
        this.runtime.urlList =this.task.url.slice();
    }else if(this.task instanceof PxerPageRequest){
        this.runtime.urlList =[this.task.url];
    }else{
        this.dispatch('error' ,`PxerThread#${this.id}.init: unknown task`);
        return false;
    };

};

/**
 * 使用PxerThread#xhr发送请求
 * @param {string} url
 * */
PxerThread.prototype['sendRequest'] =function(url){
    this.state ='running';
    this.xhr.open('GET' ,url ,true);
    // 单副漫画请求需要更改Referer头信息
    if(
        this.task instanceof PxerWorksRequest
        && this.task.type ==='manga'
        && this.task.isMultiple===false
        && /mode=big/.test(url)
    ){
        var referer =this.task.url.find(item=>item.indexOf('mode=medium')!==-1);
        var origin  =document.URL;
        if(!referer){
            this.dispatch('error','PxerThread.sendRequest: cannot find referer');
        };
        history.replaceState({} ,null ,referer);
        this.xhr.send();
        history.replaceState({} ,null ,origin);
    }else{
        this.xhr.send();
    };
};
/**运行线程*/
PxerThread.prototype['run'] =function _self(){
    const URL =this.runtime.urlList.shift();
    if(!URL){
        this.state ='free';
        this.task.completed =true;
        this.dispatch("load" ,this.task);
        return true;
    }

    const XHR =new XMLHttpRequest();

    this.xhr =XHR;
    XHR.timeout =this.config.timeout;
    XHR.responseType ='text';


    var retry=0;
    XHR.addEventListener('timeout',()=>{
        if(++retry > this.config.retry){
            this.state ='fail';
            this.dispatch('fail' ,new PxerFailInfo({
                task :this.task,
                url  :URL,
                type :'timeout',
                xhr  :XHR,
            }));
            return false;
        }else{
            this.sendRequest(URL);
        }
    });
    XHR.addEventListener("load" ,()=>{
        if(XHR.status.toString()[0]!=='2' &&XHR.status!==304){
            this.state ='fail';
            this.dispatch('fail' ,new PxerFailInfo({
                task :this.task,
                url  :URL,
                type :'http:'+XHR.status,
            }));
            return false;
        };
        // 判断是否真的请求成功
        var msg =PxerThread.checkRequest(URL ,XHR.responseText);
        if(msg !==true){
            this.state ='fail';
            this.dispatch('fail' ,{
                task :this.task,
                url  :URL,
                type :msg,
            });
            return false;
        };

        // 执行成功回调
        if(this.task instanceof PxerWorksRequest){
            this.task.html[URL] =XHR.responseText;
        }else{
            this.task.html =XHR.responseText;
        };
        _self.call(this);//递归
        return true;
    });
    XHR.addEventListener("error" ,()=>{
        this.state ='error';
        this.dispatch('error' ,{
            task :this.task,
            url  :URL,
        });
    });

    this.sendRequest(URL);

};


;


// src/app/PxerThreadManager.js
class PxerThreadManager extends PxerEvent{
    /**
     * @param {number} timeout - 超时时间
     * @param {number} retry   - 重试次数
     * @param {number} thread  - 线程数
     * */
    constructor({timeout=5000,retry=3,thread=8}={}){
        super(['load' ,'error' ,'fail' ,'warn']);

        this.config ={timeout,retry,thread};

        /**
         * 任务列表
         * @type {PxerRequest[]}
         * */
        this.taskList =[];
        /**执行的任务列表的指针，指派了下一条要执行的任务*/
        this.pointer =0;
        /**
         * 存放的线程对象
         * @type {PxerThread[]}
         * */
        this.threads =[];
        /**
         * 每当执行任务开始前调用的中间件
         * @type {Function[]} 返回true继续执行，false终止执行
         * */
        this.middleware =[function(task){
            return !!task;
        }];

        /**运行时用到的变量*/
        this.runtime ={};

    };
};

/**
 * 停止线程的执行，实际上假装任务都执行完了
 * 停止后还会触发load事件，需要一段时间
 * */
PxerThreadManager.prototype['stop'] =function(){
    this.pointer =this.taskList.length+1;
};

/**
 * 初始化线程管理器
 * @param {PxerRequest[]} taskList
 * */
PxerThreadManager.prototype['init'] =function(taskList){
    if(! this.taskList.every(request=>request instanceof PxerRequest)){
        this.dispatch('error' ,'PxerThreadManager.init: taskList is illegal');
        return false;
    }


    // 初始任务与结果
    this.taskList=taskList;
    this.runtime ={};
    this.pointer =0;

    // 建立线程对象
    this.threads =[];
    for(let i=0 ;i<this.config.thread ;i++){
        this.threads.push(new PxerThread({
            id:i,
            config:{
                timeout :this.config.timeout,
                retry :this.config.retry,
            },
        }));
    };

    return this;
};
/**
 * 运行线程管理器
 * */
PxerThreadManager.prototype['run'] =function(){
    if(this.taskList.length ===0){
        this.dispatch('warn','PxerApp#run: taskList.length is 0');
        this.dispatch('load',[]);
        return false;
    };



    for(let thread of this.threads){

        thread.on('load' ,data=>{
            next(this,thread);
        });
        thread.on('fail' ,(pfi)=>{
            this.dispatch('fail',pfi);
            next(this,thread);
        });
        thread.on('error' ,this.dispatch.bind(this ,'error'));


        next(this,thread);

    };

    function next(ptm ,thread){
        if(ptm.middleware.every(fn=>fn(ptm.taskList[ptm.pointer]))){
            thread.init(ptm.taskList[ptm.pointer++]);
            thread.run();
        }else if(ptm.threads.every(thread=>['free','fail','error'].indexOf(thread.state)!==-1)){
            ptm.dispatch('load' ,ptm.taskList);
        };
    }

};











;


// src/app/PxerApp.js
'use strict';

/**
 * Pxer主程序对象，与所有模块都是强耦合关系
 * 若你想阅读源码，建议不要从这个类开始
 * @class
 * */
class PxerApp extends PxerEvent{
    constructor(){
        /**
         * 可能被触发的事件
         * - stop 被终止时
         * - error 出错时
         * - executeWroksTask 执行作品抓取时
         * - finishWorksTask  完成作品抓取时
         * - executePageTask  执行页码抓取时
         * - finishPageTask   完成页码抓取时
         * - finishTask 完成所有任务
         * */
        super([
            'executeWroksTask','executePageTask',
            'finishWorksTask','finishPageTask',
            'error','stop',
        ]);

        /**
         * 当前页面类型。可能的值
         * @type {string}
         * */
        this.pageType =getPageType();
        /**
         * 页面的作品数量
         * @type {number|null}
         * @see PxerApp.init
         * */
        this.worksNum =null;


        /**
         * 任务队列
         * @type {PxerRequest[]}
         * */
        this.taskList=[];
        /**
         * 失败的任务信息
         * @type {PxerFailInfo[]}
         * */
        this.failList=[];
        /**
         * 抓取到的结果集
         * @type {PxerWorks[]}
         * */
        this.resultSet=[];
        /**
         * 过滤得到的结果集
         * @type {PxerWorks[]}
         * */
        this.filterResult=[];

        /**
         * 任务配置选项，用来指派任务执行过程中的一些逻辑
         * 必须在PxerApp#initPageTask调用前配置
         * */
        this.taskOption={
            /**仅抓取前几副作品*/
            limit  :null,
            /**遇到id为x的作品停止后续，不包括本id*/
            stopId :null,
        };

        // 其他对象的配置参数
        this.ptmConfig ={//PxerThreadManager
            timeout:5000,
            retry:3,
            thread:8,
        };
        this.ppConfig =this.pageType.startsWith("works_")? PxerPrinter.printAllConfig() : PxerPrinter.defaultConfig();//PxerPrinter
        this.pfConfig =PxerFilter.defaultConfig();//PxerFilter

        // 使用的PxerThreadManager实例
        this.ptm =null;

        if(window['PXER_MODE']==='dev') window['PXER_APP']=this;

        this.on('error', function (error) {
            pxer.sendEvent('error', {
                error,
                PXER_ERROR,
            })
        });
    };


    /**
     * 初始化时的耗时任务
     */
    async init(){
        this.worksNum = await PxerApp.getWorksNum(document);
    }

    /**
     * 停止执行当前任务
     * 调用后仍会触发对应的finish*事件
     * */
    stop(){
        this.dispatch('stop');
        this.ptm.stop();
    };

    /**初始化批量任务*/
    initPageTask(){
        if(typeof this.pageType !=='string' || typeof this.worksNum!=='number'){
            this.dispatch('error','PxerApp.initPageTask: pageType or number illegal');
            return false;
        };

        let onePageWorksNumber = getOnePageWorkCount(this.pageType);

        var pageNum =Math.ceil(
            this.taskOption.limit
            ? this.taskOption.limit
            : this.worksNum
        )/onePageWorksNumber;

        if (this.pageType==="discovery") {
            var mode;
            switch (true) {
                case document.URL.match(/mode=(r18|safe|all)/)===null: mode = "all"; break;
                default: mode = document.URL.match(/mode=(r18|safe|all)/)[1]; break;
            }
            var recomCount = (this.taskOption.limit? this.taskOption.limit: this.worksNum);
            this.taskList.push(new PxerPageRequest({
                url : `https://www.pixiv.net/rpc/recommender.php?type=illust&sample_illusts=auto&num_recommendations=${recomCount}&page=discovery&mode=${mode}&tt=${pixiv.context.token}`,
                type:this.pageType,
            }));
        } else if (this.pageType==="member_works_new"){
            var uid = getIDfromURL()
            var type = document.URL.match(/type=(\w+)/)?document.URL.match(/type=(\w+)/)[1]:"all"
            this.taskList.push(new PxerPageRequest({
                url: `https://www.pixiv.net/ajax/user/${uid}/profile/all`,
                type: type?`userprofile_${type}`:"userprofile_all",
            }))
        } else if (this.pageType==="bookmark_works"){
            for (let offset =0;offset<48*pageNum;offset+=48) {
                let id = getIDfromURL() || getIDfromURL("id", document.querySelector("a.user-name").getAttribute("href")) // old bookmark page
                this.taskList.push(new PxerPageRequest({
                    type:this.pageType,
                    url: `https://www.pixiv.net/ajax/user/${id}/illusts/bookmarks?tag=&offset=${offset}&limit=48&rest=show`
                }))
            }
        } else {
            var separator =document.URL.includes("?")?"&":"?";
            var extraparam = this.pageType==='rank'? "&format=json" : "";
            for(var i=0 ;i<pageNum ;i++){
                this.taskList.push(new PxerPageRequest({
                    type:this.pageType,
                    url :document.URL+separator+"p="+(i+1)+extraparam,
                }));
            };
        };
    };
    /**抓取页码*/
    executePageTask(){
        if(this.taskList.length ===0){
            this.dispatch('error','PxerApp.executePageTask: taskList is empty');
            return false;
        };
        if(! this.taskList.every(request=>request instanceof PxerPageRequest)){
            this.dispatch('error' ,'PxerApp.executePageTask: taskList is illegal');
            return false;
        };

        this.dispatch('executePageTask');

        var ptm =this.ptm =new PxerThreadManager(this.ptmConfig);
        ptm.on('error'  ,(...argn)=>this.dispatch('error',argn));
        ptm.on('warn'   ,(...argn)=>this.dispatch('error',argn));
        ptm.on('load',()=>{
            var parseResult =[];
            for(let result of this.taskList){
                result =PxerHtmlParser.parsePage(result);
                if(!result){
                    this.dispatch('error',window['PXER_ERROR']);
                    continue;
                }
                parseResult.push(...result);
            };
            this.resultSet =parseResult;
            this.dispatch('finishPageTask' ,parseResult);
        });
        ptm.on('fail',(pfi)=>{
            ptm.pointer--;//失败就不停的尝试
        });
        ptm.init(this.taskList);
        ptm.run();

    };
    /**
     * 抓取作品
     * @param {PxerWorksRequest[]} tasks - 要执行的作品请求数组
     * */
    executeWroksTask(tasks=this.taskList){
        if(tasks.length ===0){
            this.dispatch('error','PxerApp.executeWroksTask: taskList is empty');
            return false;
        };
        if(! tasks.every(request=>request instanceof PxerWorksRequest)){
            this.dispatch('error' ,'PxerApp.executeWroksTask: taskList is illegal');
            return false;
        };

        // 任务按ID降序排列(#133)
        tasks.sort((a,b)=>Number(b.id)-Number(a.id));

        this.dispatch('executeWroksTask');

        var ptm =this.ptm =new PxerThreadManager(this.ptmConfig);
        ptm.on('error'  ,(...argn)=>this.dispatch('error',argn));
        ptm.on('warn'   ,(...argn)=>this.dispatch('error',argn));
        // 根据taskOption添加ptm中间件
        if(this.taskOption.limit){
            ptm.middleware.push((task)=>{
                return ptm.pointer<this.taskOption.limit;
            });
        }
        if(this.taskOption.stopId){
            ptm.middleware.push((task)=>{
                if(task.id==this.taskOption.stopId){
                    ptm.stop();
                    return false;
                }
                return true;
            });
        }

        ptm.on('load',()=>{
            this.resultSet =[];
            var tl =this.taskList.slice(//限制结果集条数
                0,
                this.taskOption.limit
                ? this.taskOption.limit
                : undefined
            );
            for(let pwr of tl){
                if(!pwr.completed)continue;//跳过未完成的任务
                let pw =PxerHtmlParser.parseWorks(pwr);
                if(!pw){
                    pwr.completed=false;
                    ptm.dispatch('fail',new PxerFailInfo({
                        type :'parse',
                        task :pwr,
                        url  :pwr.url[0],
                    }));
                    this.dispatch('error',window['PXER_ERROR']);
                    continue;
                }
                this.resultSet.push(pw);
            }
            this.dispatch('finishWorksTask' ,this.resultSet);
        });
        ptm.on('fail' ,pfi=>{
            this.failList.push(pfi);
        });
        ptm.init(tasks);
        ptm.run();

        return true;

    };
    /**对失败的作品进行再抓取*/
    executeFailWroks(list=this.failList){
        // 把重试的任务从失败列表中减去
        this.failList =this.failList.filter(pfi=>list.indexOf(pfi)===-1);
        // 执行抓取
        this.executeWroksTask(list.map(pfi=>pfi.task))
    };
    /**抓取页码完成后，初始化，准备抓取作品*/
    switchPage2Works(len=this.resultSet.length){
        this.taskList =this.resultSet.slice(0 ,len);
        this.resultSet =[];
    };
    /**
     * 获取当前抓取到的可读的任务信息
     * @return {string}
     * */
    getWorksInfo(){
        var pp =new PxerPrinter(this.ppConfig);
        var pf =new PxerFilter(this.pfConfig);
        pp.fillTaskInfo(pf.filter(this.resultSet));
        return pp.taskInfo;
    };
    /**
     * 输出抓取到的作品
     * */
    printWorks(){
        var pp =new PxerPrinter(this.ppConfig);
        var pf =new PxerFilter(this.pfConfig);
        var works =pf.filter(this.resultSet);
        pp.fillTaskInfo(works);
        pp.fillAddress(works);
        pp.print();
    };
};

/**直接抓取本页面的作品*/
PxerApp.prototype['getThis'] =async function(){
    // 生成任务对象
    var initdata = document.head.innerHTML.match(PxerHtmlParser.REGEXP['getInitData'])[0];
    var id = getIDfromURL("illust_id");

    initdata = PxerHtmlParser.getKeyFromStringObjectLiteral(initdata, "preload");
    initdata = PxerHtmlParser.getKeyFromStringObjectLiteral(initdata, 'illust');
    initdata = PxerHtmlParser.getKeyFromStringObjectLiteral(initdata, id);

    if (initdata) {
        initdata = JSON.parse(initdata);
    } else {
        initdata = (await (await fetch("https://www.pixiv.net/ajax/illust/"+ id, {credentials:'include'})).json())['body'];
    };

    var type = initdata.illustType;
    var pageCount = initdata.pageCount;
    var pwr =new PxerWorksRequest({
        isMultiple  :pageCount>1,
        id          :id,
    });//[manga|ugoira|illust]
    switch (type) {
        case 2: pwr.type ='ugoira'; break;
        case 1: pwr.type ='illust'; break;
        case 0: pwr.type ='manga';  break;
        default:throw new Error("Unknown work type. id:" +id);
    }
    pwr.url =PxerHtmlParser.getUrlList(pwr);
    // 添加执行
    this.taskList = [pwr];
    this.one('finishWorksTask',()=>this.printWorks());
    this.executeWroksTask();
    return true;
};

/**
 * 获取当前页面的总作品数
 * @param {Document=document} dom - 页面的document对象
 * @return {number} - 作品数
 * */
PxerApp.getWorksNum =function(dom=document){
    return new Promise((resolve, reject)=>{
        if (getPageType() === "rank") {
            let queryurl = dom.URL + "&format=json";
            let xhr = new XMLHttpRequest();
            xhr.open("GET", queryurl);
            xhr.onload = (e) => resolve(JSON.parse(xhr.responseText)['rank_total']);
            xhr.send();
        } else if (getPageType() === "bookmark_new") {
            // 关注的新作品页数最多100页
            // 因为一般用户关注的用户数作品都足够填满100页，所以从100开始尝试页数
            // 如果没有100页进行一次二分查找
            let currpage = parseInt(dom.querySelector("ul.page-list>li.current").innerHTML);
            this.getFollowingBookmarkWorksNum(currpage, 100, 100).then((res) => resolve(res));
        } else if (getPageType() === "discovery"){
            resolve(3000);
        } else if (getPageType() === "bookmark_works"){
            let id =  getIDfromURL("id", dom.URL)  || getIDfromURL("id", dom.querySelector("a.user-name").getAttribute("href")) // old bookmark page
            let queryurl = `https://www.pixiv.net/ajax/user/${id}/illusts/bookmarks?tag=&offset=0&limit=48&rest=show`;
            let xhr = new XMLHttpRequest();
            xhr.open("GET", queryurl);
            xhr.onload = (e) => {
                resolve(JSON.parse(xhr.responseText).body.total)
            };
            xhr.send();
        } else if (getPageType() === "member_works_new") {
            let queryurl = `https://www.pixiv.net/ajax/user/${getIDfromURL()}/profile/all`;
            let xhr = new XMLHttpRequest();
            xhr.open("GET", queryurl);
            xhr.onload = (e) => {
                var resp = JSON.parse(xhr.responseText).body;
                var type = dom.URL.match(/type=(manga|illust)/);
                var getKeyCount = function(obj) {
                    return Object.keys(obj).length
                }
                if (!type) {
                    resolve(getKeyCount(resp.illusts)+getKeyCount(resp.manga))
                } else if (type[1]==="illust") {
                    resolve(getKeyCount(resp.illusts))
                } else {
                    resolve(getKeyCount(resp.manga))
                }
            };
            xhr.send();
        } else {
            let elt = dom.querySelector(".count-badge");
            if (!elt) resolve(null);
            resolve(parseInt(elt.innerHTML));
        }
    })
};

/**
 * 获取关注的新作品页的总作品数
 * @param {number} min - 最小页数
 * @param {number} max - 最大页数
 * @param {number} cur - 当前页数
 * @return {number} - 作品数
 */
PxerApp.getFollowingBookmarkWorksNum =function(min, max, cur){
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.pixiv.net/bookmark_new_illust.php?p=" + cur);
        xhr.onload = (e) => {
            var html = xhr.response;
            var el = document.createElement("div");
            el.innerHTML = html;
            if (min === max) {
                var lastworkcount = JSON.parse(el.querySelector("div#js-mount-point-latest-following").getAttribute("data-items")).length;
                resolve((min - 1) * 20 + lastworkcount);
            } else {
                if (!!el.querySelector("div._no-item")) {
                    this.getFollowingBookmarkWorksNum(min, cur - 1, parseInt((min + cur) / 2)).then((res) => resolve(res));
                } else {
                    this.getFollowingBookmarkWorksNum(cur, max, parseInt((cur + max + 1) / 2)).then((res) => resolve(res));
                }
            }
        }
        xhr.send();
    })
}

;


// src/view/analytics.js
(function () {
    const eventSender = new EventSender('http://127.0.0.1:3000/events', {
        uid: dataLayer[0].user_id,
        app_name: 'pxer-app',
        get event_page() { return pxer.util.getPageType(); },
        get referer() { return location.href; },
    });
    eventSender.setContent({
        dataLayer,
    });
    pxer.sendEvent = eventSender.send.bind(eventSender);
})();
;


// src/view/AutoSuggestControl.js
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
class AutoSuggestControl {
    constructor(id_or_element, provider) {
        this.provider = provider;
        /**
         * The textbox to capture, specified by element_id.
         * @scope private
         */
        this.textbox /*:HTMLInputElement*/ = typeof id_or_element == "string" ? document.getElementById(id_or_element) : id_or_element;

        //initialize the control
        this.init();
    }
}

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
    if ((iKeyCode != 16 && iKeyCode < 32) || (iKeyCode >= 33 && iKeyCode <= 46) || (iKeyCode >= 112 && iKeyCode <= 123) || (iKeyCode == 65 && evtobj.ctrlKey) || (iKeyCode == 90 && evtobj.ctrlKey)) {
        //ignore
        if (iKeyCode == 90 && evtobj.ctrlKey) {
            // window.getSelection().deleteFromDocument();
            // TODO: need to find a way to select the rest of the text and delete.
        }
    } else {
        //request suggestions from the suggestion provider
        this.requestSuggestions(this)
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
    if (this.textbox.createTextRange || this.textbox.setSelectionRange){
        var lastSpace = this.textbox.value.lastIndexOf(" ");
        var lastQuote = this.textbox.value.lastIndexOf("'");
        var lastHypen = this.textbox.value.lastIndexOf("-");
        var lastDoubleQuote = this.textbox.value.lastIndexOf('"');
        var lastEnter = this.textbox.value.lastIndexOf("\n");
        var lastIndex = Math.max(lastSpace, lastEnter, lastQuote, lastHypen, lastDoubleQuote) + 1;
        var contentStripped = this.textbox.value.substring(0, lastIndex);
        var lastWord = this.textbox.value.substring(lastIndex, this.textbox.value.length);
        this.textbox.value = contentStripped + sSuggestion; //.replace(lastWord,"");
        var start = this.textbox.value.length - sSuggestion.replace(lastWord,"").length;
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
    var sTextboxLast = sTextboxSplit[sTextboxSplit.length-1];
    var sTextboxValue = sTextboxLast;
    if (sTextboxValue.length > 0){
        //search for matching words
        for (var i=0; i < this.words.length; i++) {
            if (this.words[i].indexOf(sTextboxValue.toLowerCase()) == 0) {
                if (this.words[i].indexOf(sTextboxValue) == 0){
                    aSuggestions.push(this.words[i]);
                }
                else if (this.words[i].indexOf(sTextboxValue.charAt(0).toLowerCase() + sTextboxValue.slice(1)) == 0) {
                    aSuggestions.push(this.words[i].charAt(0).toUpperCase() + this.words[i].slice(1));
                }
            }
        }
    }

    //provide suggestions to the control
    this.autosuggest(aSuggestions);
};
;


// src/view/vm.js
pxer.util.afterLoad(function(){
    // 寻找插入点
    var elt =document.createElement('div');
    var insetElt=(
        document.getElementById('pxer-app')
        || document.getElementById('wrapper')
        || document.querySelector('#root > *:nth-child(2)') // skip <header>
        || document.body
    );
    insetElt.insertBefore(elt,insetElt.firstChild);

    // 运行Vue实例
    new Vue({render:ce=>ce({
        template: pxer.uiTemplate,
        data(){return {
            pxer:new PxerApp(),
            showAll:false,
            state:'standby',//[standby|init|ready|page|works|finish|re-ready|stop|error]
            stateMap:{
                standby:'待命',
                init  :'初始化',
                ready :'就绪',
                page  :'抓取页码中',
                works :'抓取作品中',
                finish:'完成',
                're-ready':'再抓取就绪',
                stop  :'用户手动停止',
                error :'出错',
            },
            pxerVersion:window['PXER_VERSION'],
            showPxerFailWindow:false,
            runTimeTimestamp:0,
            runTimeTimer:null,
            checkedFailWorksList:[],
            taskInfo:'',
            tryFailWroksList:[],
            showTaskOption:false,
            taskOption:{
                limit:'',
                stopId:'',
            },
            showLoadBtn:true,
            errmsg:'',
        }},
        created(){
            window['PXER_VM'] =this;
            pxer.sendEvent('created');
            this.pxer.on('error',(err)=>{
                this.errmsg =err;
            });
            this.pxer.on('finishWorksTask',(result) =>{
                pxer.sendEvent('finish', {
                    result_count: result.length,
                    ptm_config: this.pxer.ptmConfig,
                    task_option: this.pxer.taskOption,
                    error_count: this.pxer.failList.length,
                });
            })
        },
        mounted(){
            var getResultList=()=>[].concat.apply([], this.pxer.resultSet.map((res)=>res.tagList));
            new AutoSuggestControl("no_tag_any", getResultList);
            new AutoSuggestControl("no_tag_every", getResultList);
            new AutoSuggestControl("has_tag_some", getResultList);
            new AutoSuggestControl("has_tag_every", getResultList);
        },
        computed:{
            pageType(){
                var map ={
                    'member_works'     :'作品列表页',
                    'member_works_new' :'作品列表页_',
                    'search'           :'检索页',
                    'bookmark_works'   :'收藏列表页',
                    'rank'             :'排行榜',
                    'bookmark_new'     :'关注的新作品',
                    'discovery'        :'探索',
                    'unknown'          :'未知',
                };
                return map[this.pxer.pageType];
            },
            isRunning(){
                var runState =['page','works'];
                return runState.indexOf(this.state)!==-1;
            },
            worksNum(){
                return this.pxer.taskOption.limit ||this.pxer.worksNum;
            },
            taskCount(){
                var pageWorkCount = getOnePageWorkCount(this.pxer.pageType);
                return Math.ceil(this.worksNum/pageWorkCount)+ +this.worksNum;
            },
            finishCount(){
                if(this.state==='page'){
                    return this.pxer.taskList.filter(pr=>pr.completed).length;
                }else if(this.state==='works'){
                    return (
                        this.pxer.taskList.filter(pr=>pr.completed).length
                        +~~(this.worksNum/20)
                        +this.pxer.failList.length
                    );
                }else{
                    return -1;
                };
            },
            forecastTime(){
                if(this.isRunning&&this.finishCount){
                    return Math.ceil(
                        (this.runTimeTimestamp/this.finishCount)*this.taskCount
                        -this.runTimeTimestamp
                    );
                }else{
                    return -1;
                };
            },
            printConfigUgoira:{
                get(){
                    return this.pxer.ppConfig.ugoira_zip+'-'+this.pxer.ppConfig.ugoira_frames;
                },
                set(value){
                    var arr =value.split('-');
                    this.pxer.ppConfig.ugoira_zip=arr[0];
                    this.pxer.ppConfig.ugoira_frames=arr[1];
                }
            },
            no_tag_any:{
                get(){
                    return this.pxer.pfConfig.no_tag_any.join(' ');
                },
                set(value){
                    this.pxer.pfConfig.no_tag_any =value.split(' ');
                },
            },
            no_tag_every:{
                get(){
                    return this.pxer.pfConfig.no_tag_every.join(' ');
                },
                set(value){
                    this.pxer.pfConfig.no_tag_every =value.split(' ');
                },
            },
            has_tag_some:{
                get(){
                    return this.pxer.pfConfig.has_tag_some.join(' ');
                },
                set(value){
                    this.pxer.pfConfig.has_tag_some =value.split(' ');
                },
            },
            has_tag_every:{
                get(){
                    return this.pxer.pfConfig.has_tag_every.join(' ');
                },
                set(value){
                    this.pxer.pfConfig.has_tag_every =value.split(' ');
                },
            },
            showFailTaskList(){
                return this.pxer.failList
                    .filter((pfi)=>{
                        return this.tryFailWroksList.indexOf(pfi)===-1;
                    })
                ;
            },
        },
        watch:{
            state(newValue,oldValue){
            },
            isRunning(value){
                if(value&&this.runTimeTimer===null){
                    this.runTimeTimer = setInterval(()=>this.runTimeTimestamp++ ,1000);
                }else{
                    clearInterval(this.runTimeTimer);
                    this.runTimeTimer =null;
                }
            },
        },
        methods:{
            load(){
                this.state='init';
                if(this.pxer.pageType==='works_medium'){
                    this.showLoadBtn=false;
                    this.pxer.one('finishWorksTask',()=>{
                        this.showLoadBtn=true;
                        this.state='standby';
                    });
                    this.pxer.getThis();
                }else{
                    this.pxer.init().then(()=>this.state='ready');
                    this.pxer.on('finishWorksTask',()=>{
                        window.blinkTitle();
                    });
                }
                pxer.sendEvent('load', {
                    page_type:this.pxer.pageType,
                });
            },
            run(){
                pxer.sendEvent("start", {
                    ptm_config:this.pxer.ptmConfig,
                    task_option:this.pxer.taskOption,
                    vm_state:this.state,
                });
                if(this.state==='ready'){
                    this.state='page';
                    this.pxer.initPageTask();
                    this.pxer.one('finishPageTask',()=>{
                        this.state='works';
                        this.pxer.switchPage2Works();
                        this.pxer.executeWroksTask();
                    });
                    this.pxer.one('finishWorksTask',()=>{
                        this.state='finish';
                    });
                    this.pxer.executePageTask();
                }else if(this.state==='re-ready'){
                    this.state='works';
                    this.pxer.one('finishWorksTask',()=>{
                        this.state='finish';
                    });
                    this.pxer.executeFailWroks(this.tryFailWroksList);
                    this.tryFailWroksList=[];
                }
            },
            stop(){
                this.state='stop';
                this.pxer.stop();
                pxer.sendEvent("halt", {
                    task_count:this.taskCount,
                    finish_count:this.finishCount,
                });
            },
            count(){
                this.taskInfo =this.pxer.getWorksInfo()
            },
            printWorks(){
                this.pxer.printWorks();
                var sanitizedpfConfig = {};
                for (let key in this.pxer.pfConfig) {
                    sanitizedpfConfig[key] = this.pxer.pfConfig[key].length?this.pxer.pfConfig[key].length:this.pxer.pfConfig[key];
                }
                pxer.sendEvent("print", {
                    pp_config:this.pxer.ppConfig,
                    pf_config:sanitizedpfConfig,
                    task_option:this.pxer.taskOption,
                });
            },
            useTaskOption(){
                this.showTaskOption=false;
                pxer.sendEvent("setTaskOption", {
                    task_option: this.taskOption,
                });
                Object.assign(this.pxer.taskOption ,this.taskOption);
            },
            formatFailType(type){
                return{
                    'empty':'获取内容失败',
                    'timeout':'获取超时',
                    'r-18':'限制级作品（R-18）',
                    'r-18g':'怪诞作品（R-18G）',
                    'mypixiv':'仅好P友可见的作品',
                    'parse':'解析错误',
                }[type]||type;
            },
            formatFailSolution(type){
                return{
                    'empty':'点击左侧链接确认内容正确，再试一次~',
                    'timeout':'增加最大等待时间再试一次~',
                    'r-18':'开启账号R-18选项',
                    'r-18g':'开启账号R-18G选项',
                    'mypixiv':'添加画师好友再尝试',
                    'parse':'再试一次，若问题依旧，请<a href="https://github.com/pea3nut/Pxer/issues/5" target="_blank">反馈</a>给花生',
                }[type]||'要不。。。再试一次？';
            },
            tryCheckedPfi(){
                this.tryFailWroksList.push(...this.checkedFailWorksList);
                pxer.sendEvent("reready", {
                    checked_works:this.checkedFailWorksList,
                });
                this.checkedFailWorksList=[];
                this.state='re-ready';
            },
            formatTime(s){
                return `${~~(s/60)}:${(s%60>=10)?s%60:'0'+s%60}`
            },
        },
    })}).$mount(elt);

});
;


}());