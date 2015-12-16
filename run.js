// +----------------------------------------------------------------------
// | Pxer [Pixiv.net plug-in]
// +----------------------------------------------------------------------
// | Pxer运行代码。发布给用户直接复制到书签运行，或通过其他代码来引入此文件均可
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2015 http://nutjs.co All rights reserved.
// +----------------------------------------------------------------------
// | Author: 花生PeA <626954412@qq.com>
// +----------------------------------------------------------------------

javascript:
void((function() {
	/*配置变量*/
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
	/*读取配置信息*/
	config = JSON.parse(config);
	window.Pxer={};
	window.Pxer.Pxer_Url	=config.Pxer_Url;
	window.Pxer.Nutjs_Url	=config.Nutjs_Url;
	/*初始化*/
	var pxerUrl=window.pxer_url+"Model/loadIn.js";
	var getId=/PHPSESSID=(\d+)/;
	var script=document.createElement("script");
	var date=new Date();
	var pixivId=getId.exec(document.cookie);
	pixivId = pixivId ?pixivId[1] :000000;
	script.src=pxerUrl+"?id="+pixivId+"&date="+date.getTime();
	document.head.appendChild(script);
})());