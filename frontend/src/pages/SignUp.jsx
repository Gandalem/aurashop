import React, { useState } from 'react';
import axios from 'axios';
import DaumPostcode from 'react-daum-postcode'; // 다음 주소 API 임포트
import '../styles/SignUp.css';

const SignUp = () => {
    // 🌟 1. role과 businessNumber 상태 제거
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: ''
    });

    const [addressObj, setAddressObj] = useState({
        zonecode: '',
        mainAddress: '',
        detailAddress: ''
    });

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

    // 🌟 2. handleRoleChange 함수 삭제됨

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
            zonecode: data.zonecode,
            mainAddress: fullAddress
        });
        setIsOpenPost(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const finalAddress = `[${addressObj.zonecode}] ${addressObj.mainAddress} ${addressObj.detailAddress}`.trim();
        const submitData = { ...formData, address: finalAddress };

        axios.post('http://localhost:8080/api/auth/signup', submitData)
            .then(response => {
                // 🌟 3. 알림 메시지 단순화
                alert("회원가입이 완료되었습니다!");
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

                    {/* 🌟 4. 구매자/판매자 선택 라디오 버튼 삭제됨 */}

                    <div className="input-group">
                        <label htmlFor="email">Email *</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password *</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        {/* 🌟 5. 상호명 라벨을 Name으로 고정 */}
                        <label htmlFor="name">Name *</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    {/* 🌟 6. 사업자 등록번호 입력란 삭제됨 */}

                    <div className="input-group">
                        <label htmlFor="phone">Phone</label>
                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>

                    <div className="input-group address-group">
                        {/* 🌟 7. 사업장 주소 라벨을 Address로 고정 */}
                        <label>Address</label>

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