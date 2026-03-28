import React, { useState } from 'react';
import axios from 'axios';
import DaumPostcode from 'react-daum-postcode'; // 🌟 다음 주소 API 임포트
import '../styles/SignUp.css';

const SignUp = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        role: 'USER',
        businessNumber: ''
    });

    // 🌟 주소 관련 상태를 따로 관리 (우편번호, 기본주소, 상세주소)
    const [addressObj, setAddressObj] = useState({
        zonecode: '',
        mainAddress: '',
        detailAddress: ''
    });

    // 주소 검색 팝업창 열기/닫기 상태
    const [isOpenPost, setIsOpenPost] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressObj({ ...addressObj, [name]: value });
    };

    const handleRoleChange = (e) => {
        setFormData({ ...formData, role: e.target.value, businessNumber: '' });
    };

    // 🌟 다음 주소 검색 완료 시 실행되는 함수
    const handleComplete = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setAddressObj({
            ...addressObj,
            zonecode: data.zonecode, // 우편번호
            mainAddress: fullAddress // 기본주소
        });
        setIsOpenPost(false); // 검색 완료 후 팝업 닫기
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 🌟 분리되어 있던 주소를 하나로 합쳐서 백엔드에 보낼 준비
        const finalAddress = `[${addressObj.zonecode}] ${addressObj.mainAddress} ${addressObj.detailAddress}`.trim();
        const submitData = { ...formData, address: finalAddress };

        axios.post('http://localhost:8080/api/auth/signup', submitData)
            .then(response => {
                alert(submitData.role === 'SELLER' ? "판매자 회원가입이 완료되었습니다!" : "회원가입이 완료되었습니다!");
                window.location.href = '/signin';
            })
            .catch(err => {
                console.error("회원가입 실패:", err);
                const errorMessage = err.response?.data || "회원가입 중 오류가 발생했습니다.";
                setError(errorMessage);
                setLoading(false);
            });
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2>CREATE ACCOUNT</h2>

                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="role-selection">
                        <label className={`role-label ${formData.role === 'USER' ? 'active' : ''}`}>
                            <input type="radio" name="role" value="USER" checked={formData.role === 'USER'} onChange={handleRoleChange} />
                            일반 구매자
                        </label>
                        <label className={`role-label ${formData.role === 'SELLER' ? 'active' : ''}`}>
                            <input type="radio" name="role" value="SELLER" checked={formData.role === 'SELLER'} onChange={handleRoleChange} />
                            판매자 (Seller)
                        </label>
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email *</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password *</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label htmlFor="name">{formData.role === 'SELLER' ? '상호명 *' : 'Name *'}</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    {formData.role === 'SELLER' && (
                        <div className="input-group highlight-group">
                            <label htmlFor="businessNumber">사업자 등록번호 *</label>
                            <input type="text" id="businessNumber" name="businessNumber" value={formData.businessNumber} onChange={handleChange} required={formData.role === 'SELLER'} />
                        </div>
                    )}

                    <div className="input-group">
                        <label htmlFor="phone">Phone</label>
                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>

                    {/* 🌟 다음 주소 API 적용 영역 */}
                    <div className="input-group address-group">
                        <label>{formData.role === 'SELLER' ? '사업장 주소' : 'Address'}</label>

                        <div className="address-row">
                            <input type="text" placeholder="우편번호" value={addressObj.zonecode} readOnly className="zipcode-input" />
                            <button type="button" className="search-address-btn" onClick={() => setIsOpenPost(true)}>
                                주소 검색
                            </button>
                        </div>

                        <input type="text" placeholder="기본 주소" value={addressObj.mainAddress} readOnly className="main-address-input" />

                        <input
                            type="text"
                            name="detailAddress"
                            placeholder="상세 주소를 입력해주세요"
                            value={addressObj.detailAddress}
                            onChange={handleAddressChange}
                            className="detail-address-input"
                        />
                    </div>

                    {/* 🌟 주소 검색 팝업 (모달) */}
                    {isOpenPost && (
                        <div className="postcode-modal-overlay">
                            <div className="postcode-modal">
                                <button type="button" className="close-postcode-btn" onClick={() => setIsOpenPost(false)}>✕</button>
                                <DaumPostcode onComplete={handleComplete} autoClose={false} />
                            </div>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="signup-btn" disabled={loading}>
                        {loading ? '가입 진행 중...' : 'SIGN UP'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUp;