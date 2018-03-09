$(function(){
    setTimeout(function(){
        $("div.button").click();
        setTimeout(function(){
            $(".sms-input input")[0].focus();
            var btn = $(".mint-popup div.button");
            $(".sms-input input").keydown(function(e){
                if(e.keyCode==13){
                    btn.click();
                    setTimeout(function(){
                        $("div.button").click();
                        setTimeout(function(){
                            $(".sms-input input")[0].focus();
                        }, 1000);
                    }, 500);
                }
            });
        }, 1000);

        var rare = $(".tag-info .rareDegree").text();
        var title = $("title").text();
        var timeout = 180;
        var timer = setInterval(function(){
            timeout-=1;
            $("title").text(rare + " : " + timeout + " - " + title);
            if(timeout<=0) clearInterval(timer)
        }, 1000);
    }, 200);
});