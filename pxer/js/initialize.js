/**载入pxer所需的HTML，初始化环境
 * pxer_root
 */
void((function(){
	var load_html =pxer_root + '/style/pxer.php';
	var fz=document.getElementById('page-mypage')
		||document.getElementById('wrapper')
		||document.getElementById('contents')
		||document.body;
	//载入文件html
	nutjs.ajax.url=load_html;
	nutjs.ajax.mode='get';
	nutjs.ajax.fn=function(reHtml){
		if(!reHtml) {
			alert('Error:\nLoad pxerHTML is "'+reHtml+'"');
			throw new Error();
		};
		reHtml= reHtml.replace (/(image\/)/g, (pxer_root+"/$1") );
		fz.innerHTML=reHtml+fz.innerHTML;
		pxer_start();//开始初始化绑定事件
	};
	nutjs.ajax.send();
	//清除广告
	var ad=document.getElementById('header-banner');
	if(ad) ad.innerHTML='';
	//定义全局变量
	ePxer=[];
})());