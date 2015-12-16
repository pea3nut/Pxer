<?php
    if(empty($_GET['username'])) exit('username');
    $password=sha1('peanut'.$_GET['username']);
    if($_GET['password'] != $password) exit('password');
?>
function pxer_start(){
	myPxer=new Pxer();
	myPxer.initialize();
	nutjs.addEve(myPxer.px.bn_run,'click',function(){
		if(myPxer.just_get()){
			nutjs.ll("将采用获取单图方式");
			return;
		}else if(myPxer.read()){//可以批量get
			nutjs.ll("将采用批量获取方式");
			myPxer.px.pxer_showState.style.display="block";
		}else{
			nutjs.le("Pxer不知道该怎么做");
		};
	});
}

/*--- Pxer ---*/
function Pxer(){
	this.px={};//存放所有pxer中有id的elt对象，key为id
	this.is_support=false;//是否属于支持页面
	this.address=[];//将要被输出的下载地址
	this.addressObj=[];//下载地址对象
	this.thread;//线程数
	this.wait;//最大等待时间
	this.okThread=0;//执行完毕的线程数
	this.maxThread=1;//最大的线程数，取页数与用户设定的线程的最小值

	this.threadObj=[];//存放着线程的对象

	this.queue=[];//队列
	this.queue_num=1;//队列的数量
	this.queue_finish_num=0;//队列已完成的数量
	this.once_completion_time=1;//执行每一个队列需要花费的时间，用于计算预计花费的时间

	this.running_time=0;//程序运行的时间
	this.running_timer=0;//程序运行的时间的指针
	this.remaining_time=1;//剩余时间

	this.upTimer;//定时触发更新显示窗口的时间指针
};
Pxer.prototype.		xxxx			=function(){

};
Pxer.prototype.		initialize		=function(){
	var that=this;
	var all_elt=document.getElementById('pxer').getElementsByTagName('*');
	for(var i=0;i<all_elt.length;i++){
		if(all_elt[i].id){
			this.px[all_elt[i].id]=all_elt[i];
		};
	};
	this.px.pxer_main.style.display="block";
	nutjs.display(this.px.bn_expert		,this.px.pxer_config);
	nutjs.display(this.px.bn_about		,this.px.pxer_about);

	nutjs.display(this.px.bn_process	,this.px.pxer_process,null,null,'隐藏线程');
	//nutjs.display(this.px.bn_filter		,this.px.pxer_filter,null,null,'关闭过滤');

	nutjs.addEve(this.px.bn_log			,'click',function(){
		window.open().document.write(nutjs.l);
	});

	nutjs.addEve(this.px.bn_save		,'click',function(){
		that.px.bn_run.click();
	});

	nutjs.addEve(this.px.bn_filter		,'click',function(){
		if(getComputedStyle(that.px.pxer_filter,null).display == 'none'){
			that.px.switch_filter.className='pxer_no';
			that.px.switch_filter.innerHTML='禁用';
		}else{
			that.px.switch_filter.className='pxer_ok';
			that.px.switch_filter.innerHTML='启用';
		}
	});
	/*运行开始读取队列*/
	nutjs.addEve(this.px.bn_getall		,'click',function(){
		if(this.innerHTML == "开始执行"){
			that.getAll();
			this.innerHTML="停止执行"
		}else{
			this.disabled=true;
			var queueNum=that.queue.length;
			while(that.queue.pop());
			that.queue.length=queueNum;
			that.okThread = that.maxThread;
			that.theadok(1);
			this.innerHTML="已停止";
		};
	});
};
Pxer.prototype.		read			=function(){
	var page_type={
		'search'	: {
			"pxer_page_type"	: "标签页",
			"works"				: "class=count-badge"
		},
		'member_illust'	: {
			"pxer_page_type"	: "作品页",
			"works"				: "class=count-badge"
		},
		'bookmark'	: {
			"pxer_page_type"	: "收藏页",
			"works"				: "class=count-badge"
		}
	};
	var temp_reg='';
	var that=this;
	for(var key in page_type){
		temp_reg=new RegExp(key);
		if(temp_reg.test(document.URL)){//定位页面
			var temp_arr=page_type[key].works.split('=');
			var temp_elt=nutjs.getE(temp_arr[0],temp_arr[1]);
			if(!temp_elt) return false;
			var works=parseInt(temp_elt.innerHTML);
			this.is_support=true;
			this.px.pxer_page_type.innerHTML	=page_type[key].pxer_page_type;//当前位置
			nutjs.addKey(this.px.pxer_page_type,'class','act ','+=');
			this.px.pxer_works.innerHTML		=works;//作品数量
			/*估算队列与时间*/
			var page_num=Math.ceil(works/20);
			this.queue_num=page_num +works;
			/*最大等待时间*/
			this.wait=this.px.config_wait.value;
			/*添加队列*/
			this.queue=[];
			for(var i=0;i<page_num;i++){
				this.queue.push(document.URL+"&p="+(i+1));
			};
			/*初始化线程数,不允许线程超过页数*/
			this.thread=this.px.config_thread.value;
			this.maxThread = +(this.queue.length>this.thread?this.thread:this.queue.length);
			//显示效果
			this.px.show_wait.innerHTML=this.wait;
			this.px.show_thread.innerHTML=this.maxThread;
			/*显示结果*/
			this.queue_show_update();
			return true;
		}
	};
	return false;
};
Pxer.prototype.		just_get		=function(_url){//获取单个作品专用
	if(/member_illust/.test(document.URL) && /mode=medium/.test(document.URL)){
		var url =_url ||document.URL;
		pxget=new PxGet(url);
		pxget.fn=function(adr){
			nutjs.print_r(this.pr);
		};
		pxget.workHtml=document.body.innerHTML;
		pxget.get();
		return true;
	}else{
		return false;
	};
};
Pxer.prototype.		getAll			=function(){//获取全部作品
	var that=this;
	//开始计时
	this.running_timer=setInterval(function(){
		that.running_time++;
	},1000);
	//初始化线程对象
	for(var i=0;i<this.maxThread;i++){
		this.threadObj.push(new Thread(this));
		this.threadObj[i].id=i+1;
		this.threadObj[i].run();
	};
	//显示线程窗口
	this.px.bn_process.click();
	//初始化并且定时更新显示窗口
	this.px.pxer_state.className="";
	this.px.pxer_state.innerHTML="执行中";
	var new_elt;
	for(var i=0;i<this.maxThread;i++){
		new_elt=this.px.pxer_thread.cloneNode(true);
		new_elt.id="pxer_thread"+(i+1);
		new_elt.getElementsByTagName("legend")[0].innerHTML="线程"+(i+1);
		new_elt.getElementsByTagName("em")[0].className="pxer_ok";
		new_elt.getElementsByTagName("em")[0].innerHTML="运行中";
		this.px.pxer_process.appendChild(new_elt);
	};
	this.upTimer=setInterval(function(){
		that.queue_show_update.call(that);
	},500);
};
Pxer.prototype.		theadok			=function(threadId){//队列执行完毕执行的回调函数
	var that=this;
	var threadState=document.getElementById("pxer_thread"+threadId).getElementsByTagName("em")[0];
	threadState.innerHTML="停止";
	threadState.className="pxer_no"
	if(++this.okThread >= this.maxThread){//全部队列执行完毕
		//清除定时时间计算
		clearInterval(this.running_timer);
		clearInterval(this.upTimer);
		this.queue_show_update();
		//更新显示状态
		this.px.pxer_state.className="pxer_ok";
		this.px.pxer_state.innerHTML="执行完毕";
		this.px.pxer_print.style.display="block";
		nutjs.addEve(this.px.bn_print,'click',function(){
			that.print.call(that);
		});
		//整合下载地址对象
		var temp_arr=[];
		for(var i=0;i<this.threadObj.length;i++){
			temp_arr=temp_arr.concat(this.threadObj[i].address);
		}
		for(var i=0;i<temp_arr.length;i++){
			this.addressObj=this.addressObj.concat(temp_arr[i]);
		}
		//清除重复字段
		for(var i=0;i<this.addressObj.length-1;i++){
			for(var v=i+1;v<this.addressObj.length;v++){
				if(this.addressObj[i].workid == this.addressObj[v].workid){
					this.addressObj.splice(v,1);
					v--;
				};
			};
		};
	};
};
Pxer.prototype.		print			=function(){
	//初始化信息，防止多次调用
	this.address=[];//将要被输出的下载地址
	//读取用户设置的输出选项
	var config_arr=['config_pic','config_ids','config_zip'];
	var config_obj={"config_sids_o":0};
	for(var i=0;i<config_arr.length;i++){
		config_obj[config_arr[i]]=document.getElementsByName(config_arr[i]);
		for(var v=0; v<config_obj[ config_arr[i] ].length ;v++){
			if(config_obj[config_arr[i]][v].checked){
				config_obj[config_arr[i]+"_o"]=v;
			};
		};
	};
	/*将参数对象转换为下载地址
		type	: ids/pic/zip		作品的类型
		fx		: jpg/gif/png		作品的扩展名
		workid	: \d+				作品的ID
		date	: [Y,m,d,h,m,s]		作品的投稿时间
		server	: i\d				作品所被分配的服务器
		[picnum]: \d+				ids专用，作品的数量
		[zipo]	: [\w\W]*			zip专用，zip的动态参数
	*/
	var output_template={
		'pic':[
			"http://#server#.pixiv.net/img-original/img/#date#/#workid#_p0.#fx#",
			"http://#server#.pixiv.net/c/600x600/img-master/img/#date#/#workid#_p0_master1200.jpg",
			""
		],
		'ids':[
			"http://#server#.pixiv.net/img-original/img/#date#/#workid#_p#picnum#.#fx#",
			"http://#server#.pixiv.net/c/1200x1200/img-master/img/#date#/#workid#_p#picnum#_master1200.jpg",
			"http://#server#.pixiv.net/c/600x600/img-master/img/#date#/#workid#_p0_master1200.jpg",
			""
		],
		'sids':["http://#server#.pixiv.net/c/600x600/img-master/img/#date#/#workid#_p0_master1200.jpg"],
		'zip':[
			'http://#server#.pixiv.net/img-zip-ugoira/img/#date#/#workid#_ugoira1920x1080.zip',
			'http://#server#.pixiv.net/img-zip-ugoira/img/#date#/#workid#_ugoira600x600.zip',
			''
		]
	};
	var tmp_address='';
	var tmp_type;
	var tmp_size;
	for(var i=0;i<this.addressObj.length;i++){
		tmp_type=this.addressObj[i].type;
		tmp_size=config_obj["config_"+tmp_type+"_o"]
		if(tmp_size == undefined) continue;//如果是其他不需要输出的类型，直接跳过读取模板
		tmp_address=output_template[tmp_type][tmp_size]
			.replace("#fx#",this.addressObj[i].fx)
			.replace("#workid#",this.addressObj[i].workid)
			.replace("#date#",this.addressObj[i].date)
			.replace("#server#",this.addressObj[i].server)
		;
		if(/#picnum#/.test(tmp_address)){
			for(var v=0;v<this.addressObj[i].picnum;v++){
				this.address.push(tmp_address.replace("#picnum#",v));
			};
		}else{
			this.address.push(tmp_address);
		};
	};
	//输出
	var win=window.open();
	/*
		Pxer beta 4.1.1 2015-10-29
		耗时 33 秒
		============================
		漫画 最大输出 21
		插画 600P输出 34
		动图 No输出 0
		============================
		共计 55 幅作品 307个下载地址
		============================
	*/

	var date = new Date()
	var dateStr=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()
	win.document.write("Pxer "+this.px.pxer_version.innerHTML+" "+dateStr+"<br />");

	win.document.write("============================"+"<br />");

	var work_num_obj={"pic":0,"ids":0,"sids":0,"zip":0,"no_permission":0};
	for(var i=0;i<this.addressObj.length;i++){
		for(var key in work_num_obj){
			if(this.addressObj[i].type == key) work_num_obj[key]++
		};
	};
	var checked_index;
	var tmp_html;
	for(var key in work_num_obj){
		if(key == 'sids'){
			tmp_html="600p"
		}else{
			checked_index=config_obj["config_"+key+"_o"]
			if(checked_index == undefined) continue;//如果是其他不需要输出的类型，直接跳过
			tmp_html=config_obj["config_"+key][checked_index].value
		};
		win.document.write(" ->"+key+" --- 【"+tmp_html+"】 --- 【"+work_num_obj[key]+"】<br />");
	};

	win.document.write(" ->no_permission --- 【"+work_num_obj[key]+"】<br />");

	win.document.write("共计 "+this.addressObj.length+" 幅作品，"+this.address.length+" 个下载地址<br />");

	win.document.write("============================"+"<br />");

	win.document.write("共耗时 "+this.running_time+" 秒，平均每秒 "+(this.addressObj.length/this.running_time).toFixed(2)+" 张<br />");

	win.document.write("采用 "+this.maxThread+" 线程，平均每张花费 "+(this.addressObj.length/this.running_time/this.maxThread).toFixed(2)+" 秒"+"<br />");

	win.document.write("============================"+"<br />");
	for(var i=0;i<this.address.length;i++){
		if(this.address[i]){
			win.document.write(this.address[i]);
			win.document.write('<br />');
		};
	}

	//检测是否有动图参数
	if(config_obj["config_zip"][config_obj["config_zip_o"]].value != 'No' && work_num_obj["zip"]){
		var zip_config=window.open();
		for(var i=0;i<this.addressObj.length;i++){
			if(this.addressObj[i].type == 'zip'){
				zip_config.document.write('{"id":"'+this.addressObj[i].workid+'","config":'+this.addressObj[i].zipo+'}<br />');
			}
		};
	};
};




