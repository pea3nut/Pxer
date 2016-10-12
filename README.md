# Pxer

<p align="left">
	<img alt="" src="https://img.shields.io/badge/JavaScript-ES6-green.svg" />
	<img alt="" src="https://img.shields.io/badge/install-Greasemonkey-green.svg" />
	<img alt="" src="https://img.shields.io/badge/jQuery-No-red.svg" />
	<img alt="" src="https://img.shields.io/badge/Node.js-No-red.svg" />
	<img alt="" src="https://img.shields.io/npm/l/express.svg" />
</p>


纯客户端JavaScript编写的[pixiv.net](http://www.pixiv.net)爬虫，上线一周内被上万次使用！

## 快速链接

- 导航：[起步：Pxer 6](http://pea.nutjs.com/e609)
- 教程：[如何取得Pxer的使用授权？](http://pea.nutjs.com/e611)
- 教程：[如何安装Pxer？](http://pea.nutjs.com/e614)
- 教程：[Pxer使用教程](http://pea.nutjs.com/e616)
- 安装：通过诸如Greasemonkey的浏览器扩展安装Pxer[稳定版](http://pxer.nutjs.com/pxer6/lib/pxer.user.js)或[开发版](http://pxer.nutjs.com/pxer6/src/pxer.user.js)

> 稳定版需要授权后使用，开发版可以直接安装使用，但是可能会在未来被移除或调整，请仅将开发版作为试用体验。

## 文档说明

本篇文档面向拥有一定开发能力的开发人员，若仅仅是想使用Pxer请直接参考[起步：Pxer 6](http://pea.nutjs.com/e609)即可，无需阅读此文档。

## 快速体验Pxer

Pxer是一个纯JS编写的爬虫，可以直接在浏览器里运行。

Pxer最大作用是将pixiv.net网站（类似于花瓣网）中的图片作品快速的抓取下来，它不是简单的检索img标签，而是通过一定的算法和Ajax请求来完成更复杂的功能。

你可以通过下面流程快速体验Pxer的强大功能：

1. 在[Pixiv网站](http://www.pixiv.net)登陆注册一个账号
2. 打开“[机器猫 - 哆啦A梦](http://www.pixiv.net/search.php?s_mode=s_tag&word=%E3%83%89%E3%83%A9%E3%81%88%E3%82%82%E3%82%93%20000user)”的图片检索页面
3. 在浏览器运行[pxer.user.js](http://pxer.nutjs.com/pxer6/src/pxer.user.js)代码（将代码文件复制到控制台运行或存成书签点击运行）
4. 操作页面中Pxer UI界面

## 运行原理说明

Pxer启动的本质是将js文件载入进网页页面，阅读`pxer.user.js`的代码就可以发现：它做的仅仅是将项目的`launcher.js`文件载入进页面。

而Pxer的爬取功能则是利用了Ajax通过一定的算法批量的去请求特定页面，然后解析HTML筛选数据。有时碍于Ajax的限制（读写请求头），Pxer在请求过程中会使用一些较为“巧妙”的方式来规避。

## 部署配置说明

如果你需要在本地环境中部署运行Pxer客户端，可以参见下文。

本地部署Pxer需要有**服务器环境**，请自行配置。

在Pxer项目中`./src`为最新的源码目录，其中的文件未经过压缩且保留了测试代码和数据，如果要调试Pxer可以使用`./src`目录文件。

`./lib`为释出目录，当Pxer趋于稳定时会更新目录代码，如果要简单的使用Pxer建议使用`./lib`目录的文件运行Pxer。

`./src`与`./lib`都包含用户代码`pxer.user.js`文件。将其中的`pxer.user.js`稍作修改，放在浏览器中运行即可启动Pxer。

`pxer.user.js`文件配置参数说明：

- URL_ROOT：指向Pxer的主目录
- DEBUG：调试模式，若开启Pxer会在出错的情况下继续保持运行
- CACHE：是否启用缓存，若为false则会在引用每一个文件URL时再末尾加入时间戳来避免浏览器缓存
- TEMPLATE_URL：引用的UI模板，一般来说无需修改

而关于如果将`pxer.user.js`文件文件放入浏览器运行，你可以：

- 通过诸如Greasemonkey的浏览器扩展安装`pxer.user.js`文件，其中Greasemonkey格式注释已写好
- 将`pxer.user.js`文件内容存成浏览器书签，点击运行
- 将`pxer.user.js`文件内容复制在Web控制台中运行

`./lib`目录中的`pxer.core.js`文件是用JSCompress将目录`./src`部分目录文件合并而成的。在`./lib`目录保留了JSCompress的配置文件，同时你也可以参考`./src/script/launcher.js`文件对`./src`目录进行合并。

而压缩，由于Pxer大量使用ES6语法，导致压缩工具无法进行语义分析，因此js文件的压缩过程仅仅是移除注释、空格、换行符，压缩过程中注意`'use strict';`在第一行，以及部分文件可能需要手动调整ES6模板字符串。压缩网站：[javascriptcompressor.com](http://javascriptcompressor.com/)

## 开源协议

MIT


