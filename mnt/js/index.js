/**
 *
 */
nutjs.addEve(window,'load',function(){
	//检测header是否存在，隐藏导航条
	window.pea.beaderImg=nutjs.getE('alt','bander');
	if(window.pea.beaderImg){
		window.pea.imgHeight=parseInt(getComputedStyle(window.pea.beaderImg,null).height);
		window.pea.imgHeight -= parseInt(getComputedStyle(window.pea.nav,null).height)*2;//更加符合用户习惯
		if(window.pageYOffset < window.pea.imgHeight) window.pea.nav.style.display="none";
		nutjs.addEve(window,'scroll',function(){
			if(window.pageYOffset < window.pea.imgHeight){
				window.pea.nav.style.display="none";
			}else if(window.pageYOffset > window.pea.imgHeight){
				window.pea.nav.style.display="block";
			};
		});
		nutjs.addEve(window,'resize',function(){
			window.pea.imgHeight=parseInt(getComputedStyle(window.pea.beaderImg,null).height);
		});
	}



});