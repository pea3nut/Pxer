# Pxer

<p align="left">
	<img alt="" src="https://img.shields.io/badge/JavaScript-ES6-green.svg" />
	<img alt="" src="https://img.shields.io/badge/install-Greasemonkey-green.svg" />
	<img alt="" src="https://img.shields.io/badge/Test-mocha-blue.svg" />
	<img alt="" src="https://img.shields.io/badge/jQuery-No-red.svg" />
	<img alt="MIT" src="https://img.shields.io/npm/l/express.svg" />
</p>


纯客户端JavaScript编写的[pixiv.net](http://www.pixiv.net)爬虫，上线一周内被使用上万次！

<img src="/src/public/pxer-ui-gif.gif?raw=true" />

## 快速链接

- 导航：[官网：pxer.pea3nut.org](http://pxer.pea3nut.org/)
- 导航：[起步：Pxer 7](http://pxer.pea3nut.org/md/start)
- 教程：[如何取得Pxer的使用授权？](http://pxer.pea3nut.org/md/accredit)
- 教程：[如何安装Pxer？](http://pxer.pea3nut.org/md/install)
- 教程：[Pxer使用教程](http://pxer.pea3nut.org/md/accredit)
- 安装：通过诸如Greasemonkey的浏览器扩展安装Pxer[稳定版](http://pxer.pea3nut.org/pxer-app/pxer-master.user.js)或[开发版](http://pxer.pea3nut.org/pxer-app/pxer-dev.user.js)

> 稳定版需要授权后使用，开发版可以直接安装使用，但是可能会在未来被移除或调整，请仅将开发版作为试用体验。

## 文档说明

本篇文档面向拥有一定开发能力的开发人员，若仅仅是想使用Pxer请直接参考[起步：Pxer 6](http://pxer.pea3nut.org/md/start)即可，无需阅读此文档。

## 快速体验Pxer

Pxer是一个纯JS编写的爬虫，可以直接在浏览器里运行。

Pxer最大作用是将pixiv.net网站（类似于花瓣网）中的图片作品快速的抓取下来。它不是简单的检索img标签，而是通过一定的算法和Ajax请求来完成更复杂的功能。

你可以通过下面流程快速体验Pxer的强大功能：

1. 在[Pixiv网站](http://www.pixiv.net)登陆注册一个账号
2. 打开“[机器猫 - 哆啦A梦](http://www.pixiv.net/search.php?s_mode=s_tag&word=%E3%83%89%E3%83%A9%E3%81%88%E3%82%82%E3%82%93%20000user)”的图片检索页面
3. 在浏览器运行[pxer.user.js](http://pxer.pea3nut.org/pxer-app/pxer-dev.user.js)代码（将代码文件复制到控制台运行或存成书签点击运行）
4. 操作页面中Pxer UI界面

## 运行原理说明

Pxer启动的本质是将js文件载入进网页页面，阅读`pxer.user.js`的代码就可以发现：它做的仅仅是将项目的`jsonp.js`文件载入进页面。

而Pxer的爬取功能则是利用了Ajax通过一定的算法批量的去请求特定页面，然后解析HTML筛选数据。有时碍于Ajax的限制（读写请求头），Pxer在请求过程中会使用一些较为“巧妙”的方式来规避。

## 项目说明

Pxer使用原生的Node.js来构建，但是实际上，你**无需**任何Node.js基础依然可以阅读Pxer的源码。

Pxer在开发过程中避免对Node产生依赖性使得仅有Js基础的初学者也可以无障碍的阅读Pxer源码。

项目目录参考：
```text
pxer-app
    build - 构建目录，存放自动化生产文件
    dist  - 正式版释出目录
    src   - Pxer源码目录，与Node.js解耦！
```

## 自己动手构建Pxer

【待补完】

## 开源协议

MIT


