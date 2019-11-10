pxer.util.afterLoad(function(){
    const el = document.createElement('div');
    const component = {
        template: pxer.uiTemplate,
        watch:{
            currentUrl(){
                this.state = 'standby';
                this.taskInfo = '';
                this.errmsg = '';
                this.pageType = pxer.util.getPageType();
                pxer.sendEvent('pv');
            },
            isRunning(value){
                if(value&&this.runTimeTimer===null){
                    this.runTimeTimer = setInterval(()=>this.runTimeTimestamp++ ,1000);
                }else{
                    clearInterval(this.runTimeTimer);
                    this.runTimeTimer =null;
                }
            },
            tagFilterInfo: {
                deep: true,
                handler: 'onTagFilterInfoChange'
            },
        },
        data(){return {
            pxer: null,
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
            pxerVersion: pxer.package.version,
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

            pageType: pxer.util.getPageType(),
            currentUrl: document.URL,
            showAllTagFilter: false,
            showLoadingButton: false,
            /**
             * @property {'NECESSARY' | 'EXCLUDE' | 'WHATEVER'} [tagName] - default by WHATEVER
             * */
            tagFilterInfo: {},
        }},
        computed:{
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
                if (!this.pxer) return [];
                return this.pxer.failList
                    .filter((pfi)=>{
                        return this.tryFailWroksList.indexOf(pfi)===-1;
                    })
                ;
            },

            canCrawlDirectly() { return this.pageType === 'works_medium'; },
            canCrawl() { return PxerApp.canCrawl(); },

            /**
             * @return {TagInfo}
             *
             * @typedef TagInfo
             * @property {Array.<string>} tags - all tags without repeat
             * @property {Object.<string, number>} count - The times of tag included in works
             * */
            tagInfo() {
                const allTags = this.pxer.resultSet.reduce((result, works) => result.concat(works.tagList), []);
                const countMap = {};
                const noRepeatTags = [];

                allTags.forEach(tag => {
                    if (!noRepeatTags.includes(tag)) {
                        noRepeatTags.push(tag);
                    }
                    countMap[tag] = countMap[tag] || 0;
                    countMap[tag]++;
                });

                noRepeatTags.sort((tag1, tag2) => countMap[tag2] - countMap[tag1]);

                return {
                    tags: noRepeatTags,
                    count: countMap,
                }
            },
            needFoldTagFilter() {
                return this.tagInfo.tags.length > 60;
            },
            tagFilterFolded() {
                return this.needFoldTagFilter && !this.showAllTagFilter;
            },
        },
        methods:{
            createPxerApp() {
                this.pxer = new PxerApp();
                this.pxer.on('error',(error)=>{
                    this.errmsg = error;
                    pxer.sendEvent('error', {
                        error,
                        PXER_ERROR: typeof PXER_ERROR !== 'undefined' ? PXER_ERROR : null,
                    });
                });
                this.pxer.on('finishWorksTask',(result) =>{
                    pxer.sendEvent('finish', {
                        result_count: result.length,
                        ptm_config: this.pxer.ptmConfig,
                        task_option: this.pxer.taskOption,
                        error_count: this.pxer.failList.length,
                    });
                });
            },
            crawlDirectly() {
                this.createPxerApp();
                this.showLoadingButton = true;
                this.pxer.one('finishWorksTask',()=>{
                    this.showLoadingButton = false;
                    this.state='standby';
                });
                this.pxer.getThis();
                pxer.sendEvent('get-this', {
                    page_type:this.pxer.pageType,
                });
            },

            load(){
                this.createPxerApp();
                this.state='init';
                this.pxer.init().then(()=>this.state='ready');
                this.pxer.on('finishWorksTask',()=>{
                    window.blinkTitle();
                });
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

            t: pxer.t,
            listenUrlChange(){
                const vm = this;
                const historyPushState = history.pushState;
                const historyReplaceState = history.replaceState;

                history.pushState = function (...args) {
                    historyPushState.apply(history, args);
                    setTimeout(() => vm.currentUrl = document.URL, 0);
                };
                history.replaceState = function (...args) {
                    historyReplaceState.apply(history, args);
                    setTimeout(() => vm.currentUrl = document.URL, 0);
                };
            },

            // about filter by tag
            countTagTheme(tagName) {
                switch (this.tagFilterInfo[tagName]) {
                    default:
                    case 'WHATEVER': return 'btn-secondary';
                    case 'EXCLUDE': return 'btn-danger';
                    case 'NECESSARY': return 'btn-success';
                }
            },
            onTagFilterInfoChange(value){
                this.pxer.pfConfig.no_tag_any = [];
                this.pxer.pfConfig.has_tag_some = [];
                for(let [tagName, filterOption] of Object.entries(value)) {
                    switch (filterOption) {
                        case 'EXCLUDE':
                            this.pxer.pfConfig.no_tag_any.push(tagName);
                            break;
                        case 'NECESSARY':
                            this.pxer.pfConfig.has_tag_some.push(tagName);
                            break;
                    }
                }
            },
            onTagClick(tagName) {
                switch (this.tagFilterInfo[tagName]) {
                    default:
                    case 'WHATEVER':
                        this.$set(this.tagFilterInfo, tagName, 'EXCLUDE');
                        break;
                    case 'EXCLUDE':
                        this.$set(this.tagFilterInfo, tagName, 'NECESSARY');
                        break;
                    case 'NECESSARY':
                        this.$set(this.tagFilterInfo, tagName, 'WHATEVER');
                        break;
                }
            },
        },
        mounted(){
            this.listenUrlChange();
            pxer.loaded = true;
            pxer.sendEvent('pv');
        },
    };

    // find a element as anchor
    [
        elt => {
            const target = document.querySelector('#root > header');
            if (!target) return false;

            target.appendChild(elt);
            return true;
        },
        elt => {
            const target = document.querySelector('._global-header');
            if (!target) return false;

            target.appendChild(elt);
            return true;
        },
        elt => {
            const target = document.getElementById('wrapper');
            if (!target) return false;

            target.insertBefore(elt, target.firstChild);

            return true;
        },
        elt => {
            document.body.insertBefore(elt, document.body.firstChild);
            return true;
        },
    ].some(fn => fn(el));

    // mount UI
    pxer.vm = new Vue(component).$mount(el);
});