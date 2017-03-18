
~function(st ,si){
    setTimeout =function(fn ,time ,...argn){
        Promise.resolve().then(fn.bind(null ,...argn))
    };
}(setTimeout,setInterval);

