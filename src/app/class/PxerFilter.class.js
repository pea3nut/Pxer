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

