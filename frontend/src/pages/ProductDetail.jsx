import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../Spinner';
import { toast } from 'react-toastify';
import api from '../api';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🌟 수량 관리를 위한 상태 추가 (기본값 1)
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        api.get(`/products/${id}`)
            .then(response => {
                setProduct(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("상품 정보를 불러오는 중 오류가 발생했습니다!", error);
                setLoading(false);
            });
    }, [id]);

    // 🌟 2. useEffect 바로 아래, 로딩 처리하는 부분 덮어쓰기!
    // 🚨 기존: if (loading) return <div className="loading">Loading...</div>;
    if (loading) return <Spinner />; // 👈 빙글빙글 예쁜 스피너로 교체!
    if (!product) return <div className="error">상품을 찾을 수 없습니다.</div>;

    // 🌟 3. 장바구니에 담기 함수 덮어쓰기!
    const handleAddToCart = () => {
        // 🚨 앗, 여긴 'token'으로 되어있었네요! 다른 파일들과 동일하게 'accessToken'으로 맞춰줍니다.
        const token = localStorage.getItem('accessToken');

        // 1. 로그인 여부 확인
        if (!token) {
            toast.error('로그인이 필요한 서비스입니다. 😢'); // 👈 변경
            setTimeout(() => {
                navigate('/signin');
            }, 1500);
            return;
        }

        // 2. 재고 확인
        if (quantity > product.stockQuantity) {
            toast.warning(`현재 남은 수량(${product.stockQuantity}개)까지만 담을 수 있습니다. 📦`); // 👈 변경
            return;
        }

        // 3. API 호출
        api.post('http://localhost:8080/api/cart',
            { productId: product.id, quantity: quantity },
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(response => {
                toast.success('장바구니에 상품이 담겼습니다! 🛒'); // 👈 변경
            })
            .catch(error => {
                console.error("장바구니 담기 오류", error);
                toast.error('장바구니 담기에 실패했습니다. 😭'); // 👈 추가
            });
    };

    // 수량 증가/감소 핸들러
    const increaseQuantity = () => {
        if (quantity < product.stockQuantity) {
            setQuantity(prev => prev + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!product) return <div className="error">상품을 찾을 수 없습니다.</div>;

    return (
        <div className="product-detail-container">
            <div className="product-detail-image">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                ) : (
                    <div className="no-image-large">No Image</div>
                )}
            </div>

            <div className="product-detail-info">
                <h2>{product.name}</h2>
                <p className="price">{product.price.toLocaleString()}원</p>

                <div className="description">
                    <p>{product.description || "상세 설명이 등록되지 않은 상품입니다."}</p>
                </div>

                <p className="stock">남은 수량 : {product.stockQuantity}개</p>

                {/* 🌟 수량 조절 UI 추가 */}
                <div className="quantity-control">
                    <button onClick={decreaseQuantity} disabled={quantity <= 1}>-</button>
                    <span>{quantity}</span>
                    <button onClick={increaseQuantity} disabled={quantity >= product.stockQuantity}>+</button>
                </div>

                {/* 🌟 클릭 이벤트 추가 및 재고가 0일 경우 버튼 비활성화 */}
                <button
                    className="add-to-cart-large-btn"
                    onClick={handleAddToCart}
                    disabled={product.stockQuantity === 0}
                    style={{ background: product.stockQuantity === 0 ? '#ccc' : '#333' }}
                >
                    {product.stockQuantity === 0 ? 'SOLD OUT' : 'ADD TO CART'}
                </button>

                <button className="back-btn" onClick={() => navigate(-1)}>뒤로가기</button>
            </div>
        </div>
    );
};

export default ProductDetail;