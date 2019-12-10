$(function(){
    var url = "http://" + window.location.host;

//提交方法调用
    $("#save").click(function () {
        let params = {};
        if ($('input[name="username"]').val() == "") {
            app.warning("用户名不能为空");
            return
        }
        if ($('input[name="password"]').val() == "") {
            app.warning("密码不能为空");
            return
        }
        if ($('input[name="code"]').val() == "") {
            app.warning("验证码不能为空");
            return
        }
        var t = $('form').serializeArray();
        $.each(t, function () {
            params[this.name] = this.value;
        });
        app.method(url + "/admin/login/dologin", params);
    })

    $("#code").click(function () {
        $(this).attr("src", url + "/admin/login/code?" + Math.random() * 1000);
    })
})

