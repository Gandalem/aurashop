import React, { useState, useEffect } from 'react';
import api from '../api'; // 🌟 1. 주석 해제! 우리의 똑똑한 통신 도구를 불러옵니다.

const CustomerCenter = () => {
    const [activeTab, setActiveTab] = useState('notice');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });

    // 임시 공지사항 데이터 (이건 나중에 백엔드 붙여도 됨!)
    const notices = [
        { id: 1, title: '[필독] 반품 및 환불 규정 안내', date: '2026-04-01' },
        { id: 2, title: '봄맞이 신상품 입고 및 배송 지연 안내', date: '2026-03-28' },
    ];

    // 🌟 2. Q&A 목록을 빈 배열로 시작합니다! (백엔드에서 가져올 거니까요)
    const [qnas, setQnas] = useState([]);

    // 🌟 3. 백엔드 DB에서 질문 목록을 가져오는 함수
    const fetchQuestions = () => {
        api.get('/qna')
            .then(response => {
                setQnas(response.data); // 백엔드에서 준 진짜 데이터를 state에 쏙!
            })
            .catch(error => {
                console.error("질문 목록을 불러오는 중 에러 발생:", error);
            });
    };

    // 🌟 4. 이 화면이 처음 켜질 때, 질문 목록을 딱 한 번 가져옵니다.
    useEffect(() => {
        fetchQuestions();
    }, []);

    // 🌟 5. 질문 등록 버튼을 눌렀을 때 실행되는 함수 (진짜 통신!)
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!newQuestion.title || !newQuestion.content) {
            alert('제목과 내용을 모두 입력해주세요!');
            return;
        }

        // 로컬 스토리지에 저장된 이름이 있으면 쓰고, 없으면 '익명 사용자'
        const authorName = localStorage.getItem('userName') || '익명 사용자';

        // 🚀 백엔드로 데이터를 쏩니다!
        api.post('/qna', {
            title: newQuestion.title,
            content: newQuestion.content,
            author: authorName
        })
            .then(response => {
                alert(response.data); // 백엔드가 보낸 "질문이 성공적으로 등록되었습니다."
                setIsModalOpen(false); // 팝업 닫기
                setNewQuestion({ title: '', content: '' }); // 입력칸 비우기
                fetchQuestions(); // 🌟 핵심: DB에 저장됐으니 목록을 다시 갱신해서 화면에 띄움!
            })
            .catch(error => {
                console.error("질문 등록 실패:", error);
                alert("질문 등록에 실패했습니다. 로그인이 되어있는지 확인해주세요.");
            });
    };

    // 🌟 날짜 예쁘게 보여주는 함수 추가 (백엔드에서 주는 createdAt 용)
    const formatDate = (dateString) => {
        if(!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR');
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

            {/* Q&A 내용 (DB 연동 버전) */}
            {activeTab === 'qna' && (
                <div>
                    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            + 질문 등록하기
                        </button>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {qnas.length === 0 ? (
                            <li style={{ padding: '30px', textAlign: 'center', color: '#888' }}>아직 등록된 질문이 없습니다.</li>
                        ) : (
                            qnas.map(qna => (
                                <li key={qna.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 'bold' }}>❓ {qna.title}</span>
                                        <span style={{ color: qna.status === '답변완료' ? 'green' : 'orange', fontWeight: 'bold' }}>
                                            [{qna.status}]
                                        </span>
                                    </div>
                                    <div style={{ color: '#888', fontSize: '13px', display: 'flex', gap: '15px' }}>
                                        <span>작성자: {qna.author}</span>
                                        <span>작성일: {formatDate(qna.createdAt)}</span>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {/* 질문 등록 팝업창 (Modal) */}
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