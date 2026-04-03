import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import '../styles/ProductList.css';
// 🌟 useParams 추가!
import { useNavigate, useParams } from 'react-router-dom';

const ProductList = () => {
    const navigate = useNavigate();
    // 🌟 주소창에서 카테고리 이름 빼오기 (예: /category/women 이면 category = 'women')
    const { category } = useParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true); // 카테고리가 바뀔 때마다 로딩 상태로 초기화

        // 🌟 영어로 된 카테고리를 숫자로 변환하는 마법의 사전
        const categoryMap = {
            'women': 1,
            'men': 2,
            'accessories': 3
        };
        // 주소창에 category가 있으면 숫자로 바꾸고, 없으면 undefined
        const mappedCategoryId = category ? categoryMap[category.toLowerCase()] : null;

        // 카테고리 ID가 있으면 필터링 주소로, 없으면 전체 상품 주소로 설정
        const fetchUrl = mappedCategoryId
            ? `http://localhost:8080/api/products?categoryId=${mappedCategoryId}`
            : 'http://localhost:8080/api/products';

        api.get(fetchUrl)
            .then(response => {
                setProducts(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("상품을 불러오는 중 오류가 발생했습니다!", error);
                setLoading(false);
            });
    }, [category]); // 🌟 category가 바뀔 때마다 이 useEffect가 다시 실행됨!

    // 장바구니 담기 API 호출 함수 (기존과 동일)
    // 🌟 2. 장바구니 담기 함수 덮어쓰기!
    const handleAddToCart = (e, productId) => {
        e.stopPropagation(); // 버블링 방지
        const token = localStorage.getItem('accessToken');

        if (!token) {
            // 🚨 수정: 기존 alert 대신 예쁜 에러 토스트 띄우기
            toast.error("로그인이 필요한 서비스입니다. 😢");

            // 토스트가 보여질 시간 1.5초를 벌어준 뒤에 페이지 이동
            setTimeout(() => {
                navigate('/signin'); // window.location.href 대신 react-router-dom의 navigate 사용
            }, 1500);
            return;
        }

        api.post('http://localhost:8080/api/cart',
            { productId: productId, quantity: 1 },
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(response => {
                // 🚨 수정: 기존 window.confirm 대신 예쁜 성공 토스트 띄우기
                toast.success("장바구니에 담겼습니다! 🛒");
            })
            .catch(error => {
                console.error("장바구니 담기 실패:", error);
                toast.error("장바구니 담기에 실패했습니다. 😭");
            });
    };

    return (
        <div className="product-page">
            <header className="page-header">
                {/* 🌟 카테고리 이름에 따라 제목이 자동으로 바뀜! */}
                <h1>{category ? `${category.toUpperCase()}'S CLOTHING` : "ALL PRODUCTS"}</h1>
            </header>

            <div className="product-grid">
                {products.length === 0 && !loading ? (
                    <div style={{ textAlign: 'center', width: '100%', padding: '50px', gridColumn: '1 / -1' }}>
                        등록된 상품이 없습니다.
                    </div>
                ) : (
                    products.map(product => (
                        <div key={product.id}
                             className="product-card"
                             onClick={() => navigate(`/product/${product.id}`)}
                             style={{ cursor: 'pointer' }}>
                            <div className="image-placeholder">
                                {product.imageUrls && product.imageUrls.length > 0 ? (
                                    // 여러 장 등록된 이미지 중 첫 번째[0] 이미지를 썸네일로 사용!
                                    <img src={product.imageUrls[0]} alt={product.name} />
                                ) : product.imageUrl ? (
                                    // 혹시 예전에 단일 이미지로 등록해둔 상품이 있을 경우를 위한 대비책
                                    <img src={product.imageUrl} alt={product.name} />
                                ) : (
                                    <div className="no-image">No Image</div>
                                )}
                            </div>
                            <div className="product-info">
                                <h3>{product.name}</h3>
                                <p className="price">{product.price.toLocaleString()}원</p>
                                {/* 🌟 장바구니 버튼 클릭 시 e를 넘겨줘서 버블링 방지 */}
                                <button
                                    className="add-to-cart-btn"
                                    onClick={(e) => handleAddToCart(e, product.id)}
                                >
                                    ADD TO CART
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProductList;