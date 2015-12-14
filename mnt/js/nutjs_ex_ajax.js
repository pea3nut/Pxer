/**说明

 * copy © web开发协会  A233 刘伯源@花生
	nutjs库ajax扩展
	信息
		nutjs库版本		1.2
		解析器版本			1.2
			1.2更新日志
				增加监视ajax响应时间模块，如果一段时间未响应则重新发送ajax
				更新nutjs指针
		更新时间			2015年11月2日
 * 属性说明
		url			发送到的地址
		mode		发送的方式，get/post
		sendMsg		要发送的数据，支持读取json对象，如果mode为get，将不会读取。
		fn			服务器响应后的回调函数，会将返回值作为第一个参数传递
		xhr			直接指向xhr对象
		send(fn)	fn,在打开链接后，发送之前执行的函数，运行用户对xhr对象操作
		waitBn		开启监视等待时间功能，默认关闭
			waitTime	最大等待时间，默认为10（秒）
			waitedTime	已等待的时间（秒）
			timer		监听时间的时间指针
 */
NUTJS_PRO . ajax_class=function(url,mode,fn,sendMsg){
	this.url=url;
	this.mode=mode;
	this.sendMsg=sendMsg;
	this.fn=fn;
	this.diyFn;

	this.xhr=new XMLHttpRequest();

	this.waitBn=false;
	this.waitTime=10;
	this.waitedTime=0;
	this.timer;
};
NUTJS_PRO . ajax_class . prototype . send=function(){
	this.xhr.open(this.mode,this.url,true);
	if(this.mode==='post'){
		this.xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		if(typeof this.sendMsg !== 'string'){
			if(typeof this.sendMsg === 'object'){
				var sendMsg='';
				for(var key in this.sendMsg){
					sendMsg += key+ '='+ this.sendMsg[key]+"&";
				};
				this.sendMsg=sendMsg.replace(/&$/,'');
			}else{
				alert('Ajax Error:\nUnknown sendMsg '+this.sendMsg);
				return;
			};
		};
	};
	if(this.diyFn)this.diyFn.call(this);

	var that=this;
	this.xhr.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200){
			clearInterval(that.timer);
			that.fn(that.xhr.responseText);
		};
	};

	this.xhr.send(this.sendMsg);

	this.waitBn && this.monitorTime();
};

NUTJS_PRO . ajax_class . prototype . monitorTime=function(){
	var that=this;
	this.timer=setInterval(function(){
		if(++that.waitedTime == that.waitTime){
			clearInterval(that.timer);
			that.waitedTime=0;
			that.xhr.abort();
			that.send();
		};
	},this.waitTime*1000);
};

NUTJS_PRO . ajax=new reel_pointer_nutjs_proto .ajax_class ();//实例化对象