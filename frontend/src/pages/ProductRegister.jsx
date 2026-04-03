import React, { useState } from 'react';
import api from '../api';
import '../styles/ProductRegister.css';

const ProductRegister = () => {
    // 🌟 1. imageUrl을 삭제하고 imageUrls: [] 로 변경
    const [formData, setFormData] = useState({
        categoryId: '1',
        name: '',
        price: '',
        stockQuantity: '',
        description: '',
        imageUrls: []
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

    // 🌟 2. 안전하게 작성된 이미지 업로드 함수
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('file', file);

        const token = localStorage.getItem('accessToken');

        api.post('http://localhost:8080/api/files/upload', formDataFile, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                const newImageUrl = typeof res.data === 'string' ? res.data : res.data.imageUrl;

                if (!newImageUrl) {
                    alert("이미지 주소를 받아오지 못했습니다.");
                    return;
                }

                alert("사진 업로드 성공! 📸");

                // 기존 배열에 새 이미지 주소 추가
                setFormData(prev => ({
                    ...prev,
                    imageUrls: [...(prev.imageUrls || []), newImageUrl]
                }));
            })
            .catch(err => {
                console.error("이미지 업로드 실패:", err);
                alert("이미지 업로드에 실패했습니다. 😭");
            });
    };

    // 🌟 3. X 버튼 누르면 삭제되는 기능
    const handleRemoveImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: (prev.imageUrls || []).filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');

        api.post('http://localhost:8080/api/products', formData, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                alert('상품이 성공적으로 등록되었습니다! 🎉');
                window.location.href = '/seller/dashboard';
            })
            .catch(err => {
                console.error("상품 등록 오류:", err);
                setError('상품 등록 중 오류가 발생했습니다.');
                setLoading(false);
            });
    };

    return (
        <div className="product-register-container">
            <div className="register-box">
                <h2>📦 REGISTER PRODUCT</h2>
                <p>새로운 상품을 등록해 주세요.</p>

                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>카테고리</label>
                        <select name="categoryId" value={formData.categoryId} onChange={handleChange}>
                            <option value="1">WOMEN</option>
                            <option value="2">MEN</option>
                            <option value="3">ACCESSORIES</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>상품명</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>가격 (원)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>재고 수량 (개)</label>
                        <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required />
                    </div>

                    {/* 🌟 4. 다중 이미지 업로드 및 미리보기 UI */}
                    <div className="input-group">
                        <label>상품 이미지 업로드 (여러 장 등록 가능)</label>
                        <input type="file" accept="image/*" onChange={handleImageUpload} />

                        {formData.imageUrls && formData.imageUrls.length > 0 && (
                            <div style={{ marginTop: '15px' }}>
                                <p style={{ fontSize: '12px', color: 'green', marginBottom: '8px' }}>
                                    ✅ 등록된 이미지 ({formData.imageUrls.length}장)
                                </p>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {formData.imageUrls.map((url, index) => (
                                        <div key={index} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                            <img src={url} alt={`미리보기 ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#d9534f', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="description">상품 설명</label>
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

                    <button type="submit" className="register-btn" disabled={loading}>
                        {loading ? '등록 중...' : 'REGISTER PRODUCT'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductRegister;