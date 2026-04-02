import React, { useState } from 'react';
// import api from '../api'; // 나중에 백엔드 연결할 때 주석 해제!

const CustomerCenter = () => {
    const [activeTab, setActiveTab] = useState('notice');

    // 🌟 팝업창을 띄우고 닫기 위한 상태
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 🌟 새 질문의 제목과 내용을 담을 상태
    const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });

    // 임시 공지사항 데이터
    const notices = [
        { id: 1, title: '[필독] 반품 및 환불 규정 안내', date: '2026-04-01' },
        { id: 2, title: '봄맞이 신상품 입고 및 배송 지연 안내', date: '2026-03-28' },
    ];

    // 🌟 Q&A 데이터를 useState로 변경! (새 질문을 배열에 추가해서 화면에 보여주기 위해)
    const [qnas, setQnas] = useState([
        { id: 1, title: '배송은 얼마나 걸리나요?', author: '홍*동', status: '답변완료' },
        { id: 2, title: '사이즈 교환하고 싶습니다.', author: '김*수', status: '대기중' },
    ]);

    // 질문 등록 버튼 눌렀을 때 실행될 함수
    const handleSubmit = (e) => {
        e.preventDefault(); // 새로고침 방지

        if (!newQuestion.title || !newQuestion.content) {
            alert('제목과 내용을 모두 입력해주세요!');
            return;
        }

        // 💡 나중에는 여기서 api.post('/qna', newQuestion) 를 해서 백엔드로 보낼 겁니다!

        // 지금은 화면에만 임시로 추가해볼게요.
        const fakeNewQna = {
            id: qnas.length + 1,
            title: newQuestion.title,
            author: '나*용', // 실제로는 로그인한 유저 이름이 들어가야 함!
            status: '대기중'
        };

        setQnas([fakeNewQna, ...qnas]); // 새 질문을 맨 위에 추가!
        setIsModalOpen(false); // 팝업 닫기
        setNewQuestion({ title: '', content: '' }); // 입력칸 비우기
        alert('질문이 성공적으로 등록되었습니다!');
    };

    return (
        <div className="cs-container" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>CUSTOMER CENTER</h2>

            {/* 탭 버튼 영역 */}
            <div style={{ display: 'flex', borderBottom: '2px solid #333', marginBottom: '20px' }}>
                <button
                    onClick={() => setActiveTab('notice')}
                    style={{ flex: 1, padding: '15px', background: activeTab === 'notice' ? '#333' : '#fff', color: activeTab === 'notice' ? '#fff' : '#333', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    공지사항
                </button>
                <button
                    onClick={() => setActiveTab('qna')}
                    style={{ flex: 1, padding: '15px', background: activeTab === 'qna' ? '#333' : '#fff', color: activeTab === 'qna' ? '#fff' : '#333', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Q & A
                </button>
            </div>

            {/* 공지사항 내용 */}
            {activeTab === 'notice' && (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {notices.map(notice => (
                        <li key={notice.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <span>🚨 {notice.title}</span>
                            <span style={{ color: '#888' }}>{notice.date}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* Q&A 내용 */}
            {activeTab === 'qna' && (
                <div>
                    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                        {/* 🌟 팝업 열기 버튼! */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            + 질문 등록하기
                        </button>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {qnas.map(qna => (
                            <li key={qna.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                                <span>❓ {qna.title}</span>
                                <div style={{ color: '#888', fontSize: '14px' }}>
                                    <span style={{ marginRight: '15px' }}>작성자: {qna.author}</span>
                                    <span style={{ color: qna.status === '답변완료' ? 'green' : 'orange', fontWeight: 'bold' }}>
                                        [{qna.status}]
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 🌟 질문 등록 팝업창 (Modal) */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>새 질문 작성</h3>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input
                                type="text"
                                placeholder="제목을 입력하세요"
                                value={newQuestion.title}
                                onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                            <textarea
                                placeholder="질문 내용을 자세히 적어주세요"
                                rows="5"
                                value={newQuestion.content}
                                onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', resize: 'none' }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 15px', background: '#eee', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                    취소
                                </button>
                                <button type="submit" style={{ padding: '10px 15px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                    등록하기
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerCenter;