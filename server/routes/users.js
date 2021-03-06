var express = require('express')
var router = express.Router()
require('./../util/util')

var User = require('./../models/user')

router.post('/login', function (req, res, next) {
    var param = {
        userName: req.body.userName,
        userPwd: req.body.userPwd
    }
    User.findOne(param, function (err, doc) {
        if(err) {
            res.json({
                status: "1",
                msg: err.message
            })
        }else {
            if(doc) {
                //cookie存储
                res.cookie("userId", doc.userId, {
                    path: "/",
                    maxAge: 10000*60*60
                })
                res.cookie("userName", doc.userName, {
                    path: "/",
                    maxAge: 10000*60*60
                })
                //session存储
                // req.session.user = doc
                res.json({
                    status: "0",
                    msg: "",
                    result: {
                        userName: doc.userName
                        // userPwd: doc.userPwd
                    }
                })
            }
        }
    })
})

//登出接口

router.post("/logout", function (req, res, next) {
    res.cookie("userId", "", {
        path: "/",
        maxAge: -1
    })
    res.json({
        status: "0",
        msg: "",
        result: ""
    })
})

//登录校验
router.get("/checkLogin", function (req, res, next) {
    if(req.cookies.userId) {
        res.json({
            status: "0",
            msg: "",
            result: req.cookies.userName || ""
        })
    }else {
        res.json({
            status: "1",
            msg: "未登录",
            result: ""
        })
    }
})

//购物图标数量显示
router.get("/getCartCount", function(req, res, next) {
    if(req.cookies && req.cookies.userId) {
        var userId = req.cookies.userId
            User.findOne({userId:userId}, function (err, doc) {
                if(err) {
                    res.json({
                        status: '1',
                        msg: err.message,
                        result: ''
                    })
                }else {
                    var cartList = doc.cartList
                    var cartCount = 0
                    cartList.forEach( item => {
                        cartCount += parseInt(item.productNum)
                    })
                    res.json({
                        status: '0',
                        msg: '',
                        result: cartCount
                    })
                }
            })

    } 
})

//查询当前用户购物车购物车
router.get("/cartList", function (req, res, next) {
    //全局已拦截，只需要拿
    var userId = req.cookies.userId
    User.findOne({ userId:userId }, function (err, doc) {
        if(err) {
            res.json({
                status: "1",
                msg: err.message,
                result: ""
            })
        }else {
            if(doc) {
                res.json({
                   status: "0",
                   msg: "",
                   result: doc.cartList
                })
            }
        }
    })
})


//购物车删除
router.post("/cartDel", function (req,res,next) {
    var userId = req.cookies.userId,productId = req.body.productId
    User.update({
      userId:userId
    },{
      $pull:{
        'cartList':{
          'productId':productId
        }
      }
    }, function (err,doc) {
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        });
      }else{
        res.json({
          status:'0',
          msg:'',
          result:'suc'
        })
      }
    })
  })

//修改购物车商品数量
router.post("/cartEdit", function (req, res, next) {
    var userId = req.cookies.userId,
        productId = req.body.productId,
        productNum = req.body.productNum,
        checked = req.body.checked
    User.update({"userId":userId,"cartList.productId":productId},{
        "cartList.$.productNum":productNum, //更新子文档
        "cartList.$.checked":checked
    }, function(err, doc) {
        if(err) {
            resjson({
                status: '1',
                msg: err.message,
                result: ''
            })
        }else {
            res.json({
                status: '0',
                msg: '',
                result: 'suc'
            })
        }
    })
})

//购物车商品选中
router.post("/editCheckAll", function (req, res, next) {
    var userId = req.body.cookies.userId,
        checkAll = req.body.checkAll? '1':'0'
    User.findOne({userId:userId}, function (err, user) {
        if(err) {
            resjson({
                status: '1',
                msg: err.message,
                result: ''
            })
        }else {
            if(user) {
                user.cartList.forEach(item => {
                    item.checked = checkAll
                })
                user.save(function (err1, doc) {
                    if(err1) {
                        resjson({
                            status: '1',
                            msg: err1.message,
                            result: ''
                        })
                    }else {
                        res.json({
                            status: '0',
                            msg: '',
                            result: 'suc'
                        })
                    }
                })
            }
        }
    })
})


