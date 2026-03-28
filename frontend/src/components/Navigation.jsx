import React, { useState, useEffect } from 'react';
import '../styles/Navigation.css';

const Navigation = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSeller, setIsSeller] = useState(false); // 🌟 판매자 여부를 확인하는 상태 추가

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role'); // 🌟 저장해둔 권한 꺼내기

        if (token) {
            setIsLoggedIn(true);
            // 권한이 SELLER라면 isSeller를 true로 변경
            if (role === 'SELLER') {
                setIsSeller(true);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role'); // 🌟 로그아웃 시 권한 정보도 같이 지워주세요!
        localStorage.removeItem('userName');

        setIsLoggedIn(false);
        setIsSeller(false);

        alert('로그아웃 되었습니다.');
        window.location.href = '/';
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">

                <div className="navbar-logo">
                    <a href="/">AURA</a>
                </div>

                <ul className="navbar-menu">
                    <li><a href="/">NEW ARRIVALS</a></li>
                    <li><a href="/">WOMEN</a></li>
                    <li><a href="/">MEN</a></li>
                    <li><a href="/">ACCESSORIES</a></li>
                </ul>

                <div className="navbar-icons">
                    <a href="/cart" className="icon-link">CART</a>

                    {isLoggedIn ? (
                        <>
                            {/* 🌟 판매자(isSeller가 true)일 때만 이 버튼이 화면에 그려집니다! */}
                            {isSeller && (
                                <a href="/product/new" className="icon-link">ADD PRODUCT</a>
                            )}

                            <a href="/mypage" className="icon-link">MY PAGE</a>
                            <button onClick={handleLogout} className="logout-btn">SIGN OUT</button>
                        </>
                    ) : (
                        <a href="/signin" className="icon-link">SIGN IN</a>
                    )}
                </div>

            </div>
        </nav>
    );
};

export default Navigation;