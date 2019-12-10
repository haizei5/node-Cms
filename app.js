/**
 * Created by MK on 2018/12/22.
 */
//引用中间件
const koa=require("koa");
const router=require("koa-router")();
const static=require("koa-static");
const art=require("art-template");
const render=require("koa-art-template");
const path=require("path");
const session=require("koa-session");
const bodyparser=require("koa-bodyparser");
const jsonp=require("koa-jsonp");
const silly=require("silly-datetime");
const compress=require("koa-compress");
const cors=require('koa-cors');
const socketio=require('./modules/socket_init.js');

//实例koa
const app=new koa();

//实例化body
app.use(bodyparser());

//实例化jsonp
app.use(jsonp());
//配置session
app.keys = ['some secret hurr'];

//gzip压缩配置
const options = { threshold: 1024 };
app.use(compress(options));

//koa解决跨域请求问题
app.use(cors({
    origin: '*',
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 500,
    credentials: true,  //cookie
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PUT'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}));


//链接socket.io
socketio.init(app);

const CONFIG = {
    key: 'koa:sess',
    maxAge: 60*1000*60,
    autoCommit: true,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: true,
    renew: false,
};

app.use(session(CONFIG, app));


//配置art模板
render(app, {
    root: path.join(__dirname, 'views'),                   //模板路径文件
    extname: '.html',                                      //模板类型可自行编写
    debug: process.env.NODE_ENV !== 'production',           //是否添加调试
    dateFormat:dateFormat=function(value){
        return silly.format(value, 'YYYY-MM-DD');
    } /*扩展模板里面的方法*/
});

//加载静态文件
app.use(static(__dirname + "/public"));


//引用封装路由
var admin=require("./routers/admin.js");
var index=require("./routers/index.js");
var api=require("./routers/api.js");
router.use("/admin",admin);
router.use("/api",api);
router.use(index);

router.get('/aaa',async ctx=>{
    await ctx.render('app')
})
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(4008);


