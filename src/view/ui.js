~function(){
    var xhr =new XMLHttpRequest();
    xhr.open('GET' ,pxerDefinePxerConfig['URL_ROOT']+pxerDefinePxerConfig['TEMPLATE_URL'] ,true);
    xhr.responseType='document';
    xhr.addEventListener('load' ,function(){
        var parentNote =document.getElementById('page-mypage')
            ||document.getElementById('wrapper')
            ||document.getElementById('contents')
            ||document.body
        ;
        parentNote.insertBefore(this.responseXML.body ,parentNote.firstChild);
        var pu =new PxerUI(document.getElementById('pxer'));
        afterLoad(pu.init.bind(pu));
        window.pu =pu;
    });
    xhr.send();
}();
class PxerUI{
    constructor(elt){
        this.elt =elt;
        this.pxer =new PxerApp();
        this.button=[];
        this.window=[];

        this.runtime ={
            runtime:0,
            state :'wait',//[wait|getPageTask|getWorks|finish|error|stop]

            // 预计时间计算
            taskRuntime:0,
            taskTimer :null,
        };

        this.timer =setInterval(()=>{
            this.runtime.runtime ||(this.runtime.runtime =0);
            this.runtime.runtime++;
        } ,1000);


    };
    init(){
        // 处理pxer-button
        this.button =[...this.elt.querySelectorAll('[pxer-button]')];
        this.button.forEach(
            (item,index,array)=> array[item.getAttribute('pxer-button')]=item
        );
        // 处理pxer-window
        this.window =[...this.elt.querySelectorAll('[pxer-window]')];
        this.window.forEach(
            (item,index,array)=> array[item.getAttribute('pxer-window')]=item
        );

        // 处理pxer-const
        [...this.elt.querySelectorAll('[pxer-const]')].forEach(
            item=> item.innerHTML =this.constMap[item.getAttribute('pxer-const')]
        );


        // 处理页面逻辑
        if(this.pxer.getPageType() ===false && pxerDefinePxerConfig['DEBUG']!==true){
            this.button.run.disabled =true;
            console.warn('getPageType return false');
            return false;
        }else{
            this.button.run.disabled =false;
            this.button.run.innerHTML ='<span class="glyphicon glyphicon-play"></span>';
        };
        this.pxer.autoSwitch();
        this.pxer.on('finishWorksTask' ,()=>clearInterval(this.timer));



        // 挂载UI事件
        this.pxer.on('finishWorksTask' ,()=>this.window.print.style.display='');
        this.pxer.on('finishWorksTask' ,()=>this.window.inf.style.display='none');
        this.button.run.addOneEventListener('click' ,()=>{
            this.button.run.classList.remove('btn-success');
            this.button.run.classList.add('btn-info');
            this.button.run.innerHTML='<span class="glyphicon glyphicon-ok"></span>';
            this.window.inf.style.display ='';
            this.button.run.addOneEventListener('click' ,()=>{
                this.button.run.classList.remove('btn-info');
                this.button.run.classList.add('btn-danger');
                this.button.run.innerHTML='<span class="glyphicon glyphicon-remove"></span>';
            })
        });
        this.pxer.on('executePageTask' ,()=>this.runtime.state='getPageTask');
        this.pxer.on('executeWroksTask' ,()=>this.runtime.state='getWorks');
        this.pxer.on('finishWorksTask' ,()=>this.runtime.state='finish');
        this.pxer.on('error' ,()=>this.runtime.state='error');
        this.pxer.on('stop' ,()=>this.runtime.state='stop');

        // 预计时间计算
        this.pxer.on('executePageTask' ,()=>{
            this.runtime.taskTimer =setInterval(()=>{
                this.runtime.taskRuntime++;
            } ,500);
        });
        this.pxer.on('executeWroksTask' ,()=>{
            this.runtime.taskRuntime =0;
        });
        this.pxer.on('finishWorksTask' ,()=>{
            clearInterval(this.runtime.taskTimer);
        });


        // 处理pxer-bind
        [...this.elt.querySelectorAll('[pxer-bind]')].forEach(
            item=> this.signBind(item ,item.getAttribute('pxer-bind'))
        );

        // 处理pxer-config
        [...this.elt.querySelectorAll('[pxer-config]')].forEach(
            item=> this.signConfig(item ,item.getAttribute('pxer-config'))
        );


        // 响应用户行为
        this.button.run.addOneEventListener('click' ,()=>{
            this.pxer.analyzePage();
            this.button.run.addOneEventListener('click' ,()=>{
                this.pxer.executePageTask();
                this.button.run.addOneEventListener('click' ,()=>{
                    this.pxer.stop();
                })
            });
        });
        this.button.echo.addEventListener('click' ,()=>this.pxer.pp.queryPrint());
        this.button.count.addEventListener('click' ,()=>{
            this.window.taskInfo.style.display='';
            this.pxer.pp.filterWorks().countAddress().getTaskInfo();
        });


    };
};
PxerUI.prototype.constMap ={
    version :PxerApp.version
};

PxerUI.prototype.signBind =function(elt ,key){

    var bindMap =this.bindMap(key);

    if(bindMap ===undefined) return console.warn(`Count not find field "${key}" in PxerUI::bindMap`);

    // 拦截数组监听
    if(bindMap.object[bindMap.propertyName] instanceof Array){
        let oldOpd =Object.getOwnPropertyDescriptor(bindMap.object ,bindMap.propertyName)||{
            value: [],
            writable: true,
            enumerable: true,
            configurable: true,
        };
        let newOpd =Object.assign(Object.copy(oldOpd) ,{
            set(newValue){
                oldOpd.value =newValue;
                if(newValue instanceof Array){
                    Object.defineProperty(newValue ,'Hook:change', {
                        value :function(){
                            bindMap.update(elt ,newValue);
                        },
                        enumerable:false,
                        configurable:true,
                        writable:true,
                    });
                };
                bindMap.update(elt ,newValue);
            },
            get(){return oldOpd.value}
        });
        delete newOpd.value;
        delete newOpd.writable;
        Object.defineProperty(bindMap.object ,bindMap.propertyName ,newOpd);
        bindMap.object[bindMap.propertyName] =bindMap.object[bindMap.propertyName];
        return true;
    };


    var oldOpd =Object.getOwnPropertyDescriptor(bindMap.object ,bindMap.propertyName) ||{
        value: undefined,
        writable: true,
        enumerable: true,
        configurable: true,
    };
    var newOpd =Object.assign(Object.copy(oldOpd) ,{
        set(value){
            oldOpd.value =value;
            if (bindMap.update){
                bindMap.update(elt ,value);
            }else{
                elt.innerHTML =value;
            };
        },
        get(){return oldOpd &&oldOpd.value}
    });
    delete newOpd.value;
    delete newOpd.writable;
    Object.defineProperty(bindMap.object ,bindMap.propertyName ,newOpd);
    bindMap.object[bindMap.propertyName] =bindMap.object[bindMap.propertyName];

};
PxerUI.prototype.bindMap =function(key){
    var obj={
        record :{
            object:this.runtime,
            propertyName :'runtime',
            update(elt ,time){
                var second =time%60;
                var minute =~~(time/60);
                if(second<10) second='0'+second;
                elt.innerHTML =`${minute}:${second}`;
            },
        },
        pageType :{
            object:this.pxer.runtime,
            propertyName :'pageType',
            update(elt ,value){
                var pt ='';
                switch(value){
                    case 'member':
                        pt ='个人资料页';
                        break
                    case 'member_illust':
                        pt ='个人作品页';
                        break
                    case 'search':
                        pt ='搜索页';
                        break
                    case 'bookmark':
                        pt ='收藏页';
                        break
                    case 'medium':
                        pt ='作品详情查看';
                        break
                    default:
                        pt ='未知';
                };
                elt.innerHTML =pt;
            },
        },
        worksNum :{
            object:this.pxer.runtime,
            propertyName :'illust_number',
        },
        pret :{
            object:this.pxer.ptm,
            propertyName :'taskList',
            update(elt ,arr){elt.innerHTML=arr.length},
        },
        finish :{
            object:this.pxer.ptm,
            propertyName :'resultSet',
            update(elt ,arr){elt.innerHTML=arr.length},
        },
        forecast :{
            object:this.runtime,
            propertyName :'taskRuntime',
            update:(elt ,value)=>{
                var time =~~( (0.5*value)/this.pxer.ptm.resultSet.length*this.pxer.ptm.taskList.length);
                isNaN(time) && (time=0);
                var second =time%60;
                var minute =~~(time/60);
                if(second<10) second='0'+second;
                elt.innerHTML =`${minute}:${second}`;
            },
        },
        taskInfo :{
            object:this.pxer.pp.runtime,
            propertyName :'taskInfo',
        },
        state :{
            object:this.runtime,
            propertyName :'state',
            update(elt ,value){
                var pt ='';
                switch(value){
                    case 'wait':
                        pt ='待命中';
                        break;
                    case 'getPageTask':
                        pt ='获取作品信息中';
                        break;
                    case 'getWorks':
                        pt ='爬取作品中';
                        break;
                    case 'finish':
                        pt ='已完成';
                        break;
                    case 'error':
                        pt ='出现错误';
                        break;
                    case 'stop':
                        pt ='手动停止';
                        break;
                    default:
                        pt ='未知';
                };
                elt.innerHTML =pt;
            },
        },
    };
    return obj[key];
};


