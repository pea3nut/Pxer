<?php
    sleep($_GET['sleep']);
    if(!empty($_GET['error'])){
        header('HTTP/1.1 404');
        header("status: 404 Not Found");
    }else{
        header('Content-Type: text/css');
        echo 'body{background:'.$_GET['bg'].';}';
    };