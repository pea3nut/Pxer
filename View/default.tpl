<div id="pxer">


	<div id="pxer_main">
		<div id="pxer_main_logo">
			<img src="{pxer_url}/View/image/pxer_logo.png" alt="pxer" />
			<span>Pxer<em>β</em><strong>{pxer_version}</strong></span>
		</div>
		<ul id="pxer_main_nav">
			<li class="pxerBtn" id="bn_run"		>加载</li>
			<li class="pxerBtn" id="bn_expert"	>高级玩家</li>
			<li class="pxerBtn" id="bn_lange"	>选择语言</li>
			<li class="pxerBtn" id="bn_about"	>关于</li>
		</ul>
	</div>

	<div id="pxer_about">
		<fieldset>
			<legend>软件信息</legend>
			<p>软件名称：<em>Pxer 像素猎手</em></p>
			<p>制作者：<em><img src="{pxer_url}/View/image/PeA_nut.jpg" alt="PeA" />花生PeA</em></p>
			<p>软件官网：<em><a target="_blank" href="http://pxer.nutjs.com">http://pxer.nutjs.com</a></em></p>
			<p>软件中的任何部分禁止转载！©2015 Nutjs</p>
		</fieldset>
		<fieldset>
			<legend>特别感谢</legend>
			<p>图标提供者：<em><img src="{pxer_url}/View/image/BEBS DESIGN.jpg" alt="BD" />BEBS DESIGN</em></p>
			<p>P站主页：<em><a target="_blank" href="http://www.pixiv.net/member.php?id=11953369">http://www.pixiv.net/member.php?id=11953369</a></em></p>
			<p>Facebook：<em><a target="_blank" href="http://www.facebook.com/bebsdesign">http://www.facebook.com/bebsdesign</a></em></p>
		</fieldset>
		<div class="creatHeight"></div>
	</div>

	<div id="pxer_config">
		<label>线程数<input id="config_thread" class="pxerTxt" type="text" value="4" /></label>
		<label>最大等待时间<input id="config_wait" class="pxerTxt" type="text" value="4" /></label>
		<button class="pxerBtn" id="bn_save">保存参数</button>
		<button class="pxerBtn" id="bn_log">查看日志</button>
		<button class="pxerBtn" id="bn_process" style="direction: none;">显示进程</button>
		<!--button class="pxerBtn" id="bn_process">显示进程</button>
		<button class="pxerBtn" id="bn_filter">开启过滤</button>
		<button class="pxerBtn" id="bn_pause">暂停</button>
		<button class="pxerBtn" id="bn_input">导入配置</button>
		<button class="pxerBtn" id="bn_output">导出配置</button>
		<button class="pxerBtn" id="bn_togif">动图打包插件</button-->

	</div>

	<div id="pxer_showState">
		<fieldset>
			<legend>程序状态</legend>
			<p>版本：<em id="pxer_version">{pxer_version}</em></p>
			<p>状态：<em id="pxer_state" class="pxer_no">等待中</em></p>
			<p>时间：<em id="show_running_time" class="act">0:00</em></p>
		</fieldset>

		<fieldset>
			<legend>请求信息</legend>
			<p>类型：<em id="pxer_page_type">未知</em></p>
			<p>数量：<em id="pxer_works" class="act">000</em></p>
			<p>过滤：<em id="switch_filter" class="pxer_no">禁用</em></p>
		</fieldset>

		<fieldset>
			<legend>执行进度</legend>
			<p>队列：<em id="show_queue_num" class="pxer_no">000</em></p>
			<p>已执行：<em id="show_queue_finish_num" class="pxer_ok">00</em></p>
			<p>剩余时间：<em id="show_remaining_time" class="act">9:99</em></p>
		</fieldset>

		<fieldset class="lastFieldset">
			<legend>执行参数</legend>
			<p>最大等待时间：<em id="show_wait"  class="act">00</em></p>
			<p>线程：<em id="show_thread" class="act">0</em></p>
			<button class="pxerBtn" id="bn_getall">开始执行</button>
		</fieldset>
		<div class="creatHeight"></div>
	</div>

	<div id="pxer_process">
		<fieldset id="pxer_thread">
			<legend>线程</legend>
			<p>状态：<em>等待响应</em></p>
			<p>已完成：<em>0</em></p>
		</fieldset>
	</div>

	<div id="pxer_filter">
		<p>必须包括的标签<input class="pxerTxt" type="text" /></p>
		<p>不能含有的标签<input class="pxerTxt" type="text" /></p>
		<p>评分必须大于<input class="pxerTxt" type="text" /></p>
		<p>收藏数必须大于<input class="pxerTxt" type="text" /></p>
	</div>

	<div id="pxer_print">
		<fieldset>
			<legend>输出配置</legend>
			<p>
				插画：
				<label><input type="radio" name="config_pic" checked="checked" value="Max" />最大</label>
				<label><input type="radio" name="config_pic" value="600p" />600P</label>
				<label><input type="radio" name="config_pic" value="No" />No</label>
			</p>
			<p>
				漫画：
				<label><input type="radio" name="config_ids" value="Max" />最大</label>
				<label><input type="radio" name="config_ids" value="1200p" checked="checked" />1200P</label>
				<label><input type="radio" name="config_ids" value="600p" />仅封面600P</label>
				<label><input type="radio" name="config_ids" value="No" />No</label>
			</p>
			<p>
				动图：
				<label><input type="radio" name="config_zip" value="Max" />最大</label>
				<label><input type="radio" name="config_zip" value="600p" />600P</label>
				<label><input type="radio" name="config_zip" checked="checked" value="No" />No</label>
			</p>
		</fieldset>
		<button class="pxerBtn" id="bn_print">输出</button>
		<div class="creatHeight"></div>
	</div>


</div>