Pxer.prototype.		queue_show_update=function(){//更新显示效果
	//未完成的数量
	this.px.show_queue_num.innerHTML=this.queue_num;
	var finish_address=0;
	var finish_list=0;
	for(var i=0;i<this.threadObj.length;i++){
		finish_address+= (this.threadObj[i].address.length);
		finish_list+= (this.threadObj[i].strTask);
	}
	if(finish_address ==0){
		this.queue_finish_num = finish_list;
	}else{
		this.queue_finish_num = (this.queue_num - this.queue.length);
	}
	this.px.show_queue_finish_num.innerHTML =this.queue_finish_num;
	//执行时间与剩余时间
	this.px.show_running_time.innerHTML=Math.floor(this.running_time/60)+":" +this.add0( this.running_time%60 );
	this.remaining_time= this.running_time/(this.queue_finish_num/this.queue_num)-this.running_time;
	if(isNaN(this.remaining_time))this.remaining_time=(this.queue_num *this.once_completion_time)/this.maxThread;
	this.px.show_remaining_time.innerHTML=Math.floor(this.remaining_time/60)+":" +this.add0( Math.floor(this.remaining_time%60));
	//线程窗口
	var tpm_elt;
	var tpm_arr;
	for(var i=0;i<this.threadObj.length;i++){
		tpm_elt=document.getElementById("pxer_thread"+(i+1));
		tpm_elt.getElementsByTagName("em")[1].innerHTML=this.threadObj[i].address.length;
	};
};
Pxer.prototype.		add0			=function(num){//将个位数的数字前面加0
	if(num<10) return "0"+num;
	return num;
};
/*--- Thread --- 线程，读取队列调用PxGet，内置判断作品类型与初始作品队列 ---*/
function Thread(pxer){
	this.pxer=pxer;
	this.queue=pxer.queue;//队列的引用
	this.task;//当前执行的任务

	this.strTask=0;//解析完毕str类型(目录)的任务

	this.address=[];//当前进程获取到的下载地址，全是对象

	this.id;
	this.ajax=new nutjs.ajax_class();

	this.startTime=0;
	this.timer;
};

