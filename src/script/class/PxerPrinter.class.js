class PxerPrint{
    constructor(){
        /*!全部的作品集合*/
        this.works;

        this.runtime={
            /*!过滤后得到的作品集合*/
            passWorks :[],
            /*!计算得到的下载地址*/
            address :[],
            /*!动图参数*/
            ugoira_frames :{},
            /*!任务信息*/
            taskInfo :'',
        };

        /*!输出配置信息*/
        this.config ={
            "manga_single"  :"max",//[max|600p|no]
            "manga_medium"  :"max",//[max|1200p|cover_600p|no]
            "illust_single" :"max",//[max|600p|no]
            "illust_medium" :"max",//[max|1200p|cover_600p|no]
            "ugoira_zip"    :"no",//[max|600p|no]
            "ugoira_frames" :"no",//[yes|no]
            "task_inf"      :"yes",//[yes|no]
        };
        /*!过滤配置信息*/
        this.filter ={
            "score"     :0,
            "avg"       :0,
            "yes_and_tag"   :[],
            "yes_or_tag"    :[],
            "no_and_tag"    :[],
            "no_or_tag"     :[],
            "tagExp"        :null, //new RegExp()
            "callback"      :null,//new Function()
        };
    };
};

PxerPrint.prototype.print =function(){

    /*!判断输出动图参数*/
    if(this.config['ugoira_frames'] ==="yes"){
        let win =window.open(document.URL ,'_blank');
        win.document.write("/*! 这个页面是动图压缩包的动画参数，目前pxer还无法将动图压缩包打包成GIF，请寻找其他第三方软件 */\n<br /><br />");

        let frames =JSON.stringify(this.runtime.ugoira_frames ,null ,4);
        win.document.write("<pre>\n"+frames+"\n</pre>");
    };

    /*!输出下载地址*/
    let win =window.open(document.URL ,'_blank');
    win.document.write(this.runtime.taskInfo.replace(/\n/g ,'<br />'));
    win.document.write(this.runtime.address.join("<br />"));


};

PxerPrint.prototype.filterWorks =function(){

    this.runtime.passWorks=[];

    let isEmpty =function(filter){
        for(let key in filter){
            if(filter[key]) return false;
        };
        return true;
    }(this.filter);

    if(isEmpty){
        this.runtime.passWorks =this.works;
        return this;
    }

    for(let works of this.works){

        if(!(
            this.filter.score ==0
            || isNaN(this.filter.score)
            || works.scoreCount >=this.filter.score
        )) continue;

        if(!(
            this.filter['yes_and_tag'].length ===0
            || this.filter['yes_and_tag'].every(tag=>works.tagList.indexOf(tag)!=-1)
        )) continue;

        if(!(
            this.filter['yes_or_tag'].length ===0
            || !this.filter['yes_or_tag'].some(tag=>works.tagList.indexOf(tag)!=-1)
        )) continue;

        if(!(
            this.filter['no_and_tag'].length ===0
            || !this.filter['no_and_tag'].every(tag=>works.tagList.indexOf(tag)==-1)
        )) continue;

        if(!(
            this.filter['no_or_tag'].length ===0
            || !this.filter['no_or_tag'].some(tag=>works.tagList.indexOf(tag)==-1)
        )) continue;

        this.runtime.passWorks.push(works);

    };


    return this;




};

PxerPrint.prototype.countAddress =function(){

    this.runtime.address =[];


    for(let works of this.runtime.passWorks){
        switch(true){
            case works instanceof PxerUgoiraWorks:
                this.runtime.ugoira_frames[works.id] =works.frames;
                this.runtime.address.push(...PxerPrint.getUgoira(works ,this.config));
                break;
            case works instanceof PxerMultipleWorks:
                this.runtime.address.push(...PxerPrint.getMultiple(works ,this.config));
                break;
            case works instanceof PxerWorks:
                this.runtime.address.push(...PxerPrint.getWorks(works ,this.config));
                break;
        };
    };

    return this;





};

