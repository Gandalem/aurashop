import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/ProductDetail.css'; // CSS 파일 연결

const ProductDetail = () => {
    const { id } = useParams(); // URL에서 상품 id 가져오기
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 백엔드에 특정 상품 데이터 1개만 요청
        api.get(`http://localhost:8080/api/products/${id}`)
            .then(response => {
                setProduct(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("상품 정보를 불러오는 중 오류가 발생했습니다!", error);
                setLoading(false);
            });
    }, [id]);

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
                <p className="price">{product.price.toFixed(2)}원</p>

                <div className="description">
                    {/* 상품 설명이 없으면 기본 문구 출력 */}
                    <p>{product.description || "상세 설명이 등록되지 않은 상품입니다."}</p>
                </div>

                <p className="stock">남은 수량 : {product.stockQuantity}개</p>

                <button className="add-to-cart-large-btn">ADD TO CART</button>
                <button className="back-btn" onClick={() => navigate(-1)}>BACK TO LIST</button>
            </div>
        </div>
    );
};

export default ProductDetail;