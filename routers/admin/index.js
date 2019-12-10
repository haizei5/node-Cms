/**
 * Created by MK on 2018/12/22.
 */


const router=require("koa-router")();
const DB=require("../../modules/db.js");


router.get("/",async ctx=>{
    await ctx.render('admin/index');
})

//改变状态AJAX接口
router.get("/changeStatus",async ctx=>{
    try{
        let name=ctx.query.collectionName;
        let attr=ctx.query.attr;
        let id=ctx.query.id;
        //console.log(ctx.query);
        let res=await DB.find(name,{"_id":DB.getobjectid(id)});
        if(res!=undefined){
            if(res[0][attr] == 1){
                var json={
                    [attr]:"0"
                }
            }else{
                var json={
                    [attr]:"1"
                }
            }
            let update=await DB.update(name,{"_id":DB.getobjectid(id)},json)
            if(update){
                ctx.body={"message":'状态更新成功！',"success":true};
            }else{
                return ctx.body={"message":'状态更新失败！',"success":false};
            }

        }else{
            return ctx.body={"message":'状态更新失败！',"success":false};
        }
    }catch (e) {
        return ctx.body={"message":'状态更新失败，参数有误！',"success":false};
    }
})


//改变排序的ajax接口


router.get('/changeSort',async (ctx)=>{

    //console.log(ctx.query);

    var collectionName=ctx.query.collectionName; /*数据库表*/
    var id=ctx.query.id;
    var sortValue=ctx.query.sortValue;
    //更新的数据
    var json={

        sort:sortValue
    }
    let updateResult=await DB.update(collectionName,{"_id":DB.getobjectid(id)},json);

    if(updateResult){
        ctx.body={"message":'排序更新成功',"success":true};
    }else{
        ctx.body={"message":"排序更新失败","success":false}
    }

})


//删除方法AJAX接口
router.get("/remove",async ctx=>{
    let res=await DB.remove(ctx.request.body.dbname,{"_id":DB.getobjectid(ctx.request.body.id)})
    if(res){
        return ctx.body={"success":true,"url":ctx.state.G.prevPage}
    }else{
        return ctx.body={"success":false,"url":ctx.state.G.prevPage}
    }
})


module.exports=router.routes();