const router=require("koa-router")();
const method=require("../../modules/methods_node.js");

//友情链接主页
router.get("/",async ctx=>{
    let page=ctx.query.page || 1;
    let pageSize=8;
    var json={
        page:page,
        pageSize:pageSize,
        sortJson:{
            "add_time":-1,
        }
    }
    let count=await DB.count('link',{});
    if(count == 0){
        var  totalpage=1;
    }else{
        var  totalpage=Math.ceil(count/pageSize)
    }
    let res=await DB.find('link',{},{},json);
    console.log(res);

    if(res!=undefined){
        ctx.render("admin/link/list",{
            list:res,
            page:page,
            totalPages:totalpage
        })
    }
});

//友情链接添加页面
router.get("/add",async ctx=>{
    ctx.render("admin/link/add")
});

//友情链接添加提交信息
router.post("/doAdd",method.img_upload().single('link_img_url'),async ctx=>{
    let title=ctx.req.body.title.trim();
    let link_img=ctx.req.file.path.substr(6);
    let img_name=ctx.req.file.originalname;
    let link=ctx.req.body.link;
    let sort=ctx.req.body.sort;
    let status=ctx.req.body.status;
    let add_time=method.getdate();
        var params={
            title,link_img,link,sort,status,add_time,img_name
        }

    var res=await DB.insert('link',params);
    if(res){
        ctx.redirect(ctx.state._host+"/admin/link")
    }else{
        ctx.render('admin/error',{
            message:"链接图编辑失败！",
            redirect:ctx.state._host+"/admin/link"
        })
    }
});

//友情链接编辑页面
router.get("/edit",async ctx=>{
    let id=ctx.query.id;
    let res=await DB.find('link',{'_id':DB.getobjectid(id)});
    console.log(res);
    console.log(ctx.state.G.prevPage);

    if(res!=undefined && res!=""){
        ctx.render('admin/link/edit',{
            list:res[0],
            prevPage:ctx.state.G.prevPage,
        })
    }else{
        ctx.render('admin/error',{
            message:"编辑失败",
            redirect:ctx.state._host+"/admin/link"
        })
    }
});

//友情链接编辑信息提交
router.post("/doEdit",method.img_upload().single('link_img_url'),async ctx=>{
    console.log(ctx.req.body);
    let id=ctx.req.body.id;
    let title=ctx.req.body.title.trim();
    let link_img=ctx.req.file ? ctx.req.file.path.substr(6) : '';
    let img_name=ctx.req.file ? ctx.req.file.originalname:'';
    let link=ctx.req.body.link;
    let sort=ctx.req.body.sort;
    let status=ctx.req.body.status;
    let add_time=method.getdate();
    let prevPage=ctx.req.body.prevPage;
    if(link_img){
        var params={
            title,link_img,link,sort,status,add_time,img_name
        }
    }else{
        var params={
            title,link,sort,status,add_time,img_name
        }
    }
    var res=await DB.update('link',{"_id":DB.getobjectid(id)},params);
    if(res){
        if(prevPage){
            ctx.redirect(prevPage)
        }else {
            ctx.redirect(ctx.state._host + "/admin/link")
        }
    }else{
        ctx.render('admin/error',{
            message:"链接图添加失败！",
            redirect:ctx.state._host+"/admin/link"
        })
    }

});

module.exports=router.routes();