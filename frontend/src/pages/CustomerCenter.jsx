import React, { useState, useEffect } from 'react';
import api from '../api';

const CustomerCenter = () => {
    const [activeTab, setActiveTab] = useState('notice');
    const role = localStorage.getItem('role');

    // 질문 관련 상태
    const [qnas, setQnas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });

    // 공지사항 관련 상태
    const [notices, setNotices] = useState([]);
    const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
    const [newNotice, setNewNotice] = useState({ title: '', content: '' });

    // 🌟 답변 관련 상태 추가
    const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
    const [currentAnswerId, setCurrentAnswerId] = useState(null); // 어떤 질문에 답변할지 기억
    const [answerContent, setAnswerContent] = useState('');

    const fetchNotices = () => {
        api.get('/notices')
            .then(response => setNotices(response.data))
            .catch(error => console.error("공지사항 불러오기 실패:", error));
    };

    const fetchQuestions = () => {
        api.get('/qna')
            .then(response => setQnas(response.data))
            .catch(error => console.error("질문 목록 불러오기 실패:", error));
    };

    useEffect(() => {
        fetchNotices();
        fetchQuestions();
    }, []);

    // 🌟 (수정) 공지사항 등록
    const handleNoticeSubmit = (e) => {
        e.preventDefault();
        if (!newNotice.title || !newNotice.content) return alert('제목과 내용을 입력해주세요!');

        const token = localStorage.getItem('token'); // 👈 신분증(토큰) 꺼내기

        api.post('/notices', newNotice, {
            headers: { Authorization: `Bearer ${token}` } // 👈 봉투(헤더)에 신분증 첨부!
        })
            .then(() => {
                alert("공지사항이 등록되었습니다.");
                setIsNoticeModalOpen(false);
                setNewNotice({ title: '', content: '' });
                fetchNotices();
            }).catch((err) => {
            console.error(err);
            alert("공지사항 등록 실패!");
        });
    };

    // 🌟 (수정) 질문 등록
    const handleQnaSubmit = (e) => {
        e.preventDefault();
        if (!newQuestion.title || !newQuestion.content) return alert('제목과 내용을 입력해주세요!');

        const authorName = localStorage.getItem('userName') || '익명 사용자';
        const token = localStorage.getItem('token');

        api.post('/qna', { ...newQuestion, author: authorName }, {
            headers: { Authorization: `Bearer ${token}` } // 👈 헤더에 신분증 첨부!
        })
            .then(() => {
                alert("질문이 등록되었습니다.");
                setIsModalOpen(false);
                setNewQuestion({ title: '', content: '' });
                fetchQuestions();
            }).catch((err) => {
            console.error(err);
            alert("질문 등록 실패!");
        });
    };

    // 🌟 (수정) 사장님 답변 등록
    const handleAnswerSubmit = (e) => {
        e.preventDefault();
        if (!answerContent) return alert('답변 내용을 입력해주세요!');

        const token = localStorage.getItem('token');

        api.put(`/qna/${currentAnswerId}/answer`, { answer: answerContent }, {
            headers: { Authorization: `Bearer ${token}` } // 👈 헤더에 신분증 첨부!
        })
            .then(response => {
                alert(response.data);
                setIsAnswerModalOpen(false);
                setAnswerContent('');
                setCurrentAnswerId(null);
                fetchQuestions();
            })
            .catch(error => {
                console.error("답변 등록 실패:", error);
                alert("답변 등록에 실패했습니다.");
            });
    };

    // 답변 모달창 열기
    const openAnswerModal = (id) => {
        setCurrentAnswerId(id);
        setIsAnswerModalOpen(true);
    };

    const formatDate = (dateString) => {
        if(!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR');
    };

    return (
        <div className="cs-container" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>CUSTOMER CENTER</h2>

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

            {/* --- 공지사항 탭 --- */}
            {activeTab === 'notice' && (
                <div>
                    {role === 'SELLER' && (
                        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                            <button onClick={() => setIsNoticeModalOpen(true)} style={{ padding: '10px 20px', background: '#d9534f', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>📢 공지사항 쓰기</button>
                        </div>
                    )}
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {notices.map(notice => (
                            <li key={notice.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 'bold' }}>🚨 {notice.title}</span>
                                    <span style={{ color: '#888' }}>{formatDate(notice.createdAt)}</span>
                                </div>
                                <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px', whiteSpace: 'pre-line' }}>
                                    {notice.content}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* --- Q&A 탭 --- */}
            {activeTab === 'qna' && (
                <div>
                    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                        <button onClick={() => setIsModalOpen(true)} style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+ 질문 등록하기</button>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {qnas.length === 0 ? (
                            <li style={{ padding: '30px', textAlign: 'center', color: '#888' }}>아직 등록된 질문이 없습니다.</li>
                        ) : (
                            qnas.map(qna => (
                                <li key={qna.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                                    {/* 1. 질문 제목과 상태 */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 'bold' }}>❓ {qna.title}</span>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ color: qna.status === '답변완료' ? 'green' : 'orange', fontWeight: 'bold' }}>[{qna.status}]</span>

                                            {/* 🌟 사장님이고, 아직 대기중인 질문이면 '답변 달기' 버튼 표시! */}
                                            {role === 'SELLER' && qna.status === '대기중' && (
                                                <button onClick={() => openAnswerModal(qna.id)} style={{ padding: '4px 8px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                                    답변하기
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 2. 질문 내용 */}
                                    <div style={{ padding: '10px', background: '#fcfcfc', border: '1px solid #f0f0f0', borderRadius: '4px', whiteSpace: 'pre-line' }}>
                                        {qna.content}
                                    </div>

                                    <div style={{ color: '#888', fontSize: '13px', display: 'flex', gap: '15px' }}>
                                        <span>작성자: {qna.author}</span>
                                        <span>작성일: {formatDate(qna.createdAt)}</span>
                                    </div>

                                    {/* 🌟 3. 답변이 있다면 답변 박스 표시! */}
                                    {qna.answer && (
                                        <div style={{ marginTop: '10px', padding: '15px', background: '#f0f8ff', borderLeft: '4px solid #007bff', borderRadius: '4px' }}>
                                            <div style={{ fontWeight: 'bold', color: '#007bff', marginBottom: '5px' }}>↳ 관리자 답변</div>
                                            <div style={{ whiteSpace: 'pre-line' }}>{qna.answer}</div>
                                        </div>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {/* --- 공지사항 모달창 --- */}
            {isNoticeModalOpen && ( /* ... 기존 코드와 동일하여 생략 ... */
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '500px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#d9534f' }}>📢 새 공지사항 작성</h3>
                        <form onSubmit={handleNoticeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input type="text" placeholder="공지 제목" value={newNotice.title} onChange={(e) => setNewNotice({...newNotice, title: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd' }} />
                            <textarea placeholder="공지 내용" rows="8" value={newNotice.content} onChange={(e) => setNewNotice({...newNotice, content: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', resize: 'none' }} />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setIsNoticeModalOpen(false)} style={{ padding: '10px', background: '#eee', border: 'none', cursor: 'pointer' }}>취소</button>
                                <button type="submit" style={{ padding: '10px', background: '#d9534f', color: '#fff', border: 'none', cursor: 'pointer' }}>등록하기</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- 질문 등록 모달창 --- */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '400px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>새 질문 작성</h3>
                        <form onSubmit={handleQnaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input type="text" placeholder="제목" value={newQuestion.title} onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd' }} />
                            <textarea placeholder="질문 내용" rows="5" value={newQuestion.content} onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', resize: 'none' }} />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px', background: '#eee', border: 'none', cursor: 'pointer' }}>취소</button>
                                <button type="submit" style={{ padding: '10px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>등록하기</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🌟 (신규) 사장님 답변 모달창 */}
            {isAnswerModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '400px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#007bff' }}>💬 고객 질문에 답변 달기</h3>
                        <form onSubmit={handleAnswerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <textarea
                                placeholder="친절한 답변을 작성해주세요"
                                rows="5"
                                value={answerContent}
                                onChange={(e) => setAnswerContent(e.target.value)}
                                style={{ padding: '10px', border: '1px solid #ddd', resize: 'none' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setIsAnswerModalOpen(false)} style={{ padding: '10px', background: '#eee', border: 'none', cursor: 'pointer' }}>취소</button>
                                <button type="submit" style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>답변 완료</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerCenter;