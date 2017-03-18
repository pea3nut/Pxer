class PxerThreadManager extends PxerEvent{
    constructor({timeout=5000,retry=3,thread=8}={}){
        super(['load' ,'error' ,'fail' ,'warn']);

        this.config ={timeout,retry,thread};

        this.taskList =[];
        this.resultSet =[];
        this.runtime={};
        this.threads=[];

    };
};


PxerThreadManager.prototype['stop'] =function(){
    this.taskList =[];
};


PxerThreadManager.prototype['init'] =function(taskList){
    if(! this.taskList.every(request=>request instanceof PxerRequest)){
        this.dispatch('error' ,'PxerThreadManager.init: taskList is illegal');
        return false;
    }


    // 初始任务与结果
    this.taskList=taskList;
    this.failList =[];
    this.resultSet=[];
    this.runtime ={};

    // 建立线程对象
    this.threads =[];
    for(let i=0 ;i<this.config.thread ;i++){
        this.threads.push(new PxerThread({
            id:i,
            config:{
                timeout :this.config.timeout,
                retry :this.config.retry,
            },
            task:null,
        }));
    };

    return this;
};
PxerThreadManager.prototype['run'] =function(){
    if(this.taskList.length ===0){
        this.dispatch('warn','PxerApp#run: taskList.length is 0');
        this.dispatch('load',[]);
        return false;
    };



    for(let thread of this.threads){
        let task =this.taskList.shift();
        if(!task) break;

        thread.on('load' ,data=>{
            this.resultSet.push(data);
            next(this,thread);
        });
        thread.on('fail' ,(...argn)=>{
            console.log('thread fail');
            this.dispatch('fail',...argn);
            next(this,thread);
        });
        thread.on('error' ,this.dispatch.bind(this ,'error'));
        thread.init(task);
        thread.run();
    };

    function next(ptm ,thread){
        var task =ptm.taskList.shift();
        if(task){
            thread.init(task);
            setTimeout(thread.run.bind(thread));
        }else if(ptm.threads.every(thread=>['free','timeout'].indexOf(thread.state)!==-1)){
            ptm.dispatch('load' ,ptm.resultSet);
        };
    }

};











// 测试代码

// var ptm =new PxerThreadManager({
//     timeout:3000,
//     retry:2,
//     thread:2,
// })
//
// ptm.run([
//     new PxerWorksRequest({
//         url:[
//             'sleep.js.php?sleep=1',
//             'sleep.js.php?sleep=2',
//         ]
//     }),
//     new PxerWorksRequest({
//         url:[
//             'sleep.css.php?sleep=3&bg=green',
//             'sleep.css.php?sleep=5&bg=red',
//         ]
//     }),
//     new PxerWorksRequest({
//         url:[
//             'sleep.css.php?sleep=3&bg=green',
//             'sleep.js.php?sleep=1',
//             'sleep.js.php?sleep=2',
//             'sleep.css.php?sleep=5&bg=red',
//         ]
//     }),
// ])
//
// ptm.on('load' ,data=>console.log(data));


// 测试代码
// var taskList =[{"url":["/member_illust.php?mode=medium&illust_id=59070428"],"html":{},"type":"ugoira","isMultiple":false,"id":"59070428"},{"url":["/member_illust.php?mode=medium&illust_id=57532250"],"html":{},"type":"ugoira","isMultiple":false,"id":"57532250"},{"url":["/member_illust.php?mode=medium&illust_id=57532237"],"html":{},"type":"ugoira","isMultiple":false,"id":"57532237"},{"url":["/member_illust.php?mode=medium&illust_id=57507348"],"html":{},"type":"illust","isMultiple":false,"id":"57507348"},{"url":["/member_illust.php?mode=medium&illust_id=57506863","/member_illust.php?mode=manga&illust_id=57506863","/member_illust.php?mode=manga_big&page=0&illust_id=57506863"],"html":{},"type":"manga","isMultiple":true,"id":"57506863"},{"url":["/member_illust.php?mode=medium&illust_id=57506780","/member_illust.php?mode=manga&illust_id=57506780","/member_illust.php?mode=manga_big&page=0&illust_id=57506780"],"html":{},"type":"illust","isMultiple":true,"id":"57506780"},{"url":["http://www.pixiv.net/member_illust.php?mode=medium&illust_id=57506727"],"html":{},"type":"manga","isMultiple":false,"id":"57506727"},{"url":["/member_illust.php?mode=medium&illust_id=53413990","/member_illust.php?mode=manga&illust_id=53413990","/member_illust.php?mode=manga_big&page=0&illust_id=53413990"],"html":{},"type":"illust","isMultiple":true,"id":"53413990"},{"url":["/member_illust.php?mode=medium&illust_id=43717780"],"html":{},"type":"illust","isMultiple":false,"id":"43717780"}]
// .map(task=>new PxerWorksRequest(task));
//
// var ptm =new PxerThreadManager({
//     timeout:6000,
//     retry:2,
//     thread:2,
// });
//
// ptm.run(taskList);
// ptm.on('load' ,data=>console.log(data));










