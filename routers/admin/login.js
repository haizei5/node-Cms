const router=require("koa-router")();
const DB =require("../../modules/db.js");//引入数据库封装方法
const md5=require("../../modules/methods_node.js");//引入封装的md5方法
const svgcode=require("svg-captcha");//引入验证码中间件

//登录主页
router.get("/",async ctx=>{
    await ctx.render("admin/login");
})

//登录post提交地址
router.post("/dologin",async ctx=>{
    //console.log(ctx.request.body);
        if(ctx.request.body==""){
            return ctx.body={"message":"登录失败", "success":false}
        }
        let code=ctx.request.body.code.toLowerCase();
        let code_se=ctx.session.code.toLowerCase();
        if(code==code_se) {
            let params = {};
            params.username = ctx.request.body.username;
            //接收返回参数
            let res = await DB.find("user", params);
            //console.log(res[0]);
            //校验用户是否存在
            if(res[0] == undefined || res[0] == null){
                return ctx.body={"message":"此用户不存在", "success":false}
            }else{
                if(md5.md5(ctx.request.body.password)!=res[0].password){
                    return ctx.body={"message":"密码错误！", "success":false}
                }
            }
            if (res!="") {
                ctx.session.userinfo = res[0];
                //更新用户表  改变用户最近登录的时间
                await DB.update('user',{'_id':DB.getobjectid(res[0]._id)},{
                        "last_time":new Date()
                    }
                )
                //console.log(ctx.session.userinfo);
                //ctx.redirect(ctx.state._host + "/admin");
                return ctx.body={"url":ctx.state._host + "/admin","message":"登录", "success":true}

            }
        }else{

            return ctx.body={"message":"验证码错误", "success":false}

        }


})

//用户退出
router.get("/loginout",async ctx=>{
    ctx.session.userinfo=null;
    ctx.redirect(ctx.state._host+"/admin/login");
})


//获取验证码
router.get("/code",async ctx=>{
    var captcha = svgcode.create({
        size:4,
        fontSize: 50,
        width: 120,
        height:34,
        background:"#cc9966"
    });
    ctx.session.code= captcha.text;
    //console.log(ctx.session.code);

    //设置响应头
    ctx.response.type = 'image/svg+xml';
    ctx.body=captcha.data;
})

module.exports=router.routes();
