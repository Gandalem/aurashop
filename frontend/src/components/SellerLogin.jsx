import React, { useState, useEffect } from 'react'
import axios from 'axios';
import '../styles/SellerPage.css'; // 어드민 스타일 공유

const SellerLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (token && role === 'SELLER') {
            window.location.href = '/seller/dashboard';
        }
    }, []);

    const handleSellerLogin = (e) => {
        e.preventDefault();

        axios.post('http://localhost:8080/api/auth/login', {
            email: email,
            password: password
        })
            .then(res => {
                // 🌟 핵심: 로그인 성공해도, 권한이 SELLER가 아니면 쫓아냄!
                if (res.data.role !== 'SELLER') {
                    alert("판매자 계정이 아닙니다!");
                    return;
                }

                // 진짜 판매자면 로컬 스토리지에 저장하고 판매자 대시보드로 이동
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('role', res.data.role);

                alert("사장님, 환영합니다! 대박나세요! 💸");
                window.location.href = '/seller/dashboard'; // 🌟 대시보드 이동 주소 변경
            })
            .catch(err => {
                setError("이메일 또는 비밀번호가 일치하지 않습니다.");
            });
    };

    return (
        <div className="seller-dashboard" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className="seller-panel" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🏪 SELLER LOGIN</h2>
                <form className="seller-form" onSubmit={handleSellerLogin}>
                    <div className="form-group">
                        <label>판매자 이메일</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>비밀번호</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    {error && <p style={{ color: 'red', fontSize: '14px', marginTop: '10px' }}>{error}</p>}
                    <button type="submit" className="submit-product-btn" style={{ marginTop: '20px' }}>로그인</button>
                </form>
            </div>
        </div>
    );
};

export default SellerLogin;