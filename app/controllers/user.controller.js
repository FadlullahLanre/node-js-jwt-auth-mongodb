// Controller for testing Authorization..

// It contains four functions:

//    allAccess for public access
//    userBoard for loggedin users (any role)
//    adminBoard for moderator users
//    moderatorBoard for admin users


exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
