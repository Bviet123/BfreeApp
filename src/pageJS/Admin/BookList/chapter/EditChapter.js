import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { FaArrowLeft, FaBook, FaSave } from 'react-icons/fa';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '../../../../pageCSS/Admin/BookListCss/ChapterCss/EditChapterCss.css';
import { database } from '../../../../firebaseConfig';

function EditChapter() {
    const { bookId, chapterId } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [book, setBook] = useState(null);
    const [chapter, setChapter] = useState(null);

    useEffect(() => {
        const fetchBookAndChapter = async () => {
            const bookRef = ref(database, `books/${bookId}`);
            const snapshot = await get(bookRef);
            if (snapshot.exists()) {
                const bookData = snapshot.val();
                setBook(bookData);
                const chapterToEdit = bookData.content.chapters.find(ch => ch.id === chapterId);
                if (chapterToEdit) {
                    setChapter(chapterToEdit);
                    setTitle(chapterToEdit.title);
                    setContent(chapterToEdit.content);
                } else {
                    console.error('Không tìm thấy chương');
                }
            } else {
                console.error('Không tìm thấy sách');
            }
        };

        fetchBookAndChapter();
    }, [bookId, chapterId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!book || !chapter) return;

        const currentTime = new Date().toISOString();

        const updatedChapter = {
            ...chapter,
            title,
            content,
            lastUpdated: currentTime
        };

        const updatedChapters = book.content.chapters.map(ch =>
            ch.id === chapterId ? updatedChapter : ch
        );

        const updatedBook = {
            ...book,
            content: {
                ...book.content,
                chapters: updatedChapters
            },
            lastUpdated: currentTime
        };

        try {
            const bookRef = ref(database, `books/${bookId}`);
            await update(bookRef, updatedBook);
            alert('Chương đã được cập nhật thành công!');
            navigate(`/admin/books/BookDetail/${bookId}`);
        } catch (error) {
            console.error('Lỗi khi cập nhật chương:', error);
            alert('Có lỗi xảy ra khi cập nhật chương. Vui lòng thử lại.');
        }
    };

    if (!book || !chapter) {
        return <div className="ec-loading">Đang tải...</div>;
    }

    const handleGoBack = () => {
        navigate(`/admin/books/BookDetail/${bookId}`);
    };

    return (
        <div className="ec-container">
            <div className="ec-header">
                <button onClick={handleGoBack} className="ec-back-button">
                    <FaArrowLeft /> Quay lại
                </button>
                <h1 className="ec-title">
                    <FaBook /> Chỉnh sửa: {chapter.title}
                </h1>
            </div>
            <form onSubmit={handleSubmit} className="ec-form">
                <div className="ec-form-group">
                    <label htmlFor="chapterTitle" className="ec-label">Tiêu đề chương:</label>
                    <input
                        type="text"
                        id="chapterTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="ec-input"
                    />
                </div>
                <div className="ec-form-group">
                    <label htmlFor="chapterContent" className="ec-label">Nội dung chương:</label>
                    <CKEditor
                        editor={ClassicEditor}
                        data={content}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            setContent(data);
                        }}
                        className="ec-editor"
                    />
                </div>
                <button type="submit" className="ec-submit-button">
                    <FaSave /> Lưu Thay Đổi
                </button>
            </form>
        </div>
    );
}

export default EditChapter;