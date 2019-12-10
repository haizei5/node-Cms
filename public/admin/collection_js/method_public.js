$(function(){
    $(".file").on("change","input[type='file']",function(){
        app.file(this);
    })
    $("#myForm").submit(function(){
        app.sub_file();
    });
    $("#myForm_user").submit(function(){
        app.sub_file();
        let username=$("#username").val();
        let email=$("#email").val();
        let phone=$("#phone").val();
        let password=$("#password").val();
        let rpassword=$("#rpassword").val();
        if(username=="" || email=='' || phone=='' || password=='' || rpassword==''){
            app.warning("请将信息填写完整！");
            return false;
        }else{
            if(password != rpassword){
                app.warning("两次密码输入不一致！");
                return false;
            }
            return true;
        }
    });
    $("#myForm_nav").submit(function(){
        let title=$("#title").val();
        let url=$("#url").val();
        let sort=$("#sort").val();
        if(title=="" || url=='' || sort==''){
            app.warning("请将信息填写完整！");
            return false;
        }else{

            return true;
        }
    })

})