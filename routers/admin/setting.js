const router=require("koa-router")();
const method=require("../../modules/methods_node.js");

router.get("/",async ctx=>{
    //console.log('11');
    let set_result=await DB.find('setting',{});
    ctx.render('admin/setting/index',{
        list:set_result[0],
    });
})

router.post("/doEdit",method.img_upload().single('site_logo'),async ctx=>{
    let id=ctx.req.body.id;
    let site_title=ctx.req.body.site_title;
    let site_logo=ctx.req.file ? ctx.req.file.path.substr(6) : '';
    let img_name=ctx.req.file ? ctx.req.file.originalname:'';
    let site_keywords=ctx.req.body.site_keywords;
    let site_description=ctx.req.body.site_description;
    let site_icp=ctx.req.body.site_icp;
    let site_qq=ctx.req.body.site_qq;
    let site_phone=ctx.req.body.site_phone;
    let site_address=ctx.req.body.site_address;
    let site_status=ctx.req.body.site_status;
    let add_time=method.getdate();
    if(site_logo){
        var params={
            site_title,site_logo,site_keywords,site_description,site_icp,add_time,img_name,site_qq,site_phone,site_address,site_status
        }
    }else{
        var params={
            site_title,site_keywords,site_description,site_icp,add_time,img_name,site_qq,site_phone,site_address,site_status
        }
    }
    var res=await DB.update('setting',{"_id":DB.getobjectid(id)},params);
    if(res){
        ctx.render('admin/error',{
            message:"系统设置完成！",
            redirect:ctx.state._host+"/admin/setting"
        })
    }else{
        ctx.render('admin/error',{
            message:"系统设置失败！",
            redirect:ctx.state._host+"/admin/setting"
        })
    }
})



module.exports=router.routes();
