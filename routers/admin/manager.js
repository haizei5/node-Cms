
const router=require("koa-router")();
const DB=require("../../modules/db.js");
const md5=require("../../modules/methods_node.js")
//管理员列表
router.get("/",async ctx=>{
    try{

        let res=await DB.find("user",{});
        //console.log(res);
        await ctx.render('admin/manager/list',{
            list:res
        });

    }catch (e) {
        await ctx.render('admin/error',{
            message:e,
            redirect:ctx.state._host+"admin"
        })
    }
})

//增加管理员页面
router.get("/add",async ctx=>{
    await ctx.render('admin/manager/add');
})

//添加数据至数据库
router.post("/doAdd",md5.img_upload().single("user_img_url"),async ctx=>{
    //console.log(ctx.req.body);
    //console.log(ctx.req.file);

    let user_img=ctx.req.file.path.substr(6);
    let img_name=ctx.req.file.originalname;
    let username=ctx.req.body.username;
    let email=ctx.req.body.email;
    let phone=ctx.req.body.phone;
    let password=md5.md5(ctx.req.body.password);
    let status = 1;
    var params={
        user_img,img_name,email,phone,password,username,status
    };
    let res = await DB.find("user", {"username": ctx.req.body.username});
    if (res!="") {
        ctx.render('admin/error',{
            message:"管理员已存在！",
            redirect:ctx.state.G.prevPage,
        })
    } else {
        let res_in = await DB.insert("user", params);
        if (res_in != undefined) {
            ctx.redirect(ctx.state._host+"/admin/manager");
        } else {
            ctx.render('admin/error',{
                message:"管理员添加失败！",
                redirect:ctx.state.G.prevPage,
            })
        }
    }

})


//编辑管理员页面
router.get("/edit",md5.img_upload().single("user_img_url"),async ctx=>{
    let id=ctx.query.id;
    //console.log(ctx.query);

    let res_find= await DB.find('user',{"_id":DB.getobjectid(id)});
    //console.log(res_find);

    if(res_find!="") {
        await ctx.render('admin/manager/edit', {
            list: res_find[0],
            prevPage:ctx.state.G.prevPage,
        });
    }else{
        ctx.render('admin/error',{
            message:"查询管理员信息失败",
            redirect:ctx.state._host+"admin/manager"
        })
    }
})

//提交修改管理员信息
router.post("/doedit",md5.img_upload().single("user_img_url"),async ctx=>{

    let id=ctx.req.body.id;
    let user_img=ctx.req.file ? ctx.req.file.path.substr(6):'';
    let img_name=ctx.req.file ? ctx.req.file.originalname: '';
    let username=ctx.req.body.username;
    let email=ctx.req.body.email;
    let phone=ctx.req.body.phone;
    let password=md5.md5(ctx.req.body.password);
    let status = ctx.req.body.status;
    let prevPage=ctx.req.body.prevPage;
    if(user_img){
        var params={
            user_img,img_name,email,phone,password,username,status
        };
    }else{
        var params={
            email,phone,password,username,status
        };
    }
    let res_find = await DB.find("user", {"username": ctx.req.body.username});
    if (res_find !="" && res_find.length>1) {
        ctx.render('admin/error',{
            message:"用户名已存在！",
            redirect:ctx.state.G.prevPage,
        })
    } else {
        let res = await DB.update("user", {"_id": DB.getobjectid(id)}, params);
        if (res != undefined) {
            if (prevPage) {
                ctx.redirect(prevPage)
            } else {
                ctx.redirect(ctx.state._host + "/admin/manager")
            }
        } else {
            ctx.render('admin/error', {
                message: "管理员修改失败！",
                redirect: ctx.state.G.prevPage,
            })
        }
    }
})





module.exports=router.routes();