Thread.prototype.	run				=function(){
	clearInterval(this.timer);
	this.startTime=0

	this.task=this.queue.shift();
	if(this.task){//开始执行
		this.getEngine();
	}else{
		nutjs.ll("线程【"+this.id+"】已完成任务");
		this.pxer.theadok(this.id);
	};
};
Thread.prototype.	getEngine		=function(){
	var that=this;

	if(typeof this.task === "string"){//作品目录
		this.ajax.url=this.task;
		this.ajax.mode="get";
		this.ajax.waitBn=true;
		this.ajax.waitTime=this.pxer.wait;
		this.ajax.fn=function(re){
			that.getWorkqueue(re);
			that.strTask++;
			that.run();
		};
		this.ajax.send();
		//监视Ajax，保证程序健壮性
	}else if(typeof this.task === "object"){/*作品obj对象
		url:作品的workUrl
		type:作品的类型[pic|ids|zip]
	*/
		var pxget=new PxGet(this.pxer);
		pxget.workUrl=this.task.url;
		pxget.pr.type=this.task.type;
		pxget.fn=function(re){
			that.address.push(this.pr);
			that.run();
		};
		pxget.get();
	}else{
		nutjs.lw("线程【"+this.id+"】丢失任务，时间指针为【"+this.timer+"】任务的类型为【"+typeof this.task+"】，任务为【"+this.task+"】");
		this.run();
		return;
	};
};
Thread.prototype.	getWorkqueue	=function(html){
	var reg=/<a[^<>]*?href="([^"<>]*)"[^<>]*?class="(work\s+_work[^<>"]*)"[^<>]*>/img;
	var temp_arr=html.match(reg);
	for(var i=0;i<temp_arr.length;i++){
		var obj=new Object();
		var arr=reg.exec(temp_arr[i]);
		if(! /^\//.test(arr[1]))arr[1]="/"+arr[1];
		obj.url="http://www.pixiv.net"+arr[1];
		reg.lastIndex=0;//因为启用全局调用了exec
		if(/ugoku\-illust/.test(arr[2])){
			obj.type="zip";
		}else if(/multiple/.test(arr[2])){
			obj.type="ids";
		}else if(/manga/.test(arr[2])){
			obj.type="sids";
		}else if(/^\s*work\s*_work\s*$/.test(arr[2])){
			obj.type="pic";
		}else{
			nutjs.le("函数getWorkqueue无法判断作品类型！class【"+arr[2]+"】，href【"+arr[1]+"】");
			continue;
		}
		this.queue.push(obj);
	};
};
/*--- PxGet --- 获取单个页面的下载地址 ---*/
function PxGet(pxer){//获取页面的图片链接
	this.pxer=pxer;//对pxer源对象的直接访问
	this.fn;//执行完毕后的回调函数
	/*下面的参数分别是程序执行的获取步骤*/
	this.pr={};/*获取到的作品参数对象，参考本文件开始的说明
		作品存储方式
			{
				type	: ids/pic/zip		作品的类型
				fx		: jpg/gif/png		作品的扩展名
				workid	: \d+				作品的ID
				date	: [Y,m,d,h,m,s]		作品的投稿时间
				server	: i\d				作品所被分配的服务器
				[picnum]: \d+				ids专用，作品的数量
				[zipo]	: [\w\W]*			zip专用，zip的动态参数
			}
	*/
	/*this.sidsHtml单个漫画作品的大图页html
	可以通过本参数计算出下面参数
			address
	*/
	/*this.sidsUrl单个漫画作品的大图页
	可以通过本参数计算出下面参数
			sidsHtml
	*/
	this.idsUrl1Html;/*漫画作品索引页html
		可以通过本参数计算出下面参数
			pr.picnum
	*/
	this.idsUrl2Html;/*漫画作品单个大图页html
		可以通过本参数计算出下面参数
			address
	*/
	this.idsUrl1;/*漫画作品索引页
		可以通过本参数计算出下面参数
			idsUrl1Html
	 */
	this.idsUrl2;/*漫画作品单个大图页
		可以通过本参数计算出下面参数
			idsUrl2Html
	 */
	this.address;/*作品的下载地址
		可以通过本参数计算出下面参数
			pr.fx
			pr.workid
			pr.date
			pr.server
	*/
	this.workHtml;/*作品的html
		可以通过本参数计算出下面参数
			pr.type
			if $pr.type=pic then
				address
	*/
	this.workUrl;/*作品的url
		可以通过本参数计算出下面参数
			workHtml		-net
	*/
	this.workId;/*作品id @address
		可以通过本参数计算出下面参数
			workUrl
			idsUrl1
			idsUrl2
			sidsUrl
	*/
	/*运行参数*/
	this.create_url={};
};
PxGet.prototype.	get=function(){
	if(this.isOK()) return this.fn();
	if(this.pr.type){
		switch(this.pr.type){
			case 'pic':
				if(this.address){
					this.get_pr_from_address();
				}else if(this.workHtml){
					this.get_address_from_workHtml();
				}else if(this.workUrl){
					this.get_workHtml_from_workUrl();
					return;
				}else{
					this.pr.type=null;
				};
				break;
			case 'ids':
				if(this.address){
					this.get_pr_from_address();
				}else if(this.idsUrl1Html || this.idsUrl2Html){
					if(this.idsUrl1Html && this.idsUrl2Html){
						this.get_address_from_idsUrl2Html();
						this.get_prPicnum_from_idsUrl1Html();
					}else{
						return;
					};
				}else if(this.idsUrl1 && this.idsUrl2){
					this.get_idsUrl1Html_from_idsUrl1();
					this.get_idsUrl2Html_from_idsUrl2();
					return;
				}else if(this.workId){
					this.get_idsUrlx_from_workId();
				}else if(this.workHtml){
					this.get_workId_from_workHtml();
				}else if(this.workUrl){
					this.get_workHtml_from_workUrl();
					return;
				}else{
					this.pr.type=null;
				};
				break;
			case 'sids':
				if(this.workHtml){
					this.get_pr_from_workHtml();
				}else if(this.workUrl){
					this.get_workHtml_from_workUrl();
					return;
				}else{
					this.pr.type=null;
				};
				break;
			case 'zip':
				if(this.address){
					this.get_pr_from_address();
				}else if(this.workHtml){
					this.get_address_zipo_from_workHtml_zip();
				}else if(this.workUrl){
					this.get_workHtml_from_workUrl();
					return;
				}else{
					this.pr.type=null;
				};
				break;
			default:
				nutjs.le('函数PxGet.get，未知的prType值【'+this.pr.type+"】");
		};
	}else{
		if(this.workHtml){
			this.get_prType_from_workHtml();
		}else if(this.workUrl){
			this.get_workHtml_from_workUrl();
			return;
		}else if(this.workId){
			this.get_workUrl_from_workId();
		}else{
			nutjs.le("函数PxGet.get，参数不足以获取");
		};
	};
	this.get();
};
PxGet.prototype.	isOK=function(){
	if(
		this.pr.type &&
		this.pr.server &&
		(this.pr.workid||isNaN(this.pr.workid))&&
		this.pr.date
	){
		return true
	}else if(this.pr.type == 'no_permission'){
		return true
	}else{
		return false
	};
};
PxGet.prototype.	stop=function(){
	this.fn=function(){};
	this.get=function(){};
};
/*通用获取*/
PxGet.prototype.	get_workUrl_from_workId=function(){
	this.workUrl="http://www.pixiv.net/member_illust.php?mode=medium&illust_id="+this.workId;
};
PxGet.prototype.	get_workHtml_from_workUrl=function(){
	var that=this;
	var ajax=new nutjs.ajax_class();
	ajax.url=this.workUrl;
	ajax.mode="get";
	ajax.waitBn=true;
	if(this.pxer)ajax.waitTime=this.pxer.wait;
	ajax.fn=function(re){
		//校验作品是否为私人作品，必须好P友才可打开
		if(/sprites\-mypixiv\-badge/.test(re)){
			that.pr.type="no_permission";
			that.pr.workid=NaN
		};
		that.workHtml=re;
		that.get();
	};
	ajax.send();
};
PxGet.prototype.	get_prType_from_workHtml=function(){
	var is_ids=/class[^<>]*works_display[^<>]*>[\w\W]*?<a[\w\W]*?href[^"']*?"([^"']*?mode[^"']*?manga[^"']*)"/mi;
	var is_sids=/class[^<>]*works_display[^<>]*>[\w\W]*?<a[\w\W]*?href[^"']*?"([^"']*?mode[^"']*?big[^"']*)"/mi;
	var is_pic=/<img[^<>]*data-src[^"]"([^\{\}]*?)"[^<>]*class[^<>]*original-image/mi;
	var is_zip=/ugoira600x600\.zip/im;
	if(is_ids.test(this.workHtml)){
		this.pr.type="ids";
	}else if(is_pic.test(this.workHtml)){
		this.pr.type="pic";
	}else if(is_sids.test(this.workHtml)){
		this.pr.type="sids";
	}else if(is_zip.test(this.workHtml)){
		this.pr.type="zip";
	}else{
		ePxer.push(this);
		nutjs.lw("函数get_prType_from_workHtml无法通过workHtml鉴别出prType!回滚操作，并添加当前PxGet对象 $ePxer["+(ePxer.length-1)+"]");
		this.pr.workHtml=null;
		return this.fn();
	}
};
PxGet.prototype.	get_pr_from_address=function(){
	var reg=/http:\/\/([^\.]*)\.pixiv.net\/[^"<>]*?\/([\d\/]{19})\/(\d+)_\w+?\.(\w+)/;
	var arr=reg.exec(this.address);
	//if(!arr)alert(this.pr.type+"\n"+this.sidsUrl+"\n"+this.sidsHtml);
	this.pr.fx=arr[4];
	this.pr.workid=arr[3];
	this.pr.date=arr[2];
	this.pr.server=arr[1];
};
/*pic专用*/
PxGet.prototype.	get_address_from_workHtml=function(){
	var reg=/<img[^<>]*data-src[^"]"([^\{\}<>]*?)"[^<>]*class[^<>]*original-image/mi;
	try{
		this.address=reg.exec(this.workHtml)[1];
	}catch(e){
		ePxer.push(this);
		nutjs.le("函数get_address_from_workHtml，未知的workHtml!回滚操作，并添加当前PxGet对象 $ePxer["+(ePxer.length-1)+"]");
		this.workHtml=null;
	};
};
/*ids专用*/
PxGet.prototype.	get_workId_from_workHtml=function(){
	var reg=/<textarea class="ui-select-all">[^<>]*?(\d+)<\/textarea>/;
	try{
		var arr=reg.exec(this.workHtml);
		this.workId=arr[1];
	}catch(e){
		ePxer.push(this);
		nutjs.le("函数get_workId_from_workHtml，未知的workHtml!回滚操作，并添加当前PxGet对象 $ePxer["+(ePxer.length-1)+"]");
		this.workHtml=null;
	};
};
PxGet.prototype.	get_idsUrlx_from_workId=function(){
	this.idsUrl1="http://www.pixiv.net/member_illust.php?mode=manga&illust_id="+this.workId;
	this.idsUrl2="http://www.pixiv.net/member_illust.php?mode=manga_big&illust_id="+this.workId+"&page=0";
};
PxGet.prototype.	get_idsUrl1Html_from_idsUrl1=function(){
	var that=this;
	var ajax=new nutjs.ajax_class();
	ajax.url=this.idsUrl1;
	ajax.mode="get";
	ajax.waitBn=true;
	if(this.pxer)ajax.waitTime=this.pxer.wait;
	ajax.fn=function(re){
		that.idsUrl1Html=re;
		that.get();
	};
	ajax.send();
};
PxGet.prototype.	get_idsUrl2Html_from_idsUrl2=function(){
	var that=this;
	var ajax=new nutjs.ajax_class();
	ajax.url=this.idsUrl2;
	ajax.mode="get";
	ajax.waitBn=true;
	if(this.pxer)ajax.waitTime=this.pxer.wait;
	ajax.fn=function(re){
		that.idsUrl2Html=re;
		that.get();
	};
	ajax.send();
};
PxGet.prototype.	get_prPicnum_from_idsUrl1Html=function(){
	var reg=/<span[^<>]*?class[^<>"']*?"[^<>"']*?total[^<>"']*?"[^<>]*?>(\d+)<\/span>/mi;
	try{
		this.pr.picnum=reg.exec(this.idsUrl1Html)[1];
	}catch(e){
		ePxer.push(this);
		nutjs.le("函数get_prPicnum_from_idsUrl1Html，未知的idsUrl1Html!回滚操作，并添加当前PxGet对象 $ePxer["+(ePxer.length-1)+"]");
		this.idsUrl1Html=null;
	};
};
PxGet.prototype.	get_address_from_idsUrl2Html=function(){
	var reg=/<img[^<>]*src="([^<>"]*)"[^<>]*>/mi;
	try{
		this.address=reg.exec(this.idsUrl2Html)[1];
	}catch(e){
		ePxer.push(this);
		nutjs.le("函数get_address_from_idsUrl2Html，未知的idsUrl2Html!回滚操作，并添加当前PxGet对象 $ePxer["+(ePxer.length-1)+"]");
		this.idsUrl2Html=null;
	};
};
/*sids专用*/
PxGet.prototype.	get_pr_from_workHtml=function(){
	var reg=/<div class="_layout\-thumbnail"><img src="([^"]*)"/mi;
	var adrsReg=/http:\/\/([^\.]*)\.pixiv.net\/.*\/img\/([\d\/]{19})\/(\d+)/;
	try{
		var sidsAddress=reg.exec(this.workHtml)[1];
		var arr=adrsReg.exec(sidsAddress);
		this.pr.type="sids";
		this.pr.workid=arr[3];
		this.pr.date=arr[2];
		this.pr.server=arr[1];
	}catch(e){
		ePxer.push(this);
		nutjs.le("函数get_pr_from_workHtml，未知的workHtml!回滚操作，并添加当前PxGet对象 $ePxer["+(ePxer.length-1)+"]");
		this.workHtml=null;
	};
};
/*zip专用*/
PxGet.prototype.	get_address_zipo_from_workHtml_zip=function(){
	var reg=/"src":"([^"<>]*?600x600\.zip)"[^<>]*?"frames":(\[.*?\])/mi;
	try{
		var execRes=reg.exec(this.workHtml)
		this.address=execRes[1].replace(/\\/g,"");
		this.pr.zipo=execRes[2];
	}catch(e){
		ePxer.push(this);
		nutjs.le("函数get_address_zipo_from_workHtml_zip，未知的workHtml!回滚操作，并添加当前PxGet对象 $ePxer["+(ePxer.length-1)+"]");
		this.workHtml=null;
	};
};
/*其他*/
PxGet.prototype.	get__from_=function(){};
