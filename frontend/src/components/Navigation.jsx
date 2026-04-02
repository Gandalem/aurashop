import React, { useState, useEffect } from 'react';
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
        // 🚨 수정됨: 지울 때도 'accessToken'을 지우도록 변경!
        localStorage.removeItem('accessToken');
        localStorage.removeItem('role');
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
                    <li><a href="/cs">CUSTOMER SERVICE</a></li>
                </ul>

                <div className="navbar-icons">
                    <a href="/cart" className="icon-link">CART</a>

                    {isLoggedIn ? (
                        <>
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