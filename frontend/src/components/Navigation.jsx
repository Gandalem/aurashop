import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import '../styles/Navigation.css';

const Navigation = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSeller, setIsSeller] = useState(false);

    useEffect(() => {
        // 🚨 수정됨: 'token'이 아니라 'accessToken'을 찾도록 변경!
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('role');

        if (token) {
            try {
                // 🌟 1. JWT 토큰의 뱃속(Payload)을 열어서 만료 시간을 확인합니다.
                // (atob는 base64를 해독하는 브라우저 기본 함수입니다)
                const payload = JSON.parse(atob(token.split('.')[1]));
                const isExpired = payload.exp * 1000 < Date.now(); // 현재 시간과 비교

                if (isExpired) {
                    // 🌟 2. 토큰이 만료되었다면? 뒤에서 조용히 재발급을 요청합니다.
                    // (api.js를 쓰면 무한 루프에 빠질 수 있으므로 순수 axios를 사용합니다)
                    api.post('/api/auth/reissue', {}, {
                        withCredentials: true // 쿠키(Refresh Token)를 담아서 보냄
                    })
                        .then(res => {
                            // 성공적으로 새 토큰을 받아오면 교체하고 로그인 상태 유지!
                            localStorage.setItem('accessToken', res.data.accessToken);
                            setIsLoggedIn(true);
                            if (role === 'SELLER') setIsSeller(true);
                        })
                        .catch(() => {
                            // 🌟 3. 14일짜리 Refresh Token마저 만료되었다면?
                            // 미련 없이 찌꺼기를 지우고 확실하게 로그아웃 상태로 만듭니다.
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('role');
                            localStorage.removeItem('userName');
                            setIsLoggedIn(false);
                            setIsSeller(false);
                        });
                } else {
                    // 아직 만료되지 않은 쌩쌩한 토큰이라면 바로 로그인 처리
                    setIsLoggedIn(true);
                    if (role === 'SELLER') setIsSeller(true);
                }
            } catch (error) {
                // 토큰 형식이 이상하게 꼬였을 경우를 대비한 방어 로직
                localStorage.removeItem('accessToken');
                localStorage.removeItem('role');
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('role');
        localStorage.removeItem('userName');

        setIsLoggedIn(false);
        setIsSeller(false);

        // 🚨 기존의 투박한 alert 대신 예쁜 toast.success 사용!
        toast.success('성공적으로 로그아웃 되었습니다! 👋');

        // (참고: window.location.href로 바로 새로고침하면 알림이 안 보일 수 있으니
        // setTimeout을 주거나, react-router-dom의 useNavigate를 쓰는 것이 좋습니다.)
        setTimeout(() => {
            window.location.href = '/';
        }, 1500); // 1.5초 뒤에 메인으로 이동
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">

                <div className="navbar-logo">
                    {/* 로고는 메인으로 가도록 Link 처리 */}
                    <Link to="/">AURA</Link>
                </div>

                <ul className="navbar-menu">
                    {/* 🌟 2. 각 카테고리별로 다른 주소(경로)를 지정해 줍니다. */}
                    <li><Link to="/category/new">NEW ARRIVALS</Link></li>
                    <li><Link to="/category/women">WOMEN</Link></li>
                    <li><Link to="/category/men">MEN</Link></li>
                    <li><Link to="/category/accessories">ACCESSORIES</Link></li>
                    <li><Link to="/cs">CUSTOMER SERVICE</Link></li>
                </ul>

                <div className="navbar-icons">
                    {/* 우측 아이콘들도 모두 Link로 변경! */}
                    <Link to="/cart" className="icon-link">CART</Link>

                    {isLoggedIn ? (
                        <>
                            <Link to="/mypage" className="icon-link">MY PAGE</Link>
                            <button onClick={handleLogout} className="logout-btn">SIGN OUT</button>
                        </>
                    ) : (
                        <Link to="/signin" className="icon-link">SIGN IN</Link>
                    )}
                </div>

            </div>
        </nav>
    );
};

export default Navigation;