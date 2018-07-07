### [寻求Contributor，为Pxer续一秒！](https://github.com/pea3nut/Pxer/issues/64)

---

# Pxer

<p align="left">
	<img alt="" src="https://img.shields.io/badge/JavaScript-ES6-green.svg" />
	<img alt="" src="https://img.shields.io/badge/install-Tampermonkey-green.svg" />
	<img alt="" src="https://img.shields.io/badge/Test-mocha-blue.svg" />
	<img alt="" src="https://img.shields.io/badge/jQuery-No-red.svg" />
	<img alt="MIT" src="https://img.shields.io/npm/l/express.svg" />
</p>


纯客户端JavaScript编写的[pixiv.net](https://www.pixiv.net)爬虫，上线一周内被使用上万次！

不仅人人可用，且代码经过精心注释可供参考~

> 文档尚未完善

<img src="/src/public/pxer-ui-gif.gif?raw=true" />

## 快速链接

- 官网：[pxer.pea3nut.org](http://pxer.pea3nut.org/)
- 教程：[起步：Pxer](http://pxer.pea3nut.org/md/start)
- 教程：[安装教程](http://pxer.pea3nut.org/md/install)
- 教程：[使用手册](http://pxer.pea3nut.org/md/use)
- 安装：通过[Tampermonkey浏览器扩展](http://tampermonkey.net/)安装Pxer [开发版（推荐）](https://pxer-app.pea3nut.org/pxer-dev.user.js) / [稳定版](https://pxer-app.pea3nut.org/pxer-master.user.js)

> 稳定版几乎支持市面上所有主流浏览器，而开发版则拥有更新的功能及更高的性能！

## 文档说明

本篇文档面向拥有一定开发能力的开发人员，若仅仅是想使用Pxer请直接参考[起步：Pxer](http://pxer.pea3nut.org/md/start)即可，无需阅读此文档。

## 快速体验Pxer

Pxer是一个纯客户端JavaScript编写的爬虫，无需任何配置即可直接在浏览器端运行。

Pxer最大作用是将pixiv.net网站（类似于花瓣网）中的图片作品快速的抓取下来。它不是简单的检索img标签，而是通过一定的算法和Ajax请求来完成更复杂的功能。

你可以通过下面流程快速体验Pxer的强大功能：

1. 在[Pixiv网站](https://www.pixiv.net)登陆注册一个账号
2. 打开“[机器猫 - 哆啦A梦](https://www.pixiv.net/search.php?s_mode=s_tag&word=%E3%83%89%E3%83%A9%E3%81%88%E3%82%82%E3%82%93%20000user)”的图片检索页面
3. 在浏览器运行[pxer.user.js](https://pxer-app.pea3nut.org/pxer-master.user.js)代码（将代码文件复制到控制台运行或存成书签点击运行）
4. 操作页面中PxerUI界面

## 阅读源码

Pxer开发过程中十分注意代码可读性，且使用[jsDOC](http://www.css88.com/doc/jsdoc/)进行良好的注释进一步增强可读性。

Pxer使用ECMAScript 6进行开发，如果你正在学习它，那么Pxer或许可以带给你许些启发。

如果你十分苦恼于寻找一个个人项目练手，或许阅读Pxer源码后你也会有兴趣来写一个很酷的JavaScript爬虫~~

## 运行原理说明

Pxer启动的本质是将js文件载入进网页页面，阅读`/pxer-dev.user.js`的代码就可以发现：它做的仅仅是将项目的`/jsonp.js`文件载入进页面。

而Pxer的爬取功能则是利用了Ajax通过一定的算法批量的去请求特定页面，然后解析HTML筛选数据。有时碍于Ajax的限制，Pxer在请求过程中会使用一些较为“巧妙”的方式来规避。

## 项目说明

Pxer使用原生的Node.js来构建，但是实际上，你**无需**任何Node.js基础依然可以阅读Pxer的源码。

Pxer在开发过程中避免对Node产生依赖性使得仅有Js基础的初学者也可以无障碍的阅读Pxer源码。

- 纯客户端JavaScript实现的爬虫
- 良好的jsDOC格式注释
- 完全面向对象的模块化设计
- 使用原生Nodejs进行构建
- 主程序使用原生ES6实现，无任何第三方依赖
- 使用mocha进行单元测试
- 维护近3年，迭代超过20个版本

项目目录参考：
```text
pxer-app
    build - 构建目录，存放自动化构建文件
    dist  - 稳定版释出目录
    src   - 开发版、Pxer源码目录，与Node.js解耦！
    pxer-dev.user.js    - 开发版的Pxer运行文件
    pxer-master.user.js - 稳定版的Pxer运行文件
    jsonp.js - pxer-app入口文件
```

## 自己动手构建Pxer

【待补完】

## 开源协议

[MIT](http://opensource.org/licenses/MIT)


