import React, { useState, useEffect } from 'react';
import api from '../api';
import '../styles/ProductList.css';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('http://localhost:8080/api/products')
            .then(response => {
                setProducts(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("상품을 불러오는 중 오류가 발생했습니다!", error);
                setLoading(false);
            });
    }, []);

    // 🌟 장바구니 담기 API 호출 함수
    const handleAddToCart = (productId) => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            window.location.href = '/signin';
            return;
        }

        api.post('http://localhost:8080/api/cart',
            { productId: productId, quantity: 1 }, // 1개씩 담기
            { headers: { Authorization: `Bearer ${token}` } } // 🔑 토큰 필수!
        )
            .then(response => {
                if(window.confirm("장바구니에 담겼습니다! 장바구니로 이동하시겠습니까?")) {
                    window.location.href = '/cart';
                }
            })
            .catch(error => {
                console.error("장바구니 담기 실패:", error);
                alert("장바구니에 담는 중 오류가 발생했습니다.");
            });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="product-page">
            <header className="page-header">
                <h1>WOMEN'S CLOTHING</h1>
            </header>

            <div className="product-grid">
                {products.map(product => (
                    <div key={product.id} key={product.id}
                         className="product-card"
                         onClick={() => navigate(`/product/${product.id}`)}
                         style={{ cursor: 'pointer' }}>
                        <div className="image-placeholder">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} />
                            ) : (
                                <div className="no-image">Image</div>
                            )}
                        </div>
                        <div className="product-info">
                            <h3>{product.name}</h3>
                            <p className="price">{product.price.toFixed(2)}원</p>
                            {/* 🌟 버튼에 onClick 이벤트 연결 */}
                            <button
                                className="add-to-cart-btn"
                                onClick={() => handleAddToCart(product.id)}
                            >
                                ADD TO CART
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;