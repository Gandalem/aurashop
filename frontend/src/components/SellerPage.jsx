import React, { useState, useEffect } from 'react';
import api from '../api.js';
import Spinner from '../Spinner'; // 스피너 임포트
import '../styles/SellerPage.css';
import ProductRegister from "../pages/ProductRegister.jsx"; // 분리된 상품 등록 컴포넌트

const SellerPage = () => {
    // 🌟 1. 현재 선택된 탭을 관리하는 상태 (기본값: 상품 등록)
    const [activeTab, setActiveTab] = useState('product-register');

    // 🌟 주문 관리를 위한 상태
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // 🌟 2. 보안 체크: 진짜 판매자(SELLER)인지 확인
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('role');

        // SELLER가 아니면 판매자 전용 로그인 페이지로 쫓아내기!
        if (!token || role !== 'SELLER') {
            window.location.href = '/seller';
        }
    }, []);

    // 🌟 3. 주문 관리 탭이 열릴 때 주문 목록 불러오기
    useEffect(() => {
        if (activeTab === 'order-manage') {
            fetchOrders();
        }
    }, [activeTab]);

    const fetchOrders = () => {
        setLoadingOrders(true);
        const token = localStorage.getItem('accessToken');

        // 판매자용 주문 전체 조회 API 호출
        api.get('/orders/seller', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setOrders(res.data);
                setLoadingOrders(false);
            })
            .catch(err => {
                console.error("주문 목록을 불러오는 중 오류 발생:", err);
                setLoadingOrders(false);
            });
    };

    // 🌟 4. 주문 상태 변경 함수
    const handleStatusChange = (orderId, newStatus) => {
        const token = localStorage.getItem('accessToken');

        api.put(`/orders/${orderId}/status`, { status: newStatus }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => {
                alert('주문 상태가 성공적으로 변경되었습니다.');
                fetchOrders(); // 변경된 데이터로 새로고침
            })
            .catch(err => {
                console.error("상태 변경 오류:", err);
                alert('상태 변경에 실패했습니다.');
            });
    };

    return (
        <div className="seller-dashboard">
            {/* 좌측 사이드바 메뉴 */}
            <aside className="seller-sidebar">
                <h3>SELLER CENTER</h3>
                <ul>
                    <li
                        className={activeTab === 'product-register' ? 'active' : ''}
                        onClick={() => setActiveTab('product-register')}
                    >
                        📦 상품 등록
                    </li>
                    <li
                        className={activeTab === 'order-manage' ? 'active' : ''}
                        onClick={() => setActiveTab('order-manage')}
                    >
                        🛒 주문 관리
                    </li>
                </ul>
            </aside>

            {/* 우측 메인 콘텐츠 영역 */}
            <main className="seller-content">

                {/* 탭 1: 상품 등록 */}
                {activeTab === 'product-register' && (
                    <div className="tab-pane">
                        <ProductRegister />
                    </div>
                )}

                {/* 탭 2: 주문 관리 */}
                {activeTab === 'order-manage' && (
                    <div className="tab-pane">
                        <h2>주문 관리</h2>

                        {loadingOrders ? (
                            <Spinner />
                        ) : (
                            <table className="order-table">
                                <thead>
                                <tr>
                                    <th>주문 번호</th>
                                    <th>주소</th>
                                    <th>총 금액</th>
                                    <th>주문 일자</th>
                                    <th>상태 변경</th>
                                </tr>
                                </thead>
                                <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="5">들어온 주문 내역이 없습니다.</td>
                                    </tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order.id}>
                                            <td>{order.id}</td>
                                            <td>{order.shippingAddress}</td>
                                            <td>{order.totalAmount?.toLocaleString()}원</td>
                                            <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                            <td>
                                                {/* DB에 저장되는 영문 상태(PENDING, SHIPPED, DELIVERED)에 맞춤 */}
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`status-select ${
                                                        order.status === 'PENDING' ? 'status-paid' :
                                                            order.status === 'SHIPPED' ? 'status-shipping' : 'status-done'
                                                    }`}
                                                >
                                                    <option value="PENDING">결제완료(대기)</option>
                                                    <option value="SHIPPED">배송중</option>
                                                    <option value="DELIVERED">배송완료</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
};

export default SellerPage;