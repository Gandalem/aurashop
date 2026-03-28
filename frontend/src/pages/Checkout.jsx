import React, { useState } from 'react';
import axios from 'axios';
// 라우터를 사용하신다면 useNavigate를 이용해 페이지 이동을 처리합니다.
// import { useNavigate } from 'react-router-dom';
import '../styles/Checkout.css';

const Checkout = () => {
    // const navigate = useNavigate(); // 라우터 사용 시 활성화

    const [shippingAddress, setShippingAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAddressChange = (e) => {
        setShippingAddress(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. 로그인 토큰 확인
        const token = localStorage.getItem('token');
        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            window.location.href = '/signin'; // 또는 navigate('/signin');
            setLoading(false);
            return;
        }

        if (!shippingAddress.trim()) {
            alert("배송지를 입력해 주세요.");
            setLoading(false);
            return;
        }

        // 2. 백엔드로 주문 생성 요청 보내기 (장바구니의 모든 상품을 주문)
        axios.post('http://localhost:8080/api/orders',
            {
                shippingAddress: shippingAddress // 백엔드 DTO(OrderRequest)와 이름이 일치해야 합니다.
            },
            {
                headers: {
                    Authorization: `Bearer ${token}` // 문지기 필터 통과용 토큰
                }
            }
        )
            .then(response => {
                // 3. 주문 성공 처리
                alert(response.data); // "주문이 성공적으로 완료되었습니다." 메시지 출력
                window.location.href = '/mypage'; // 결제 완료 후 마이페이지로 이동 (또는 navigate('/mypage'))
            })
            .catch(err => {
                // 4. 에러 처리 (예: 장바구니가 비어있거나 재고가 부족할 때)
                console.error("주문 실패:", err);
                const errorMessage = err.response?.data || "주문 처리 중 오류가 발생했습니다.";
                setError(errorMessage);
                alert(errorMessage);
                setLoading(false);
            });
    };

    return (
        <div className="checkout-container">
            <h2>CHECKOUT</h2>

            <form className="checkout-form" onSubmit={handleSubmit}>
                <div className="checkout-section-title">Shipping Information</div>

                <div className="form-group">
                    <label htmlFor="address">배송지 주소 (Shipping Address)</label>
                    <textarea
                        id="address"
                        rows="4"
                        placeholder="상세한 배송지 주소를 입력해 주세요 (예: 서울특별시 강남구 테헤란로 123, 4층)"
                        value={shippingAddress}
                        onChange={handleAddressChange}
                        required
                    />
                </div>

                {error && <div style={{ color: '#d9534f', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

                <button
                    type="submit"
                    className="submit-order-btn"
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? '결제 진행 중...' : 'PLACE ORDER (결제하기)'}
                </button>
            </form>
        </div>
    );
};

export default Checkout;