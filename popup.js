$(function () {
    var option;
    chrome.extension.sendMessage({}, function (response) {
        option = response;
        console.log(option);
        $("[name=enable][value="+option.enable+"]").prop("checked", true);
        $("#interval").val(option.interval);
        $("#pageSize").val(option.pageSize);
        $("[name=querySortType][value="+option.querySortType+"]").prop("checked", true);
        $("input[name=threshold]").each(function (i, el) {
            $(this).val(option.thresholds[i]);
        });
    });

    $("#btnOk").click(function () {
        var thresholds = [];
        $("input[name=threshold]").each(function (i, el) {
            thresholds.push(parseFloat($(this).val()?$(this).val():0));
        });
        var new_option = {
            enable: $("[name=enable]:checked").val()==="true",
            interval: parseInt($("#interval").val()?$("#interval").val():option.interval),
            pageSize: parseInt($("#pageSize").val()?$("#pageSize").val():option.pageSize),
            querySortType: $("[name=querySortType]:checked").val(),
            thresholds: thresholds
        };
        chrome.extension.sendMessage(new_option, function (response) {
            option = response;
            console.log(option);
        });
    });
});