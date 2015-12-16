<?php
// +----------------------------------------------------------------------
// | 载入Model文件中的js文件
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2015 http://nutjs.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: 花生PeA <626954412@qq.com>
// +----------------------------------------------------------------------
//校验请求文件合法性
$file_path= './Model/'.$_GET['js'];
if(!preg_match('/[^\\/]+\.js/', $_GET['js']) || !file_exists($file_path)){
	show_error('非法请求');
};
//检查是否是第一次请求js，只有id没有username和password
if(!empty($_GET['id']) && empty($_GET['username']) && empty($_GET['password'])){
	//定义User_ID
	define('User_ID',$_GET['id']);
	//是否开启了允许所有请求
	if(!Allow_All){
		$errorMsg='';
		$authorizationUsers=include './Config/authorizationUsers.php';
		if ($_GET['id'] == '000000'){
			show_error('请先登录你的P站ID再启动Pxer');
		}
		if (!in_array($_GET['id'], $authorizationUsers)){
			show_error('当前ID未得到授权\n请加QQ群：37369013 尝试获取授权');
		};
	}
	//记录日志文件
	global $start_time;
	$rec=fopen('./Log/use_pxer.log','a+');
	$headerArr=apache_request_headers ();
	fwrite($rec , $start_time.' '.User_ID.'\tip:'.$_SERVER["REMOTE_ADDR"].'\r\n\t'.$headerArr['Referer'].'\r\n');
	//生成密钥
	$id_rsa='username='.base64_encode(User_ID).'&password='.sha1(Token.User_ID);
	//载入渲染JS文件
	$js_value=file_get_contents($file_path);
	$js_value=preg_replace('/Model\/([^\'"]+)/', 'run.php?js=$1&'.$id_rsa,$js_value);
	//输出JS文件
	echo $js_value;
}else{//普通的js文件请求，已经就有username和password
	//校验合法性
	if(empty($_GET['js']) || empty($_GET['username']) || empty($_GET['password'])){
		show_error("非法调用");
	};
	//校验密码
	$password=sha1(Token.base64_decode($_GET['username']));
	if($_GET['password'] !== $password){
		show_error('密码不符');
	};
	//渲染js文件
	$js_value=file_get_contents($file_path);
	$js_value=preg_replace('/Model\/([^\'"]+)/', 'run.php?js=$1'."&username={$_GET['username']}&password={$_GET['password']}" ,$js_value);
	echo $js_value;
};