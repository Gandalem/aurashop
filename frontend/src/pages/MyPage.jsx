import React, { useState, useEffect } from 'react';
import api from '../api';
import '../styles/Mypage.css';

const MyPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 🚨 1. 수정됨: 'token' 대신 'accessToken'을 꺼내오도록 변경!
        const token = localStorage.getItem('accessToken');

        if (!token) {
            setError("로그인이 필요한 서비스입니다."); //
            setLoading(false); //
            return; //
        }

        // 🚨 2. 수정됨: api.js에서 이미 'http://localhost:8080/api'를 기본 주소로
        // 설정해두었기 때문에 '/orders'만 적어주면 됩니다!
        api.get('/orders', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setOrders(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("주문 내역 조회 실패:", err);
                setError("주문 내역을 불러오는 중 오류가 발생했습니다.");
                setLoading(false);
            });
    }, []);

    // 날짜 포맷팅 함수 (예: 2026-03-28T19:41:45 -> 2026. 03. 28)
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    if (loading) return <div className="mypage-loading">주문 내역을 불러오는 중입니다...</div>;
    if (error) return <div className="mypage-error">{error}</div>;

    return (
        <div className="mypage-container">
            <header className="mypage-header">
                <h2>MY PAGE</h2>
                <p>주문 내역을 확인하세요.</p>
            </header>

            <div className="orders-list">
                {orders.length === 0 ? (
                    <div className="no-orders">
                        <p>아직 주문한 내역이 없습니다.</p>
                        <button className="shop-now-btn" onClick={() => window.location.href = '/'}>
                            쇼핑하러 가기
                        </button>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <span className="order-date">{formatDate(order.orderDate)}</span>
                                <span className="order-id">주문번호: {order.id}</span>
                            </div>

                            <div className="order-body">
                                <div className="order-info">
                                    <p><strong>결제 금액:</strong> ${order.totalAmount.toFixed(2)}</p>
                                    <p><strong>배송지:</strong> {order.shippingAddress}</p>
                                </div>

                                <div className="order-status">
                                    {/* 상태에 따라 다른 색상을 주기 위해 클래스명 동적 할당 */}
                                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status === 'PENDING' && '결제 완료'}
                                        {order.status === 'SHIPPED' && '배송 중'}
                                        {order.status === 'DELIVERED' && '배송 완료'}
                  </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyPage;