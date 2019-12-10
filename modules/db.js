//导入mongdb中间件
var  Mongdb=require("mongodb").MongoClient;
var  config=require("./mongdb_config.js"); //引入mong数据库配置
const Objectid=require("mongodb").ObjectID;


class DB{

    //单例模式
    static getInstance(){
        if(!DB.instance){

            DB.instance=new DB();

        }

        return DB.instance;
    }
    //匿名构造函数
    constructor(){
        this.dbvalue="";  //用于接收数据连接成功后赋予值
        this.connect();
    }

    //连接数据库
    connect(){
        let _that=this;
            //防止数据库重复连接
            return new Promise((resolve,reject)=>{
                if(!_that.dbvalue) {
                    //开始连接数据库
                    Mongdb.connect(config.dburl, (err, client) => {
                        if (err) {
                            reject(err);
                        } else {
                            //赋值给this.dbvalue
                            _that.dbvalue = client.db(config.dbname);
                            resolve(_that.dbvalue);
                        }


                    })
                }else{
                    resolve(_that.dbvalue);
                }
            })
    }

    //c查询方法name为表名，json
    find(name,json,json1,json2) {
        if (arguments.length == 2) {
            var attr = {};
            var skip_num = 0;
            var pageSize = 0;
        } else if (arguments.length == 3) {
            var attr = json1;
            var skip_num = 0;
            var pageSize = 0
        }else{
                var attr = json1;
                if(json2.sortJson){
                    var sortJson=json2.sortJson
                }else{
                    var sortJson={};
                }
                var page = json2.page || 1;
                var pageSize = json2.pageSize || 0;
                if(pageSize!=0){
                    var skip_num = (page - 1) * pageSize;
                }else{
                    var skip_num = 0;
                }
        }
            //es6 Promise+then
            return new Promise((resolve, reject) => {
                this.connect().then((db) => {
                    //开始查询,分页查询
                    let res = db.collection(name).find(json, {fields: attr}).skip(skip_num).limit(pageSize).sort(sortJson);//根据添加时间进行排序
                    //构造对象数组
                    res.toArray((err, data) => {
                        if (err) {
                            reject(err);
                            return
                        } else {
                            resolve(data);
                        }

                    })

                })
            })
        }
    //添加方法
    insert(name,json){
        return new Promise((resolve,reject)=>{
            this.connect().then(db=>{
                //插入开始
                db.collection(name).insertOne(json,(err,res)=>{
                    if(err){
                        reject(err);

                    }else{
                        resolve(res);
                    }
                })
            })
        })
    }
    //删除方法
    remove(name,json){
        return new Promise((resolve,reject)=>{
            this.connect().then(db=>{
                //删除开始
                db.collection(name).remove(json,(err,res)=>{
                    if(err){
                        reject(err)
                    }else{
                        resolve(res)
                    }
                })
            })
        })
    }
    //更新方法
    update(name,json,json2){
        return new Promise((resolve,reject)=>{
            this.connect().then(db=>{
                db.collection(name).updateOne(json,{$set:json2},(err,res)=>{
                    if(err){
                        reject(err)
                    }else{
                        resolve(res)
                    }
                })
            })
        })
    }
    //统计总条数
    count(name,json){
        return new Promise((resolve,reject) =>{
            this.connect().then(db=>{
                    let num=db.collection(name).count(json);
                    num.then(function(count){
                        resolve(count);
                    })
                })
        })
    }
    //外部调用objectid
    getobjectid(id){
        return new Objectid(id);
    }
}



module.exports=DB.getInstance();