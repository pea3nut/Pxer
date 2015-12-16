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
if(!defined('Config')){
	if(!empty($config['Config'])){
		define('Config', $config['Config'] , true);
	}else{
		define('Config', 'Local' , true);
	};
};
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
//新建日志文件夹与文件
file_exists('./Log')	or	mkdir('./Log');
//检查入口方向
if(!empty($_GET['js'])){//普通js文件请求
	include './Presenter/getjs.php';
}elseif(!empty($_GET['tpl'])){//请求Pxer主面板HTML
	//过滤模板字符
	if(preg_match('/[\\\\]/', $_GET['tpl']))exit('非法的模板');
	//智能添加后缀
	if(!preg_match('/\\.tpl$/', $_GET['tpl'])) $_GET['tpl'] .= '.tpl';
	//模板渲染输出
	$tpl=file_get_contents('./View/'.$_GET['tpl']);
	$tpl=preg_replace('/\{pxer_url\}\//', Pxer_Url ,$tpl);
	$tpl=preg_replace('/\{pxer_version\}/', Pxer_Version ,$tpl);
	echo $tpl;
}else{//处理Pxer请求(run.js文件请求)
	$run=file_get_contents('./run.js');
	echo preg_replace('/Model\/([^\'"]+)/', 'run.php?js=$1' ,$run);
}