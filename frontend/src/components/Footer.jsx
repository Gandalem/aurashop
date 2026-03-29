import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
    // 🌟 핵심: 현재 브라우저에 저장된 사용자의 권한(role)을 확인합니다!
    const role = localStorage.getItem('role');

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-links">
                    <a href="#!">이용약관</a>
                    <a href="#!">개인정보처리방침</a>

                    {/* 🌟 똑똑한 분기 처리: 판매자냐 아니냐에 따라 다른 버튼 보여주기! */}
                    {role === 'SELLER' ? (
                        <Link to="/seller/dashboard" className="seller-center-link">
                            🏪 내 판매자 대시보드
                        </Link>
                    ) : (
                        <Link to="/seller" className="seller-center-link">
                            🏪 판매자 센터 (입점신청)
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