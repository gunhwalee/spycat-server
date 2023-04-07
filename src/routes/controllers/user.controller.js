exports.signupEndpoint = (req, res, next) => {
  res.send({
    result: "ok",
    message: "회원가입이 정상처리됐습니다.",
  });
};
