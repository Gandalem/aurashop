import React, { useState } from 'react';
import axios from 'axios';
import Spinner from '../Spinner';
import { toast } from 'react-toastify'; // 🌟 1. 예쁜 알림창(Toast) 도구 불러오기
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
                // 토큰 저장
                localStorage.setItem('accessToken', response.data.accessToken || response.data.token);
                localStorage.setItem('role', response.data.role);

                // 🌟 2. 기존 투박한 alert 대신 예쁜 toast.success 사용!
                toast.success("로그인 성공! 환영합니다 🎉");

                // 🌟 3. 사용자가 알림을 읽을 수 있도록 1.5초 뒤에 메인으로 이동
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            })
            .catch(err => {
                console.error("로그인 실패:", err);
                setError("이메일이나 비밀번호가 일치하지 않습니다.");
                setLoading(false); // 에러 발생 시 로딩 끄고 다시 폼 보여주기
            });
    };

    return (
        <div className="signin-container">
            <div className="signin-box">
                <h2>SIGN IN</h2>
                <p>AURA에 오신 것을 환영합니다.</p>

                {loading ? (
                    <div style={{ padding: '50px 0' }}>
                        <Spinner />
                        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                            로그인 처리 중입니다...
                        </p>
                    </div>
                ) : (
                    <>
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

                            <button type="submit" className="signin-btn">
                                SIGN IN
                            </button>
                        </form>

                        <div className="signin-links">
                            <a href="/signup">회원가입</a>
                            <span>|</span>
                            <a href="#none">비밀번호 찾기</a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SignIn;