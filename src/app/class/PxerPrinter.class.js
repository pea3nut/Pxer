class PxerPrinter{
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
        let str =[
            '<pre>',
            '/** 这个页面是动图压缩包的动画参数，目前Pxer还无法将动图压缩包打包成GIF，请寻找其他第三方软件 */',
            JSON.stringify(this.ugoiraFrames ,null ,4),
            '</pre>',
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
            '<pre>' ,
            '/** 这个页面是抓取到的下载地址，你可以将它们复制到第三方下载工具如QQ旋风中下载 */' ,
            '/**' ,
            this.taskInfo.replace(/\<br \/\>/g,'') ,
            '*/' ,
            this.address.join('\n') ,
            '</pre>' ,
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




