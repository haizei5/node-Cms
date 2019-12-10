const router=require("koa-router")();
const method=require("../../modules/methods_node.js");
const DB=require("../../modules/db.js");

//轮播图主页
router.get("/",async ctx=>{
    let pageSize=8;
    let page=ctx.query.page || 1;
    var json={
        pageSize:pageSize,
        page:page,
        sortJson:{
            "sort":1,
        }
    };
    let count=await DB.count('focus',{});
    if(count == 0){
        var  totalpage=1;
    }else{
        var  totalpage=Math.ceil(count/pageSize)
    }
    let res=await DB.find('focus',{},{},json);
    console.log(res[0]);
    console.log(count);

    if(res){
        ctx.render("admin/focus/list",{
            list:res,
            page: page,
            totalPages: totalpage
        });
    }else{
        ctx.render('admin/error',{
            message:"轮播图列表加载失败！",
            redirect:ctx.state._host+"/admin/focus"
        })
    }
})

//添加页面
router.get("/add",async ctx=>{
    let foodtype=await DB.find('foodtype',{});

    ctx.render("admin/food/add",{
        list:foodtype,
    });
})

//添加提交信息
router.post("/doAdd",method.img_upload().single('img_url'),async ctx=>{
    console.log(ctx.req.body);

    let title=ctx.req.body.title;
    let price=ctx.req.body.price;
    let cate_id=ctx.req.body.cate_id;
    let img_url=ctx.req.file.path.substr(6);
    if(ctx.req.file.path==undefined){
        ctx.render('admin/error',{
            message:"您未上传菜品图，或者您上传文件类型有误！",
            redirect:ctx.state._host+"/admin/food/add"
        })
    }
    let img_name=ctx.req.file.originalname;
    let status=ctx.req.body.status;
    let add_time=method.getdate();
    let num=0;
    var params={
        title,img_url,price,status,add_time,img_name,num,cate_id
    }
    var res=await DB.insert('foodcate',params);
    if(res){
        ctx.redirect(ctx.state._host+"/admin/food/add")
    }else{
        ctx.render('admin/error',{
            message:"菜品添加失败！",
            redirect:ctx.state._host+"/admin/focus"
        })
    }
})
//编辑页面
router.get("/focusedit",async ctx=>{
    let id=ctx.query.id;
    let res=await DB.find('focus',{"_id":DB.getobjectid(id)});
    if(res!=undefined && res!=""){
        ctx.render('admin/focus/edit',{
            list:res[0],
            prevPage:ctx.state.G.prevPage,
        })
    }else{
        ctx.render('admin/error',{
            message:"编辑失败！",
            redirect:ctx.state._host+"/admin/focus"
        })
    }
})

//编辑提交信息
router.post("/doEdit",method.img_upload().single('focus_img_url'),async ctx=>{

    let id=ctx.req.body._id;
    let title=ctx.req.body.title;
    let title_der=ctx.req.body.title_der;
    let focus_img=ctx.req.file ? ctx.req.file.path.substr(6) : '';
    let focus_link=ctx.req.body.url;
    let sort=ctx.req.body.sort;
    let status=ctx.req.body.status;
    let add_time=method.getdate();
    let prevPage=ctx.req.body.prevPage;
    if(focus_img) {
        let img_name=ctx.req.file.originalname;
        var params = {
            title, focus_img, focus_link, sort, status, add_time,img_name,title_der
        }
    }else{
        var params = {
            title, focus_link, sort, status, add_time,title_der
        }
    }
    var res=await DB.update('focus',{"_id":DB.getobjectid(id)},params);
    if(res){
        if(prevPage){
            ctx.redirect(prevPage)
        }else {
            ctx.redirect(ctx.state._host + "/admin/focus")
        }
    }else{
        ctx.render('admin/error',{
            message:"轮播图编辑失败！",
            redirect:ctx.state._host+"/admin/focus"
        })
    }
})


module.exports=router.routes();
