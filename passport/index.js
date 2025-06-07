const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { User } = require('../models');

/*
로그인 과정
1. 로그인 요청 들어옴
2. passport.authenticate 메서드 호출
3. 로그인 전략 수행
4. 로그인 성공 시 사용자 정보 객체와 함께 req.login 호출
5. req.login 메서드가 passport.serializeUser 호출
6. req.session에 사용자 아이디 저장
7. 로그인 완료

로그인 이후 과정
1. 매 요청마다 passport.session() 미들웨어가 passport.deserializeUser 메서드 호출
2. req.session에 저장된 아이디로 DB에서 사용자 조회
3. 조회된 사용자 정보를 req.user에 저장
4. 라우터에서 req.user 객체 사용
*/

module.exports = (passport) => {
  // req.session 객체에 user.id 저장
  passport.serializeUser((user, done) => {
    done(null, user.id);  // 첫 번쨰 인자는 에러 발생 시 사용
  });

  // passport.session() 미들웨어가 이 메서드를 호출
  // serializeUser에서 세션에 저장했던 아이디를 받아 DB에서 조회 후 req.user에 정보 저장
  passport.deserializeUser((id, done) => {
     /*
     User.findOne({
      where: { id },
      include: [{
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers',
      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings',
      }],
    })
    */
      // --- 여기부터 수정된 부분입니다 ---
    User.findOne({ where: { id },
    include: [{
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers',
      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings',
      }],
    
     }) // User.findOne의 인자는 하나의 객체여야 합니다.
    .then(user => done(null, user)) // 사용자 정보를 성공적으로 찾으면 done 호출
    .catch(err => done(err)); // 오류 발생 시 done 호출
  // --- 여기까지 수정된 부분입니다 ---
  });

  local(passport);
  kakao(passport);
};