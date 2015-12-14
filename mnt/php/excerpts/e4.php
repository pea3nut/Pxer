<p>可能有人一看到花生打算用JavaScript写爬虫感到不可思议，js竟然能写爬虫？！</p>
<p>其实用JavaScript写爬虫其实是有很大好处的</p>
<ul>
	<li>js直接可以直接在浏览器运行，所以每个人都可以拿来使用，即使是电脑小白</li>
	<li>就如XSS攻击一样，当每个人拿到花生的写的爬虫程序使用时，就相当于大家都在帮忙爬取数据，这样可以避免被封杀</li>
	<li>js是事件驱动的，Ajax可以帮我们大忙</li>
	<li>js与HTML CSS关系紧密，可以很简单实现一个界面美观功能强大的程序</li>
</ul>
<p>所以，一个“基于js的爬虫项目 —— Pxer ”诞生了。</p>
<p>先介绍下pixiv.net网站(以下简称P站)：</p>
<blockquote>
	<p>P站是提供一个能让艺术家发表他们的插图，并通过评级系统反应其他用户意见之处，网站以用户投稿的原创图画为中心。</p>
	<p>简单的说，P站为一些二次元画师提供一个投稿平台，每一个画师都可以在P站中注册一名会员，然后上传自己的作品。当然，也可以像花生这样只看那些画师投稿，纯粹的欣赏。</p>
</blockquote>
<p>但是，P站不提供作品批量下载功能！！！也就是说，如果花生喜欢一名画师，他有500副作品，花生如果想要保存至电脑，只能一副一副的右键另存为！！然后花生就受不了了，一怒之下写一个爬虫来实现批量下载这个功能，所以Pxer主要具有以下功能：</p>
<ol>
	<li>Pxer是用来爬取P站的专用爬虫</li>
	<li>Pxer可以爬取到P站中的图片信息，比如下载地址、评分值、画师ID</li>
	<li>Pxer可以实现P站图片批量下载（输出所有图片下载地址，再借助第三方下载软件即可）</li>
	<li>Pxer可以根据用户的喜好来过滤数据，比如用户可以选择仅爬取评分大于1000点的作品</li>
	<li>Pxer可以实现一些常用的快捷操作，使网站更符合国人上网习惯</li>
</ol>
<p>然后花生就开工了，一开始的Pxer是采用DOM操作来爬取数据，直接getElement，后来发现Ajax比较快，然后就采用Ajax爬取数据了，花生的电脑，挂上代理，速度大概是 4张/秒，感觉网速不给力，其实应该非常快才对，不过考虑到P站的服务器在日本，这个速度勉强可以接受，起码比右键另存为快多了！</p>
<h1>实现过程</h1>
<p>首先是如何运行，有2种方法</p>
<ol>
	<li>在Firefox中有一个插件叫做“Greasemonkey”，其作用是可以设点规则，在特定的网站中在网页中嵌入Js文件。直接设置在“pixiv.net”添加Pxer启动文件即可</li>
	<li>利用浏览器书签可以执行js代码的特性，直接将Pxer启动文件代码复制进书签即可</li>
