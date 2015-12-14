javascript:
void((function() {

	var getId=/PHPSESSID=(\d+)/;
	var pixivId=getId.exec(document.cookie)[1];
	var pxerUrl="http://pxer.nutjs.com/get.js.php";

	var script=document.createElement("script");
	var date=new Date();

	script.src=pxerUrl+"?id="+pixivId+"&date="+date.getTime();
	document.head.appendChild(script);

})());