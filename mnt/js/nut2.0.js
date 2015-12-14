/**nutjs 2.0
 *
 */

/* -- 系统常量 -- */
var NUTJS_CLA=function(){};
var NUTJS_OBJ=new NUTJS_CLA();
var NUTJS_PRO=NUTJS_CLA.prototype;
/* -- 原型赋值 -- */
//获取元素
NUTJS_PRO .getE					=function(key,value,multi,elt){
	var win=elt||window.document;
	var allElts=win.getElementsByTagName("*");
	if(multi){
		var arr=[];
		for (var i=0;i<allElts.length;i++){
			if (allElts[i].getAttribute(key) == value){
				arr.push(aAES[i]);
			};
		};
		if(arr.length==0) return null;
		return arr;
	}else{
		for (var i=0;i<allElts.length;i++){
			if (allElts[i].getAttribute(key)==value){
				return allElts[i];
			};
		};
	};
};
NUTJS_PRO .getClass				=function(cssName,multi,elt){
	var win=elt||window.document;
	var allElts=win.getElementsByTagName("*");
	var cssReg=new RegExp(cssName);
	if (multi){
		var arr=[];
		for (var i=0;i<allElts.length;i++){
			if (cssReg.test(allElts[i].className)){
				array.push(allElts[i]);
			};
		};
		if(array.length==0){
			return null;
		}
		return arr;
	}else{
		for (var i=0;i<allElts.length;i++){
			if (cssReg.test(allElts[i].className)){
				return allElts[i];
			};
		};
	};
	return null;
};
//操作元素
NUTJS_PRO .addEve				=function(elts,eve,fn){
	if(!elts)return null;
	if(elts.length == undefined ||elts.document){
		if (elts.addEventListener){//火狐
			elts.addEventListener(eve,fn,false);
		}else if (window.attachEvent){//IE
			elts.attachEvent("on"+eve,fn);
		}else{//最传统的替换事件
			try{
				elts['on'+eve]=fn;
			}catch(e){
				throw e;
			};
		};
	}else if(elts.length >= 1){//兼容多维数组
		for(var i=0;i<elts.length;i++){
			NUTJS_OBJ.addEve(elts[i],eve,fn);
		};
	}else{//错误
		throw new Error("Nutjs->addEve Error!");
	};
};
NUTJS_PRO .addKey				=function(elts,key,value,add){
	if(!elts) return null;
	if(elts.length == undefined){
		if(add){
			var oldValue=elts.getAttribute(key)||"";
			elts.setAttribute(key , oldValue +value );
		}else{
			elts.setAttribute(key,value);
		};
	}else if(elts.length >=1){
		for(var i=0;i<elts.length;i++){
			this.addKey(elts[i],key,value,add);
		};
	}else{
		throw new Error("Nutjs->addKey Error!");
	};
};
//便利功能&模拟PHP扩展
NUTJS_PRO .$_GET				=function(url){
	var str=url||decodeURI(document.URL);
	var reg_get_str=/\?.+/;
	if(reg_get_str.test(str)){
		var obj={};
		var temp=str
				.match(reg_get_str)[0]
				.replace("?","")
				.split("&")
			;
		for(var i=0;i<temp.length;i++){
			var key=temp[i].match(/^[^=]+/)[0];
			var value=temp[i].replace(key+"=","");
			obj[key]=value;
		};
		return obj;
	};
	return null;
};
NUTJS_PRO .print_r				=function(array,onlyString,reStr){
	var str="";
	for (var key in array){
		if(
			onlyString
			&&typeof array[key]!="string"
			&&typeof array[key]!="number"
			&&typeof array[key]!="array"
		){
			continue;
		};
		str+=key+"\t->\t【"+array[key]+"】\n";
	};
	if(reStr) return str;
	alert(str);
};
//常用操作偷懒封装
NUTJS_PRO .time					=function(){
	var date=new Date();
	var time=date.getTime();
	return time;
};

NUTJS_PRO .l=[];//每次输出的日志信息
NUTJS_PRO .ll=function(msg){
	console.log(msg);
	this.l.push("l:"+msg);
};
NUTJS_PRO .lw=function(msg){
	console.warn(msg);
	this.l.push("w:"+msg);
};
NUTJS_PRO .le=function(msg){
	console.error(msg);
	this.l.push("e:"+msg);
};

//NUTJS_PRO .le=NUTJS_PRO .lw=NUTJS_PRO .ll=function(){};
//常用demo
NUTJS_PRO .dis					=function(switch_elt ,change_elt ,display_type ,event_type ,switch_value){
	var display_type =display_type||'block';
	var event_type =event_type||'click';
	var old_switch_value =switch_elt.value ||switch_elt.innerHTML;
	NUTJS_OBJ.addEve(switch_elt ,event_type ,function(){
		var styl=getComputedStyle(change_elt,null);
		if(styl.display == 'none'){
			change_elt.style.display=display_type;
			if(switch_value){
				if(switch_elt.value) switch_elt.value =switch_value
				if(switch_elt.innerHTML) switch_elt.innerHTML =switch_value
			};
		}else{
			change_elt.style.display='none';
			if(switch_value){
				if(switch_elt.value) switch_elt.value =old_switch_value
				if(switch_elt.innerHTML) switch_elt.innerHTML =old_switch_value
			};
		};
	});
};

//向下兼容
var __nutjs__=nutjs=NUTJS_OBJ;
var reel_pointer_nutjs_proto=NUTJS_PRO;
NUTJS_PRO.display=NUTJS_PRO.dis