PxerPrint.getUgoira =function(works ,{ugoira_zip}){
    const tpl ={
        "max"   :"http://#server#.pixiv.net/img-zip-ugoira/img/#date#/#id#_ugoira1920x1080.zip",
        "600p"  :"http://#server#.pixiv.net/img-zip-ugoira/img/#date#/#id#_ugoira600x600.zip",
    };

    var address =tpl[ugoira_zip];
    if(!address) return [];

    for(let key in works){
        address =address.replace(`#${key}#` ,works[key]);
    };

    return [address];

};
PxerPrint.getMultiple =function(works ,{manga_medium,illust_medium}){
    const tpl ={
        "max"        :"http://#server#.pixiv.net/img-original/img/#date#/#id#_p#index#.#fileFormat#",
        "1200p"      :"http://#server#.pixiv.net/c/1200x1200/img-master/img/#date#/#id#_p#index#_master1200.jpg",
        "cover_600p" :"http://#server#.pixiv.net/c/600x600/img-master/img/#date#/#id#_p0_master1200.jpg",
    };

    var address =works.type ==='manga'?tpl[manga_medium]:tpl[illust_medium];
    if(!address) return [];

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
PxerPrint.getWorks=function (works ,{illust_single,manga_single}){
    const tpl ={
        "max"   :"http://#server#.pixiv.net/img-original/img/#date#/#id#_p0.#fileFormat#",
        "600p"  :"http://#server#.pixiv.net/c/600x600/img-master/img/#date#/#id#_p0_master1200.jpg",
    };

    var address =works.type ==='manga'?tpl[manga_single]:tpl[illust_single];
    if(!address) return [];

    for(let key in works){
        address =address.replace(`#${key}#` ,works[key]);
    }

    return [address];

};


PxerPrint.prototype.template={
    'pic':{
        "max"   :"http://#server#.pixiv.net/img-original/img/#date#/#workid#_p0.#fx#",
        "600p"  :"http://#server#.pixiv.net/c/600x600/img-master/img/#date#/#workid#_p0_master1200.jpg",
    },
    'ids':{
        "max"        :"http://#server#.pixiv.net/img-original/img/#date#/#workid#_p#picnum#.#fx#",
        "1200p"      :"http://#server#.pixiv.net/c/1200x1200/img-master/img/#date#/#workid#_p#picnum#_master1200.jpg",
        "cover_600p" :"http://#server#.pixiv.net/c/600x600/img-master/img/#date#/#workid#_p0_master1200.jpg",
    },
    'zip':{
        "max"   :"http://#server#.pixiv.net/img-zip-ugoira/img/#date#/#workid#_ugoira1920x1080.zip",
        "600p"  :"http://#server#.pixiv.net/img-zip-ugoira/img/#date#/#workid#_ugoira600x600.zip",
    }
};

PxerPrint.prototype.getTaskInfo =function(){
    this.runtime.textHead ||(this.runtime.textHead='');

    var [manga,ugoira,illust,unknow,multiple,single,works,address] =new Array(20).fill(0);

    for(let works of this.runtime.passWorks){
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
                unknow++;
                break;
        };

        if(works instanceof PxerMultipleWorks){
            multiple++;
        }else if(works instanceof PxerWorks){
            single++;
        };

    };

    address =this.runtime.address.length;
    works =this.runtime.passWorks.length;

    this.runtime.taskInfo =`\
共计${works}个作品，${address}个下载地址。
其中有${illust}幅插画、${manga}幅漫画、${ugoira}幅动图。
单张图片作品有${multiple}个，多张图片的作品有${single}个。
`;

    return this;

};

PxerPrint.prototype.queryPrint =function(){
    this.filterWorks().countAddress().getTaskInfo().print();
};




// 测试代码

