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
import ProductRegister from './pages/ProductRegister';

// 전체 앱의 전역 CSS (필요하다면)
import './styles/App.css';

function App() {
    return (
        // Router가 앱 전체를 감싸야 주소 이동이 가능합니다.
        <Router>
            <div className="App">
                {/* Navigation은 Routes 밖에 두어 항상 화면 상단에 보이게 합니다. */}
                <Navigation />

                {/* 메인 콘텐츠 영역 (주소에 따라 바뀌는 부분) */}
                <div className="main-content">
                    <Routes>
                        {/* 기본 주소('/')로 접속하면 상품 목록 화면을 보여줍니다. */}
                        <Route path="/" element={<ProductList />} />

                        {/* 각 주소에 맞는 페이지 컴포넌트를 연결합니다. */}
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/mypage" element={<MyPage />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/product/new" element={<ProductRegister />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;