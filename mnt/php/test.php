<?php
	$fnt=function (){
		echo 'Hello world';
	};

//var_dump($fnt);
//$fnt();


	function callBack($fn){
		$fn();
	};




	class mnt{
		public function typeError(){
			echo 'function typeError()';
		}
		public $typeError;
	}
	$m=new mnt();
	$m->typeError=function (){
		echo '$typeError';
	};

	call_user_func($m->typeError);
	$m->typeError();



echo is_callable($m->typeError);
	var_dump($m->typeError);