// +----------------------------------------------------------------------
// | Pxer [Pixiv.net plug-in]
// +----------------------------------------------------------------------
// | Pxer运行代码。通过其他代码来引入此文件
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2015 http://nutjs.co All rights reserved.
// +----------------------------------------------------------------------
// | Author: 花生PeA <626954412@qq.com>
// +----------------------------------------------------------------------

void((function() {
	//配置变量
	var config_path="http://127.0.0.1/works/pxer/Conf/config.json"
	//读取JSON文件
	var xhr=new XMLHttpRequest();
	var config=null;
	xhr.open('get',config_path,false);
	xhr.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200){
			config = this.responseText;
		};
	};
	xhr.send();
	//读取通用配置信息
	window.pxerConfig = JSON.parse(config);
	//读取特定模式配置
	var special_config = window.pxerConfig[ window.pxerConfig.Config ];
	if(special_config){
		for(var key in special_config){
			window.pxerConfig[key]=special_config[key];
		}
	}
	//获取ID值
	var getId=/PHPSESSID=(\d+)/;
	var pixivId=getId.exec(document.cookie);
	//生成节点
	var script=document.createElement("script");
	var date=new Date();
	pixivId = pixivId ?pixivId[1] :"000000";
	//拼接Get请求，生成src
	var pxerUrl=window.pxerConfig.Pxer_Url+"Model/loadIn.js";
	if(!/\?/.test(pxerUrl)){
		pxerUrl=pxerUrl+"?";
	}else{
		pxerUrl=pxerUrl+"&";
	};
	pxerUrl = pxerUrl+"id="+pixivId+"&date="+date.getTime();
	script.src=pxerUrl;
	//载入节点
	document.head.appendChild(script);
})());