import React, { useState } from 'react';
import '../../pageCSS/BookDetailCss/AuthorInforCss.css';
import DateFormatter from '../../Format/DateFormatter';

function AuthorInfo({ authors }) {
    const [activeTab, setActiveTab] = useState(0);

    if (!authors || authors.length === 0) return <p>Không có thông tin về tác giả.</p>;

    return (
        <div className="dt-author-info">
            <h2>Thông tin tác giả</h2>

            <div className="dt-author-tabs">
                {authors.map((author, index) => (
                    <button
                        key={author.id}
                        className={`dt-author-tab ${activeTab === index ? 'active' : ''}`}
                        onClick={() => setActiveTab(index)}
                    >
                        {author.name}
                    </button>
                ))}
            </div>

            <div className="dt-author-content">
                {authors.map((author, index) => (
                    <div
                        key={author.id}
                        className={`dt-author-panel ${activeTab === index ? 'active' : ''}`}
                    >
                        <div className="dt-author-details">

                            <div className="dt-author-info-list">
                                <div className="dt-info-row">
                                    <span className="dt-info-label">Họ và Tên: </span>
                                    <span className="dt-info-value">{author.name || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="dt-info-row">
                                    <span className="dt-info-label">Ngày sinh:</span>
                                    <span className="dt-info-value">{
                                        <DateFormatter
                                            dateString={author.birthDate}
                                            format="DD/MM/YYYY"
                                            showError={true}
                                        /> || 'Chưa cập nhật'}
                                    </span>
                                </div>

                                <div className="dt-info-row">
                                    <span className="dt-info-label">Quốc tịch:</span>
                                    <span className="dt-info-value">{author.nationality || 'Chưa cập nhật'}</span>
                                </div>

                            </div>
                            {author.introduction && (
                                <div className="dt-author-introduction">
                                    <div className="dt-info-row">
                                        <span className="dt-info-label">Giới thiệu:</span>
                                        <span className="dt-info-value">{author.introduction}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AuthorInfo;