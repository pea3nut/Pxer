javascript:
/*加载完整的Pxer，本文件代码可以直接放在标签内启动*/
void((function() {
	/*根路径*/
	pxer_root='http://127.0.0.1/git_studio/pxer';
	pxer_nutjs='http://127.0.0.1/git_studio/warehouse/js'
	/*要载入文件的列表
		注意，列表文件会依次载入，载入完其中一个onload触发载入下一个
		因此请将不能设置onload事件的标签放在末尾
	*/
	var load_arr=[
		pxer_nutjs+'/nut2.0.js',
		pxer_nutjs+'/nutjs_ex_ajax.js',
		'/style/basic.css',
		'/js/pxer.js.php',
		'/js/initialize.js',
		'/image/favicon.ico'
	];
	/*系统变量*/
	var load_parser={
			'js'	: {
				"tag"	: "script",
				"url"	: "src",
				"add"	:{"type":"text/javascript"}
			},
			'ico'	: {
				"tag"	: "link",
				"url"	: "href",
				"add"	:{"rel":"shortcut icon"}
			},
			'css'	: {
				"tag"	: "link",
				"url"	: "href",
				"add"	:{"rel":"stylesheet"}
			}
	};
	/*载入配置文件*/
	var all_loadElt=[];/*要加载的节点*/
	var temp_url='';
	var temp_elt=null;
	var date=new Date;
	for(var i=0;i<load_arr.length;i++){
		/*将相对路径转换为硬路径*/
		if(/^http/.test(load_arr[i])){
			temp_url=load_arr[i];
		}else{
			temp_url=pxer_root+load_arr[i];
		};
		/*初始化all_arrH*/
		if(/\.(\w+)$/.test(temp_url) && load_parser[RegExp.$1]){
			temp_elt= document.createElement(load_parser[RegExp.$1].tag);
			temp_elt[(load_parser[RegExp.$1].url)] =temp_url+"?"+date.getTime();
			if(load_parser[RegExp.$1].add){
				for(var key in load_parser[RegExp.$1].add){
					temp_elt.setAttribute( key, (load_parser[RegExp.$1].add)[key] );
				};
			};
			all_loadElt.push(temp_elt);
		}else{
			alert('Error:\nunknow URL type in "'+load_arr[i]+'"');
			throw new Error();
		};
	};
	/*载入节点*/
	for(var i=0;i<all_loadElt.length -1;i++){
		all_loadElt[i].onload=function(){
			for(var i=0;i<all_loadElt.length -1;i++){
				if(this == all_loadElt[i]){
					document.head.appendChild(all_loadElt[i+1]);
				}
			}
		};
	};
	document.head.appendChild(all_loadElt[0]);
})());
