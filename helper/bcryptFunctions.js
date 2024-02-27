const bcrypt = require("bcrypt");

const hashPassword = (password) => {
  const result = bcrypt.hashSync(password, bcrypt.genSaltSync(8));

  return result;
};

const comparePassword = (password, databasePassword) => {
  const result = bcrypt.compareSync(password, databasePassword);

  return result;
};

module.exports = { hashPassword, comparePassword };
