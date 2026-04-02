import React, { useState } from 'react';
import axios from 'axios';
import DaumPostcode from 'react-daum-postcode';
import Spinner from '../Spinner';
import { toast } from 'react-toastify'; // 🌟 1. 토스트 알림 임포트
import '../styles/SignUp.css';

const SignUp = () => {
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
            zonecode: data.zonecode,
            mainAddress: fullAddress,
            detailAddress: ''
        });
        setIsOpenPost(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 상세 주소까지 입력했는지 확인
        if (!addressObj.mainAddress || !addressObj.detailAddress) {
            toast.warning("주소 검색 및 상세 주소를 모두 입력해주세요. 📍"); // 🌟 경고 알림도 토스트로!
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const finalAddress = `[${addressObj.zonecode}] ${addressObj.mainAddress} ${addressObj.detailAddress}`;

            await axios.post('http://localhost:8080/api/auth/signup', {
                email: formData.email,
                password: formData.password,
                name: formData.name,
                phone: formData.phone,
                address: finalAddress
            });

            // 🌟 2. 기존 alert 대신 성공 토스트 띄우기
            toast.success('회원가입이 성공적으로 완료되었습니다! 🎉');

            // 🌟 3. 알림을 볼 수 있게 1.5초 뒤에 로그인 페이지로 이동
            setTimeout(() => {
                window.location.href = '/signin';
            }, 1500);

        } catch (err) {
            console.error("회원가입 에러:", err);
            toast.error('회원가입에 실패했습니다. 입력 정보를 확인해주세요. 😢'); // 🌟 에러 알림도 토스트로!
            setError('회원가입 중 오류가 발생했습니다. 이미 가입된 이메일인지 확인해 주세요.');
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2>CREATE ACCOUNT</h2>
                <p>회원가입을 위해 아래 정보를 입력해 주세요.</p>

                {loading ? (
                    <div style={{ padding: '50px 0' }}>
                        <Spinner />
                        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                            회원가입을 처리하고 있습니다...
                        </p>
                    </div>
                ) : (
                    <form className="signup-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>이메일</label>
                            <input type="email" name="email" placeholder="example@email.com" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>비밀번호</label>
                            <input type="password" name="password" placeholder="비밀번호를 입력해주세요" value={formData.password} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>이름</label>
                            <input type="text" name="name" placeholder="이름을 입력해주세요" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>전화번호</label>
                            <input type="text" name="phone" placeholder="010-0000-0000" value={formData.phone} onChange={handleChange} required />
                        </div>

                        <div className="input-group address-group">
                            <label>주소</label>
                            <div className="zipcode-wrapper">
                                <input type="text" placeholder="우편번호" value={addressObj.zonecode} readOnly className="zipcode-input" />
                                <button type="button" className="find-address-btn" onClick={() => setIsOpenPost(true)}>
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

                        {error && <div className="error-message" style={{ color: '#d9534f', fontSize: '13px', marginTop: '10px' }}>{error}</div>}

                        <button type="submit" className="signup-btn" style={{ marginTop: '20px' }}>
                            SIGN UP
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SignUp;