//查询用户地址接口
router.get("/addressList", function (req, res, next) {
    var userId = req.cookies.userId
    User.findOne({userId:userId}, function (err, doc) {
        if(err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            })
        }else {
            if(doc) {
                res.json({
                    status: '0',
                    msg: '',
                    result: doc.addressList
                })
            }
        }
    })
})

//设置默认地址
router.post("/setDefault", function (req, res, next) {
    var userId = req.cookies.userId,
        addressId = req.body.addressId
        if(!addressId) {
            res.json({
              status: '11',
              msg: 'addressId is null',
              result: ''
            })
        }
    User.findOne({userId:userId}, function (err, doc) {
        if(err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            })
        }else {
            if(doc) { 
                var addressList = doc.addressList
                addressList.forEach(item => {
                    if(item.addressId == addressId) {
                        item.isDefault = true
                    }else {
                        item.isDefault = false
                    }
                })
            
                doc.save(function (err1, doc1) {
                    if(err1) {
                        res.json({
                            status: '1',
                            msg: err1.message,
                            result: ''
                        })
                    }else {
                        res.json({
                            status: '0',
                            msg: '',
                            result: ''
                        })
                    }
                })
            }
        }
    })
})

//删除地址接口
router.post("/delAddress", function(req, res, next) {
    var userId = req.cookies.userId,
        addressId = req.body.addressId
        User.update({
            userId:userId
        },{
            $pull:{
                'addressList':{
                    'addressId':addressId
                }
            }
        }, function (err, doc) {
            if(err) {
                res.json({
                    status: '1',
                    msg: err.message,
                    result: ''
                })
            }else {
                res.json({
                    status: '0',
                    msg: '',
                    result: 'suc'
                })
            }
        })

})

//生成订单
router.post("/payMent", function (req,res,next) {
    var userId = req.cookies.userId,
      addressId = req.body.addressId,
      orderTotal = req.body.orderTotal
    User.findOne({userId:userId}, function (err,doc) {
       if(err){
          res.json({
              status:"1",
              msg:err.message,
              result:'not find userId'
          });
       }else{
         var address = {},goodsList = []
         //获取当前用户的地址信息
         doc.addressList.forEach((item)=>{
            if(addressId==item.addressId){
              address = item
            }
         })
         //获取用户购物车的购买商品
         doc.cartList.filter((item)=>{
           if(item.checked=='1'){
             goodsList.push(item)
           }
         })
  
         var platform = '622'
         var r1 = Math.floor(Math.random()*10)
         var r2 = Math.floor(Math.random()*10)
  
         var sysDate = new Date().Format('yyyyMMddhhmmss')
         var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss')
         var orderId = platform+r1+sysDate+r2;

         var order = {
            orderId:orderId,
            orderTotal:orderTotal,
            addressInfo:address,
            goodsList:goodsList,
            orderStatus:'1',
            createDate:createDate
         };
  
         doc.orderList.push(order)   //数据库直接操作Push跨域
       
  
         doc.save(function (err1,doc1) {
            if(err1){
              res.json({
                status:"1",
                msg:err1.message,
                result:'save error'
              });
            }else{
              res.json({
                status:"0",
                msg:'',
                result:{
                  orderId:order.orderId,
                  orderTotal:order.orderTotal
                }
              })
            }
         })

       }
    })
  })


//根据订单ID查询订单信息
router.get("/orderDetail", function (req, res, next) {
    var userId = req.cookies.userId,
        orderId = req.param("orderId")    //get请求
        User.findOne({userId:userId}, function (err, userInfo) {
            if(err) {
                res.json({
                    status: '1',
                    msg: err.message,
                    result: ''
                })
            }else {
                var orderList = userInfo.orderList
                if(orderList.length > 0) {
                    var orderTotal = 0
                    orderList.forEach( item => {
                        if(item.orderId == orderId) {
                            orderTotal = item.orderTotal
                        }
                    })
                    if(orderTotal > 0) {
                        res.json({
                            status: '0',
                            msg: '',
                            result: {
                                orderId: orderId,
                                orderTotal: orderTotal
                            }
                        })
                    }else {
                        res.json({
                            status: '12002',
                            msg: '无此订单',
                            result: ''
                        })
                    }   
                }else {
                    res.json({
                        status: '12001',
                        msg: '当前用户未创建订单',
                        result: ''
                    })
                } 
            }
        })
})


module.exports = router