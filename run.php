<?php
// +----------------------------------------------------------------------
// | Pxer [Pixiv.net plug-in]
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2015 http://nutjs.co All rights reserved.
// +----------------------------------------------------------------------
// | Author: 花生PeA <626954412@qq.com>
// +----------------------------------------------------------------------
header("Content-type: text/html; charset=utf-8");
//再次定义的配置常量将不会作用于JS部分
//允许跨域访问本文件
header('Access-Control-Allow-Origin:*');
//同意所有用户请求
define('Allow_All', 1 , true);
//定义令牌
define('Token', 'nutjs.com' , true);
//引入核心入口文件
include 'Presenter/pxer.php';