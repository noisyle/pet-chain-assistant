(function($, window) {
  var option = {
    enable: false,
    interval: 1000,
    pageSize: 10,
    querySortType: "CREATETIME_DESC",
    autoActive: false,
    thresholds: [0, 0, 0, 0, 0, 0]
  };
  var orders = [];
  var loop = null;
  var rareColors = ['#555', '#5cb85c', '#5bc0de', '#337ab7', '#f0ad4e', '#d9534f'];
  var rareNames = ['普通', '稀有', '卓越', '史诗', '神话', '传说'];
  var alarm;

  function doQuery() {
    if(!option.enable) return;

    var settings = {
      "url": "https://pet-chain.baidu.com/data/market/queryPetsOnSale",
      "method": "POST",
      "headers": {
        "accept": "application/json",
        "content-type": "application/json",
        "cache-control": "no-cache"
      },
      "crossDomain": true,
      "processData": false,
      "data": JSON.stringify({
        pageNo: 1,
        pageSize: option.pageSize,
        querySortType: option.querySortType,
        filterCondition: JSON.stringify({
          // "1": "3",
          "6": "1"
        }),
        petIds: [],
        appId: 1,
        requestId: new Date().getTime()
      })
    }
    
    $.ajax(settings).done(function (response) {
      doQueryCallback(response);
    });
  }

  function doQueryCallback(data) {
    if(data.errorMsg === "success") {
      if(data.data && data.data.petsOnSale) {
        console.log("%s : 查询返回结果%i条", new Date().toLocaleString('chinese', {hour12: false}), data.data.petsOnSale.length);
        data.data.petsOnSale.sort(function(a, b){return b.rareDegree === a.rareDegree ? a.amount - b.amount : b.rareDegree - a.rareDegree}).forEach(function(item, index){
          console.log("id: %s, %c稀有度: %i (%s)%c, 价格: %.2f", item.petId, "color: #fff; background: " + rareColors[item.rareDegree] + ";", item.rareDegree, rareNames[item.rareDegree], "color: #000; background: #fff;", parseFloat(item.amount));
          if(judge(item) && $.inArray(item.id, orders)<0) {
            orders.push(item.id);
            var url = "https://pet-chain.baidu.com/chain/detail?channel=market&petId="+item.petId+"&validCode=";//+item.validCode;
            chrome.tabs.create({url: url, active: option.autoActive}, function(tab){ });
            console.log("发现符合条件的记录，跳转交易页面: %s", url);
            if (alarm.paused) {
              alarm.play();
            }
          }
        });
      }
    }
  }

  function judge(item) {
    var result = false;
    for(var i=0; i<option.thresholds.length; i++) {
      var threshold = option.thresholds[i];
      //console.log(i, threshold, item.rareDegree, parseFloat(item.amount));
      if(threshold>0 && item.rareDegree>=i && parseFloat(item.amount)<=threshold) {
        result = true;
        break;
      }
    }
    return result;
  }

  $(function() {
    doQuery();
    loop = window.setInterval(doQuery, option.interval);
    alarm = new Audio();
    alarm.src = "sound/bell-small.mp3";
    alarm.load();
  });

  chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
      $.extend(option, request);
      orders = [];
      if(loop != null){
        window.clearInterval(loop);
      }
      doQuery();
      loop = window.setInterval(doQuery, option.interval);
      console.log("设置已更新: %O", option);
      sendResponse(option);
  });

})(jQuery, window);

