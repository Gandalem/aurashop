import React, { useState, useEffect } from 'react';
import api from '../api.js';
import Spinner from '../Spinner'; // 1. 스피너 임포트
import '../styles/SellerPage.css';
import ProductRegister from "../pages/ProductRegister.jsx";

const SellerPage = () => {
    // 🌟 1. 현재 선택된 탭을 관리하는 상태 (기본값: 상품 등록)
    const [activeTab, setActiveTab] = useState('product-register');

    // 🌟 2. 보안 체크: 진짜 판매자(SELLER)인지 확인
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
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
        const token = localStorage.getItem('accessToken');

        api.post('/api/products', {
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

    // --- (상품 관리 관련 상태 및 함수들) ---
    const [productList, setProductList] = useState([]);
    const [editingProductId, setEditingProductId] = useState(null); // 현재 수정 중인 상품 ID
    const [editForm, setEditForm] = useState({}); // 수정 폼 데이터

    // 상품 관리 탭이 열릴 때마다 상품 목록 불러오기
    useEffect(() => {
        if (activeTab === 'product-manage') {
            fetchProducts();
        }
    }, [activeTab]);

    const fetchProducts = () => {
        api.get('/api/products')
            .then(res => setProductList(res.data))
            .catch(err => console.error("상품 불러오기 실패:", err));
    };

    // 상품 삭제 함수
    const handleDeleteProduct = (id) => {
        if (window.confirm("정말 이 상품을 삭제하시겠습니까?")) {
            const token = localStorage.getItem('accessToken');
            api.delete(`/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(() => {
                    alert("삭제되었습니다.");
                    fetchProducts(); // 목록 새로고침
                })
                .catch(err => {
                    // 🌟 백엔드에서 보낸 친절한 에러 메시지를 화면에 띄워줍니다!
                    if (err.response && err.response.data) {
                        alert(err.response.data);
                    } else {
                        alert("삭제 실패!");
                    }
                });
        }
    };

    // 수정 버튼 눌렀을 때 (수정 모드 ON)
    const handleEditClick = (product) => {
        setEditingProductId(product.id);
        setEditForm(product); // 기존 데이터를 폼에 채워넣기
    };

    // 수정 완료 버튼 눌렀을 때 (백엔드로 전송)
    const handleUpdateProduct = (id) => {
        const token = localStorage.getItem('accessToken');
        api.put(`/api/products/${id}`, editForm, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => {
                alert("상품이 수정되었습니다!");
                setEditingProductId(null); // 수정 모드 OFF
                fetchProducts(); // 목록 새로고침
            })
            .catch(err => alert("수정 실패!"));
    };
    // ----------------------------------------------------

    // ----------------------------------------------------


    // 🌟 진짜 주문 데이터를 담을 빈 배열!
    const [orders, setOrders] = useState([]);

    // 🌟 탭이 'order-manage'로 바뀔 때 백엔드에서 모든 주문 데이터 불러오기
    useEffect(() => {
        if (activeTab === 'order-manage') {
            const token = localStorage.getItem('accessToken');
            api.get('/api/orders/seller', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setOrders(res.data); // DB에서 가져온 진짜 주문 데이터 세팅
                })
                .catch(err => {
                    console.error("주문 목록 불러오기 실패:", err);
                });
        }
    }, [activeTab]); // activeTab이 바뀔 때마다 실행

    // 🌟 백엔드 DB의 배송 상태를 실제로 업데이트하는 함수
    const handleStatusChange = (orderId, newStatus) => {
        const token = localStorage.getItem('accessToken');

        api.put(`/api/orders/${orderId}/status`,
            { status: newStatus }, // 변경할 영문 상태값 (PENDING, SHIPPED 등)
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(() => {
                // DB 변경이 성공하면 화면의 리스트도 새로고침 없이 변경!
                setOrders(orders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
                alert(`✅ 주문번호 ${orderId} 상태가 변경되었습니다!`);
            })
            .catch(err => {
                console.error("상태 변경 실패:", err);
                alert("상태 변경 중 오류가 발생했습니다.");
            });
    };

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
                        📦 상품 관리
                    </li>
                    <li
                        className={activeTab === 'order-manage' ? 'active' : ''}
                        onClick={() => setActiveTab('order-manage')}
                    >
                        🚚 주문/배송 관리
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
                    <div className="admin-panel">
                        <h2>📦 상품 관리</h2>
                        <p>등록된 상품을 수정하거나 삭제할 수 있습니다.</p>

                        <table className="order-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>상품명</th>
                                <th>가격</th>
                                <th>재고</th>
                                <th>관리</th>
                            </tr>
                            </thead>
                            <tbody>
                            {productList.map(product => (
                                <tr key={product.id}>
                                    <td>{product.id}</td>

                                    {/* 🌟 수정 모드일 때와 아닐 때를 다르게 보여줍니다 */}
                                    {editingProductId === product.id ? (
                                        <>
                                            <td><input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} /></td>
                                            <td><input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} /></td>
                                            <td><input type="number" value={editForm.stockQuantity} onChange={(e) => setEditForm({...editForm, stockQuantity: e.target.value})} /></td>
                                            <td>
                                                <button onClick={() => handleUpdateProduct(product.id)} className="save-btn">저장</button>
                                                <button onClick={() => setEditingProductId(null)} className="cancel-btn">취소</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{product.name}</td>
                                            <td>{product.price}원</td>
                                            <td>{product.stockQuantity}개</td>
                                            <td>
                                                <button onClick={() => handleEditClick(product)} className="edit-btn">수정</button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn">삭제</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 🌟 수정된 주문/배송 관리 탭 */}
                {activeTab === 'order-manage' && (
                    <div className="admin-panel">
                        <h2>🚚 주문/배송 관리</h2>
                        <p>고객들의 주문 내역을 확인하고 배송 상태를 업데이트하세요.</p>

                        <table className="order-table">
                            <thead>
                            <tr>
                                <th>주문번호</th>
                                <th>주문자 ID(Email)</th>
                                <th>결제금액</th>
                                <th>주문일시</th>
                                <th>배송상태 (클릭해서 변경)</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '30px', color: '#999' }}>아직 접수된 주문이 없습니다.</td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.id}</td>
                                        {/* 회원님의 Order 엔티티 구조에 맞춰 user.email 접근 */}
                                        <td>{order.user?.email || '알수없음'}</td>
                                        <td>{order.totalAmount?.toLocaleString()}원</td>
                                        <td>{new Date(order.orderDate).toLocaleString()}</td>
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
                    </div>
                )}

                {/* 🌟 회원 관리 콘텐츠 영역 삭제됨 */}
            </main>
        </div>
    );
};

export default SellerPage;