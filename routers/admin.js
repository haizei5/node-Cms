/**
 * Created by MK on 2018/12/22.
 * 后台展示路由配置
 */
var router=require("koa-router")();
    ueditor=require("koa2-ueditor");
    DB=require("../modules/db.js");
    url=require("url");//引入url模块
    //各页面路由
    login=require("./admin/login.js");
    manager=require("./admin/manager.js");
    focuspic=require("./admin/focuspic.js");
    articlecate=require("./admin/articlecate.js");
    article=require("./admin/article.js");
    link_url=require("./admin/link.js");
    index=require("./admin/index.js");
    nav=require("./admin/nav.js");
    setting=require('./admin/setting.js');
    food=require('./admin/food.js');



//初始化定义全局变量
router.use(async (ctx,next)=>{
/*    try{*/

        //console.log(ctx.request.header.host);
        ctx.state._host="http://"+ctx.request.header.host;
        let pathname=url.parse(ctx.request.url).pathname; //获取地址文件路径
        //设置全局变量对象
        let split_url=pathname.split("/");
        //console.log(split_url[split_url.length-1]);
        let link_length=await DB.count('link',{});
        let nav_length=await DB.count('nav',{});
        if(ctx.session.userinfo != "" && ctx.session.userinfo != undefined) {
            let params = {};
            params.username=ctx.session.userinfo.username;
            let res = await DB.find("user", params);
            ctx.session.userinfo = res[0];
        }
        ctx.state.G={
            userinfo:ctx.session.userinfo,
            url_type:split_url,
            prevPage:ctx.request.headers['referer'],   /*上一页的地址*/
            link_num:link_length,
            nav_num:nav_length
        }

        //判断权限（session是否存在）
        if(ctx.session.userinfo){
            if(pathname==="/admin/login"){   //如果地址等于登录页面不用跳转
                ctx.redirect("/admin");        //向下继续匹配路由
            }else{
                await next();//跳转回登录页面
            }
        }else{
            if(pathname==="/admin/login" || pathname==="/admin/login/dologin" || pathname==="/admin/login/code"){   //如果地址等于登录页面不用跳转
                await next();         //向下继续匹配路由
            }else{
                ctx.redirect("/admin/login");      //跳转回登录页面
            }
        }
})


//公共删除方法调用
router.post("/remove",async ctx=>{
    let res=await DB.remove(ctx.request.body.dbname,{'_id':DB.getobjectid(ctx.request.body.id)});
    //console.log(res);

    if(res){

        if(ctx.state.G.prevPage.indexOf("?")!=-1){
            var pre_url=ctx.state.G.prevPage.split("?")[0];
        }else{
            var pre_url=ctx.state.G.prevPage;
        }

        return ctx.body={"success":true,"url":pre_url,"message":"已成功删除数据！"}
    }else{
        return ctx.body={"success":false,"message":"未删除数据！"}
    }
    
})


//注意上传图片的路由   ueditor.config.js配置图片post的地址
router.all('/editor/controller', ueditor(['public', {
    "imageAllowFiles": [".png", ".jpg", ".jpeg"],
    "imagePathFormat": "/upload/ueditor/image/{yyyy}{mm}{dd}/{filename}"  // 保存为原文件名
}]))


//配置admin下的路由
router.use(index);
router.use('/login',login);
router.use('/manager',manager);
router.use('/focus',focuspic);
router.use('/articlecate',articlecate);
router.use('/article',article);
router.use('/link',link_url);
router.use('/nav',nav);
router.use('/setting',setting);
router.use('/food',food);

module.exports=router.routes();




