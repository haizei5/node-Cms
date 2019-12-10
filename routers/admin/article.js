const router=require("koa-router")();
const DB=require("../../modules/db.js");
const method=require("../../modules/methods_node.js");



//文章分类主页
router.get("/",async ctx=>{
    try {
        let pageSize = 8;
        let page = ctx.query.page || 1;
        var json = {
            pageSize,
            page,
            sortJson: {
                'add_time': -1,               //根据添加时间进行排序
            }
        }
        let count = await DB.count('ArticleContent', {});
        if (count == 0) {
            var totalpage = 1;
        } else {
            var totalpage = Math.ceil(count / pageSize)
        }
        let res = await DB.find('ArticleContent', {}, {}, json);
        let res_type=await DB.find('article',{});
        //console.log(res);
        //console.log(res);


        if (res) {
            ctx.render('admin/article/index', {
                list: res,
                page: page,
                totalPages: totalpage,
                res_type:res_type
            })
        } else {
            ctx.render('admin/error', {
                message: "数据加载失败！",
                redirect: ctx.state._host + "/admin"
            })
        }
    }catch (e) {
        ctx.render('admin/error', {
            message: "系统错误，请重试！",
            redirect: ctx.state._host + "/admin"
        })
    }
})

//添加文章分类
router.get("/add",async ctx=>{
    let firlist=await DB.find('first_menu',{});
    let seclist=await DB.find('second_menu',{});
    if(firlist.length>0 && seclist.length){
        ctx.render("admin/article/add",{
            catelist:firlist,
            seclist:seclist
        })
    }else{
        ctx.render('admin/error',{
            message:"分类查询失败！",
            redirect:ctx.state._host+"/admin/article"
        })
    }
})

//文章提交添加信息
router.post("/doAdd",method.img_upload().single('img_url'),async ctx=>{
    if(ctx.req.body.secpid == '0'){
        var pid=ctx.req.body.pid;
    }else{
        var pid=ctx.req.body.secpid;
    }
    let catename=ctx.req.body.catename.trim();
    let title=ctx.req.body.title.trim();
    let author=ctx.req.body.author.trim();
    let status=ctx.req.body.status;
    let is_best='';
    if(ctx.req.body.is_best) {
        is_best = ctx.req.body.is_best;
    }else{
        is_best = '0';
    }
    let is_hot='';
    if(ctx.req.body.is_hot) {
        is_hot = ctx.req.body.is_hot;
    }else{
        is_hot = '0';
    }
    let is_new='';
    if(ctx.req.body.is_new) {
        is_new = ctx.req.body.is_new;
    }else{
        is_new = '0';
    }
    let keywords=ctx.req.body.keywords;
    let description=ctx.req.body.description || '';
    let content=ctx.req.body.content || '';
    let img_url=ctx.req.file ? ctx.req.file.path.substr(6) : '';
    let add_time=method.getdate();
    var params={
        pid,catename,title,author,status,is_best,is_hot,is_new,keywords,description,content,img_url,add_time
    }
    let res=await DB.insert("ArticleContent",params);

    if(res){
        ctx.redirect(ctx.state._host+"/admin/article")
    }else{
        ctx.render('admin/error',{
            message:"文章插入失败！",
            redirect:ctx.state._host+"/admin/article"
        })
    }
});


//文章编辑
router.get("/edit",async ctx=>{
    let id=ctx.query.id;
    let res=await DB.find('ArticleContent',{"_id":DB.getobjectid(id)});
    let res_fir=await DB.find('first_menu',{"_id":DB.getobjectid(res[0].pid)});
    let res_sec=await DB.find('second_menu',{"_id":DB.getobjectid(res[0].pid)});
    let firlist=await DB.find('first_menu',{});
    let seclist=await DB.find('second_menu',{});

    if(res_fir==""){
        res_fir=await DB.find('first_menu',{"_id":DB.getobjectid(res_sec[0].pid)});
    }


    if(res!=""){
        ctx.render('admin/article/edit',{
            catelist:firlist,
            seclist:seclist,
            res_fir:res_fir[0],
            article_list:res[0],
            prevPage:ctx.state.G.prevPage,

        })
    }else{
        ctx.render('admin/error',{
            message:"查询失败！",
            redirect:ctx.state._host+"/admin/article",
        })
    }
})

//文章提交编辑信息
router.post("/doEdit",method.img_upload().single('img_url'),async ctx=>{
    let id=ctx.req.body.id;
    if(ctx.req.body.secpid != '0'){
        var pid=ctx.req.body.secpid;
    }else{
        var pid=ctx.req.body.pid;
    }
    let prevPage=ctx.req.prevPage;
    let catename=ctx.req.body.catename.trim();
    let title=ctx.req.body.title.trim();
    let author=ctx.req.body.author.trim();
    let status=ctx.req.body.status;
    let is_best='';
    if(ctx.req.body.is_best) {
        is_best = ctx.req.body.is_best;
    }else{
        is_best = '0';
    }
    let is_hot='';
    if(ctx.req.body.is_hot) {
        is_hot = ctx.req.body.is_hot;
    }else{
        is_hot = '0';
    }
    let is_new='';
    if(ctx.req.body.is_new) {
        is_new = ctx.req.body.is_new;
    }else{
        is_new = '0';
    }
    let keywords=ctx.req.body.keywords;
    let description=ctx.req.body.description || '';
    let content=ctx.req.body.content || '';
    let img_url=ctx.req.file ? ctx.req.file.path.substr(6) : '';
    let add_time=method.getdate();
    if(img_url) {
        var params = {
            pid,catename,title,author,status,is_best,is_hot,is_new,keywords,description,content,img_url,add_time
        }
    }else{
        var params = {
            pid,catename,title,author,status,is_best,is_hot,is_new,keywords,description,content,add_time
        }
    }
    let res=await DB.update("ArticleContent",{"_id":DB.getobjectid(id)},params);

    if(res){
        if(prevPage){
            ctx.redirect(prevPage)
        }else {
            ctx.redirect(ctx.state._host + "/admin/article")
        }
    }else{
        ctx.render('admin/error',{
            message:"文章编辑失败！",
            redirect:ctx.state._host+"/admin/article"
        })
    }
});



module.exports=router.routes();