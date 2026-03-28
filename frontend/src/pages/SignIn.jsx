import React, { useState } from 'react';
import axios from 'axios';
import '../styles/SignIn.css';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 백엔드의 진짜 로그인 API 호출!
        axios.post('http://localhost:8080/api/auth/login', {
            email: email,
            password: password})
            .then(response => {
                // 1. 토큰 저장
                localStorage.setItem('token', response.data.token);

                // 2. 🌟 백엔드에서 받은 권한(role)도 저장! (이 줄이 핵심입니다)
                localStorage.setItem('role', response.data.role);

                alert("로그인 성공!");
                window.location.href = '/'; // 메인 화면으로 이동
            })
            .catch(err => {
                console.error("로그인 실패:", err);
                setError("이메일이나 비밀번호가 일치하지 않습니다.");
                setLoading(false);
            });
    };

    return (
        <div className="signin-container">
            <div className="signin-box">
                <h2>SIGN IN</h2>
                <p>AURA에 오신 것을 환영합니다.</p>

                <form onSubmit={handleSubmit} className="signin-form">
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="이메일을 입력해 주세요"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력해 주세요"
                            required
                        />
                    </div>

                    {error && <div style={{ color: '#d9534f', fontSize: '13px', textAlign: 'left', marginTop: '-10px' }}>{error}</div>}

                    <button
                        type="submit"
                        className="signin-btn"
                        disabled={loading}
                        style={{ opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? '로그인 중...' : 'SIGN IN'}


                    </button>
                </form>

                <div className="signin-links">
                    <a href="/signup">회원가입</a>
                    <span>|</span>
                    <a href="#none">비밀번호 찾기</a>
                </div>
            </div>
        </div>
    );
};

export default SignIn;