<?php
	include 'php/config.php';
	include 'php/tool.function.php';
	include 'php/GetExcerpt.class.php';
	include 'php/HTMLhead.class.php';

	$head=new HTMLhead();
	$head->title='花生PeA的测试博客';
	$head->icon='image/peanut.ico';
	$head->mobile=true;
	$head->mobileWidth=360;

	$head->add('js/nut2.0.js');
	$head->add('js/basic.js');
	$head->add('js/index.js');

	$head->add('style/basic.css');
	$head->add('style/nav.css');
	$head->add('style/footer.css');
	$head->add('style/index.css');

	$head->output();
?>
<body>
<header>
<?php if(!(!empty($_GET['list']) && $_GET['list']!='all')){?>
	<img alt="bander" src="image/bander.jpg" />
<?php }?>
</header>
<div id="main">



<?php include 'php/nav.php';?>

<div id="myBody">
	<aside>
		<img class="myLogo" alt="logo" src="image/peanut.jpg">
		<ul class="showPerson">
			<li><span class="lable">姓名：</span>花生PeA</li>
			<li><span class="lable">性别：</span>男</li>
			<li><span class="lable">年龄：</span>20</li>
			<li><span class="lable">邮箱：</span>626954412@qq.com</li>
			<li><span class="lable">所在地：</span>山东青岛</li>
			<li><span class="lable">擅长领域：</span>JavaScript</li>
			<li><span class="lable">兴趣爱好：</span>VOCALOID</li>
			<li><span class="lable">个人说明：</span>在创业、写代码、控V家，相信就会存在，请叫我花生。</li>
			<li><span class="lable">个人主页：</span>http://pea.nutjs.com/</li>
		</ul>
	</aside>

	<article>
	 	<?php
	 		$mysqli=cMysqli();
			if(!empty($_GET['list']) && $_GET['list']!='all'){
				$whereSQL="Where `work_type`= '{$_GET['list']}'";
			}else{
				$whereSQL='';
			};
	 		$sql="Select `work_id`,`work_title`,`beader`,`excerpt`,`work_date` From works {$whereSQL} Order By `work_date` DESC";
			$rec=$mysqli->query($sql);
		?>
		<?php while ($res=$rec->fetch_array()){?>
			<div class="works">
				<a href="getExcerpt.php?work=<?php echo $res['work_id']?>">
					<h3><?php echo $res['work_title']?></h3>
					<img class="imgAlt" alt="vsFTP" src="<?php echo $res['beader']?>">
				</a>
				<div class="excerpt"><?php echo $res['excerpt']?></div>
				<div class="creatHeight"></div>
				<div class="date">最后更新：<?php echo $res['work_date']?></div>
			</div>
		<?php }?>
	</article>

	<div class="creatHeight"></div>
</div>

<?php include 'php/footer.php';?>

</div></body></html>