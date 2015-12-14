<nav>
	<div class="rope"></div>
	<div class="navs">
		<img class="navLogo" alt="logo" src="image/peanut.ico">
		<a class="index_a" href="index.php?list=all">首页</a>
		<a href="index.php?list=web">Web开发</a>
		<a href="index.php?list=think">总结与反思</a>
		<a href="index.php?list=works">小作品</a>
		<a href="getExcerpt.php?work=e0">关于这里</a>
		<div class="map">
			<?php
				if(!empty($exc)){
					$exc->getMap();
				}else if(empty($_GET['list'])){
					echo '当前位置：' . GetExcerpt::$keyToMsg['default'];
 				}else {
 					echo '当前位置：' . GetExcerpt::$keyToMsg[$_GET['list']];
				};
			?>
		</div>
		<div class="creatHeight"></div>
	</div>
</nav>