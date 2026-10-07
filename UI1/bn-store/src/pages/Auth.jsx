import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useLanguage } from '../LanguageContext';

const loadFbSdk = () => {
  return new Promise((resolve) => {
    if (window.FB) {
      resolve();
      return;
    }
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: '1287278943338096',
        cookie: true,
        xfbml: true,
        version: 'v16.0'
      });
      resolve();
    };

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  });
};

export function Login() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoResponse.json();

        const payload = {
          email: userInfo.email,
          name: userInfo.name,
          socialId: userInfo.sub,
          avatar: userInfo.picture
        };

        const beResponse = await fetch('/identity/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (beResponse.ok) {
          const data = await beResponse.json();
          localStorage.setItem('user', JSON.stringify(data));
          window.location.href = '/';
        } else {
          setError(lang === 'vi' ? 'Đăng nhập Google thất bại tại máy chủ.' : 'Google login failed on server.');
        }
      } catch (err) {
        setError(lang === 'vi' ? 'Lỗi khi lấy thông tin từ Google.' : 'Error getting info from Google.');
      }
    },
    onError: () => setError(lang === 'vi' ? 'Đăng nhập Google thất bại.' : 'Google login failed.'),
  });

  const handleFacebookSuccess = async (userInfo) => {
    try {
      const payload = {
        email: userInfo.email || `${userInfo.id}@facebook.com`,
        name: userInfo.name,
        socialId: userInfo.id,
        avatar: userInfo.picture?.data?.url || ''
      };

      const beResponse = await fetch('/identity/api/auth/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (beResponse.ok) {
        const data = await beResponse.json();
        localStorage.setItem('user', JSON.stringify(data));
        window.location.href = '/';
      } else {
        setError(lang === 'vi' ? 'Đăng nhập Facebook thất bại tại máy chủ.' : 'Facebook login failed on server.');
      }
    } catch (err) {
      setError(lang === 'vi' ? 'Lỗi khi đăng nhập Facebook.' : 'Error logging in with Facebook.');
    }
  };

  const loginWithFacebook = async () => {
    await loadFbSdk();
    window.FB.login((response) => {
      if (response.authResponse) {
        window.FB.api('/me', { fields: 'name,email,picture' }, (userInfo) => {
          handleFacebookSuccess(userInfo);
        });
      } else {
        setError(lang === 'vi' ? 'Đăng nhập Facebook bị từ chối.' : 'Facebook login cancelled.');
      }
    }, { scope: 'public_profile' });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/identity/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data));
        window.location.href = '/';
      } else {
        const errText = await response.text();
        setError(errText || (lang === 'vi' ? 'Đăng nhập thất bại. Kiểm tra lại thông tin.' : 'Login failed. Please check your credentials.'));
      }
    } catch (err) {
      setError(lang === 'vi' ? 'Lỗi kết nối mạng.' : 'Network connection error.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-scale-in">
        <h2 className="auth-title">{lang === 'vi' ? 'Đăng Nhập' : 'Login'}</h2>
        <p className="auth-sub">{lang === 'vi' ? 'Chào mừng trở lại! Vui lòng đăng nhập thông tin của bạn.' : 'Welcome back! Please enter your details.'}</p>

        {error && <div className="zara-error-banner">
          <i className="ri-error-warning-line"></i> {error}
        </div>}

        <form onSubmit={handleLogin}>
          <div className="floating-group">
            <input
              type="email"
              id="login-email"
              placeholder=" "
              className={`floating-input ${email ? 'has-value' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="login-email" className="floating-label">Email</label>
          </div>
          <div className="floating-group">
            <input
              type="password"
              id="login-password"
              placeholder=" "
              className={`floating-input ${password ? 'has-value' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="login-password" className="floating-label">{lang === 'vi' ? 'Mật khẩu' : 'Password'}</label>
          </div>

          <div className="auth-options">
            <label className="checkbox-label">
              <input type="checkbox" /> {lang === 'vi' ? 'Ghi nhớ đăng nhập' : 'Remember me'}
            </label>
            <Link to="/forgot-password" className="forgot-link">{lang === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}</Link>
          </div>

          <button type="submit" className="zara-submit-btn">{lang === 'vi' ? 'Đăng Nhập' : 'Login'}</button>
        </form>

        <div className="divider"><span>{lang === 'vi' ? 'Hoặc đăng nhập với' : 'Or login with'}</span></div>

        <div className="social-login">
          <button type="button" className="social-btn" onClick={loginWithGoogle}>
            <i className="ri-google-fill" style={{ color: '#DB4437' }}></i> Google
          </button>
          <button type="button" className="social-btn" onClick={loginWithFacebook}>
            <i className="ri-facebook-circle-fill" style={{ color: '#4267B2' }}></i> Facebook
          </button>
        </div>

        <div className="auth-footer">
          {lang === 'vi' ? (
            <>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></>
          ) : (
            <>Don't have an account? <Link to="/register">Register now</Link></>
          )}
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoResponse.json();

        const payload = {
          email: userInfo.email,
          name: userInfo.name,
          socialId: userInfo.sub,
          avatar: userInfo.picture
        };

        const beResponse = await fetch('/identity/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (beResponse.ok) {
          const data = await beResponse.json();
          localStorage.setItem('user', JSON.stringify(data));
          window.location.href = '/';
        } else {
          setError(lang === 'vi' ? 'Đăng nhập Google thất bại tại máy chủ.' : 'Google login failed on server.');
        }
      } catch (err) {
        setError(lang === 'vi' ? 'Lỗi khi lấy thông tin từ Google.' : 'Error getting info from Google.');
      }
    },
    onError: () => setError(lang === 'vi' ? 'Đăng nhập Google thất bại.' : 'Google login failed.'),
  });

  const handleFacebookSuccess = async (userInfo) => {
    try {
      const payload = {
        email: userInfo.email || `${userInfo.id}@facebook.com`,
        name: userInfo.name,
        socialId: userInfo.id,
        avatar: userInfo.picture?.data?.url || ''
      };

      const beResponse = await fetch('/identity/api/auth/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (beResponse.ok) {
        const data = await beResponse.json();
        localStorage.setItem('user', JSON.stringify(data));
        window.location.href = '/';
      } else {
        setError(lang === 'vi' ? 'Đăng ký Facebook thất bại tại máy chủ.' : 'Facebook registration failed on server.');
      }
    } catch (err) {
      setError(lang === 'vi' ? 'Lỗi khi lấy thông tin từ Facebook.' : 'Error getting info from Facebook.');
    }
  };

  const loginWithFacebook = async () => {
    await loadFbSdk();
    window.FB.login((response) => {
      if (response.authResponse) {
        window.FB.api('/me', { fields: 'name,email,picture' }, (userInfo) => {
          handleFacebookSuccess(userInfo);
        });
      } else {
        setError(lang === 'vi' ? 'Đăng ký Facebook bị từ chối.' : 'Facebook registration cancelled.');
      }
    }, { scope: 'public_profile' });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError(lang === 'vi' ? 'Mật khẩu xác nhận không khớp' : 'Passwords do not match');
      return;
    }
    try {
      const response = await fetch('/identity/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (response.ok) {
        navigate('/login');
      } else {
        const errText = await response.text();
        setError(errText || (lang === 'vi' ? 'Đăng ký thất bại. Email có thể đã được sử dụng.' : 'Registration failed. Email might be in use.'));
      }
    } catch (err) {
      setError(lang === 'vi' ? 'Lỗi kết nối mạng.' : 'Network connection error.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-scale-in">
        <h2 className="auth-title">{lang === 'vi' ? 'Tạo Tài Khoản' : 'Create Account'}</h2>
        <p className="auth-sub">{lang === 'vi' ? 'Đăng ký để nhận những ưu đãi mới nhất.' : 'Sign up to receive the latest offers.'}</p>

        {error && <div className="zara-error-banner">
          <i className="ri-error-warning-line"></i> {error}
        </div>}

        <form onSubmit={handleRegister}>
          <div className="floating-group">
            <input
              type="text"
              id="register-name"
              placeholder=" "
              className={`floating-input ${name ? 'has-value' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label htmlFor="register-name" className="floating-label">{lang === 'vi' ? 'Họ và tên' : 'Full Name'}</label>
          </div>
          <div className="floating-group">
            <input
              type="email"
              id="register-email"
              placeholder=" "
              className={`floating-input ${email ? 'has-value' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="register-email" className="floating-label">Email</label>
          </div>
          <div className="floating-group">
            <input
              type="password"
              id="register-password"
              placeholder=" "
              className={`floating-input ${password ? 'has-value' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="register-password" className="floating-label">{lang === 'vi' ? 'Mật khẩu' : 'Password'}</label>
          </div>
          <div className="floating-group">
            <input
              type="password"
              id="register-confirm"
              placeholder=" "
              className={`floating-input ${confirmPassword ? 'has-value' : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <label htmlFor="register-confirm" className="floating-label">{lang === 'vi' ? 'Xác nhận mật khẩu' : 'Confirm Password'}</label>
          </div>

          <button type="submit" className="zara-submit-btn" style={{ marginTop: '1.5rem' }}>{lang === 'vi' ? 'Đăng Ký' : 'Register'}</button>
        </form>

        <div className="divider"><span>{lang === 'vi' ? 'Hoặc đăng ký với' : 'Or register with'}</span></div>

        <div className="social-login">
          <button type="button" className="social-btn" onClick={loginWithGoogle}>
            <i className="ri-google-fill" style={{ color: '#DB4437' }}></i> Google
          </button>
          <button type="button" className="social-btn" onClick={loginWithFacebook}>
            <i className="ri-facebook-circle-fill" style={{ color: '#4267B2' }}></i> Facebook
          </button>
        </div>

        <div className="auth-footer">
          {lang === 'vi' ? (
            <>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></>
          ) : (
            <>Already have an account? <Link to="/login">Login</Link></>
          )}
        </div>
      </div>
    </div>
  );
}

export function ForgotPassword() {
  const { lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email input, 2: OTP & password input, 3: Success
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/identity/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setStep(2);
      } else {
        const errMsg = await res.text();
        setError(errMsg || (lang === 'vi' ? 'Email không tồn tại hoặc lỗi máy chủ.' : 'Email does not exist or server error.'));
      }
    } catch (err) {
      setError(lang === 'vi' ? 'Lỗi kết nối mạng.' : 'Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError(lang === 'vi' ? 'Mật khẩu xác nhận không khớp' : 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/identity/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      if (res.ok) {
        setStep(3);
      } else {
        const errMsg = await res.text();
        setError(errMsg || (lang === 'vi' ? 'Mã OTP không hợp lệ hoặc đã hết hạn.' : 'OTP code is invalid or expired.'));
      }
    } catch (err) {
      setError(lang === 'vi' ? 'Lỗi kết nối mạng.' : 'Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-scale-in">
        <h2 className="auth-title">
          {step === 1 && (lang === 'vi' ? 'Khôi Phục Mật Khẩu' : 'Reset Password')}
          {step === 2 && (lang === 'vi' ? 'Xác Minh OTP' : 'OTP Verification')}
          {step === 3 && (lang === 'vi' ? 'Thành Công' : 'Success')}
        </h2>
        
        {error && <div className="zara-error-banner">
          <i className="ri-error-warning-line"></i> {error}
        </div>}

        {step === 1 && (
          <>
            <p className="auth-sub">{lang === 'vi' ? 'Nhập email của bạn và chúng tôi sẽ gửi mã xác minh khôi phục mật khẩu.' : 'Enter your email and we will send a verification code to reset your password.'}</p>
            <form onSubmit={handleRequestOtp}>
              <div className="floating-group">
                <input
                  type="email"
                  id="forgot-email"
                  placeholder=" "
                  className={`floating-input ${email ? 'has-value' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label htmlFor="forgot-email" className="floating-label">Email</label>
              </div>
              <button type="submit" className="zara-submit-btn" style={{ marginTop: '1.5rem' }} disabled={loading}>
                {loading ? (lang === 'vi' ? 'Đang gửi...' : 'Sending...') : (lang === 'vi' ? 'Gửi Yêu Cầu' : 'Submit Request')}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <p className="auth-sub">
              {lang === 'vi' 
                ? `Mã OTP đã được gửi đến email ${email} (hoặc kiểm tra log console backend). Vui lòng nhập mã OTP và mật khẩu mới.`
                : `OTP has been sent to ${email} (or check backend console log). Please enter the OTP and your new password.`}
            </p>
            <form onSubmit={handleResetPassword}>
              <div className="floating-group">
                <input
                  type="text"
                  id="otp-code"
                  placeholder=" "
                  className={`floating-input ${otp ? 'has-value' : ''}`}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <label htmlFor="otp-code" className="floating-label">{lang === 'vi' ? 'Mã OTP (6 chữ số)' : 'OTP Code (6 digits)'}</label>
              </div>
              <div className="floating-group">
                <input
                  type="password"
                  id="new-password"
                  placeholder=" "
                  className={`floating-input ${newPassword ? 'has-value' : ''}`}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <label htmlFor="new-password" className="floating-label">{lang === 'vi' ? 'Mật khẩu mới' : 'New Password'}</label>
              </div>
              <div className="floating-group">
                <input
                  type="password"
                  id="confirm-password"
                  placeholder=" "
                  className={`floating-input ${confirmPassword ? 'has-value' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <label htmlFor="confirm-password" className="floating-label">{lang === 'vi' ? 'Xác nhận mật khẩu' : 'Confirm Password'}</label>
              </div>
              <button type="submit" className="zara-submit-btn" style={{ marginTop: '1.5rem' }} disabled={loading}>
                {loading ? (lang === 'vi' ? 'Đang xác nhận...' : 'Verifying...') : (lang === 'vi' ? 'Đặt Lại Mật Khẩu' : 'Reset Password')}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(0, 0, 0, 0.05)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>
              <i className="ri-check-line"></i>
            </div>
            <h3 style={{ marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-display)' }}>
              {lang === 'vi' ? 'Đặt lại mật khẩu thành công' : 'Password Reset Successfully'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {lang === 'vi' 
                ? 'Mật khẩu của bạn đã được cập nhật thành công. Bạn có thể sử dụng mật khẩu mới để đăng nhập!'
                : 'Your password has been successfully updated. You can now use your new password to login!'}
            </p>
          </div>
        )}
        
        <div className="auth-footer" style={{ marginTop: '3rem' }}>
          <Link to="/login"><i className="ri-arrow-left-line"></i> {lang === 'vi' ? 'Quay lại đăng nhập' : 'Back to login'}</Link>
        </div>
      </div>
    </div>
  );
}

