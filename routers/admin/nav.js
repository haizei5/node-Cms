const router=require("koa-router")();
const DB=require("../../modules/db.js");
const method=require('../../modules/methods_node.js');

router.get('/',async ctx=>{
    try {
        let page=ctx.query.page || 1;
        let pageSize=8;
        var json={
            page,
            pageSize,
            sortJson:{
                sort:1,
            }
        }
        let count=Number(ctx.state.G.nav_num);

        if (count == 0) {
            var totalpage = 1;
        } else {
            var totalpage = Math.ceil(count / pageSize)
        }
        let res = await DB.find('nav', {},{},json);
        if (res != undefined) {
            ctx.render('admin/nav/list', {
                list: res,
                page: page,
                totalPages: totalpage
            })
        } else {
            ctx.render('admin/error', {
                message: '数据加载失败！',
                redirect: ctx.state._host + '/admin'
            })
        }
    }catch (e) {
        ctx.render('admin/error', {
            message: '系统错误，请重试！',
            redirect: ctx.state._host + '/admin'
        })
    }
});

router.get('/add',async ctx=>{
    ctx.render('admin/nav/add');
})

router.post('/doadd',async ctx=>{
    let title=ctx.request.body.title;
    let sort=ctx.request.body.sort;
    let url=ctx.request.body.url;
    let status=ctx.request.body.status;
    let add_time=method.getdate();
    var json={
        title,status,sort,url,add_time
    }
    let res=await DB.insert('nav',json);
    if(res!=undefined){
        ctx.redirect(ctx.state._host+'/admin/nav');
    }else{
        ctx.render('admin/error',{
            message:'导航链接添加失败！',
            redirect:ctx.state._host+'/admin/nav'
        })
    }
})

router.get('/edit',async ctx=>{
    try {
        let id = ctx.query.id;
        let res = await DB.find('nav', {'_id': DB.getobjectid(id)});
        console.log(res);

        if (res != undefined) {
            ctx.render('admin/nav/edit', {
                list:res[0],
                prevPage:ctx.state.G.prevPage,
            })
        } else {
            ctx.render('admin/error', {
                message: '编辑失败！',
                redirect: ctx.state._host + '/admin/nav'
            })
        }
    }catch (e) {
        ctx.render('admin/error',{
            message:'系统错误，请重试！',
            redirect:ctx.state._host+'/admin/nav'
        })
    }

})

router.post('/doedit',async ctx=>{
    let id=ctx.request.body.id;
    let title=ctx.request.body.title;
    let sort=ctx.request.body.sort;
    let url=ctx.request.body.url;
    let status=ctx.request.body.status;
    let prevPage=ctx.request.body.prevPage;
    let add_time=method.getdate();
    var json={
        title,status,sort,url,add_time
    }
    let res=await DB.update('nav',{'_id':DB.getobjectid(id)},json);
    if(res){
        if(prevPage) {
            ctx.redirect(prevPage);
        }else{
            ctx.redirect(ctx.state.G._host+'/admin/nav')
        }
    }else{
        ctx.render('admin/error',{
            message:"编辑失败！",
            redirect:ctx.state._host+"/admin/nav"
        })
    }

})

module.exports=router.routes();