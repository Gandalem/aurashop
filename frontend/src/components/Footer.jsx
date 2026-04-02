import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
    // 🌟 현재 브라우저에 저장된 사용자의 권한(role)을 확인합니다
    const role = localStorage.getItem('role');

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-links">
                    <a href="#!">이용약관</a>
                    <a href="#!">개인정보처리방침</a>

                    {/* 🌟 일반 손님에겐 아예 안 보이고, 사장님(SELLER) 계정으로 로그인했을 때만 대시보드 링크가 뜹니다! */}
                    {role === 'SELLER' && (
                        <Link to="/seller/dashboard" className="seller-center-link">
                            🏪 관리자 대시보드
                        </Link>
                    )}
                </div>

                <div className="footer-info">
                    <p>(주)아우라 스토어 | 대표자: 홍길동 | 서울특별시 강남구 테헤란로 123</p>
                    <p>사업자등록번호: 123-45-67890 | 통신판매업신고: 제2023-서울강남-1234호</p>
                    <p>고객센터: 1588-0000 (평일 09:00~18:00, 주말/공휴일 휴무)</p>
                </div>

                <div className="footer-copyright">
                    &copy; {new Date().getFullYear()} AURA Store. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;