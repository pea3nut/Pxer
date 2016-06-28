/**
 * Pxer任务队列中的任务对象
 * @constructor
  * */
function PxerRequest(){
    this.url;
};

/**
 * 页面任务对象
 * @constructor
 * @extends {PxerRequest}
 * */
function PageRequest(){
    PxerRequest.call(this);
};
PageRequest.prototype =new PxerRequest();

/**
 * 作品任务对象
 * @constructor
 * @extends {PxerRequest}
 * */
function IllustRequest(type ,isMultiple){
    PxerRequest.call(this);
    this.type =type;//[manga|ugoira|illust]
    this.isMultiple =isMultiple;//[true|false]
    this.id;
    this.url ={
        "list" :new Array(),
        "lastIndex":-1
    };
};
IllustRequest.prototype =new PxerRequest();
IllustRequest.prototype["nowUrl"] =function(){
    if(typeof this.url.lastIndex ==='number' && this.url.lastIndex >-1){
        return this.url.list[this.url.lastIndex];
    }else{
        return null;
    };
};
IllustRequest.prototype["readUrl"] =function(){
    return this.url.list[++this.url.lastIndex];
};
IllustRequest.prototype["hasNextUrl"] =function(){
    if(this.url.list[this.url.lastIndex+1]){
        return true;
    }else{
        return false;
    };
};