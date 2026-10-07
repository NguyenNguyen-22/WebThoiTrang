import React, { useState, useEffect } from 'react';

export default function ProductReview({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Get current user from localStorage
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  // Fetch reviews for the product
  const fetchReviews = async () => {
    try {
      const res = await fetch(`/identity/api/reviews/product/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  // Check if the current user is eligible to write a review
  const checkEligibility = async () => {
    if (!currentUser || !currentUser.id) {
      setIsEligible(false);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/identity/api/reviews/check-eligibility?productId=${productId}&userId=${currentUser.id}`);
      if (res.ok) {
        const eligible = await res.json();
        setIsEligible(eligible);
      } else {
        setIsEligible(false);
      }
    } catch (err) {
      console.error('Error checking review eligibility:', err);
      setIsEligible(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchReviews();
    checkEligibility();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.id) {
      setError('Vui lòng đăng nhập để gửi đánh giá.');
      return;
    }
    if (!comment.trim()) {
      setError('Vui lòng viết nội dung đánh giá.');
      return;
    }

    setSubmitting(true);
    setError('');

    // Kiểm tra tính đồng nhất của đánh giá bằng AI (nhận diện comment mâu thuẫn số sao)
    try {
      const checkRes = await fetch('/ai-fit/check-sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: rating,
          comment: comment.trim()
        })
      });
      
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (!checkData.is_consistent) {
          setError(`Đánh giá không thành công: ${checkData.warning} Hệ thống không cho phép gửi đánh giá mâu thuẫn với số sao.`);
          setSubmitting(false);
          return;
        }
      }
    } catch (checkErr) {
      console.warn('Không thể kiểm tra cảm xúc bằng AI (bỏ qua và gửi trực tiếp):', checkErr);
    }

    try {
      const res = await fetch('/identity/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: productId,
          userId: currentUser.id,
          rating: rating,
          comment: comment.trim()
        })
      });

      if (res.ok) {
        setComment('');
        setRating(5);
        // Refresh reviews and check eligibility again (usually hides form or marks as reviewed)
        await fetchReviews();
        await checkEligibility();
      } else {
        const errMsg = await res.text();
        setError(errMsg || 'Không thể gửi đánh giá. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Lỗi kết nối server. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem' }}>
      <h3 style={{ 
        fontSize: '1.15rem', 
        fontFamily: 'var(--font-display)', 
        marginBottom: '1.25rem', 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em',
        borderLeft: '3px solid #B99B6B',
        paddingLeft: '0.75rem'
      }}>
        Đánh giá & Bình luận từ khách hàng
      </h3>

      {/* Review Form Container */}
      <div style={{ marginBottom: '1.5rem', backgroundColor: '#fcfcfc', border: '1px solid #f0f0f0', padding: '1.25rem' }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Đang kiểm tra quyền đánh giá...</div>
        ) : !currentUser ? (
          <div style={{ 
            padding: '1rem', 
            border: '1px dashed #d9d9d9', 
            backgroundColor: '#fafafa', 
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem'
          }}>
            <i className="ri-lock-line" style={{ marginRight: '0.5rem', fontSize: '1rem', verticalAlign: 'middle', color: '#B99B6B' }}></i>
            Vui lòng <strong>đăng nhập</strong> tài khoản của bạn để viết đánh giá cho sản phẩm này.
          </div>
        ) : !isEligible ? (
          <div style={{ 
            padding: '1rem', 
            border: '1px dashed rgba(185, 155, 107, 0.3)', 
            backgroundColor: 'rgba(185, 155, 107, 0.03)', 
            color: '#8A6D3B',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            borderRadius: '4px'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <i className="ri-information-line" style={{ fontSize: '1.1rem', color: '#B99B6B', marginTop: '-1px' }}></i>
              <div>
                <strong>Chỉ những khách hàng đã mua sản phẩm này mới có thể viết đánh giá.</strong>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Hệ thống BN Store ghi nhận lịch sử đơn hàng của bạn. Khi đơn hàng chứa sản phẩm này chuyển sang trạng thái <strong>Hoàn thành</strong>, bạn sẽ có quyền bình luận tại đây.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.8rem', color: '#111' }}>Viết Đánh Giá Của Bạn</h4>
            
            {error && (
              <div style={{ 
                padding: '0.5rem 0.75rem', 
                backgroundColor: '#fff2f0', 
                border: '1px solid #ffccc7', 
                color: '#ff4d4f', 
                fontSize: '0.85rem', 
                marginBottom: '0.8rem',
                borderRadius: '2px'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Đánh giá của bạn:</span>
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star} 
                    style={{ 
                      cursor: 'pointer', 
                      color: star <= rating ? '#FFB800' : '#d9d9d9', 
                      fontSize: '1.4rem',
                      transition: 'color 0.2s ease, transform 0.1s ease',
                      lineHeight: 1
                    }} 
                    onMouseEnter={() => setRating(star)}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span style={{ 
                fontSize: '0.8rem', 
                color: '#B99B6B', 
                fontWeight: 600, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em' 
              }}>
                {rating === 5 && 'Rất tốt'}
                {rating === 4 && 'Tốt'}
                {rating === 3 && 'Trung bình'}
                {rating === 2 && 'Kém'}
                {rating === 1 && 'Rất kém'}
              </span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <textarea
                className="form-input"
                style={{ 
                  width: '100%', 
                  minHeight: '70px', 
                  padding: '0.75rem', 
                  borderRadius: '0px', 
                  borderColor: '#d9d9d9',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}
                placeholder="Chia sẻ trải nghiệm thực tế của bạn về sản phẩm này (chất vải, form dáng, dịch vụ giao hàng...)"
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
              />
            </div>

            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={submitting || !comment.trim()}
              style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}
            >
              {submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
          </form>
        )}
      </div>

      {/* Reviews List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Tất cả đánh giá ({reviews.length})</span>
        </div>

        {reviews.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem 0', 
            color: 'var(--text-muted)',
            fontSize: '0.9rem'
          }}>
            Chưa có đánh giá nào cho sản phẩm này. Hãy là người mua đầu tiên đánh giá!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {reviews.map(r => (
              <div key={r.id} style={{ 
                borderBottom: '1px solid #f5f5f5', 
                paddingBottom: '1rem',
                display: 'flex',
                gap: '1rem'
              }}>
                {/* User Avatar Placeholder */}
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  backgroundColor: '#B99B6B', 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  flexShrink: 0
                }}>
                  {r.user && r.user.name ? r.user.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#111' }}>
                        {r.user ? r.user.name : 'Khách hàng'}
                      </strong>
                      
                      {r.isPurchased && (
                        <span style={{ 
                          fontSize: '0.65rem', 
                          color: '#52c41a', 
                          backgroundColor: '#f6ffed', 
                          border: '1px solid #b7eb8f',
                          padding: '0.05rem 0.3rem',
                          borderRadius: '2px',
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '1px'
                        }}>
                          <i className="ri-shield-check-line" style={{ fontSize: '0.75rem' }}></i> Đã mua hàng
                        </span>
                      )}
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(r.createdAt)}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.1rem', margin: '0.2rem 0 0.4rem 0' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} style={{ color: star <= r.rating ? '#FFB800' : '#e8e8e8', fontSize: '0.9rem' }}>
                        ★
                      </span>
                    ))}
                  </div>

                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#333', 
                    lineHeight: '1.5', 
                    whiteSpace: 'pre-line' 
                  }}>
                    {r.comment}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
