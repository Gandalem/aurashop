import React, { useState, useEffect } from 'react';
import api from '../api';
import '../styles/Cart.css';
import Spinner from '../Spinner'; // 1. 스피너 임포트

const Cart = () => {
    // 가짜 데이터 대신 빈 배열로 시작
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🌟 백엔드에서 내 장바구니 목록 가져오기
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("로그인이 필요합니다.");
            window.location.href = '/signin';
            return;
        }

        api.get('http://localhost:8080/api/cart', { /* headers... */ })
            .then(response => {
                setCartItems(response.data);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
            });
    }, []);

    // 🌟 삭제 기능도 API 연동 (앞서 백엔드에 만들어둔 DELETE API 호출)
    const handleRemove = (id) => {
        const token = localStorage.getItem('accessToken');
        api.delete(`http://localhost:8080/api/cart/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => {
                // 삭제 성공 시 화면에서도 해당 아이템 지우기
                setCartItems(cartItems.filter(item => item.id !== id));
            })
            .catch(error => alert("삭제 중 오류가 발생했습니다."));
    };

    // 프론트엔드 수량 변경 (실제 구현 시엔 백엔드 API 호출이 필요하지만 임시 처리)
    const handleQuantityChange = (id, amount) => {
        setCartItems(cartItems.map(item =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
        ));
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 2. 로딩 중일 때 스피너 반환
    if (loading) return <Spinner />;

    return (
        <div className="cart-page">
            <h2>SHOPPING CART</h2>

            {cartItems.length === 0 ? (
                <p className="empty-cart">장바구니가 비어있습니다.</p>
            ) : (
                <div className="cart-content">
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="item-image">
                                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <div className="no-img">IMG</div>}
                                </div>
                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p className="item-price">${item.price.toFixed(2)}</p>
                                </div>
                                <div className="item-quantity">
                                    <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                                </div>
                                <div className="item-total">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                                <button className="remove-btn" onClick={() => handleRemove(item.id)}>✕</button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h3>ORDER SUMMARY</h3>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="summary-total">
                            <span>Total</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                        {/* 결제 페이지로 이동 */}
                        <button className="checkout-btn" onClick={() => window.location.href = '/checkout'}>
                            PROCEED TO CHECKOUT
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;