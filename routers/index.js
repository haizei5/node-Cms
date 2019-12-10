/**
*前台页面展示路由配置
*/

const router=require('koa-router')();
const url=require('url');
const DB=require('../modules/db.js');
const menu=require('../modules/menu_config.js');
const method=require('../modules/methods_node.js');

//定义全局变量
router.use(async (ctx,next)=>{
    let pathname=url.parse(ctx.request.url).pathname;
    let navres=await DB.find('nav',{'status':'1'},{},{
        sortJson:{'sort':1}
    })
    let indexlist=await DB.find('setting',{});
    //console.log(navres);

    ctx.state.nav=navres;
    ctx.state.path=pathname;
    ctx.state.prevPage=ctx.request.headers['referer'];
    ctx.state.setting=indexlist[0];

    await next()
})

//首页
router.get('/',async (ctx)=>{
    let focusres=await DB.find('focus',{'status':'1'},{},{
        sortJson: {'sort':-1}
    })
    let links=await DB.find('link',{'status':'1'},{},{
        sortJson:{'sort':1}
    })
    var page=1;
    var pageSize=6;
    var json = {
        page,
        pageSize,
        sortJson:{
            "sort":1
        }
    }
    let plan=await DB.find('ArticleContent',{"pid":menu.plan},{},json);
    let core=await DB.find('ArticleContent',{"pid":menu.competence},{},json);
    let ind=await DB.find('ArticleContent',{'pid':menu.industry},{},json);
    let news_id=await DB.find('second_menu',{'pid':menu.news});
    let news=await DB.find('ArticleContent',{'pid':{$in: method.arr_for(news_id)}},{},json);
    console.log(news_id);

    ctx.render('default/index',{
        focus:focusres,
        link:links,
        plan:plan,
        core:core,
        ind:ind,
        news:news
    });

})

//核心能力
router.get('/competence',async ctx=>{
    var pageSize=3;
    var page=1;
    var json = {
        pageSize,
        page,
        sortJson: {
            'add_time': 1,               //根据添加时间进行排序
        }
    }
    var menu_id=ctx.state.path.slice(1);
    var corelist = await DB.find('ArticleContent', {'pid': menu[menu_id]}, {}, json);
    ctx.render('default/competence',{
        corelist:corelist,
    });
})

//新闻资讯
router.get('/news',async (ctx)=>{
    var pid=ctx.query.pid;
    var pageSize=3;
    var page=ctx.query.page || 1;
    var json = {
        pageSize,
        page,
        sortJson: {
            'add_time': -1,               //根据添加时间进行排序
        }
    }
    var menu_id=ctx.state.path.slice(1);
    var newslist_id=await DB.find('second_menu',{'pid':menu[menu_id]});
    if(pid){
        var newslist = await DB.find('ArticleContent', {'pid': pid}, {}, json);
        var newslistNum = await DB.count('ArticleContent', {'pid': pid});
    }else {
        var newslist = await DB.find('ArticleContent', {'pid': {$in: method.arr_for(newslist_id)}}, {}, json);
        var newslistNum = await DB.count('ArticleContent', {'pid': {$in: method.arr_for(newslist_id)}});
    }
    ctx.render('default/news',{
        newslist_id:newslist_id,
        newslist:newslist,
        pid:pid,
        page: page,
        totalPages: Math.ceil(newslistNum / pageSize)
    });

})

//开发服务
router.get('/service',async (ctx)=>{
    var menu_id=ctx.state.path.slice(1);
    let service_res=await DB.find('ArticleContent',{'pid':menu[menu_id]});
    console.log(service_res);
    if(service_res) {
        ctx.render('default/service', {
            list: service_res
        });
    }

})

//行业
router.get('/industry',async (ctx)=>{
    var menu_id=ctx.state.path.slice(1)
    let nd_list=await DB.find('ArticleContent',{'pid':menu[menu_id]});
    console.log(nd_list);

    ctx.render('default/industry',{
        nd_list:nd_list
    })
})

//核心能力模块内容
router.get('/list/compet_list/:id',async (ctx)=>{
    let id=ctx.params.id;
    let content_res=await DB.find('ArticleContent',{'_id':DB.getobjectid(id)});
    let caselist=await DB.find('ArticleContent',{'pid':content_res[0].pid});
        ctx.render('default/list/compet_list', {
            list: content_res[0],
            caselist: caselist,

        });
})

