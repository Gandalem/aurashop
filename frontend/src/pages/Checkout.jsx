import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Checkout.css';

const Checkout = () => {
    const [shippingAddress, setShippingAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 🌟 추가된 상태: 결제할 진짜 총 금액과 주문 이름
    const [totalAmount, setTotalAmount] = useState(0);
    const [orderName, setOrderName] = useState('상품 결제');

    // 🌟 컴포넌트가 켜질 때 장바구니 데이터를 불러와서 총 금액 계산하기
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // 장바구니 목록을 불러오는 API (기존에 만드셨던 주소에 맞게 확인해주세요!)
            axios.get('http://localhost:8080/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    const cartItems = res.data;

                    // 🌟 추가: 실제 백엔드에서 어떻게 데이터를 주는지 콘솔에서 확인하기 위함
                    console.log("🛒 장바구니 데이터 확인:", cartItems);

                    let calculatedTotal = 0;
                    cartItems.forEach(item => {
                        // 🌟 핵심 방어 코드 (옵셔널 체이닝 ?.)
                        // 1. item.product 안에 price가 있으면 그걸 씁니다.
                        // 2. 만약 없으면 그냥 item.price를 찾아서 씁니다.
                        // 3. 둘 다 없으면 에러 내지 말고 0원으로 계산해! 라는 뜻입니다.
                        const itemPrice = item.product?.price || item.price || 0;
                        calculatedTotal += (itemPrice * item.quantity);
                    });

                    setTotalAmount(calculatedTotal);

                    if (cartItems.length > 0) {
                        // 상품 이름도 마찬가지로 에러가 나지 않게 방어 코드를 넣습니다.
                        const firstItemName = cartItems[0].product?.name || cartItems[0].productName || cartItems[0].name || "상품";
                        const name = cartItems.length > 1
                            ? `${firstItemName} 외 ${cartItems.length - 1}건`
                            : firstItemName;
                        setOrderName(name);
                    }
                })
                .catch(err => {
                    console.error("결제 전 장바구니 정보 불러오기 실패:", err);
                });
        }
    }, []);

    const handleAddressChange = (e) => {
        setShippingAddress(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            window.location.href = '/signin';
            return;
        }

        if (!shippingAddress.trim()) {
            alert("배송지를 입력해 주세요.");
            return;
        }

        if (totalAmount === 0) {
            alert("결제할 금액이 0원입니다. 장바구니를 확인해주세요.");
            return;
        }

        setLoading(true);
        setError(null);

        // 🌟 1. 카카오페이 결제창 호출 (포트원/아임포트)
        const { IMP } = window;
        IMP.init('imp23026348'); // 테스트 가맹점 식별코드

        const data = {
            pg: 'kakaopay',
            pay_method: 'card',
            merchant_uid: `mid_${new Date().getTime()}`,
            name: orderName,            // 계산된 진짜 상품명
            amount: totalAmount,        // 🌟 계산된 진짜 총 금액!
            buyer_email: 'user@test.com', // 실제로는 회원 정보에서 가져올 수 있습니다.
            buyer_name: '고객님',
        };

        IMP.request_pay(data, (response) => {
            if (response.success) {
                // 🌟 2. 결제가 성공하면 비로소 백엔드로 주문 생성 요청 보내기
                axios.post('http://localhost:8080/api/orders',
                    {
                        shippingAddress: shippingAddress
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                )
                    .then(res => {
                        alert("카카오페이 결제 및 주문이 성공적으로 완료되었습니다!");
                        window.location.href = '/mypage';
                    })
                    .catch(err => {
                        console.error("주문 저장 실패:", err);
                        const errorMessage = err.response?.data || "결제는 완료되었으나 주문 처리 중 오류가 발생했습니다.";
                        setError(errorMessage);
                        alert(errorMessage);
                        setLoading(false);
                    });
            } else {
                // 결제 취소 또는 실패 시
                alert(`결제에 실패하였습니다. 사유: ${response.error_msg}`);
                setLoading(false);
            }
        });
    };

    return (
        <div className="checkout-container">
            <h2>CHECKOUT</h2>

            {/* 🌟 사용자에게 결제할 금액을 보여줍니다 */}
            <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px' }}>
                <strong>결제 예정 금액: </strong>
                <span style={{ color: '#d9534f', fontWeight: 'bold' }}>
                    {totalAmount.toLocaleString()}원
                </span>
            </div>

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
                    // 카카오페이 느낌을 내기 위해 색상을 노란색으로 바꿨습니다!
                    style={{ opacity: loading ? 0.7 : 1, backgroundColor: '#FEE500', color: '#000', border: 'none' }}
                >
                    {loading ? '결제 창 여는 중...' : '카카오페이로 결제하기'}
                </button>
            </form>
        </div>
    );
};

export default Checkout;