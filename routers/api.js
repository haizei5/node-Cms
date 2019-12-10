const router=require("koa-router")();
const DB=require('../modules/db.js');
const method=require('../modules/methods_node.js')


//商品列表
router.get('/productlist',async ctx=>{
    try {
        var pcate = await DB.find('foodtype', {}, {'_id': 1, "title": 1, "pid": 1});
        var product = await DB.find('foodcate', {});
        for (var i = 0; i < pcate.length; i++) {
            pcate[i].list = [];
            for (var j = 0; j < product.length; j++) {
                if (pcate[i]._id == product[j].cate_id) {
                    pcate[i].list.push(product[j]);
                }
            }
        }
        ctx.body = {"result": pcate};
    }catch (e) {
        ctx.body={"success": false,"result":''};
    }
})



//商品详情
router.get('/productcontent',async ctx=>{
    //console.log(111);

    try{
        var id=ctx.query.id;
        var product=await DB.find('foodcate',{'_id':DB.getobjectid(id)});
        //console.log(product);

        ctx.body={"result":product};
    }catch(err){
        ctx.body={"result":'',"err":err};
    }

})

//购物车
router.post('/addcart',async ctx=>{


    var data=ctx.request.body;

    try{
        //传入桌号
        var type=data.type;
        //添加信息类型
        if(type=='1'){
            for(var i=0;i<data.list.length;i++){
                //查询信息是否已存在，如存直接更新
                let hasData=await DB.find('cart',{'uid':data.list[i].uid,'product_id':data.list[i].product_id});
                if(hasData.length>0){
                    if(hasData[0].num!=data.list[i].num) {
                        await DB.update('cart', {
                            'uid':data.list[i].uid,
                            'product_id': data.list[i].product_id
                        }, {'num': data.list[i].num})
                    }
                }else{
                    var result=await DB.insert('cart',data.list[i]);
                }
            }

        }else{
            let uid=data.uid;
            let product_id=data.product_id;
            //查询信息是否已存在，如存直接更新
            let hasData=await DB.find('cart',{'uid':uid,'product_id':product_id});
            if(hasData.length>0){
                await DB.update('cart',{'uid':uid,'product_id':product_id},{'num':hasData[0].num+1})
            }else{
                let result=await DB.insert('cart',data);
            }
        }
        ctx.body={"success":'true',"msg":"增加数据成功"};

    }catch(err){
        ctx.body={"success":false,"msg":"增加数据失败"};
    }
})


//购物车列表
router.get('/cartlist',async ctx=>{

    try {
        var uid = ctx.query.uid;


        var result = await DB.find('cart', {'uid': uid});

        ctx.body = {"success": 'true', "result": result};
    }catch (e) {
        ctx.body={"success": false,"result":''};
    }


})



//增加购物车数据
router.post('/incCart',async ctx=>{
    try {
        var data = ctx.request.body;
        var uid = data.uid;
        var product_id = data.id;
        var num = data.num;
        var result = await DB.update('cart', {'uid': uid, 'product_id': product_id}, {"num": num});
        ctx.body = {"success": true};
    }catch (e) {
        ctx.body={"success": false,"result":''};
    }
})


//减少购物车数据
router.post('/decCart',async ctx=>{
    try {
        var data = ctx.request.body;
        var uid = data.uid;
        var product_id = data.id;
        var num = data.num;

        if (num < 1) {
            var result = await DB.remove('cart', {'uid': uid, 'product_id': product_id});
        } else {
            var result = await DB.update('cart', {'uid': uid, 'product_id': product_id}, {"num": num});
        }
        ctx.body = {"success": true};
    }catch (e) {
        ctx.body={"success": false,"result":''};
    }
})

//获取购物车数量
router.get('/cartCount',async ctx=>{

    try {
        var uid = ctx.query.uid;
        var result = await DB.find('cart', {'uid': uid});


        //console.log(result);
        var sum = 0;
        for (var i = 0; i < result.length; i++) {
            sum += result[i].num;
        }
        ctx.body = {"success": true, "result": sum};
    }catch (e) {
        ctx.body={"success": false,"result":''};
    }
})

//保存就餐人数
router.post('/addpeonum',async ctx=>{
    try {
        var data = ctx.request.body;
        let ram = await DB.find('ramadhin',{'uid':data.uid});
        var hasData = await DB.find('mealspeo', {'uid': data.uid});
        if(ram.length>0) {
            if (hasData.length > 0) {
                await DB.update('mealspeo', {'uid': data.uid}, {'peonum': data.peonum})
            } else {
                var result = await DB.insert('mealspeo', data);
            }
            ctx.body = {"success": true}
        }else{
            ctx.body={"success": false,"result":'桌号不存在！'};
        }
    }catch (e) {
        ctx.body={"success": false,"result":''};
    }
})

//查询就餐人数
router.post('/getpeonum',async ctx=>{
    try {
        let data = ctx.request.body;
        let ram = await DB.find('ramadhin',{'uid':data.uid});
        if(ram.length>0) {
            let hasData = await DB.find('mealspeo', {'uid': data.uid});
            ctx.body = {"success": true, "result": hasData}
        }else{
            ctx.body={"success": false,"result":'桌号不存在！'};
        }
    }catch (e) {
        ctx.body={"success": false,"result":''};
    }
})

//订单录入
router.post('/addorder',async ctx=>{
    var data = ctx.request.body;
    try {
        var uid = data.uid;                     //桌号
        var meals = data.meals    //就餐人数
        var foodnum = data.foodnum    //菜品数量
        var allprice = data.allprice  //总价格
        var order_status = 0;   //0表示  未确认    1 表示已经确认      2表示取消
        var pay_status = 0;   //0表示未支付  1表示已经支付
        //var pay_type=data.pay_type;     1 微信支付   2支付宝
        var add_time = method.getdate();  //下单时间
        var res_order = await DB.find('order_item', {'uid': uid, 'order_status': {$not: /2/}, 'pay_status': 0});
        if (res_order.length > 0) {
            console.log(res_order[0]);
            var order_result = await DB.update('order_item', {
                meals, allprice, foodnum, add_time
            })
            for (var i = 0; i < data.list.length; i++) {
                let params = {};
                params.order_id = res_order[0]._id;
                params.title = data.list[i].title;
                params.price = data.list[i].price;
                params.num = data.list[i].num;
                params.status = 1;
                await DB.insert('order_product', params)
            }
        } else {
            //增加订单录入
            var order_result = await DB.insert('order_item', {
                uid, meals, allprice, foodnum, order_status, pay_status, add_time,
            });
            //增加订单成功后，录入订单内的菜品
            if (order_result.insertedId) {
                for (var i = 0; i < data.list.length; i++) {
                    let params = {};
                    params.order_id = order_result.insertedId.toString();
                    params.title = data.list[i].title;
                    params.price = data.list[i].price;
                    params.num = data.list[i].num;
                    params.status = 1;
                    await DB.insert('order_product', params)
                }
            } else {
                ctx.body = {'result': "", 'success': false}
            }

        }
        ctx.body = {'success': true, 'msg': '增加数据成功'}
    }catch (e) {
        ctx.body = {'success':false,'msg':'增加失败'}
    }

})

//获取订单信息
router.get('/getorder',async ctx=>{


})

module.exports=router.routes();


