// Registration and Login controller

const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

// Registration logic
exports.signup = (req, res) => {
  // create a user instance
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });
  
  user.save((err, user) => {
    // if there is an error while creating a user instance
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    // if the user request contains a specified role  
    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles }
        },
        (err, roles) => {
          // if the role is not found
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          // else save the role and map it to the respective role id
          user.roles = roles.map(role => role._id);
          // save the user
          user.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      // this role is the default role of the application
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

// Login logic
exports.signin = (req, res) => {
  // check if username exists in the server
  User.findOne({
    username: req.body.username
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      
      // if user does not exist in the server
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      
      // compare the provided password to the password in the server
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }
      
      // create token
      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });
      
      // create authorities array: a new name for all the roles in the roles array after adding the prefix..
      var authorities = [];
      
      // for each role in the roles array, add the prefix ROLE_, and convert the role name to uppercase
      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      // return the user details
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token
      });
    });
};
