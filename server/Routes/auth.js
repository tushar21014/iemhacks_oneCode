const express = require('express');
const User = require('../Models/User');
const app = express();
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Signature = 'Tushar'
app.use(express.json());
const fetchuser = require('../middleware/fetchuser');


// To Create A user
router.post('/createuser', [
  body('email', 'Please enter a valid email').isEmail(),
  body('pass', 'Password length should be minimum 5 letters').isLength({ min: 5 }),
  // body('phone').isMobilePhone,
], async (req, res) => {

  console.log("I am hit")
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(402).json({ errors: errors.array() });
    console.log({ errors })
  }

  const saltRounds = await bcrypt.genSalt(10);
  let secPass = await bcrypt.hash(req.body.pass, saltRounds)

  try {
    await User.create({
      email: req.body.email,
      pass: secPass,
      username: req.body.username
    })


    res.json({ success: true })
    console.log("Account Created")


  } catch (error) {
    console.log(error)
    res.json({ success: false })
  }

});



// To login the user

router.post('/login', [
  body('email', 'Please enter a valid email').isEmail(),
  body('pass', 'Password length should be minimum 5 letters').isLength({ min: 5 }),
], async (req, res) => {


  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    console.log(errors)
  }
  const { email, pass } = req.body
  try {

    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(400).json({ errors: "Login with correct credentials" });
    }

    if (!user.pass) {
      return res.status(400).json({ errors: "Password not found" });
    }

    const pwdCompare = await bcrypt.compare(pass, user.pass)
    if (!pwdCompare) {
      return res.status(402).json({ errors: "Login with correct credentials" })
    }


    const data = {
      userr: {
        id: user._id
      }
    }

    // console.log(data);

    const authToken = jwt.sign(data, Signature)
    // await User.findByIdAndUpdate(user._id,{isOnline: true, isOffline: false})
    res.json({ success: true, authToken: authToken })
    console.log("Logged in SuccessFully")


  } catch (error) {
    console.log(error)
    res.json({ success: false })
  }

});

router.put('/updateOnlinestatus', fetchuser, async (req, res) => {
  let userId = req.user;
  try {

    await User.findByIdAndUpdate(userId, { isOnline: true, isOffline: false, isFree: true, socketId: req.body.socketId });
    res.status(200).json({ message: "Status updated successfully" }); // Send JSON response
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" }); // Send JSON response for error
  }
});


router.post('/findFreeUser', fetchuser, async (req, res) => {
  const userId = req.user;
  const currentUser = await User.findById(userId);

  try {
    const response = await User.findOne({
      isOnline: true,
      isOffline: false,
      isFree: true,
      _id: { $ne: userId }    // Apne user ke ilava result m dikhayega
    });

    if (!response)
      return res.json({ message: "No user is available right now" });

    else {  
      let ress1 = await User.findByIdAndUpdate(userId, { currentConnection: response.socketId,isFree:false });  
      let ress2 = await User.findByIdAndUpdate(response._id , { currentConnection: currentUser.socketId,isFree:false}); 
      return res.json(response).status(200);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// router.put("/updateFindingstatus", fetchuser, async (req, res) => {
//   let userId = req.user;
//   try {
//     await User.findByIdAndUpdate(userId, { isFree: false })
//     res.json({ message: "Updated" }).status(200)
//   } catch (error) {
//     console.log(error);
//     res.json({ message: "Error while updating offline status" }).status(500);
//   }
// })

router.put("/updateDisconnect", fetchuser, async (req, res) => {
  let userId = req.user;
  try {
    await User.findByIdAndUpdate(userId, { isFree: false, isOnline: false,isOffline:true });
    res.json({ message: "Disconnected" }).status(200)
  } catch (error) {
    console.log(error);
    res.json({ message: "Error while updating offline status" }).status(500);
  }
})

router.put("/connectFriend", fetchuser, async (req, res) => {
  const userId = req.user._id; // Assuming the fetchuser middleware adds the user object to req.user
  const secondSocketId = req.body.targetId;
  
  try {
    setTimeout(async () => {
      const targetUser = await User.findOne({ socketId: secondSocketId });

      if (!targetUser) {
        res.status(404).json({ message: "Target user not found" });
        return;
      }

      // Logic for sending accept/decline options to the targetUser's socket

      // Assuming the targetUser's socket listens for the accept/decline response and triggers the following
      // if targetUser accepts the request
      if (accepted) {
        targetUser.friends.push(userId);
        await targetUser.save();
        res.json({ message: "Friend request accepted" });
      } else {
        res.json({ message: "Friend request declined" });
      }

    }, 300000); // 5 minutes in milliseconds
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error while updating offline status" });
  }
});




module.exports = router;