<?php
	//基本信息
	$width=75;
	$height=25;
	$randNum='';//结果

	$img=imagecreatetruecolor($width,$height);
	$white=imagecolorallocate($img,255,255,255);
	if(!empty($_GET['style'])){
		switch ($_GET['style']){
			case 'mobile_reg':
				mobile_reg();
				break;
		};
	}else{
		imagefill($img,0,0,$white);
		//画字体
		for($i=0;$i<4;$i++){
			$randNum.=mt_rand(0,9);
			$randColor=imagecolorallocate($img,mt_rand(0,150),mt_rand(0,150),mt_rand(0,150));
			imagechar($img,5,$i*$width/4+mt_rand(0,11),mt_rand(-3,12),$randNum[$i],$randColor);
		};
		//画线条
		PaintRandLine($img,$width,$height,5);
	};
	//设置输出PNG图片
	header('Content-Type:image/png');
	imagepng($img);
	imagedestroy($img);
	//设置session
	session_start();
	$_SESSION['code']=$randNum;

	function mobile_reg(){
		global $img,$randNum,$width,$height;
		$c = imagecolorallocatealpha($img , 0 , 0 , 0 , 127);//拾取一个完全透明的颜色
		imagealphablending($img , false);//关闭混合模式，以便透明颜色能覆盖原画布
		imagefill($img , 0 , 0 , $c);//填充
		imagesavealpha($img , true);//设置保存PNG时保留透明通道信息

		for($i=0;$i<4;$i++){
			$randNum.=mt_rand(0,9);
			$randColor=imagecolorallocate($img,mt_rand(150,255),mt_rand(150,255),mt_rand(150,255));
			//$randColor=imagecolorallocate($img,255,255,255);
			imagechar($img,15,$i*$width/4+mt_rand(0,11),mt_rand(-3,12),$randNum[$i],$randColor);
		};
		//PaintRandLine($img,$width,$height,5);
	}
















	//函数区
	//随机话随机的线条
	function PaintRandLine($ImageResource,$width,$height,$number){
		for($i=0;$i<$number;$i++){
			$RandColorArray=array();
			for($v=0;$v<sqrt($width*$width*$height*$height);$v++){
				array_push($RandColorArray,imagecolorallocate($ImageResource,mt_rand(0,255),mt_rand(0,255),mt_rand(0,255)));
			};
			imagesetstyle($ImageResource,$RandColorArray);
			imageline($ImageResource,mt_rand(0,$width),mt_rand(0,$height),mt_rand(0,$width),mt_rand(0,$height),IMG_COLOR_STYLED);
		};
	};
?>



















