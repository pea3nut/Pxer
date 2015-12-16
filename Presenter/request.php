<?php
// +----------------------------------------------------------------------
// | 处理Pxer请求(loadIn.js文件请求)
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2015 http://nutjs.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: 花生PeA <626954412@qq.com>
// +----------------------------------------------------------------------

//检查权限
if(!Allow_All){
	$errorMsg='';
	$authorizationUsers=include './Config/authorizationUsers.php';
	if(empty($_GET['id'])){
		show_error('请先登陆你的P站ID');
	}elseif (!in_array($_GET['id'], $authorizationUsers)){
		show_error('当前ID未得到授权\n请加QQ群：37369013 尝试获取授权');
	};
	//记录日志文件
	$rec=fopen('./Log/use_pxer.log','a+');
	$headerArr=apache_request_headers ();
	fwrite($start_time.' '.User_ID.'\tip:'.$_SERVER["REMOTE_ADDR"],'\r\n\t'.$headerArr['Referer'].'\r\n');
}
//生成密钥
$id_rsa='username='.base64_encode(User_ID).'&password='.sha1(Token.User_ID);
//载入JS文件
$loadIn=file_get_contents('./Model/loadIn.js');
echo preg_replace('/Model\/([^\']+)/', 'run.php?js=$1&'.$id_rsa,$loadIn);