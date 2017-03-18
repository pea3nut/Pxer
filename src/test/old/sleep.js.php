<?php
    sleep($_GET['sleep']);
    if(!empty($_GET['error'])){
        header('HTTP/1.1 404');
        header("status: 404 Not Found");
    }else{
        echo 'console.log("sleep '.$_GET['sleep'].'s over ")';
    };