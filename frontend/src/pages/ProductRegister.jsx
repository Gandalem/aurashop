import React, { useState } from 'react';
import api from '../api';
import '../styles/ProductRegister.css';

const ProductRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stockQuantity: '',
        description: '',
        imageUrl: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataFile = new FormData(); // 💡 위쪽의 formData 상태와 이름이 겹치지 않게 변경
        formDataFile.append('file', file);

        const token = localStorage.getItem('accessToken');

        api.post('http://localhost:8080/api/files/upload', formDataFile, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                alert("사진 업로드 성공! 📸");
                // 🚨 수정된 부분: setProduct 대신 setFormData 사용!
                setFormData({ ...formData, imageUrl: res.data });
            })
            .catch(err => {
                console.error(err);
                alert("사진 업로드 중 오류가 발생했습니다.");
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            window.location.href = '/signin';
            return;
        }

        // 백엔드의 상품 등록 API 호출 (판매자 권한이 있는 토큰만 통과될 것입니다)
        api.post('http://localhost:8080/api/products', formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                alert("상품이 성공적으로 등록되었습니다!");
                window.location.href = '/'; // 메인 화면(상품 목록)으로 이동
            })
            .catch(err => {
                console.error("상품 등록 실패:", err);
                // 권한이 없거나(403) 에러가 발생했을 때
                const errorMessage = err.response?.data?.message || "상품 등록에 실패했습니다. 판매자 계정으로 로그인되어 있는지 확인해 주세요.";
                setError(errorMessage);
                setLoading(false);
            });
    };

    return (
        <div className="product-register-container">
            <div className="register-box">
                <h2>ADD NEW PRODUCT</h2>
                <p>AURA 스토어에 새로운 상품을 등록합니다.</p>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="input-group">
                        <label htmlFor="name">상품명 (Product Name) *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="예: Classic White T-Shirt"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="price">가격 (Price) *</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="예: 29.99 (숫자만 입력)"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="stockQuantity">재고 수량 (Stock Quantity) *</label>
                        <input
                            type="number"
                            id="stockQuantity"
                            name="stockQuantity"
                            value={formData.stockQuantity}
                            onChange={handleChange}
                            placeholder="예: 100"
                            min="1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>상품 이미지 업로드</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        {/* 🚨 수정된 부분: product.imageUrl -> formData.imageUrl */}
                        {formData.imageUrl && (
                            <div style={{ marginTop: '10px' }}>
                                <p style={{ fontSize: '13px', color: 'green' }}>✅ 업로드 완료!</p>
                                <img src={formData.imageUrl} alt="미리보기" style={{ width: '150px', borderRadius: '8px' }} />
                            </div>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="description">상품 설명 (Description)</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="상품에 대한 상세 설명을 입력해 주세요."
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="register-btn"
                        disabled={loading}
                    >
                        {loading ? '등록 중...' : 'REGISTER PRODUCT'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductRegister;