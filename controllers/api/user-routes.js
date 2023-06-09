// Import necessary modules
const router = require("express").Router();
const { User } = require("../../models");

// Route to get all users
router.get("/", (req, res) => {
  User.findAll({
    attributes: { exclude: ["password"] },
  })
    .then((dbUserData) => res.json(dbUserData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});
// Route to sign up a new user
router.post("/signup", async (req, res) => {
  console.log("req body: "+ JSON.stringify(req.body))
  try {
    const newUser = User.build({ name: req.body.name, email: req.body.email, password: req.body.password});
    // newUser.name = req.body.name;
    // newUser.email = req.body.email;
    // newUser.password = req.body.password;

    const userData = await newUser.save();

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.status(200).json(userData);
    });
  } catch (err) {
    res.status(400).json(err);
    console.log(err);
  }
});
// Route to log in a user
router.post("/login", async (req, res) => {
  console.log("req.body: "+JSON.stringify(req.body))
  console.log("req.body.email: "+req.body.email)
  try {
    const userData = await User.findOne({ where: { email: req.body.email} });
    console.log(userData)

    if (!userData) {
      res
        .status(400)
        .json({ message: "Incorrect username or password, please try again" });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password.toString());
    console.log(validPassword)

    if (!validPassword) {
      res
        .status(400)
        .json({ message: "Incorrect email or password, please try again" });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res
        .status(200)
        .json({ user: userData, message: "You are now logged in!" });
    });
  } catch (err) {
    res.status(404).json(err);
  }
});
// Route to log out a user
router.post("/logout", (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.redirect("/")
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});
// Export the router
module.exports = router;
