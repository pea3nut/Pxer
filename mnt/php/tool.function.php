<?php
function cMysqli(){//创建一个mysqli对象
	$mysqli=new mysqli(DB_HOST,DB_USER,DB_PASSWORD,DB_NAME);
	if($mysqli->errno){
		exit('dberror');
	};
	$mysqli->set_charset('utf8');
	return $mysqli;
};
function p($echostr='Error!',$dir='res.txt',$mode='w'){
	$fp=fopen($dir,$mode);
	fwrite($fp,$echostr);
};
function getRandChar($length){
	$str = null;
	$strPol = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
	$max = strlen($strPol)-1;

	for($i=0;$i<$length;$i++){
		$str.=$strPol[rand(0,$max)];//rand($min,$max)生成介于min和max两个数之间的一个随机整数
	}
	return $str;
}
function get_fromSQL($sql){
	$mysqli=cMysqli();
	$rec=$mysqli->query($sql);
	if($mysqli->errno) echo '<br />',$mysqli->error,'<br />',$sql;
	$res=$rec->fetch_array();
	$mysqli->close();
	return $res[0];
};