<?php
	include 'php/config.php';
	include 'php/tool.function.php';
	include 'php/HTMLhead.class.php';
	include 'php/GetExcerpt.class.php';

	if(empty($_GET['work'])){
		$excID='e0';
	}else{
		$excID=$_GET['work'];
	}
	$exc=new GetExcerpt($excID);
	$exc->initialize();

	$head=new HTMLhead();
	$head->title=$exc->getTitle(true);
	$head->icon='image/peanut.ico';
	$head->mobile=true;
	$head->mobileWidth=360;

	$head->add('js/nut2.0.js');
	$head->add('js/basic.js');

	$head->add('style/basic.css');
	$head->add('style/nav.css');
	$head->add('style/footer.css');
	$head->add('style/getExcerpt.css');


	$head->output();
?>
<body>
<div id="main">



<?php include 'php/nav.php';?>

<div id="myBody">

	<article>
		<h1><?php $exc->getTitle()?></h1>
		<div class="excerpt">
			<?php $exc->getValue()?>
		</div>
	</article>

	<div class="discuss">
		<div class="send_discuss">
			<form action="php/control.php?type=subDis&work=<?php echo $excID?>" method="post">
				<h2>发表评论</h2>
				<div class="userInf">
					<label>昵称：<input type="text" name="nick" /></label>
					<label>电子邮件：<input type="text" name="email" placeholder="本字段不会被公开" /></label>
					<label>站点：<input type="text" name="site" /></label>
					<div class="creatHeight"></div>
				</div>
				<textarea rows="4" name="discus_msg"></textarea>
				<input type="submit" value="发表评论" />
			</form>
		</div>

		<div class="allDiscuss">
			<?php $exc->getDiscuss()?>
		</div>
	</div>

</div>

<?php include 'php/footer.php';?>

</div></body></html>