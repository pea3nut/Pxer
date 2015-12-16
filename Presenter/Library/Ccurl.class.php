<?php
/**Ccurl
 * $curl		cURL对象
 * $url			要发送的链接
 * $msg			要发送的数据，支持数组与对象
 * $syn=[30]	发送时是否等待，为true时无限等待，为数字时等待数字的秒数，为其他值是不等待(等待1ms)
 * send()		发送数据，返回请求返回值，等待超时时返回false
 *
 * 类会自动关闭SSL验证
 * */
/*
 * 对CURL组件的便捷封装
 * */
class Ccurl{
	/**
	 * 原生的CURL句柄
	 * @var curl
	 * @access protected
	 * */
	protected $curl;
	/**
	 * 要发送的链接
	 * @var url
	 * @access public
	 * */
	public $url;
	/**
	 * 要发送的数据[Array/Object]
	 * @var url
	 * @access public
	 * */
	public $msg;
	/**
	 * 同步等待的时间，单位秒
	 * @var url
	 * @access public
	 * */
	public $syn=30;
	/**
     * 构造函数
     * @access public
     * @param string $url 要发送到的URL
     * @param mixed $msg 要发送的数据[Array/Object]
     * @param int $syn 同步等待的时间，单位秒
     * @return void
	 * */
	public function __construct($url,$msg,$syn){
		$this->curl=curl_init();
		$this->url=$url;
		$this->msg=$msg;
		if(isset($syn)){
			$this->syn=$syn;
		};
		//设置返回数据
		curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, 1);
	}
	/**
	 * 初始CURL信息，发送数据
	 * @access public
	 * @return mixed 如果发送失败或采用异步返回false，其他情况返回请求数据
	 * */
	public function send(){
		//设置链接
		curl_setopt($this->curl, CURLOPT_URL, $this->url);
		//禁用SSL证书验证
		curl_setopt($this->curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($this->curl, CURLOPT_SSL_VERIFYHOST, false);
		//格式化发送的数据
		if(empty($this->msg)){
			curl_setopt($this->curl, CURLOPT_POST, true);
			if(is_array($this->msg) || is_object($this->msg)){//读取对象与字符串
				$msg='';
				foreach ($this->msg as $key => $value){
					$msg.= $key.'='.$value.'&';
				};
				preg_replace('/&$/', '', $msg);
				curl_setopt($this->curl, CURLOPT_POSTFIELDS, $msg);//POST数据
			}else{
				curl_setopt($this->curl, CURLOPT_POSTFIELDS, $this->msg);//POST数据
			}
		}
		//设置等待时间
		if(is_int($this->syn)){
			curl_setopt($this->curl, CURLOPT_TIMEOUT , $this->syn);
		}else {
			curl_setopt($this->curl, CURLOPT_TIMEOUT_MS , 1);
		};
		//发送数据
		return curl_exec($this->curl);
	}
}