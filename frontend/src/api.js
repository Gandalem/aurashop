import axios from 'axios';

const api = axios.create({
    // 🌟 하드코딩 제거! Vite의 환경 변수를 불러옵니다.
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});

// 🚨 [새로 추가된 부분] 요청 인터셉터: API 요청을 보내기 직전에 토큰을 달아줍니다!
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ♻️ [기존 코드] 응답 인터셉터: 토큰 만료 시 재발급 처리
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // 토큰 재발급 요청
                const res = await axios.post('http://localhost:8080/api/auth/reissue', {}, {
                    withCredentials: true
                });

                const newAccessToken = res.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return api(originalRequest);

            } catch (reissueError) {
                console.error("인증이 완전히 만료되었습니다.");

                // 1. 지갑(로컬 스토리지)에 있는 사용자의 모든 흔적을 깨끗하게 비웁니다.
                localStorage.removeItem('accessToken');
                localStorage.removeItem('role');
                localStorage.removeItem('userName');

                // 2. 사용자에게 왜 쫓겨났는지 친절하게 알려줍니다.
                alert('로그인 세션이 만료되었습니다. 안전을 위해 다시 로그인해 주세요.');

                // 3. 로그인 페이지로 강제 리다이렉션 시킵니다.
                window.location.href = '/signin';

                return Promise.reject(reissueError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;