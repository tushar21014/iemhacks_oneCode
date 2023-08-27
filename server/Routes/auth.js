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
require("dotenv").config();


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
      _id: { $ne: userId },    // Apne user ke ilava result m dikhayega,
    });

    if (!response)
      return res.json({ message: "No user is available right now", usersAvailables: false });

    else {
      let ress1 = await User.findByIdAndUpdate(userId, { currentConnection: response.socketId, isFree: false });
      let ress2 = await User.findByIdAndUpdate(response._id, { currentConnection: currentUser.socketId, isFree: false });
      return res.json(response).status(200);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", usersAvailables: false });
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

router.put("/updateDisconnect", async (req, res) => {
  let socketId = req.body.socketId
  try {
    await User.findOneAndUpdate({socketId: socketId}, { isFree: false, isOnline: false, isOffline: true });
    res.json({ message: "Disconnected",success:"true" }).status(200)
  } catch (error) {
    console.log(error);
    res.json({ message: "Error while updating offline status" }).status(500);
  }
})

router.post("/makeFriend", fetchuser, async (req, res) => {
  let userId = req.user;
  const secondUsersocketId = req.body.current_connection;
  console.log("userId", userId)
  console.log("Second userId: ", secondUsersocketId)
  try {
    const firstUser = await User.findById(userId);
    const secondUser = await User.findOne({ socketId: secondUsersocketId });
    // console.log("First User: ", firstUser)
    // console.log("Second User: ", secondUser)

    if (firstUser.friends.includes(secondUser._id)) {
      return res.json({ message: "Friend already exists." });
    }

    if (secondUser.friends.includes(firstUser._id)) {
      return res.json({ message: "Friend already exists." });
    }

    const updatedFirstUser = await User.findByIdAndUpdate(
      firstUser._id,
      { $push: { friends: secondUser._id } },
      { new: true }
    );

    const updatedSecondUser = await User.findByIdAndUpdate(
      secondUser._id,
      { $push: { friends: firstUser._id } },
      { new: true }
    );

    if (!updatedFirstUser || !updatedSecondUser) {
      return res.json({ message: "There was an error" });
    }

    // Calculate the expiration timestamp for the timer
    const TWO_DAYS_IN_MILLISECONDS = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

    const timerExpiration = Date.now() + TWO_DAYS_IN_MILLISECONDS;

    // Store the timer expiration timestamp in both users' documents
    await User.findByIdAndUpdate(userId, { $set: { friendTimerExpires: timerExpiration } });
    await User.findByIdAndUpdate(secondUser._id, { $set: { friendTimerExpires: timerExpiration } });

    setTimeout(async () => {
      const firstUserAfterTimeout = await User.findById(userId);
      const secondUserAfterTimeout = await User.findById(secondUser._id);

      if (
        firstUserAfterTimeout.friendTimerExpires <= Date.now() ||
        secondUserAfterTimeout.friendTimerExpires <= Date.now()
      ) {
        // Remove users from each other's friends arrays
        await User.findByIdAndUpdate(userId, { $pull: { friends: secondUser._id } });
        await User.findByIdAndUpdate(secondUser._id, { $pull: { friends: userId } });
      }
    }, TWO_DAYS_IN_MILLISECONDS);

    return res.json({
      message: "You are now friends... Enjoy",
      success: true,
      friendTimerExpires: timerExpiration
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error making friends" });
  }
});

// router.post("/makeFriend", fetchuser, async (req, res) => {
//   let userId = req.user;
//   let secondUsersocketId = req.body.current_connection
//   try {
//     const firstUser = await User.findById(userId);
//     const secondUser = await User.findOne({ socketId: secondUsersocketId });
    
//     if(firstUser.friends.includes(secondUser._id)){
//       return res.json({message: "Friend Already exist."})
//     }

//     if(secondUser.friends.includes(firstUser._id)){
//       return res.json({message: "Friend Already exist."})
//     }
//     let ress = await User.findByIdAndUpdate(userId, { $push: { friends: secondUser._id } }, { new: true });
//     const ress2 = await User.findByIdAndUpdate(secondUser._id, { $push: { friends: firstUser._id } }, { new: true });
//     if (!ress) {
//       res.json({ message: "There is an error" })
//     }
//     if (!ress2) {
//       res.json({ message: "There is an error" })
//     }
//     return res.json({ message: "You are now friends... Enjoy", success: true })
//   } catch (error) {
//     console.log(error)
//   }
// })

router.post("/getFriend", fetchuser, async (req, res) => {
  let userId = req.user;
  try {
    const firstUser = await User.findById(userId);
    
    const friendsCount = firstUser.friends.length;
    const friendUsernames = [];

    for (const friendId of firstUser.friends) {
      const friend = await User.findById(friendId);
      if (friend) {
        friendUsernames.push(friend.username);
      }
    }

    res.json({ friendsCount: friendsCount, friendUsernames: friendUsernames });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching friends" });
  }
});



// Sending a Link to user email to reset password
router.post('/sendLink', async (req, res) => {
  const email = req.body.email;

  if (!email) {
    res.status(401).json({ status: 401, message: "Enter your email" });
  }
  else {

    try {
      const ans = await User.findOne({ "email": email });
      if (ans) {
        const token = jwt.sign({ _id: ans.id }, Signature, {
          expiresIn: '300s'
        });
        console.log(token);
        res.status(200).json(ans);

        const setUserToken = await User.findByIdAndUpdate({ _id: ans.id }, { verify_token: token }, { new: true })


        // Set up a nodemailer SMTP transporter with your email credentials
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          port: 25,
          secure: false,
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
          }
        });

        const message = {
          from: 'Talk o lytic',
          to: email,
          subject: 'Password Reset Link',
          text: `Click the following link to reset your password: https://talkolytic-app.com/ResetPassword/${ans.id}/${token}`,
          html: `<body>
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;">
              <div style="background-color: white; border-radius: 10px; padding: 20px; box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.3);">
                <h2>Hello ${ans.name},</h2>
                <p>We've received a request to reset your password. To proceed with the password reset, click the button below:</p>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="https://talkolytic-app.com/ResetPassword/${ans.id}/${token}" style="background-color: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Reset Password</a>
                </div>
                <p style="margin-top: 20px;">If you didn't request a password reset, you can safely ignore this email.</p>
                <p>Note: This link is valid for 5 minutes.</p>
                <p>Thank you for using Talk o lytic!</p>
              </div>
            </div>
          </body>`
        };


        // Send the email with nodemailer
        transporter.sendMail(message, (error, info) => {
          if (error) {
            console.error(error);
            res.status(500).json({ message: 'Error sending email' });
          } else {
            console.log('Email sent: ', info.response);
            res.status(200).json(ans);
          }
        });

        console.log(setUserToken);


      }
      else {
        res.status(401).send({ "message": "User not found", "success": false });
      }

    } catch (error) {
      console.error(error);
    }
  }
})

