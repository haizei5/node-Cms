const IO=require('koa-socket');
const url=require('url');
const io= new IO();

var socketIo={
    init:function(app){
        io.attach(app);
        /*注册启动*/
        app._io.on('connection',socket=>{
            console.log('连接成功');
            var requestUrl = socket.request.url;
            var roomid = url.parse(requestUrl, true).query.roomid; // 获取房间ID


            socket.join(roomid);
            //加入购物车
            socket.on('addcart', data=>{

                console.log('addcart');
                //用户加入房间
                //socket.emit('addcart',data);
                //app._io.emit('addcart',data);   /*广播数据*/
                //对房间内的用户发送消息
                //  app._io.to(roomid).emit('addcart','有人加入购物车了');//包括自己
                socket.broadcast.to(roomid).emit('addcart', 'addcart');//不包括自己
            });
            socket.on('mealssoc',data=>{
                socket.broadcast.to(roomid).emit('mealssoc', 'mealssoc');
            });
        })
    }
}

module.exports=socketIo;