</ol>
<p>在正式发布之前，为了调试方便，采用第二种方法来运行Pxer。</p>
<p>Pxer启动文件大概长这样：</p>
<pre class="code">
javascript:
void(( function() {
	var script=document.createElement("script");
	var date=new Date;
	script.src="http://127.0.0.1/pxer/pxer4.0/js/run_pxer.js?"+date.getTime();
	document.head.appendChild(script);
})());
</pre>
<p>因为代码的开头有“javascript:”，所以复制进书签会当做js代码来解析。代码大体作用是在页面中插入一个本地的js文件，地址127.0.0.1是因为花生为了测试搭建了个wamp环境。</p>
<p>然后真正的pxer运行文件就开始运行了，运行文件大概长这样</p>
<pre class="code">
javascript:
void(( function() {
	pxer_root='http://127.0.0.1/pxer/pxer4.0';
	var load_arr=[
		'http://127.0.0.1/studio/warehouse/js/nut.js',
		'http://127.0.0.1/studio/warehouse/js/nutjs_ex_ajax.js',
		'/js/pxer.js',
		'/js/load.js',
		'/style/pxer.css',
		'/image/favicon.ico'
	];
	/*系统变量*/
	var load_parser={
			'js'	: {
				"tag"	: "script",
				"url"	: "src",
				"add"	:{"type":"text/javascript"}
			},
			'ico'	: {
				"tag"	: "link",
				"url"	: "href",
				"add"	:{"rel":"shortcut icon"}
			},
			'css'	: {
				"tag"	: "link",
				"url"	: "href",
				"add"	:{"rel":"stylesheet"}
			}
	};
	/*载入配置文件*/
	var all_loadElt=[];/*要加载的节点*/
	var temp_url='';
	var temp_elt=null;
	var date=new Date;
	for(var i=0;i&lt;load_arr.length;i++){
		/*将相对路径转换为硬路径*/
		if(/^http/.test(load_arr[i])){
			temp_url=load_arr[i];
		}else{
			temp_url=pxer_root+load_arr[i];
		};
		/*初始化all_arrH*/
		if(/\.(\w+)$/.test(temp_url) &amp;&amp; load_parser[RegExp.$1]){
			temp_elt= document.createElement(load_parser[RegExp.$1].tag);
			temp_elt[(load_parser[RegExp.$1].url)] =temp_url+"?"+date.getTime();
			if(load_parser[RegExp.$1].add){
				for(var key in load_parser[RegExp.$1].add){
					temp_elt.setAttribute( key, (load_parser[RegExp.$1].add)[key] );
				};
			};
			all_loadElt.push(temp_elt);
		}else{
			alert('Error:\nunknow URL type in "'+load_arr[i]+'"');
			throw new Error();
		};
	};
	/*载入节点*/
	for(var i=0;i&lt;all_loadElt.length -1;i++){
		all_loadElt[i].onload=function(){
			for(var i=0;i&lt;all_loadElt.length -1;i++){
				if(this == all_loadElt[i]){
					document.head.appendChild(all_loadElt[i+1]);
				}
			}
		};
	};
	document.head.appendChild(all_loadElt[0]);
})());
</pre>
<p>这个是真正的Pxer运行代码，在页面中插入很多个Pxer必备的文件，其中包括了一个叫做nutjs的小js类库。</p>
<p>程序运行到这一步，程序界面也差不多出来了，大概在P站的这个位置</p>
<p><img src="image/excerpts/e4_1.png" alt="pxer"></p>
<p>在网页中有一个Pxerβ 4.0就是Pxer的界面，按照花生喜欢的风格设计的，与P站本身融于一体，即使日常不用Pxer也不会耽误正常的访问。</p>
<p>如果完整展开，Pxer是有很多个模块的，完整展开大概长这样</p>
<p><img src="image/excerpts/e4_2.png" alt="pxer"></p>
<p>实际上页面内容根据版本的更新实在不断的变化的。实际上写起这个爬虫，感觉其中的难度比花生想象的难度要大很多，因为要考虑到所有的情况，用户有可能在任何页面使用Pxer点击任何功能。随便放出其中的一个控制函数大家感受下</p>
<pre class="code">
PxGet.prototype.	get				=function(){		//中央控制函数,递归？
	if(this.address){
		this.fn(this.address);
	}else{
		if(this.material){
			this.getAddress();
		}else{
			if(this.murl){
				this.getMaterial();
			}else{
				if(this.type){
					if(this.workid){
						switch (this.type){
							case 'pic':
								if(this.workhtml){
									this.material=this.workhtml;
									this.get();
								}else{
									this.getMurl();
								};
								break;
							case 'ids':
								this.getMurl();
								break;
							case 'zip':
								console.warn("Does not support "+this.workid);
								this.fn(null);
								break;
							default:
								throw new Error("PxGet unknow pagn type");
						};
					}else{
						if(this.wurl){
							this.getWorkid('url');
						}else{
							if(this.workhtml){
								this.getWorkid('html');
							}else{
								throw new Error("PxGet unknow do something");
							};
						};
					};
				}else{
					if(this.workhtml){
						this.getType();
					}else{
						if(this.wurl){
							this.getWorkhtml();
						}else{
							if(this.workid){
								this.getWurl();
							}else{
								throw new Error("PxGet unknow do something");
							};
						};
					};
				};
			};
		};
	};
};
</pre>
<p>还好花生这次机智的采用了面向对象的写法，比之前的面向过程清晰不少，而且代码量也少了很多。<br>
不过依旧比较乱<br>
<p><img src="image/excerpts/e4_0.jpg" alt="pxer"></p>
<p>由于最近非常忙，所以这个项目也就一直搁浅着，希望有机会能把它完整的写出来吧</p>
