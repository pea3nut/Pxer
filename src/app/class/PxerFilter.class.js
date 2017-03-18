'use strict';

class PxerFilter{
    constructor(config){
        /*!全部的作品集合*/
        this.worksList =[];
        /*!过滤后得到的作品集合*/
        this.passWorks =[];

        /*!过滤配置信息*/
        this.config =Object.assign(PxerFilter.defaultConfig(),config);
    };

    filter(worksList){
        var resultSet =PxerFilter.filterInfo(PxerFilter.filterTag(worksList,this.config) ,this.config);
        this.passWorks.push(...resultSet);
        return resultSet;
    };
};

PxerFilter.defaultConfig =function(){
    return{
        "score"     :0,
        "avg"       :0,
        "view"      :0,
        "has_tag_every" :[],
        "has_tag_some"  :[],
        "no_tag_any"    :[],
        "no_tag_every"  :[],
    };
};

PxerFilter.filterInfo =function(worksList ,{score=0,avg=0,view=0}){
    return worksList.filter(function(works){
        return works.scoreCount >= score
        && works.viewCount >= view
        && (works.ratedCount&&(works.scoreCount/works.ratedCount)) >= avg
    });
};

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

