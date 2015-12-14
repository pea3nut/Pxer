<?php
	class Control{
		protected function typeError(){exit('typeError');}
		public $typeError;
		protected function fieldError($str){exit("fieldError $str");}
		public $fieldError;
		protected function subError(){exit('subError');}
		public $subError;

		protected $mysqli;
		protected $date;

		protected $fieldReg=array(
			'work'=>'/^e\d+$/',
			'nick'=>'/^[^\'"\\<>]+$/',
			'email'=>'/^[^\'"\\<>@]+@[^\'"\\<>@]+$/',
			'site'=>'/^[\w\W]*$/',
			'discus_msg'=>'/^[\w\W]+$/'
		);

		protected $type;
		protected $legalType=array('subDis');

		public function verifyType($type){
			$this->type=$type;
			if(!in_array($this->type,$this->legalType)){
				if(is_callable($this->typeError)){
					$this->typeError();
				}else{
					$this->typeError();
				};
			}
		}

		public function verifyField($data){
			foreach ($data as $key => $value) {
				if(empty($this->fieldReg[$key]) || !preg_match($this->fieldReg[$key], $value)){
					if(is_callable($this->fieldError)){
						call_user_func($this->fieldError,$key);
					}else{
						$this->fieldError($key);
					};
				};
			};
			$this->date=$data;
		}

		public function verifySub(){
			$this->mysqli=cMysqli();
			foreach ($this->date as $key => $value) {
				$this->date[$key]=$this->mysqli->real_escape_string(htmlspecialchars($value));
			}
			$this->mysqli->query(
				"INSERT INTO `pea_blog`.`discuss`
					(`id`, `work_id`, `user_nick`, `user_email`, `user_site`, `discus`, `date`) VALUES
					(NULL, '{$this->date['work']}', '{$this->date['nick']}',
					'{$this->date['email']}', '{$this->date['site']}', '{$this->date['discus_msg']}', '".date('Y-m-d H:i:s')."');"
			);
			if(!empty($this->mysqli->error)){
				if(is_callable($this->subError)){
					call_user_func($this->subError,$this->mysqli->error);
				}else{
					$this->fieldError(subError);
				};
			};
		}

		public function verifyReturn(){
			header('Cache-control: private, must-revalidate');
			echo ('<script>
				alert("成功");
				history.back();
			</script>');
		}
	};






