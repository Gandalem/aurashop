import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 🌟 CSS 파일 내부의 클래스 이름들도 .seller-... 로 변경해야 디자인이 적용됩니다.
import '../styles/SellerPage.css';
import ProductRegister from "../pages/ProductRegister.jsx";

const SellerPage = () => {
    // 🌟 1. 현재 선택된 탭을 관리하는 상태 (기본값: 상품 등록)
    const [activeTab, setActiveTab] = useState('product-register');

    // 🌟 2. 보안 체크: 진짜 판매자(SELLER)인지 확인
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        // 🌟 SELLER가 아니면 판매자 전용 로그인 페이지로 쫓아내기!
        if (!token || role !== 'SELLER') {
            window.location.href = '/seller'; // 관리자 로그인 주소(/admin)가 아닌 판매자 로그인 주소로 변경
        }
        // 실제 운영 시에는 백엔드 API를 호출하여 토큰의 유효성과 ROLE을 검증하는 것이 필수입니다.
    }, []);

    // --- (상품 등록 관련 상태 및 함수들) ---
    const [product, setProduct] = useState({ name: '', price: '', stockQuantity: '', description: '', imageUrl: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleProductSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');

        axios.post('http://localhost:8080/api/products', {
            name: product.name,
            price: Number(product.price),
            stockQuantity: Number(product.stockQuantity),
            description: product.description,
            imageUrl: product.imageUrl
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => {
                alert("상품이 성공적으로 등록되었습니다! 🎉");
                setProduct({ name: '', price: '', stockQuantity: '', description: '', imageUrl: '' });
                setLoading(false);
            })
            .catch(err => {
                console.error("상품 등록 실패:", err);
                alert("상품 등록 중 오류가 발생했습니다.");
                setLoading(false);
            });
    };
    // ----------------------------------------------------

    return (
        // 🌟 클래스 이름을 seller-dashboard 로 변경
        <div className="seller-dashboard">
            {/* 🌟 좌측 사이드바 메뉴 (클래스 이름 seller-sidebar 로 변경) */}
            <aside className="seller-sidebar">
                <h3>⚙️ SELLER CENTER</h3>
                <ul>
                    <li
                        className={activeTab === 'product-register' ? 'active' : ''}
                        onClick={() => setActiveTab('product-register')}
                    >
                        🛍️ 상품 등록
                    </li>
                    <li
                        className={activeTab === 'product-manage' ? 'active' : ''}
                        onClick={() => setActiveTab('product-manage')}
                    >
                        📦 상품 관리 (준비중)
                    </li>
                    <li
                        className={activeTab === 'order-manage' ? 'active' : ''}
                        onClick={() => setActiveTab('order-manage')}
                    >
                        🚚 주문/배송 관리 (준비중)
                    </li>
                    {/* 🌟 회원 관리 메뉴 삭제됨 */}
                </ul>
            </aside>

            {/* 🌟 우측 메인 콘텐츠 영역 (클래스 이름 seller-content 로 변경) */}
            <main className="seller-content">
                {activeTab === 'product-register' && (
                    // 🌟 클래스 이름 seller-panel, seller-form 으로 변경
                    <div className="seller-panel">
                        <ProductRegister /> {/* 🌟 예전 페이지를 부품처럼 쏙 끼워넣기! */}
                    </div>
                )}

                {activeTab === 'product-manage' && (
                    <div className="seller-panel">
                        <h2>상품 관리</h2>
                        <p>등록된 상품 목록을 보고 수정/삭제할 수 있는 화면이 들어올 자리입니다.</p>
                    </div>
                )}

                {activeTab === 'order-manage' && (
                    <div className="seller-panel">
                        <h2>주문/배송 관리</h2>
                        <p>고객들이 주문한 내역을 확인하고 배송 상태(배송중, 완료)를 변경하는 자리입니다.</p>
                    </div>
                )}

                {/* 🌟 회원 관리 콘텐츠 영역 삭제됨 */}
            </main>
        </div>
    );
};

export default SellerPage;