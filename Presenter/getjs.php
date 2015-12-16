<?php
// +----------------------------------------------------------------------
// | 载入Model文件中的js文件
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2015 http://nutjs.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: 花生PeA <626954412@qq.com>
// +----------------------------------------------------------------------
//校验合法性
if(empty($_GET['js']) || empty($_GET['username']) || empty($_GET['password'])){
	show_error("非法调用");
};
//校验请求文件合法性
$file_path= './Model/'.$_GET['js'];
if(!preg_match('/[^\\/]+\.js/', $_GET['js']) || !file_exists($file_path)){
	show_error('非法请求');
};
//校验密码
$password=sha1(Token.base64_decode($_GET['username']));
if($_GET['password'] !== $password){
	show_error('密码不符');
};
//引入JS文件
include $file_path;