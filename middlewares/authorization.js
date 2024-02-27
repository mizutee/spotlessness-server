const authorization = async (req, res, next) => {
  try {
    const role = req.user.role
    if(role === 'admin') {
        next()
    } else {
        throw {error: "No authorization!", status: 401}
    }
  } catch (error) {
    next(error);
  }
};

module.exports = authorization;
