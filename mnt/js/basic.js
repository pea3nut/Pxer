nutjs.addEve(window,'load',function(){
	window.pea={};
	window.pea.nav=document.getElementsByTagName('nav')[0];
	if(+screen.width < 600){//屏幕过小，做出响应式调整
		window.pea.nav.style.width="100%";
		window.pea.nav.style.padding="0";

		var navs=nutjs.getClass('navs',false,window.pea.nav);
		var map=nutjs.getClass('map',false,window.pea.nav);
		var rope=nutjs.getClass('rope',false,window.pea.nav);
		rope.style.display="none";
		navs.style.border="none";
		map.style.display="none";

		var aside=document.getElementsByTagName('aside');
		if(aside[0])aside[0].style.display="none";

		document.getElementsByTagName('article')[0].style.width="100%";
		//alert(document.getElementsByTagName('article')[0].style.width);
	};
});