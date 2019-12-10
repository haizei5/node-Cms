
//封装html方法
var app={
    //处理get
    toggle:function(el,collectionName,attr,id){
        $.get('/admin/changeStatus',{collectionName:collectionName,attr:attr,id:id},function(data) {
            if (data.success) {
                if (el.src.indexOf('yes') != -1) {
                    el.src = '/admin/images/no.gif';
                } else {
                    el.src = '/admin/images/yes.gif';
                }
            }
            app.warning(data);
        })

    },

    //处理post数据
    method:function(url,data,bool){
        if(data.pid=="0"){
            swal({
                title: "顶级分类添加后不可删除！",
                text: "",
                type: "warning",
                showCancelButton: "true",
                showConfirmButton: "true",
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                allowOutsideClick:false,
            }).then(function (isConfirm) {
                if(isConfirm.value===true) {
                    $.ajax({
                        url: url,
                        type: 'post',
                        dataType: 'json',
                        ContentType: 'application/json; charset=utf-8',
                        data: data,
                        //cache: false,
                        //contentType: false,
                        /*async:false,*/
                        success: function (data) {
                            if (data.success == true) {
                                if (data.message != "登录") {
                                    app.warning(data);
                                } else {
                                    window.location.href = data.url;
                                }
                            } else {
                                app.warning(data);
                            }
                        },
                        error: function (e) {
                            console.log(e);

                        }
                    })
                }
            });
        }else {
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                ContentType: 'application/json; charset=utf-8',
                data: data,
                //cache: false,
                //contentType: false,
                /*async:false,*/
                success: function (data) {
                    if (data.success == true) {
                        if (data.message != "登录") {
                            app.warning(data);
                        } else {
                            window.location.href = data.url;
                        }
                    } else {
                        app.warning(data);
                    }
                },
                error: function (e) {
                    console.log(e);

                }
            })
        }
    },
    //信息提示
    warning:function(str){
        if(str.success == true){
            var type="success";
            var message=str.message
        }else if(str.success == false){
            var type="warning";
            var message=str.message
        }else{
            var type="warning";
            var message=str;
        }
        swal({
            title:message,
            text: '',
            type: type,
            //showCancelButton: true,
            confirmButtonText: 'OK',
            //cancelButtonText: 'No, keep it',
            confirmButtonColor:"#7cd1f9",
            allowOutsideClick:false,
            confirmButtonClass:"",
            buttonsStyling:true
        }).then(function(){
            debugger
            if(str.url) {
                window.location.href = str.url;
            }
        })
    },
    //删除询问框
    delete:function(delete_url,id,dbname){
        debugger;
        swal({
            title: "确定删除吗？",
            text: "",
            type: "warning",
            showCancelButton: "true",
            showConfirmButton: "true",
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            allowOutsideClick:false,
        }).then(function (isConfirm) {
            if(isConfirm.value===true) {
                $.ajax({
                    type: "post",
                    url: delete_url,
                    traditional: true,
                    dataType: "json",
                    data: {
                        "id": id,
                        "dbname": dbname
                    }
                }).done(function (data) {
                    if (data.success == true) {
                        app.warning(data)
                    } else {
                        app.warning(data)
                    }
                }).error(function (data) {
                    swal("OMG", "删除操作失败了!", "error");
                });
            }
        });
    },
    //单选赋值
    radio:function(obj){
        $(obj).parent().siblings().children().removeClass("label_check");
        $(obj).addClass("label_check")
    },
    //文件变化显示
    file:function(obj){
        debugger;
        var filePath=$(obj).val();
        var filePath_length=$(obj).val().lastIndexOf(".");
        var filename_length=$(obj).val().length;
        var file_type=$(obj).val().substring(filePath_length+1,filename_length).toLowerCase();
        $("#img").attr("src",filePath)
        if(file_type.indexOf("jpg")!=-1 || file_type.indexOf("png")!=-1 || file_type.indexOf("gif")!=-1){
            $(".showerror").html("").hide();
            var arr=filePath.split('\\');
            var fileName=arr[arr.length-1];
            $(".showFileName").html(fileName).show();
            $(".showFileName").attr("title",fileName);
        }else{
            $(".showFileName").html("").hide();
            $(".showerror").attr("title","您未上传文件，或者您上传文件类型有误！");
            $(".showerror").html("您未上传文件，或者您上传文件类型有误！").show();
            return false
        }
    },
    //是否上传图片提交校验
    sub_file:function(){
        if($(".showFileName").css('display') != "none"){
            return true;
        }else{
            app.warning("您未上传文件，或者您上传文件类型有误！");
            return false;
        }
    },
    //排序更新
    changeSort:function(el,collectionName,id){
        debugger;
        var sortValue=el.value;
        var sortHide=$("#sort_hid").val();
        if(sortValue != sortHide) {
            $.get('/admin/changeSort', {collectionName: collectionName, id: id, sortValue: sortValue}, function (data) {
                debugger;
                if (data.success) {
                    app.warning(data);
                }
            })
        }else{
            return
        }
    },
    //查询接口
    Check_type:function (collectionName,id) {
        $.get('/admin/checktype',{collectionName: collectionName, id: id},function(data){
            if (data.success) {
                app.warning(data);
            }
        })
    },
    listview:function(str){
            if($(".sub"+str).css('display') != 'none') {
                $("#i"+str).removeClass('icon-xiala').addClass('icon-zhankai');
                $(".sub"+str).hide();
            }else{
                $("#i"+str).addClass('icon-xiala').removeClass('icon-zhankai');
                $(".sub"+str).show();
            }
    },
    menuchange:function(type){
        debugger;
        var id=$('#pid').val();
        if($('#pid').val()!=0) {
            $('#secpid option').hide();
            $('.se' + id).show();
        }
        if(type==undefined) {
            $('#secpid').val(0);
        }

    }

}