// var works =[{"id":"59070428","type":"ugoira","date":"2016/09/19/22/34/15","server":"i1","tagList":["动图","僕だけがいない街","僕街","雛月加代","藤沼悟"],"viewCount":155,"ratedCount":3,"scoreCount":30,"fileFormat":"zip","frames":[{"file":"000000.jpg","delay":2000},{"file":"000001.jpg","delay":1000},{"file":"000002.jpg","delay":1000},{"file":"000003.jpg","delay":2000},{"file":"000004.jpg","delay":2000},{"file":"000005.jpg","delay":4000},{"file":"000006.jpg","delay":2000},{"file":"000007.jpg","delay":3000},{"file":"000008.jpg","delay":2000},{"file":"000009.jpg","delay":2000},{"file":"000010.jpg","delay":2000},{"file":"000011.jpg","delay":2000},{"file":"000012.jpg","delay":2000},{"file":"000013.jpg","delay":4000},{"file":"000014.jpg","delay":2000},{"file":"000015.jpg","delay":1000},{"file":"000016.jpg","delay":4000},{"file":"000017.jpg","delay":2000},{"file":"000018.jpg","delay":3000},{"file":"000019.jpg","delay":2000},{"file":"000020.jpg","delay":2000},{"file":"000021.jpg","delay":3000},{"file":"000022.jpg","delay":5000}]},{"id":"57532250","type":"ugoira","date":"2016/06/22/15/01/45","server":"i3","tagList":["test"],"viewCount":40,"ratedCount":0,"scoreCount":0,"fileFormat":"zip","frames":[{"file":"000000.jpg","delay":200},{"file":"000001.jpg","delay":200}]},{"id":"57507348","type":"illust","date":"2016/06/20/22/22/26","server":"i1","tagList":["test"],"viewCount":37,"ratedCount":0,"scoreCount":0,"fileFormat":"jpg"},{"id":"57532237","type":"ugoira","date":"2016/06/22/15/00/43","server":"i2","tagList":["test"],"viewCount":50,"ratedCount":0,"scoreCount":0,"fileFormat":"zip","frames":[{"file":"000000.jpg","delay":200},{"file":"000001.jpg","delay":200}]},{"id":"57506727","type":"manga","date":"2016/06/20/21/56/11","server":"i4","tagList":["test"],"viewCount":45,"ratedCount":0,"scoreCount":0,"fileFormat":"png"},{"id":"43717780","type":"illust","date":"2014/05/26/02/21/22","server":"i1","tagList":["VOCALOID","vocaloid","ココロ·キセキ","鏡音","鏡音レン","鏡音リン","镜音","镜音双子","ココロ","鏡音リン・レン"],"viewCount":381,"ratedCount":10,"scoreCount":100,"fileFormat":"png"},{"id":"57506780","type":"illust","date":"2016/06/20/21/58/41","server":"i1","tagList":["test"],"viewCount":30,"ratedCount":0,"scoreCount":0,"fileFormat":"jpg","multiple":2},{"id":"53413990","type":"illust","date":"2015/11/06/22/05/38","server":"i3","tagList":["ココロ","鏡音","镜音","VOCALOID","ココロ·キセキ"],"viewCount":141,"ratedCount":0,"scoreCount":0,"fileFormat":"jpg","multiple":10},{"id":"57506863","type":"manga","date":"2016/06/20/22/02/06","server":"i4","tagList":[],"viewCount":34,"ratedCount":0,"scoreCount":0,"fileFormat":"jpg","multiple":2}];
// works =works.map(obj=>{
//     if(obj.type ==='ugoira'){
//         return new PxerUgoiraWorks(obj);
//     }else if(obj.multiple){
//         return new PxerMultipleWorks(obj);
//     }else{
//         return new PxerWorks(obj);
//     };
// });
//
// var pp =new PxerPrint();
// pp.works =works;
// pp.config['ugoira_zip'] ='max';
// pp.config['ugoira_frames'] ='yes';
//
// console.log(pp);
//
// pp.filterWorks().countAddress().getTaskInfo();
//
// console.log(pp.runtime.textHead);
// console.log(pp.runtime.address.join('\n'));
//
//












