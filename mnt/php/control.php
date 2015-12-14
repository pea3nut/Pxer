<?php
	include 'config.php';
	include 'tool.function.php';
	include 'Control.class.php';

	header('Content-Type: text/html; charset=utf-8');
	$con=new Control();
	$con->typeError=function (){
		exit('<script>
			alert("提交不正确");
			history.back();
		</script>');
	};

	$con->verifyType($_GET['type']);

	$con->fieldError=function($field){
		$errorMsg=array(
			'work'=>'非法提交',
			'nick'=>'请填写正确的昵称',
			'email'=>'请填写正确的电子邮箱，邮箱将不会被公开',
			'site'=>'',
			'discus_msg'=>''
		);
		exit('<script>
			alert("'.$errorMsg[$field].'");
			history.back();
		</script>');
	};
	$_POST['work']=$_GET['work'];
	$con->verifyField($_POST);

	$con->subError=function($str){
		exit('<script>
			alert("数据库出错，请重试");
			history.back();
		</script>');
	};
	$con->verifySub();

	$con->verifyReturn();

	exit('OK');