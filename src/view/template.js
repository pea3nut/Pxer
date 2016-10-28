'use strict';

pxerDefinePxerConfig["PXER_TPL"]=`\
<div id="pxer">

    <nav class="pxer-nav navbar navbar-default">
        <div class="container-fluid">
            <div class="navbar-header">
                <a href="#" class="navbar-brand">Pxer <em class="">β </em>6</a>
            </div>
            <ul class="nav navbar-nav navbar-right"></ul>
            <div class="navbar-right pxer-sign-btn" pxer-bind="hasFailTask">
                <button class="btn btn-warning navbar-btn glyphicon" pxer-button="warn"><span class="glyphicon glyphicon-warning-sign"></span></button>
                <span class="badge" pxer-bind="failTaskLength">-1</span>
            </div>
            <button class="btn btn-success navbar-btn navbar-right" pxer-button="run">　</button>
        </div>
    </nav>


    <div class="pxer-warn panel panel-default" pxer-window="warn" pxer-bind="hasFailTask" style="display: none;">
        <table class="table">
            <thead class="t-head">
                <tr>
                    <td>图片ID</td>
                    <td>失败原因</td>
                    <td>解决方案</td>
                    <td width="160" class="text-right">
                        <button class="btn btn-default btn-sm" pxer-button="again">重试选中</button>
                        <button class="btn btn-default btn-sm" pxer-button="selectAllfw">全选</button>
                    </td>
                </tr>
            </thead>
            <tbody pxer-bind="failList"></tbody>
        </table>
    </div>
    
    
    <div class="pxer-inf container-fluid" pxer-window="inf" style="display: none;">
        <div class="row">
            <div class="col-xs-3">
                <div class="panel panel-default">
                    <div class="panel-heading">程序状态</div>
                    <table class="table">
                        <tr>
                            <td>主程序版本：</td>
                            <td pxer-const="version"></td>
                        </tr>
                        <tr>
                            <td>当前状态：</td>
                            <td pxer-bind="state">初始化</td>
                        </tr>
                        <tr>
                            <td>已运行时间：</td>
                            <td pxer-bind="record">0:00</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="col-xs-3">
                <div class="panel panel-default">
                    <div class="panel-heading">配置信息</div>
                    <table class="table pxer-cinfig-inputgroup">
                        <tr>
                            <td>线程数：</td>
                            <td><input pxer-config="thread" class="form-control" type="text" /></td>
                        </tr>
                        <tr>
                            <td>等待时间：</td>
                            <td><input pxer-config="timeout" class="form-control" type="text" /></td>
                        </tr>
                        <tr>
                            <td>重试次数：</td>
                            <td><input pxer-config="maxRetry" class="form-control" type="text" /></td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="col-xs-3">
                <div class="panel panel-default">
                    <div class="panel-heading">当前页面信息</div>
                    <table class="table">
                        <tr>
                            <td>页面类型：</td>
                            <td pxer-bind="pageType">画师作品页</td>
                        </tr>
                        <tr>
                            <td>作品数量：</td>
                            <td pxer-bind="worksNum">233</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="col-xs-3">
                <div class="panel panel-default">
                    <div class="panel-heading">执行进度</div>
                    <table class="table">
                        <tr>
                            <td>总任务数：</td>
                            <td pxer-bind="pret">9</td>
                        </tr>
                        <tr>
                            <td>已完成：</td>
                            <td pxer-bind="finish">3</td>
                        </tr>
                        <tr>
                            <td>剩余时间：</td>
                            <td pxer-bind="forecast">0:45</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>


    <div class="pxer-print container-fluid" pxer-window="print" style="display: none;">
        <div class="row">
            <div class="col-xs-7">
                <div class="panel panel-default">
                    <form pxer="print_filter">
                        <div class="panel-heading">过滤选项</div>
                        <ul class="list-group">
                            <li class="list-group-item form-inline">
                                <div class="form-group">
                                    <label class="control-label">总分必须大于</label>
                                    <input type="number" class="form-control" pxer-config="score" />
                                </div>
                                <div class="form-group">
                                    <label class="control-label">平均分必须大于</label>
                                    <input type="number" class="form-control" pxer-config="avg" />
                                </div>
                            </li>
                            <li class="list-group-item">
                                <div class="form-group">
                                    <label class="control-label">作品中<strong>不能</strong>含有以下<strong>任意一个</strong>标签</label>
                                    <input pxer-config="no_or_tag" type="text" class="form-control" placeholder="可以有多个，空格分割" />
                                </div>
                            </li>
                            <li class="list-group-item">
                                <div class="form-group">
                                    <label class="control-label">作品中<strong>不能同时</strong>含有以下<strong>所有</strong>标签</label>
                                    <input pxer-config="no_and_tag" type="text" class="form-control" placeholder="可以有多个，空格分割" />
                                </div>
                            </li>
                            <li class="list-group-item">
                                <div class="form-group">
                                    <label class="control-label">作品中<strong>必须</strong>含有以下<strong>任意一个</strong>标签</label>
                                    <input pxer-config="yes_or_tag" type="text" class="form-control" placeholder="可以有多个，空格分割" />
                                </div>
                            </li>
                            <li class="list-group-item">
                                <div class="form-group">
                                    <label class="control-label">作品中<strong>必须同时</strong>含有以下<strong>所有</strong>标签</label>
                                    <input pxer-config="yes_and_tag" type="text" class="form-control" placeholder="可以有多个，空格分割" />
                                </div>
                            </li>
                        </ul>
                    </form>
                </div>
            </div>
            <div class="col-xs-5">
                <div class="panel panel-default">
                    <div class="panel-heading">输出选项</div>
                    <ul class="list-group form-horizontal">
                        <li class="list-group-item">
                            <div class="form-group">
                                <label class="col-sm-4 control-label">单张插画</label>
                                <div class="col-sm-8">
                                    <select class="form-control" pxer-config="illust_single">
                                        <option value="max">最大</option>
                                        <option value="600p">600p</option>
                                        <option value="no">不输出</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                        <li class="list-group-item">
                            <div class="form-group">
                                <label class="col-sm-4 control-label">多张插画</label>
                                <div class="col-sm-8">
                                    <select class="form-control" pxer-config="illust_medium">
                                        <option value="max">最大</option>
                                        <option value="1200p">1200p</option>
                                        <option value="cover_600p">仅封面（600p）</option>
                                        <option value="no">不输出</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                        <li class="list-group-item">
                            <div class="form-group">
                                <label class="col-sm-4 control-label">单张漫画</label>
                                <div class="col-sm-8">
                                    <select class="form-control" pxer-config="manga_single">
                                        <option value="max">最大</option>
                                        <option value="600p">600p</option>
                                        <option value="no">不输出</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                        <li class="list-group-item">
                            <div class="form-group">
                                <label class="col-sm-4 control-label">多张漫画</label>
                                <div class="col-sm-8">
                                    <select class="form-control" pxer-config="manga_medium">
                                        <option value="max">最大</option>
                                        <option value="1200p">1200p</option>
                                        <option value="cover_600p">仅封面（600p）</option>
                                        <option value="no">不输出</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                        <li class="list-group-item">
                            <div class="form-group">
                                <label class="col-sm-4 control-label">动图</label>
                                <div class="col-sm-8">
                                    <select class="form-control" pxer-config="ugoira">
                                        <option value="max-no">最大压缩包</option>
                                        <option value="600p-no">600p压缩包</option>
                                        <option value="max-yes">最大压缩包 + 参数</option>
                                        <option value="600p-yes">600p压缩包 + 参数</option>
                                        <option selected="selected" value="no-no">不输出</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                        <li class="list-group-item text-right form-inline">
                            <div class="alert alert-info text-left" role="alert" pxer-bind="taskInfo" pxer-window="taskInfo" style="display:none"></div>
                            <button class="btn btn-info" pxer-button="count">计算</button>
                            <button class="btn btn-success" pxer-button="echo">输出</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

</div>`;
