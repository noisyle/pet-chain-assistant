(function($, window) {
  var option = {
    enable: false,
    interval: 2000,
    pageSize: 20,
    querySortType: "CREATETIME_DESC",
    autoActive: false,
    thresholds: [0, 0, 0, 0, 0, 0]
  };
  var orders = [];
  var loop = null;
  var colors = ['#555', '#5cb85c', '#5bc0de', '#337ab7', '#f0ad4e', '#d9534f'];
  
  var getParam = function() {
    return {
      "pageNo": 1,
      "pageSize": option.pageSize,
      "querySortType": option.querySortType,
      "petIds": [],
      "requestId": new Date().getTime(),
      "appId": 1
    };
  };

  function doQuery() {
    if(!option.enable) return;
    $.ajax({
      url: "https://pet-chain.baidu.com/data/market/queryPetsOnSale",
      type: "POST",
      contentType: 'application/json',
      dataType: "json",
      data: JSON.stringify(getParam()),
      success: doQueryCallback
    });
  }

  function doQueryCallback(data) {
    if(data.errorMsg === "success") {
      if(data.data && data.data.petsOnSale) {
        console.log("%s : 查询返回结果%i条", new Date().toLocaleString('chinese', {hour12: false}), data.data.petsOnSale.length);
        data.data.petsOnSale.sort(function(a, b){return b.rareDegree === a.rareDegree ? a.amount - b.amount : b.rareDegree - a.rareDegree}).forEach(function(item, index){
          console.log("id: %s, %c稀有度: %i%c, 价格: %.2f", item.petId, "color: #fff; background: " + colors[item.rareDegree] + ";", item.rareDegree, "color: #000; background: #fff;", parseFloat(item.amount));
          if(judge(item) && $.inArray(item.id, orders)<0) {
            orders.push(item.id);
            var url = "https://pet-chain.baidu.com/chain/detail?channel=market&petId="+item.petId+"&validCode=";//+item.validCode;
            chrome.tabs.create({url: url, active: option.autoActive}, function(tab){ });
            console.log("发现符合条件的记录，跳转交易页面: %s", url);
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

