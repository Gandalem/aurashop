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

    const [quantity, setQuantity] = useState(1);

    // 🌟 1. 현재 보여지는 메인 이미지의 순서(인덱스)를 기억하는 상태
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

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

    if (loading) return <Spinner />;
    if (!product) return <div className="error">상품을 찾을 수 없습니다.</div>;

    // 🌟 2. 여러 장의 이미지를 배열로 만듭니다.
    // (나중에 백엔드에서 imageUrls라는 배열로 보내주면 그걸 쓰고, 지금은 임시로 3장의 이미지를 만듭니다)
    const images = product.imageUrls ? product.imageUrls : [
        product.imageUrl, // 1번: 진짜 등록한 이미지
        "https://via.placeholder.com/600x600?text=Detail+Image+2", // 2번: 가짜 이미지 (테스트용)
        "https://via.placeholder.com/600x600?text=Detail+Image+3"  // 3번: 가짜 이미지 (테스트용)
    ].filter(Boolean); // 빈 값(null) 제거

    // 🌟 3. 좌우 화살표 클릭 시 이미지 넘기기 함수
    const handlePrevImage = () => {
        setCurrentImgIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImgIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const increaseQuantity = () => {
        if (quantity < product.stockQuantity) setQuantity(quantity + 1);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const handleAddToCart = () => {
        const token = localStorage.getItem('accessToken'); // token -> accessToken 통일

        if (!token) {
            toast.error('로그인이 필요한 서비스입니다. 😢');
            setTimeout(() => navigate('/signin'), 1500);
            return;
        }

        if (quantity > product.stockQuantity) {
            toast.warning(`현재 남은 수량(${product.stockQuantity}개)까지만 담을 수 있습니다. 📦`);
            return;
        }

        api.post('http://localhost:8080/api/cart',
            { productId: product.id, quantity: quantity },
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(response => {
                toast.success('장바구니에 상품이 담겼습니다! 🛒');
            })
            .catch(error => {
                console.error("장바구니 담기 오류", error);
                toast.error('장바구니 담기에 실패했습니다. 😭');
            });
    };

    return (
        <div className="product-detail-container">

            {/* 🌟 4. 쇼핑몰 스타일의 이미지 갤러리 영역 */}
            <div className="product-gallery">
                {images.length > 0 ? (
                    <>
                        {/* 메인 큰 이미지 */}
                        <div className="main-viewer">
                            <img src={images[currentImgIndex]} alt={`${product.name} 상세이미지`} />
                        </div>

                        {/* 하단 썸네일 & 화살표 */}
                        {images.length > 1 && (
                            <div className="thumbnail-nav">
                                <button className="nav-btn prev" onClick={handlePrevImage}>◀</button>

                                <ul className="thumbnail-list">
                                    {images.map((img, idx) => (
                                        <li
                                            key={idx}
                                            className={`thumb-item ${idx === currentImgIndex ? 'active' : ''}`}
                                            onMouseEnter={() => setCurrentImgIndex(idx)} // 👈 마우스만 올려도 바뀌게 하려면 추가
                                            onClick={() => setCurrentImgIndex(idx)}
                                        >
                                            <img src={img} alt={`썸네일 ${idx + 1}`} />
                                        </li>
                                    ))}
                                </ul>

                                <button className="nav-btn next" onClick={handleNextImage}>▶</button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-image-large">No Image</div>
                )}
            </div>

            {/* 오른쪽 상품 정보 영역 (기존과 동일) */}
            <div className="product-detail-info">
                <h2>{product.name}</h2>
                <p className="price">{product.price.toLocaleString()}원</p>

                <div className="description">
                    <p>{product.description || "상세 설명이 등록되지 않은 상품입니다."}</p>
                </div>

                <p className="stock">남은 수량 : {product.stockQuantity}개</p>

                <div className="quantity-control">
                    <button onClick={decreaseQuantity} disabled={quantity <= 1}>-</button>
                    <span>{quantity}</span>
                    <button onClick={increaseQuantity} disabled={quantity >= product.stockQuantity}>+</button>
                </div>

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