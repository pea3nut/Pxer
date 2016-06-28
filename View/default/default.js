jQuery.prototype["serializeJson"] =function(){
    var raw=this.serializeArray();
    var json={};
    for(var i=0 ;i<raw.length ;i++){
        json[raw[i]["name"]] =raw[i]["value"];
    };
    return json;
};

function formatTime(second){
    second =Math.ceil(second);
    var minute =(second/60).toFixed(0);
    second =second%60;
    if(second <9){
        second ="0"+second;
    };
    return minute+":"+second;
};

function DefaultTemplate(){
    this.elementSet =new Object();
    this.pxer =new Pxer();

    this.forecast={
        timer:0,
        second:0,
    };
    this.syncTimer;

    this.__constructor();
};
DefaultTemplate.prototype ={
    "__constructor" :function(){},
};
DefaultTemplate.prototype["__constructor"] =function(){
    var allElt =$("#pxer *[pxer]");
    for (var i=0 ;i<allElt.length ;i++){
        var key =allElt[i].getAttribute("pxer");
        this.elementSet[key] =$(allElt[i]);
    };
};


$(function(){
    $.scoped();
    var tpl =new DefaultTemplate();
    console.log(tpl);

    tpl.pxer.on("analyzePage",function(tagName ,pageType){
        switch(pageType){
            case "member":
                tpl.elementSet["pageType"].html("个人资料页");
                break;
            case "member_illust":
                tpl.elementSet["pageType"].html("个人作品页");
                break;
            case "search":
                tpl.elementSet["pageType"].html("搜索页");
                break;
            case "bookmark":
                tpl.elementSet["pageType"].html("收藏页");
                break;
            case "medium":
                tpl.elementSet["pageType"].html("作品详情查看");
                break;
            default:
                tpl.elementSet["pageType"].html("未知");
        }
        tpl.elementSet["worksNum"].html(tpl.pxer.page.illust_number);
        tpl.elementSet["version"].html(tpl.pxer.version);
        tpl.elementSet["forecast"].html(formatTime(tpl.pxer.taskList.length*30));
        tpl.elementSet["pret"].html(tpl.pxer.taskList.length);
        tpl.elementSet["finish"].html(0);
        tpl.pxer._tag("upDateConfig");
    });

    tpl.pxer.on("executePageParseTask",function(){

        tpl.forecast.timer =setInterval(function(tpl){
            tpl.forecast.second++;

            var pret =tpl.pxer.ptm.taskList.length;
            var finish =tpl.pxer.ptm.resultSet.length;

            if(finish != 0){
                var forecast =(pret/finish)*tpl.forecast.second;
                tpl.elementSet["forecast"].html(formatTime(forecast));
            }

        },1000,tpl);

        tpl.syncTimer =setInterval(function(tpl){
            tpl.elementSet["pret"].html(tpl.pxer.ptm.taskList.length);
            tpl.elementSet["finish"].html(tpl.pxer.ptm.resultSet.length);
        },300,tpl);


        tpl.elementSet["state"].html("获取作品列表中");
    });

    tpl.pxer.on("executeIllustParseTask",function(){
        tpl.elementSet["state"].html("爬取作品中");
        tpl.forecast.second=0;
    });

    tpl.pxer.on("finishTask",function(){
        clearInterval(tpl.forecast.timer);
        clearInterval(tpl.syncTimer);

        tpl.elementSet["state"].html("已完成");
        tpl.elementSet["pret"].html(0);
        tpl.elementSet["finish"].html(tpl.pxer.ptm.resultSet.length);
        tpl.elementSet["forecast"].html("完成");
        tpl.elementSet["run"].html("已完成").removeClass("btn-danger").addClass("btn-default").prop("disabled",true);

        tpl.elementSet["print"].show();
    });

    tpl.pxer.on("upDateConfig",function(){
        tpl.elementSet["thread"].val(tpl.pxer.config.thread);
        tpl.elementSet["timeout"].val(tpl.pxer.config.timeout);
        tpl.elementSet["maxRetry"].val(tpl.pxer.config.maxRetry);
    });

    tpl.pxer.on("timerRunning",function(){
        tpl.elementSet["record"].html(formatTime(tpl.pxer.runTime));
    });

    tpl.pxer.on("stop",function(){
        clearInterval(tpl.forecast.timer);
        clearInterval(tpl.syncTimer);

        tpl.elementSet["state"].html("任务被终止");
        tpl.elementSet["finish"].html(tpl.pxer.ptm.resultSet.length);
        tpl.elementSet["forecast"].html("已终止");
        tpl.elementSet["run"].prop("disabled",true);

        tpl.elementSet["print"].show();
    });

    with(tpl){
        if(pxer.getPageType()){
            elementSet["run"].prop("disabled" ,false);
        }else{
            elementSet["run"].prop("disabled" ,true);
        };

        elementSet["change"].on("click" ,function(){
            if($("#pxer .pxer-cinfig-inputgroup input[pxer]").prop("disabled")){
                $("#pxer .pxer-cinfig-inputgroup input[pxer]").prop("disabled" ,false);
                elementSet["change"]
                    .removeClass("btn-info")
                    .addClass("btn-success")
                    .html("保存")
                ;
            }else{
                $("#pxer .pxer-cinfig-inputgroup input[pxer]").prop("disabled" ,true);
                elementSet["change"]
                    .removeClass("btn-success")
                    .addClass("btn-info")
                    .html("更改")
                ;
                pxer.upDateConfig({
                    "thread" :elementSet["thread"].val(),
                    "timeout" :elementSet["timeout"].val(),
                    "maxRetry" :elementSet["maxRetry"].val(),
                });
            };
        });

        var fn;
        elementSet["run"].on("click" ,fn=function(){
            pxer.analyzePage();
            elementSet["inf"].show();
            elementSet["run"].removeClass("btn-success").addClass("btn-info").html("执行");


            elementSet["run"].off("click",fn);
            elementSet["run"].on("click" ,fn=function(){
                pxer.executeTask();
                elementSet["run"].removeClass("btn-info").addClass("btn-danger").html("强制终止");

                elementSet["run"].off("click",fn);
                elementSet["run"].on("click" ,fn=function(){
                    elementSet["run"].prop("disabled" ,true);
                    pxer.stop();
                });
            });
        });

        elementSet["echo"].on("click" ,function(ev){
            ev.preventDefault();

            var json =elementSet["print_config"].serializeJson();
            if(json["ugoira"]){
                var arr =json["ugoira"].split("-");
                json["ugoira_zip"] =arr[0];
                json["ugoira_frames"] =arr[1];
                delete json["ugoira"];
            };
            pxer.pp.changeConfig(json);

            pxer.pp.changeFilter(elementSet["print_filter"].serializeJson());

            pxer.pp.sieve();
            pxer.pp.countAddress();
            pxer.pp.print();
        });
    };




//  var pi =new PxerIllust('ugoira');
//  pi.scoreCount =10;
//  pi.bookmarkCount =10;
//  pi.multiple =1;
//  pi.id =123456;
//  pi.fileFormat ="zip";
//  pi.date =["2016" ,"06" ,"26" ,"19" ,"16" ,"05"];
//  pi.server ="i5";
//  pi.zipConfig =JSON.parse('[{"pea":"nut"}]')[0];
//
//  tpl.pxer.finishTask([pi]);
//
//  tpl.elementSet["run"].click();
//  tpl.elementSet["print"].show();
//  tpl.elementSet["echo"].click();
});
