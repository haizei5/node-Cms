let md5=require("md5");
let multer=require("koa-multer");

//封装md5加密
const methods_node= {
    getdate(){
        return new Date()
    },
    md5(str){
        return md5(str)
    },
    data_spilt(data,data2){
        var first_list=[];
        for(var i=0;i<data.length;i++){
                first_list.push(data[i])
        }
        for(var j=0;j<first_list.length;j++){
            first_list[j].list=[];
            for(var i=0;i<data2.length;i++){
                if(first_list[j]._id == data2[i].pid){
                    first_list[j].list.push(data2[i])
                }
            }
        }
        return first_list;
    },
    img_upload(){
        //图片上传模块

        var storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'public/upload');   /*配置图片上传的目录     注意：图片上传的目录必须存在*/
            },
            filename: function (req, file, cb) {   /*图片上传完成重命名*/
                var fileFormat = (file.originalname).split(".");   /*获取后缀名  分割数组*/
                cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
            }
        })
        var upload = multer({ storage: storage });
        return upload
    },
    arr_for(data){
        var subarr=[];
        for (var i = 0; i < data.length; i++) {
            subarr.push(data[i]._id.toString());
        }
        return subarr;
    },
    next_for(data,str){
        var obj={
            prev:'',
            next:'',
            next_id:'',
            prev_id:''
        };
        for(var i=0;i<data.length;i++){
            if(data[i].title.toString() == str){
                if(i==0){
                    obj.prev='返回首页';
                    obj.next=data[i+1].title.toString();
                    obj.next_id=data[i+1]._id.toString();
                }else if(i==data.length-1){
                    obj.prev=data[i-1].title.toString();
                    obj.prev_id=data[i-1]._id.toString();
                    obj.next='返回首页';
                }else{
                    obj.next=data[i+1].title.toString();
                    obj.next_id=data[i+1]._id.toString();
                    obj.prev=data[i-1].title.toString();
                    obj.prev_id=data[i-1]._id.toString();
                }
            }
        }
        return obj;
    },
}



module.exports=methods_node;
