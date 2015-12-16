// +----------------------------------------------------------------------
// | Pxer的载入文件，载入Pxer的必备环境文件
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2015 http://nutjs.co All rights reserved.
// +----------------------------------------------------------------------
// | Author: 花生PeA <626954412@qq.com>
// +----------------------------------------------------------------------

/**
 * 要载入文件的列表
 * 注意，列表文件会依次载入，载入完其中一个节点onload触发载入下一个节点
 * 因此请将不能设置onload事件的标签放在末尾，比如ico
 * */
var load_arr=[
	//远程环境文件
	window.Pxer.nutjs_url	+'js/nut2.0.js',
	window.Pxer.nutjs_url	+'js/nutjs_ex_ajax.js',
	//Pxer内置文件
	window.Pxer.pxer_url	+'View/basic.css',
	window.Pxer.pxer_url	+'Model/pxer.js',
	window.Pxer.pxer_url	+'Model/getHTML.js',//当此文件通过Ajax加载完毕HTML时会回调 pxer_start()
	window.Pxer.pxer_url	+'View/image/favicon.ico'
];
//系统变量
var load_parser={
		'js'	: {
			"tag"	: "script",
			"url"	: "src",
			"add"	:{"type":"text/javascript"}
		},
		'php'	: {//这里是为了兼容编译后的文件标签，请Model层开发请勿修改，除非你十分明确自己在做什么！
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
var all_loadElt=[];/*要加载的节点*/
var date=new Date;
//临时变量
var temp_url='';
var temp_elt=null;
var fileSuffix;
//生成节点(填充all_loadElt)
for(var i=0; i<load_arr.length ;i++){
	//获取文件扩展名
	//这里的正则表达式是为了兼容编译后的文件标签，请Model层开发请勿修改，除非你十分明确自己在做什么！
	fileSuffix=load_arr[i].match(/\.(\w+)(\?.+)?$/)[1];
	//生成节点
	temp_elt= document.createElement(load_parser[fileSuffix].tag);
	//添加属性
	if(load_parser[fileSuffix].add){
		for(var key in load_parser[fileSuffix].add){
			temp_elt.setAttribute(key , (load_parser[fileSuffix].add)[key]);
		};
	};
	temp_elt[(load_parser[fileSuffix].url)] =load_arr[i];
	//添加节点
	all_loadElt.push(temp_elt);
};
//载入节点
for(var i=0;i<all_loadElt.length -1;i++){
	all_loadElt[i].onload=function(){
		for(var i=0;i<all_loadElt.length -1;i++){
			if(this == all_loadElt[i]){
				nutjs.ll(all_loadElt[i+1]);
				document.head.appendChild(all_loadElt[i+1]);
			}
		}
	};
};
document.head.appendChild(all_loadElt[0]);
