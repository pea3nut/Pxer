// +----------------------------------------------------------------------
// | 载入Pxer所需的HTML，初始化环境
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2015 http://nutjs.co All rights reserved.
// +----------------------------------------------------------------------
// | Author: 花生PeA <626954412@qq.com>
// +----------------------------------------------------------------------
void((function(){
	//pxer主程序HTML所在位置
	var load_html =window.pxer_url + 'run.php?html=1';
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