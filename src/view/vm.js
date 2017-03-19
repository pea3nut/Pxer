afterLoad(function(){
    // 寻找插入点
    var elt =document.createElement('div');
    var insetElt=(
        document.getElementById('wrapper')
        || document.body
    );
    insetElt.insertBefore(elt,insetElt.firstChild);

    // 运行Vue实例
    new Vue({render:ce=>ce({
        template:PXER_TEMPLATE,
        data(){return {
            pxer:new PxerApp(),
            showAll:false,
            state:'loaded',//[loaded|ready|page|works|finish|re-ready|stop|error]
            pxerVersion:window['PXER_VERSION'],
            showPxerFailWindow:false,
            runTimeTimestamp:0,
            runTimeTimer:null,
            checkedFailList:[],
            taskInfo:'',
        }},
        created(){
            window['PXER_VM'] =this;
        },
        computed:{
            pageType(){
                var map ={
                    'member'        :'个人资料页',
                    'member_illust' :'作品列表页',
                    'search'        :'搜索页',
                    'bookmark'      :'收藏页',
                    'medium'        :'作品详情查看',
                    'null'          :'未知',
                };
                return map[this.pxer.pageType];
            },
            isRunning(){
                var runState =['page','works'];
                return runState.indexOf(this.state)!==-1;
            },
            taskCount(){
                return ~~(this.pxer.worksNum/20)+this.pxer.worksNum;
            },
            finishCount(){
                if(this.state==='page'){
                    return this.pxer.ptm.resultSet.length;
                }else if(this.state==='works'){
                    return this.pxer.ptm.resultSet.length+~~(this.pxer.worksNum/20)+this.pxer.resultSet.length;
                }else{
                    return -1;
                };
            },
            forecastTime(){
                if(this.isRunning){

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
                if(this.pxer.pageType==='works_medium'){
                    this.pxer.getThis();
                }else{
                    this.state='ready'
                }
            },
            run(){
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
                    this.pxer.executeWroksTask();
                }
            },
            stop(){
                this.state='stop';
                this.pxer.stop();
            },
            count(){
                this.taskInfo =this.pxer.getWorksInfo()
            },
            formatFailType(type){
                return{
                    'empty':'获取内容失败',
                    'timeout':'获取超时',
                    'r-18':'限制级作品（R-18）',
                    'r-18g':'怪诞作品（R-18G）',
                    'mypixiv':'仅好P友可见的作品',
                }[type];
            },
            formatFailSolution(type){
                return{
                    'empty':'点击左侧链接确认内容正确，再试一次~',
                    'timeout':'增加最大等待时间再试一次~',
                    'r-18':'开启账号R-18选项',
                    'r-18g':'开启账号R-18G选项',
                    'mypixiv':'添加画师好友再尝试',
                }[type];
            },
            tryCheckedPfi(){
                this.pxer.switchFail2Task(this.checkedFailList);
                this.checkedFailList.forEach(pfi=>this.pxer.failList.splice(
                    this.pxer.failList.indexOf(pfi),1
                ));
                this.checkedFailList=[];
                this.state='re-ready';
            },
            formatTime(s){
                return `${~~(s/60)}:${(s%60>=10)?s%60:'0'+s%60}`
            },
        },
    })}).$mount(elt);

});