PxerUI.prototype.signConfig =function(elt ,key) {
    var configMap = this.configMap(key);

    if (configMap === undefined) return console.warn(`Count not find field "${key}" in PxerUI::configMap`);


    if (typeof configMap.toValue === 'function'){
        elt.value = configMap.toValue(configMap.object[configMap.propertyName]);
    }else{
        elt.value = configMap.object[configMap.propertyName];
    };

    let eventType =elt.tagName ==='SELECT' ?'change' :'input';
    elt.addEventListener(eventType ,()=>{
        if(typeof configMap.toConfig === 'function') {
            configMap.object[configMap.propertyName] = configMap.toConfig(elt.value);
        }else{
            configMap.object[configMap.propertyName] = elt.value;
        };
    })

};
PxerUI.prototype.configMap =function(key){
    var obj ={
        thread :{
            object:this.pxer.ptm.config,
            propertyName :'thread',
        },
        timeout :{
            object:this.pxer.ptm.config,
            propertyName :'timeout',
        },
        maxRetry :{
            object:this.pxer.ptm.config,
            propertyName :'retry',
        },
        score :{
            object:this.pxer.printFilter,
            propertyName :'score',
        },
        avg :{
            object:this.pxer.printFilter,
            propertyName :'avg',
        },
        yes_and_tag :{
            object:this.pxer.printFilter,
            propertyName :'yes_and_tag',
            toConfig :value=>value.trim().split(' '),
            toValue :config=>config.join(' '),
        },
        yes_or_tag :{
            object:this.pxer.printFilter,
            propertyName :'yes_or_tag',
            toConfig :value=>value.trim().split(' '),
            toValue :config=>config.join(' '),
        },
        no_and_tag :{
            object:this.pxer.printFilter,
            propertyName :'no_and_tag',
            toConfig :value=>value.trim().split(' '),
            toValue :config=>config.join(' '),
        },
        no_or_tag :{
            object:this.pxer.printFilter,
            propertyName :'no_or_tag',
            toConfig :value=>value.trim().split(' '),
            toValue :config=>config.join(' '),
        },
        illust_single :{
            object:this.pxer.printConfig,
            propertyName :'illust_single',
        },
        illust_medium :{
            object:this.pxer.printConfig,
            propertyName :'illust_medium',
        },
        manga_single :{
            object:this.pxer.printConfig,
            propertyName :'manga_single',
        },
        manga_medium :{
            object:this.pxer.printConfig,
            propertyName :'manga_medium',
        },
        ugoira :{
            object:this.pxer.printConfig,
            propertyName :'ugoira_zip',
            toConfig :value=>{
                var arr =value.split('-');
                this.pxer.printConfig['ugoira_frames'] =arr[1];
                return arr[0];
            },
            toValue :config=>`${config}-${this.pxer.printConfig['ugoira_frames']}`,
        },
    };
    return obj[key];
};


































