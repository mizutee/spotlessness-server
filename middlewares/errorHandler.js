const errHandler = (err, req, res, next) => {
  if (err.error) {
    res.status(err.status).json({ error: err.error });
  } else {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { errHandler };
