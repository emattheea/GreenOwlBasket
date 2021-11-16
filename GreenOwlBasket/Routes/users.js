const { User,validateUser,validateLogin } = require('../models/Model')
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();



//REGISTER
router.post('/register', async (req, res) => {
    try {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    let user = await User.findOne({ email: req.body.email }); 
    if (user) return res.status(400).send('User already registered.'); 

    const salt = await bcrypt.genSalt(10);
      user = new User({ 
      name: req.body.name, 
      email: req.body.email, 
      password: await bcrypt.hash(req.body.password, salt), 
   }); 
    
   await user.save();
    
   const token = user.generateAuthToken();
  
   return res
     .header('x-auth-token',token)
     .header('access-control-expose-headers','x-auth-token')
     .send({ _id:user._id, name: user.name, email: user.email }); 
   }catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`); }
  });

  //LOGIN
router.post('/login', async (req, res) => { 
    try{  
         const { error } = validateLogin(req.body);
      if (error) return res.status(400).send(error.details[0].message);
     
      let user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(400).send('Invalid email or password .');
     //prolem with brcrpyt
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) return res.status(400).send('Invalid password.')
      
      const token = user.generateAuthToken();
      
      return res.send(token); 
      } catch (ex) {
      return res.status(500).send(`Internal Server Error: ${ex}`); }
      });

 //DELETE USER
  router.delete('/:id', async (req,res) => {
    try{
        const user = await User.findByIdAndRemove(req.params.id);
        if(!user)
        return res.status (400).send(`The user with id "${id.params.id}" does not exist`)
        return res.send(user)
    }catch (ex) {
        return res.status(500).send(`Internal Server Error:${ex}`);
        }
});