// Route to change password
router.put('/changePass/:id/:token', async (req, res) => {
  try {
    const { id, token } = req.params;

    // Check for valid user and token
    const validUser = await User.findOne({ _id: id, verify_token: token });

    if (!validUser) {
      res.status(401).send({ message: 'Invalid User or Token' });
      return;
    }

    // Verify token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, Signature);
    } catch (error) {
      res.status(401).send({ message: 'Authentication failed!' });
      return;
    }

    const { pass } = req.body;
    const saltRounds = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(pass, saltRounds);

    const response = await User.findByIdAndUpdate(id, { pass: secPass });

    if (response) {
      res.status(200).send({ message: 'Password Changed successfully' });
      console.log('Password Changed Successfully');
    } else {
      res.status(500).send({ message: 'Error while changing password' });
      console.log('Problem while changing pass');
    }
  } catch (error) {
    console.log(error);
  }
});

router.put('/reactionUpdate', async(req,res)=>{
  let current_connection = req.body.targetID
  try {
    let firstuser = await User.findOneAndUpdate({socketId: current_connection },{isFree: true});
    if(firstuser){
      res.json({message:"Updated Successfully", success: true})
    }
    else{
      res.json({message:"User not Found", success: false});
    }
    
  } catch (error) {
    console.log(error)
  }
})

module.exports = router;