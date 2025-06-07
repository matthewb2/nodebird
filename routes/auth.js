const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();
router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  console.log('req.body:', email, nick, password);
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      // 이미 해당 이메일 주소가 있는 경우
      req.flash('joinError', '이미 가입된 이메일입니다');
      return res.redirect('/join');
    }
    // 이메일 주소가 중복되지 않아 사용자 생성(가입))
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect('/');
  } catch (error) {
    // 과정 중 오류 발생
    console.error(error);
    return next(error);
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      // authError 인자가 null이 아닌 경우 = 인증 실패
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      // 사용자ID 없는 경우
      req.flash('loginError', info.message);
      return res.redirect('/');
    }
    // passport는 req에 login, logout 메서드를 추가한다.
    // req.login은 user 객체를 인자로 사용해 passport.serializeUser를 호출한다.
    return req.login(user, (loginError) => {
      if (loginError) {
        // 로그인 프로세스 중 오류
        console.error(loginError);
        return next(loginError);
      }
      // 정상 로그인
      return res.redirect('/');
    })
  })(req, res, next);
});

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', 
{
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('/');
});

router.get('/logout', isLoggedIn, (req, res, next) => { // next 인자 추가 (콜백에서 에러 처리 위함)
  // 기존: req.logout();
  // 수정: req.logout()에 콜백 함수를 전달
  req.logout((err) => { // 콜백 함수 추가, err는 오류가 발생했을 경우 전달됩니다.
    if (err) {
      console.error(err);
      return next(err); // 에러 발생 시 다음 에러 핸들러로 전달
    }
    req.session.destroy(); // 세션 파괴 (로그아웃 후 세션 데이터 정리)
    res.redirect('/'); // 로그아웃 후 리다이렉트
  });
});

module.exports = router;