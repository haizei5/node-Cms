const router=require("koa-router")();
const DB=require("../../modules/db.js");
const methods_node=require("../../modules/methods_node.js");

//分类管理首页
router.get("/",async ctx=>{
    let pageSize = 8;
    let page = ctx.query.page || 1;
    var json = {
        pageSize,
        page,
        sortJson: {
            'add_time': -1,               //根据添加时间进行排序
        }
    }
    let count = await DB.count('first_menu', {});
    let res=await DB.find("first_menu",{},{},json);
    let res_sec=await DB.find('second_menu',{});
    if (count == 0) {
        var totalpage = 1;
    } else {
        var totalpage = Math.ceil(count / pageSize)
    }
    if(res!=""){
        //console.log(res);
        //console.log(res_sec);


        //console.log(methods_node.data_spilt(res,res_sec));
        ctx.render("admin/articlecate/index",{
            list:methods_node.data_spilt(res,res_sec),
            page: page,
            totalPages: totalpage,

        });
    }else{
        ctx.redirect("admin/error",{
            message:res,
            redirect:ctx.state._host+"admin/articlecate/index"
        })
    }
})

//分类管理添加
router.get("/add",async ctx=>{
    let res=await DB.find('first_menu',{});
    let res_sec=await DB.find('second_menu',{});
    //console.log(ctx.state.G.prevPage);
    ctx.render("admin/articlecate/add",{
            catelist:res,
            seclist:res_sec,
    })
})


//分类管理编辑
router.get("/edit",async ctx=>{
    let id=ctx.query.id;
    let res_first=await DB.find('first_menu',{'_id':DB.getobjectid(id)});
    let res_second=await DB.find("second_menu",{'_id':DB.getobjectid(id)});
    let firstlist=await DB.find('first_menu',{});
    if(res_first!=undefined && res_first!="") {
        var list = res_first[0];
    }else{
        var list = res_second[0];
    }
    if(list!=undefined && list!="") {
        ctx.render("admin/articlecate/edit",{
            list:list,
            catelist:firstlist
        });
    }else{
        ctx.redirect("admin/error",{
            message:res,
            redirect:ctx.state._host+"admin/articlecate/index"
        })
    }
})

//分类管理提交增加信息
router.post("/doadd",async ctx=>{
    //console.log(ctx.request.body);

    let params=ctx.request.body;
    let title=ctx.request.body.title;
    if(ctx.request.body.pid == '0') {
        var res_find = await DB.find('first_menu', {"title": title});
        var res_in = await DB.insert('first_menu', params);
    }else{
        var res_find = await DB.find('second_menu', {"title": title});
        var res_in = await DB.insert('second_menu', params);
    }
    //console.log(res_find);

    if(res_find!=undefined && res_find.length>0){
        return ctx.body = {"message": "添加分类已存在！", "success": false}
    }else {
        if (res_in) {
            return ctx.body = {"url": ctx.state._host + "/admin/articlecate", "message": "分类添加成功", "success": true}
        } else {
            return ctx.body = {"message": "分类添加失败！", "success": false}
        }
    }
})

//分类管理提交编辑信息
router.post("/doEdit",async ctx=>{
    let id=ctx.request.body.id;
    let params=ctx.request.body;
    if(ctx.request.body.pid !='0'){
        var res_up=await DB.update('second_menu',{"_id":DB.getobjectid(id)},params);
    }else{
        var res_up=await DB.update('first_menu',{"_id":DB.getobjectid(id)},params);
    }
        if (res_up) {
            return ctx.body = {"url": ctx.state._host + "/admin/articlecate", "message": "分类修改成功", "success": true}
        } else {
            return ctx.body = {"message": "分类修改失败！", "success": false}
        }
})


module.exports=router.routes();