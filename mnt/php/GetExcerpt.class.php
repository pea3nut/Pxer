<?php

class GetExcerpt{
	private $excID;
	private $mysqli;
	public static $keyToMsg=array(
			'all'=>'所有文章',
			'web'=>'Web开发',
			'think'=>'总结与反思',
			'works'=>'小作品',
			'default'=>'总结与反思'
	);

	public function getTitle ($re=false){
		$rec=$this->mysqli->query("Select work_title From works Where work_id='{$this->excID}'");
		$res=$rec->fetch_array();
		if($re){
			return $res['work_title'];
		}else{
			echo $res['work_title'];
		};
	}
	public function getValue (){
		$rec=$this->mysqli->query("Select work_value From works Where work_id='{$this->excID}'");
		$res=$rec->fetch_array();
		echo $res['work_value'];
	}
	public function getDiscuss (){
		$rec=$this->mysqli->query("Select * From discuss Where work_id='{$this->excID}' Order by date DESC");
		while ($res=$rec->fetch_array()){
			if(empty($res['user_site'])){
				$res['user_site']='###';
			}else if(!preg_match('/^http/', $res['user_site'])){
				$res['user_site']='http://'.$res['user_site'];
			};
			echo "
				<div class=\"theDiscuss\">
					<div class=\"disUser\"><a href=\"{$res['user_site']}\">{$res['user_nick']}</a></div>
					<div class=\"disDate\">{$res['date']}</div>
					<div class=\"disMsg\">{$res['discus']}</div>
				</div>
			";
		};
	}
	public function getMap (){
		$rec=$this->mysqli->query("Select work_type From works Where work_id='{$this->excID}'");
		$res=$rec->fetch_array();
		$msg='当前位置：' . GetExcerpt::$keyToMsg[ $res['work_type'] ] . ' -> '.$this->excID;
		echo $msg;
	}

	public function initialize (){
		$this->mysqli=cMysqli();
	}
	public function __construct($excID){
		$reg='/^\w+$/';
		if(preg_match($reg, $excID)){
			$this->excID=$excID;
		};
	}
}