// +----------------------------------------------------------------------
// | 载入Pxer所需的HTML，初始化环境
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2015 http://nutjs.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: 花生PeA <626954412@qq.com>
// +----------------------------------------------------------------------
void((function(){
	//获取模板位置
	var pxer_tpl=window.pxerConfig.Pxer_Tpl;
	var load_html=null;
	if(/^http/.test(pxer_tpl)){
		load_html = pxer_tpl;
	}else{
		load_html = window.pxerConfig.Pxer_Url + "run.php?tpl=" + pxer_tpl;
	}
	//寻找插入到页面的位置
	var fz=document.getElementById('page-mypage')
		||document.getElementById('wrapper')
		||document.getElementById('contents')
		||document.body;
	//载入文件html
	nutjs.ajax.url=load_html;
	nutjs.ajax.mode='get';
	nutjs.ajax.fn=function(reHtml){
		fz.innerHTML=reHtml+fz.innerHTML;
		pxer_start();//开始初始化绑定事件
	};
	nutjs.ajax.send();
	//定义全局变量
	window.ePxer=[];
})());