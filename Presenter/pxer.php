<?php
// +----------------------------------------------------------------------
// | Pxer加密系统业务逻辑，载入配置优先级： 入口配置 > 特定模式配置 > 通用配置
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2015 http://nutjs.co All rights reserved.
// +----------------------------------------------------------------------
// | Author: 花生PeA <626954412@qq.com>
// +----------------------------------------------------------------------

//记录开始时间
$start_time=date('Y-m-d H:i:s');
//读取配置文件Json
$config=json_decode(file_get_contents('./Conf/config.json'),true) or die('Json配置文件有误!');
//载入特定模式下的配置
defined('Config') or $config['Config'] or define('Config', 'Local' , true);
var_dump($config);
foreach ($config[Config] as $key => $value) {
	if(is_string($key) && is_string($value)){
		defined($key) or define($key, $value ,true);
	};
};
//载入配置文件
foreach ($config as $key => $value) {
	if(is_string($key) && is_string($value)){
		defined($key) or define($key, $value ,true);
	};
};
//载入环境文件
include './Presenter/Library/function.php';
//读取用于生产$id_rsa密钥的id
if(empty($_GET['id'])){
	defined('User_ID')		or	define('User_ID',000000);
}else{
	defined('User_ID')		or	define('User_ID',$_GET['id']);
};
//新建日志文件夹与文件
file_exists('./Log')	or	mkdir('./Log');
//检查入口方向
if(!empty($_GET['js'])){//js文件请求
	include './Presenter/getjs.php';
}elseif(!empty($_GET['html'])){//请求Pxer主面板HTML
	//模板渲染输出
	$tpl=file_get_contents('./View/default.tpl');
	$tpl=preg_replace('/\{pxer_url\}\//', Pxer_Url ,$tpl);
	$tpl=preg_replace('/\{pxer_version\}/', Pxer_Version ,$tpl);
	echo $tpl;
}else{//处理Pxer请求(loadIn.js文件请求)
	include './Presenter/request.php';
}

