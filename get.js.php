<?php
	header('Access-Control-Allow-Origin:*');
	
	$rec=fopen('use_pxer.log','a+');
	$dated=date('Y-m-d H:i:s');
	$headerArr=apache_request_headers ();
	fwrite($rec,"用户 {$_GET['id']} 与 {$dated} 使用\r\n\t{$headerArr['Referer']}\n");
	
	$regID=array(
		'11220499','3070689','9984069','9331947','14127396','10009740','13271238','8266913','2159727','8817808',//早期群内成员
		'11876379','6827295',//扎易和他的舍友高瑞宗
		'4480810','2778325','3759661','4955210',//未报到的成员
		'9676538','5471033','15302767','12261501','8513844','1159424','16525073',//新加群的同学
		'16178767'
	);

	if(empty($_GET['id'])){
		exit('alert("请登陆你的P站ID后再启动Pxer"');
	}elseif (!in_array($_GET['id'], $regID)){
	    exit('alert("当前登陆的P站ID未得到授权\n请加QQ群：37369013 尝试获取权限")');
	};

	define('PXER_CODE', 'peanut');

	$password=sha1('peanut'.$_GET['id']);

	$url_get='?username='.$_GET['id'].'&password='.$password;
?>

/*根路径*/
pxer_root='http://pxer.nutjs.com/pxer';
pxer_nutjs='http://w.nutjs.com/js'
/*要载入文件的列表
	注意，列表文件会依次载入，载入完其中一个onload触发载入下一个
	因此请将不能设置onload事件的标签放在末尾
*/
var load_arr=[
	pxer_nutjs+'/nut2.0.js',
	pxer_nutjs+'/nutjs_ex_ajax.js',
	'/style/basic.css',
	'/js/pxer.js.php<?php echo $url_get?>',
	'/js/initialize.js',
	'/image/favicon.ico'
];
/*系统变量*/
var load_parser={
		'php?'	: {
			"tag"	: "script",
			"url"	: "src",
			"add"	:{"type":"text/javascript"}
		},
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
var tagName;
for(var i=0; i<load_arr.length ;i++){
	/*将相对路径转换为硬路径*/
	if(/^http/.test(load_arr[i])){
		temp_url=load_arr[i];
	}else{
		temp_url=pxer_root+load_arr[i];
	};
	/*初始化all_arrH*/
	if(/\.((\w+)$|(\w+)\?)/.test(temp_url) && load_parser[tagName=RegExp.$1]){
		temp_elt= document.createElement(load_parser[tagName].tag);
		if(/\?/.test(tagName)){
		  temp_elt[(load_parser[tagName].url)] =temp_url+"&date="+date.getTime();
		}else{
		  temp_elt[(load_parser[tagName].url)] =temp_url+"?"+date.getTime();
		};
		if(load_parser[tagName].add){
			for(var key in load_parser[tagName].add){
				temp_elt.setAttribute( key, (load_parser[tagName].add)[key] );
			};
		};
		all_loadElt.push(temp_elt);
	}else{
		alert('Error:\nunknow URL type in "'+tagName+'"');
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
