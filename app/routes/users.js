var express = require('express');
var router = express.Router();
const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_TOKEN;
const withAuth = require('../middlewares/auth');

router.post('/register', async(req, res) => {
  const { name, email, password } = req.body;
  const user = new userModel({ name, email, password });

  try {
    await user.save();
    res.json(user);
  } catch (e) {
    res.status(401).json({error: 'Error in registration of a new user', user: user});
  }
});

router.get('/token', withAuth, async(req, res) => {
  try {
      //let notes = await noteModel.find({author: req.user._id});
      res.json({sucess: 'sucess'}).status(200);
  }
  catch (e) {
      res.json({error: e}).status(204);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await userModel.findOne({ email });
    if (!user) {
      res.status(204).json({error: 'Incorrect email or password'});
    } else {
      user.isCorrectPassword(password, function (e, same) {
        if (!same) {
          res.status(204).json({error: 'Incorrect email or password'});
        } else {
          const token = jwt.sign({email}, secret, { expiresIn: '5d' });
          res.json({user: user, token: token});
        }
      });
    }
  } catch (e) {
    res.status(401).json({error: e});
  }
});

router.put('/', withAuth, async function(req, res) {
  const { name, email } = req.body;

  try {
    var user = await userModel.findByIdAndUpdate(
      {_id: req.user._id},
      { $set: { name: name, email: email}},
      { upsert: true, 'new': true } 
    )
    console.log(user);
    res.json(user);
  } catch (e) {
    res.status(403).json({error: e});
  }
});

router.put('/password', withAuth, async function(req, res) {
  const { password } = req.body;

  try {
    var user = await userModel.findOne({_id: req.user._id})
    user.password = password
    await user.save()
    res.json(user);
  } catch (error) {
    res.status(403).json({error: error});
  }
});

router.delete('/', withAuth, async function(req, res) {
  try {
    let user = await userModel.findOne({_id: req.user._id });
    await user.delete();
    res.json({message: 'OK'});
  } catch (error) {
    res.status(403).json({error: error});
  }
});

module.exports = router;
