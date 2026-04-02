import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/Navigation.css';

const Navigation = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSeller, setIsSeller] = useState(false);

    useEffect(() => {
        // 🚨 수정됨: 'token'이 아니라 'accessToken'을 찾도록 변경!
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('role');

        if (token) {
            setIsLoggedIn(true);
            if (role === 'SELLER') {
                setIsSeller(true);
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