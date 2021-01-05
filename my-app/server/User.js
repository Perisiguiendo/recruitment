const { json } = require('body-parser')
const express = require('express')
const utility = require('utility')

const model = require('./model')
const Router = express.Router()
const User = model.getModel('user')
const Chat = model.getModel('chat')
const _filter = { 'pwd': 0, '__v': 0 }
// Chat.remove({}, function (err, doc) { })


Router.get('/info', function (req, res) {
  const { userid } = req.cookies;
  if (!userid) {
    return res.json({ code: 1 });
  }

  User.findOne({ _id: userid }, _filter, function (err, doc) {
    if (err) {
      return res.json({ code: 1, msg: '后端出错了' });
    }
    if (doc) {
      return res.json({ code: 0, data: doc })
    }
  })
})

Router.get('/list', function (req, res) {
  const { type } = req.query;
  // User.remove({}, function (err, doc) { })
  User.find({ type }, _filter, function (err, doc) {
    return res.json({ code: 0, data: doc })
  })
})

Router.post('/register', function (req, res) {
  const { user, pwd, type } = req.body;
  User.findOne({ user: user }, function (err, doc) {
    if (doc) {
      return res.json({ code: 1, msg: '用户名重复' })
    }
    const userModel = new User({ user, pwd: md5Pwd(pwd), type })
    userModel.save(function (err, doc) {
      if (err) {
        return res.json({ code: 1, msg: '后端出错了' })
      }
      const { user, type, _id } = doc;
      res.cookie('userid', _id);
      return res.json({ code: 0, data: { user, type, _id } })
    })
  })
})

Router.post('/login', function (req, res) {
  const { user, pwd } = req.body;
  User.findOne({ user: user, pwd: md5Pwd(pwd) }, _filter, function (err, doc) {
    if (!doc) {
      return res.json({ code: 1, msg: '用户名不存在或密码错误' })
    }
    res.cookie('userid', doc._id);
    return res.json({ code: 0, data: doc })
  })
})

Router.post('/update', function (req, res) {
  const userid = req.cookies.userid;
  if (!userid) {
    return res.json({ code: 1, msg: '后端出错了', userid: userid })
  }
  const body = req.body;
  User.findByIdAndUpdate(userid, body, function (err, doc) {
    const data = Object.assign({}, {
      user: doc.user,
      type: doc.type,
    }, body)
    return res.json({ code: 0, data })
  })
})

Router.get('/getmsglist', function (req, res) {
  const userid = req.cookies.userid;
  User.find({}, function (err, userdoc) {
    let users = {};
    userdoc.forEach(v => {
      users[v._id] = { name: v.user, avatar: v.avatar };
    })
    Chat.find({ '$or': [{ from: userid }, { to: userid }] }, function (err, doc) {
      if (!err) {
        return res.json({ code: 0, msgs: doc, users: users })
      }
    })
  })
})

Router.post('/readmsg', function (req, res) {
  const userid = req.cookies.userid;
  const { from } = req.body;
  Chat.update({ from, to: userid }, { '$set': { read: true } }, function (err, doc) {
    if (!err) {
      res.json({ code: 0 })
    }
    return res.json({ code: 1, msg: '修改失败' })
  })
})



function md5Pwd(pwd) {
  const salt = 'imooc_is_good_768r@57$48&9~~';
  return utility.md5(utility.md5(pwd + salt));
}

module.exports = Router