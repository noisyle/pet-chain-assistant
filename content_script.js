$(function(){
    setTimeout(function(){
        $("div.button").click();
        setTimeout(function(){
            $(".sms-input>input").focus();
            var btn = $(".mint-popup div.button");
            $(".sms-input>input").keydown(function(e){
                if(e.keyCode==13){ 
                    btn.click(); 
                } 
            });
        }, 300);
    }, 200);
});