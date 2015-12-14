<?php
/*HTMLhead,输出html头
	css:				css文件路径，支持多个
		css文件1,css文件2,css文件3...

	js：					js文件路径，支持多个
		js文件1,js文件2，js文件3...

	other:				会直接输出的字符串

	title:				网页的标题

	icon:				页面图片的文件路径

	charset:			文件编码,默认为utf-8

	mobile:				是否兼容移动设备,默认为false

	mobileWidth:		在移动设备中屏幕的宽度,默认为device-width

	endHead:			是否在结尾打印</head>,默认为true

	output():			输出头
*/

class HTMLhead{
	private $css=array();
	private $js=array();
	var $other='';
	var $title;
	var $icon;
	var $charset='utf-8';
	var $mobile=false;
	var $mobileWidth='device-width';
	var $endHead=true;
	public function add(){
		for($i=0;$i<func_num_args();$i++){
			$str=func_get_arg($i);
			if(preg_match('/\.css$/i', $str)){
				array_push($this->css, $str);
			}else if(preg_match('/\.js(on)?$/i', $str)){
				array_push($this->js, $str);
			}else if(preg_match('/\.ico$/i', $str)){
				$this->icon=$str;
			}else{
				$this->other.=$str;
			};
		};
	}







	public function output(){
		echo '<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset='.$this->charset.'" />
';
		if($this->mobile){
			echo '	<meta content="no-transform" http-equiv="Cache-Control" />
	<meta content="width='.$this->mobileWidth.'" name="viewport" />
	<meta content="no-cache" http-equiv="Pragma" />
	<meta content="no-cache" http-equiv="Cache-Control" />
	<meta content="0" http-equiv="Expires" />
';
		};
		if(!empty($this->other)){
			echo "\n",$this->other,"\n";
		};
		if(!empty($this->css)){
			for($i=0;$i<sizeof($this->css);$i++){
					echo '	<link type="text/css" rel="stylesheet" href="'.$this->css[$i].'" />',"\n";
			};
		};
		if(!empty($this->icon)){
			echo '	<link rel="shortcut icon" href="'.$this->icon.'" type="image/x-icon" />',"\n";
		};
		if(!empty($this->js)){
			for($i=0;$i<sizeof($this->js);$i++){
					echo '	<script charset='.$this->charset.' src="'.$this->js[$i].'"></script>',"\n";
			}
		};
		if(!empty($this->title)){
			echo "	<title>{$this->title}</title>";
		};
		if($this->endHead){
			echo "\n</head>\n";
		};
	}
};
