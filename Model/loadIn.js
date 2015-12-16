// +----------------------------------------------------------------------
// | Pxer的载入文件，载入Pxer的必备环境文件
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2015 http://nutjs.co All rights reserved.
// +----------------------------------------------------------------------
// | Author: 花生PeA <626954412@qq.com>
// +----------------------------------------------------------------------
void((function(){
/*
 * 要载入文件的列表
	-注意，列表文件会依次载入，载入完其中一个节点onload触发载入下一个节点
	-因此请将不能设置onload事件的标签放在末尾，比如ico
*/
var load_list=[
	{//nutjs库
		"tag":"script",
		"attribute":{
			"src"	: window.pxerConfig.Nutjs_Url	+'js/nut2.0.js',
			"type"	: "text/javascript"
		}
	},
	{//nutjs库Ajax扩展
		"tag":"script",
		"attribute":{
			"src"	: window.pxerConfig.Nutjs_Url	+'js/nutjs_ex_ajax.js',
			"type"	: "text/javascript"
		}
	},
	{//加载默认样式
		"tag":"link",
		"attribute":{
			"href"	: function(){
				//判断是否引用了第三方CSS
				var pxer_css=window.pxerConfig.Pxer_Css;
				if(/^http/.test(pxer_css)){
					return pxer_css;
				}else{
					return window.pxerConfig.Pxer_Url + "View/" + pxer_css;
				}
			},
			"rel"	: "stylesheet"
		}
	},
	{
		"tag":"script",
		"attribute":{
			"src"	: window.pxerConfig.Pxer_Url	+'Model/pxer.js',
			"type"	: "text/javascript"
		}
	},
	{//当此文件通过Ajax加载完毕HTML时会回调 pxer_start()
		"tag":"script",
		"attribute":{
			"src"	: window.pxerConfig.Pxer_Url	+'Model/getHTML.js',
			"type"	: "text/javascript"
		}
	},
	{//不能触发onload的标签放在最后面
		"tag":"link",
		"attribute":{
			"href"	: window.pxerConfig.Pxer_Url	+'View/image/favicon.ico',
			"rel"	: "shortcut icon"
		}
	}
];
var all_loadElt=[];//要加载的节点
var date=new Date;
//临时变量
var temp_url='';
var temp_elt=null;
var fileSuffix;
//生成节点(填充all_loadElt)
for(var i=0; i<load_list.length ;i++){
	//生成节点
	temp_elt= document.createElement(load_list[i].tag);
	//添加属性
	for(var key in load_list[i].attribute){
		$value=load_list[i]["attribute"][key];
		if(typeof $value === 'function'){
			$value=$value();
		};
		nutjs.ll($value);
		temp_elt[key] = $value;
	}
	//添加节点
	all_loadElt.push(temp_elt);
};
//载入节点
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