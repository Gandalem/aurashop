import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. 네비게이션(상단 메뉴바) 컴포넌트 불러오기
import Navigation from './components/Navigation';

// 2. 화면(페이지) 컴포넌트들 불러오기
import ProductList from './pages/ProductList';
import SignIn from './pages/SignIn';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyPage from './pages/MyPage';
import SignUp from './pages/SignUp';
import ProductDetail from './pages/ProductDetail';
import SellerLogin from './components/SellerLogin.jsx';
import SellerPage from './components/SellerPage.jsx';
import Footer from './components/Footer';
import CustomerCenter from './pages/CustomerCenter';

// 전체 앱의 전역 CSS
import './styles/App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Navigation />
                <div className="main-content">
                    <Routes>
                        <Route path="/" element={<ProductList />} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/mypage" element={<MyPage />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/seller" element={<SellerLogin />} />
                        <Route path="/seller/dashboard" element={<SellerPage />} />
                        <Route path="/cs" element={<CustomerCenter />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
}

export default App; // 👈 App.jsx에는 이것만 남아야 정상입니다!