//开发服务模块内容
router.get('/list/service_list/:id',async (ctx)=>{
    let id=ctx.params.id;
    let content_res=await DB.find('ArticleContent',{'_id':DB.getobjectid(id)});
    let caselist = await DB.find('ArticleContent', {'pid':content_res[0].pid});
        ctx.render('default/list/service_list', {
            list: content_res[0],
            caselist: caselist,
        });
})

//原创方案模块内容
router.get('/list/solve_list/:id',async (ctx)=>{
    let id=ctx.params.id;
    let content_res=await DB.find('ArticleContent',{'_id':DB.getobjectid(id)});
    let caselist = await DB.find('ArticleContent', {'pid':content_res[0].pid});
    ctx.render('default/list/solve_list', {
        list: content_res[0],
        caselist: caselist,
    });
})

//存在二级分类调用模块内容
router.get('/list/content_list/:id',async (ctx)=>{
    let id=ctx.params.id;
    let content_res=await DB.find('ArticleContent',{'_id':DB.getobjectid(id)});
    let nav_title=await DB.find('second_menu',{'_id':DB.getobjectid(content_res[0].pid)});
        nav_art=await DB.find('first_menu',{'_id':DB.getobjectid(nav_title[0].pid)});
        nav_url=await DB.find('nav',{'title':nav_art[0].title});
        var menu_id = nav_url[0].url.slice(1);
        ctx.state.path = nav_url[0].url;
        let menulist = await DB.find('article', {'pid': menu[menu_id]});
        let caselist = await DB.find('ArticleContent', {'pid': {$in: method.arr_for(menulist)}});
        var json_list = method.next_for(caselist, content_res[0].title);
        ctx.render('default/list/content_list', {
            list: content_res[0],
            menulist: menulist,
            caselist: caselist,
            type_address: nav_url[0].url,
            json_list: json_list

        });
})

//不存在二级分类调用

router.get('/list/ind_list/:id',async (ctx)=>{
    var nav_url="";
    var nav_art="";
    let id=ctx.params.id;
    let content_res=await DB.find('ArticleContent',{'_id':DB.getobjectid(id)});
    let nav_title=await DB.find('first_menu',{'_id':DB.getobjectid(content_res[0].pid)});
    nav_url=await DB.find('nav',{'title':nav_title[0].title});
    var menu_id = nav_url[0].url.slice(1);
    ctx.state.path = nav_url[0].url;
    let caselist = await DB.find('ArticleContent', {'pid': menu[menu_id]});
    ctx.render('default/list/ind_list', {
        list: content_res[0],
        caselist: caselist,
        type_address: nav_url[0].url,
    });
})

//关于我们
router.get('/about',async (ctx)=>{
    var menu_id=ctx.state.path.slice(1)
    let res=await DB.find('ArticleContent',{'pid': menu[menu_id]});
    ctx.render('default/about',{
        res:res[0]
    });

})


//成功案例
router.get('/case',async (ctx)=>{
    var pid=ctx.query.pid;
    var pageSize=6;
    var page=ctx.query.page || 1;
    var json = {
        pageSize,
        page,
        sortJson: {
            'add_time': 1,               //根据添加时间进行排序
        }
    }
    var menu_id=ctx.state.path.slice(1);
    var caselist_id = await DB.find('second_menu', {'pid': menu[menu_id]});
    if(ctx.query.pid){
        var caselist=await DB.find('ArticleContent',{'pid':pid},{},json);
        var caselistNum=await DB.count('ArticleContent',{'pid':pid});
    }else {

        var caselist = await DB.find('ArticleContent', {'pid': {$in: method.arr_for(caselist_id)}},{},json);
        var caselistNum=await DB.count('ArticleContent',{'pid': {$in: method.arr_for(caselist_id)}});
    }
    ctx.render('default/case',{
        caselist:caselist,
        caselist_id:caselist_id,
        pid:pid,
        page: page,
        totalPages: Math.ceil(caselistNum / pageSize)
    });

})


//联系我们
router.get('/connect',async (ctx)=>{
    ctx.render('default/connect');
})

module.exports=router.routes();