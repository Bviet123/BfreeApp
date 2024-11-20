// BookComments.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { database } from '../../firebaseConfig';
import { ref, push, get, remove, update, onValue } from 'firebase/database';
import { debounce } from 'lodash';
import '../../pageCSS/BookDetailCss/BookCommentCss.css';


function BookComments({ bookId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [replyPath, setReplyPath] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    const commentsRef = ref(database, `bookComments/${bookId}`);
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const commentsData = snapshot.val();
        const commentsArray = Object.entries(commentsData).map(([id, comment]) => ({
          id,
          ...comment,
          timestamp: new Date(comment.timestamp).toLocaleString('vi-VN'),
          replies: parseReplies(comment.replies)
        }));
        commentsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setComments(commentsArray);

        const initialExpandedState = {};
        const initializeExpanded = (comment) => {
          initialExpandedState[comment.id] = false;
          if (comment.replies) {
            comment.replies.forEach(reply => {
              initialExpandedState[reply.id] = false;
              if (reply.replies) {
                initializeExpanded(reply);
              }
            });
          }
        };
        
        commentsArray.forEach(comment => initializeExpanded(comment));
        setExpandedComments(prev => ({ ...prev, ...initialExpandedState }));
      } else {
        setComments([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [bookId]);

  const parseReplies = (replies) => {
    if (!replies) return [];
    return Object.entries(replies).map(([id, reply]) => ({
      id,
      ...reply,
      timestamp: new Date(reply.timestamp).toLocaleString('vi-VN'),
      replies: parseReplies(reply.replies)
    })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Vui lòng đăng nhập để bình luận.");
      return;
    }
    if (!newComment.trim() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const userRef = ref(database, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();

      const commentsRef = ref(database, `bookComments/${bookId}`);
      const newCommentData = {
        userId: user.uid,
        userName: userData?.fullName || 'Anonymous',
        userAvatar: userData?.avatar || null,
        content: newComment,
        timestamp: new Date().toISOString(),
        likes: 0,
        likedBy: {}
      };

      const newCommentRef = await push(commentsRef, newCommentData);
      setExpandedComments(prev => ({ ...prev, [newCommentRef.key]: true }));
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Có lỗi xảy ra khi đăng bình luận.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!user || !replyContent.trim() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const userRef = ref(database, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();

      const replyRef = ref(database, `bookComments/${bookId}/${replyPath}/replies`);
      const newReplyData = {
        userId: user.uid,
        userName: userData?.fullName || 'Anonymous',
        userAvatar: userData?.avatar || null,
        content: replyContent,
        timestamp: new Date().toISOString(),
        likes: 0,
        likedBy: {}
      };

      const newReplyRef = await push(replyRef, newReplyData);
      setExpandedComments(prev => ({ ...prev, [newReplyRef.key]: true }));
      setReplyContent('');
      setReplyingTo(null);
      setReplyPath(null);
    } catch (error) {
      console.error("Error adding reply:", error);
      alert("Có lỗi xảy ra khi trả lời bình luận.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComment = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleEditComment = (path, content) => {
    if (!user) return;
    setEditingComment(path);
    setEditedContent(content);
  };

  const handleSaveEdit = async () => {
    if (!editedContent.trim() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const commentRef = ref(database, `bookComments/${bookId}/${editingComment}`);
      await update(commentRef, {
        content: editedContent,
        isEdited: true,
        editTimestamp: new Date().toISOString()
      });

      setEditingComment(null);
      setEditedContent('');
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Có lỗi xảy ra khi cập nhật bình luận.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (path) => {
    if (!user || isSubmitting) return;

    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      try {
        setIsSubmitting(true);
        const commentRef = ref(database, `bookComments/${bookId}/${path}`);
        await remove(commentRef);
      } catch (error) {
        console.error("Error deleting comment:", error);
        alert("Có lỗi xảy ra khi xóa bình luận.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleLikeComment = useCallback(
    debounce(async (path) => {
      if (!user) {
        alert("Vui lòng đăng nhập để thích bình luận.");
        return;
      }

      try {
        const commentRef = ref(database, `bookComments/${bookId}/${path}`);
        const snapshot = await get(commentRef);
        const comment = snapshot.val();

        const likedBy = comment.likedBy || {};
        const newLikes = comment.likes || 0;

        if (likedBy[user.uid]) {
          delete likedBy[user.uid];
          await update(commentRef, {
            likes: newLikes - 1,
            likedBy
          });
        } else {
          likedBy[user.uid] = true;
          await update(commentRef, {
            likes: newLikes + 1,
            likedBy
          });
        }
      } catch (error) {
        console.error("Error updating like:", error);
        alert("Có lỗi xảy ra khi cập nhật lượt thích.");
      }
    }, 300),
    [user, bookId]
  );

  const renderComment = (comment, path = '', level = 0) => {
    const isExpanded = expandedComments[comment.id];

    return (
      <div key={comment.id} className="dt-comment-item">
        <div className="dt-comment-container">
          <div className="dt-comment-header">
            {comment.replies?.length > 0 && (
              <div className="dt-comment-toggle" onClick={() => handleToggleComment(comment.id)}>
                {isExpanded ? '▼' : '▶'}
              </div>
            )}
            <img
              src={comment.userAvatar || '/default-avatar.png'}
              alt={comment.userName}
              className="dt-user-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
              }}
            />
            <span className="dt-user-name">{comment.userName}</span>
            <span className="dt-comment-time">{comment.timestamp}</span>
          </div>

          <div className="dt-comment-content">
            {editingComment === path ? (
              <div className="dt-edit-comment">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="dt-edit-input"
                />
                <div className="dt-edit-actions">
                  <button 
                    onClick={handleSaveEdit} 
                    disabled={isSubmitting}
                    className="dt-save-button"
                  >
                    Lưu
                  </button>
                  <button 
                    onClick={() => setEditingComment(null)}
                    className="dt-cancel-button"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p>{comment.content}</p>
                {comment.isEdited && (
                  <span className="dt-edited-mark">(đã chỉnh sửa)</span>
                )}
              </>
            )}

            <div className="dt-comment-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLikeComment(path);
                }}
                className={`dt-like-button ${comment.likedBy?.[user?.uid] ? 'liked' : ''}`}
                disabled={isSubmitting}
              >
                {comment.likes || 0} Thích
              </button>

              {user && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setReplyingTo(path);
                    setReplyPath(path);
                  }}
                  disabled={isSubmitting}
                  className="dt-reply-button"
                >
                  Trả lời
                </button>
              )}

              {user && comment.userId === user.uid && editingComment !== path && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditComment(path, comment.content);
                    }}
                    disabled={isSubmitting}
                    className="dt-edit-button"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteComment(path);
                    }}
                    disabled={isSubmitting}
                    className="dt-delete-button"
                  >
                    Xóa
                  </button>
                </>
              )}
            </div>
          </div>

          {replyingTo === path && (
            <div className="dt-reply-form">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Viết câu trả lời của bạn..."
                className="dt-reply-input"
              />
              <div className="dt-reply-actions">
                <button 
                  onClick={handleSubmitReply} 
                  disabled={isSubmitting}
                  className="dt-submit-reply"
                >
                  Gửi trả lời
                </button>
                <button 
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyPath(null);
                  }}
                  className="dt-cancel-reply"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className={`dt-replies-section ${isExpanded ? 'expanded' : ''}`}>
            {comment.replies.map(reply =>
              renderComment(
                reply,
                `${path}${path ? '/replies/' : ''}${reply.id}`,
                level + 1
              )
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="dt-loading">Đang tải bình luận...</div>;

  return (
    <div className="dt-book-comments">
      <div className="dt-comments-header">
        <h2>Bình luận</h2>
      </div>

      <form onSubmit={handleSubmitComment} className="dt-comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? "Viết bình luận của bạn..." : "Vui lòng đăng nhập để bình luận"}
          disabled={!user || isSubmitting}
          className="dt-comment-input"
        />
        <button
          type="submit"
          disabled={!user || !newComment.trim() || isSubmitting}
          className="dt-submit-comment"
        >
          Đăng bình luận
        </button>
      </form>

      <div className="dt-comments-list">
        {comments.length === 0 ? (
          <p className="dt-no-comments">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
        ) : (
          comments.map(comment => renderComment(comment, comment.id))
        )}
      </div>
    </div>
  );
}

export default BookComments;