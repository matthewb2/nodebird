const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user'); // User 모델 경로가 맞는지 확인

module.exports = (passport) => {
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_ID, // 여기에 카카오 REST API 키를 입력합니다.
                                    // 예: 'YOUR_KAKAO_REST_API_KEY'
    clientSecret: process.env.KAKAO_SECRET, // 필요하다면 클라이언트 시크릿도 입력합니다.
                                            // 예: 'YOUR_KAKAO_CLIENT_SECRET'
    callbackURL: '/auth/kakao/callback', // Kakao Developers에 등록된 Redirect URI와 일치해야 합니다.
  }, async (accessToken, refreshToken, profile, done) => {
    console.log('kakao profile', profile);
    try {
      const exUser = await User.findOne({
        where: { snsId: profile.id, provider: 'kakao' },
      });
      if (exUser) {
        done(null, exUser);
      } else {
        const newUser = await User.create({
          email: profile._json && profile._json.kakao_account.email,
          nick: profile.displayName,
          snsId: profile.id,
          provider: 'kakao',
        });
        done(null, newUser);
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};