import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useLanguage } from '../LanguageContext';

const mockFlashSaleProducts = [
  { id: 1, name: 'Áo Thun Slim-Fit ProCOOL Premium', originalPrice: 360000, salePrice: 290000, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80', category: 'Áo', sold: 16, total: 20 },
  { id: 2, name: 'Quần Jeans Nam AIRFLEX Straight', originalPrice: 620000, salePrice: 490000, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80', category: 'Quần', sold: 12, total: 20 },
  { id: 3, name: 'Áo Polo Nam ICONDENIM Imperial', originalPrice: 500000, salePrice: 390000, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80', category: 'Áo', sold: 18, total: 20 },
  { id: 4, name: 'Túi Balo Urban Explorer Da Thật', originalPrice: 980000, salePrice: 680000, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', category: 'Phụ kiện', sold: 8, total: 10 },
  { id: 5, name: 'Áo Hoodie Streetwear Oversize', originalPrice: 550000, salePrice: 350000, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80', category: 'Áo', sold: 15, total: 20 },
  { id: 6, name: 'Quần Short Kaki Elastic Waist', originalPrice: 280000, salePrice: 190000, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80', category: 'Quần', sold: 19, total: 20 },
  { id: 7, name: 'Giày Sneaker Retro Classic White', originalPrice: 850000, salePrice: 550000, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80', category: 'Giày', sold: 14, total: 25 },
  { id: 8, name: 'Mũ Cap Denim Classic Vintage', originalPrice: 220000, salePrice: 150000, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80', category: 'Phụ kiện', sold: 9, total: 15 }
];

export default function FlashSale() {
  const { t, lang } = useLanguage();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dbProducts, setDbProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 24, seconds: 15 });

  useEffect(() => {
    const target = new Date().getTime() + (8 * 3600 + 24 * 60 + 15) * 1000;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;
      if (difference <= 0) {
        clearInterval(interval);
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch products from DB
  useEffect(() => {
    fetch('/identity/api/products')
      .then(res => {
        if (!res.ok) throw new Error("API Error: " + res.status);
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          const getCategoryName = (id, name = '') => {
            const lowerName = name.toLowerCase();
            if (lowerName.includes('áo') || lowerName.includes('hoodie') || lowerName.includes('polo')) return 'Áo';
            if (lowerName.includes('quần') || lowerName.includes('jean') || lowerName.includes('short')) return 'Quần';
            if (lowerName.includes('giày') || lowerName.includes('sneaker')) return 'Giày';
            return 'Phụ kiện';
          };

          const formattedData = data.map(p => {
            const finalPrice = p.salePrice > 0 ? p.salePrice : Math.round(p.price * 0.8); // 20% off fallback
            const isSale = true;
            return {
              id: p.id,
              name: p.name,
              originalPrice: p.price,
              salePrice: finalPrice,
              image: (p.images && p.images.length > 0) ? (p.images.find(img => img.isMain)?.imageUrl || p.images[0].imageUrl) : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
              category: getCategoryName(p.categoryId, p.name),
              sold: 10 + (p.id % 10),
              total: 20
            };
          });
          setDbProducts(formattedData);
        }
      })
      .catch(err => {
        console.error("Lỗi khi load sản phẩm từ DB:", err);
      });
  }, []);

  const productsToDisplay = dbProducts.length > 0 ? dbProducts : mockFlashSaleProducts;

  const filteredProducts = selectedCategory === 'All' 
    ? productsToDisplay 
    : productsToDisplay.filter(p => p.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  // Pagination computations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Quick purchase handler
  const handleQuickBuy = async (product) => {
    // Add default variant S or M or 40 for Shoes
    const size = product.category === 'Giày' ? '40' : 'M';
    await addToCart({
      id: product.id,
      name: product.name,
      price: new Intl.NumberFormat('vi-VN').format(product.salePrice) + 'đ',
      image: product.image
    }, 1, size, 'Đen');
    navigate('/cart');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', paddingBottom: '4rem', minHeight: '100vh' }}>
      {/* Banner Header with Timer */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #635dc7 50%, #312e81 100%)',
        color: '#ffffff',
        padding: '3.5rem 1rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background shapes */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '30%', height: '50%', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', transform: 'rotate(-30deg)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '40%', height: '60%', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span style={{
            backgroundColor: '#ef4444',
            color: '#ffffff',
            padding: '0.35rem 1rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)'
          }}>{lang === 'vi' ? '⚡ SIÊU KHUYẾN MÃI GIỜ VÀNG' : '⚡ GOLDEN HOUR SUPER SALE'}</span>
          
          <h1 style={{
            fontSize: '2.8rem',
            fontWeight: 900,
            color: '#ffffff',
            marginTop: '1.25rem',
            marginBottom: '0.5rem',
            letterSpacing: '0.02em',
            textTransform: 'uppercase'
          }}>{lang === 'vi' ? 'FLASH SALE HÔM NAY' : "TODAY'S FLASH SALE"}</h1>
          
          <p style={{ color: '#e0f2fe', fontSize: '0.95rem', fontWeight: 500, opacity: 0.9 }}>
            {lang === 'vi' ? (
              <>Ưu đãi cực sốc lên tới <strong style={{ color: '#fadb14' }}>50%</strong>. Số lượng có hạn, nhanh tay săn ngay kẻo lỡ!</>
            ) : (
              <>Crazy discount up to <strong style={{ color: '#fadb14' }}>50%</strong>. Limited stock, hurry up to grab now!</>
            )}
          </p>

          {/* Countdown Clock */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '2rem'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#e0f2fe', marginRight: '0.5rem' }}>{t('countdown_text')}:</span>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div className="countdown-box" style={{ background: '#1e293b', fontSize: '1.4rem', padding: '0.75rem 1rem', borderRadius: '8px', minWidth: '48px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.5rem', alignSelf: 'center' }}>:</div>
              <div className="countdown-box" style={{ background: '#1e293b', fontSize: '1.4rem', padding: '0.75rem 1rem', borderRadius: '8px', minWidth: '48px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.5rem', alignSelf: 'center' }}>:</div>
              <div className="countdown-box" style={{ background: '#1e293b', fontSize: '1.4rem', padding: '0.75rem 1rem', borderRadius: '8px', minWidth: '48px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        
        {/* Category Filters */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '2.5rem'
        }}>
          {[
            { key: 'All', label: lang === 'vi' ? 'Tất cả' : 'All' },
            { key: 'Áo', label: lang === 'vi' ? 'Áo' : 'Tops' },
            { key: 'Quần', label: lang === 'vi' ? 'Quần' : 'Bottoms' },
            { key: 'Giày', label: lang === 'vi' ? 'Giày' : 'Shoes' },
            { key: 'Phụ kiện', label: lang === 'vi' ? 'Phụ kiện' : 'Accessories' }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              style={{
                padding: '0.6rem 1.75rem',
                borderRadius: '30px',
                border: '1px solid',
                borderColor: selectedCategory === cat.key ? 'var(--primary-color)' : 'var(--border-medium)',
                backgroundColor: selectedCategory === cat.key ? 'var(--primary-color)' : '#ffffff',
                color: selectedCategory === cat.key ? '#ffffff' : 'var(--text-dark)',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.2s ease',
                boxShadow: selectedCategory === cat.key ? '0 4px 12px rgba(99, 93, 199, 0.2)' : 'none'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '2rem'
        }}>
          {currentItems.map((product) => {
            const percentOff = Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100);
            const soldQty = product.sold;
            const totalQty = product.total;
            const fillPercent = (soldQty / totalQty) * 100;

            return (
              <div
                key={product.id}
                className="product-card"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-light)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  position: 'relative'
                }}
              >
                {/* Sale Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  zIndex: 2,
                  boxShadow: '0 2px 5px rgba(239, 68, 68, 0.2)'
                }}>
                  {lang === 'vi' ? 'GIẢM' : 'OFF'} {percentOff}%
                </div>

                {/* Product Image */}
                <div className="product-image-container" style={{ aspectRatio: '3/4', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Product Info */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {product.category}
                  </span>
                  
                  <h3 style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    lineHeight: '1.4',
                    textTransform: 'uppercase',
                    minHeight: '2.4rem',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    marginBottom: '0.75rem'
                  }}>
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>
                      {new Intl.NumberFormat('vi-VN').format(product.salePrice)}đ
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      {new Intl.NumberFormat('vi-VN').format(product.originalPrice)}đ
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '1.25rem', marginTop: 'auto' }}>
                    <div style={{
                      height: '14px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '10px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(to right, #ef4444, #f97316)',
                        borderRadius: '10px',
                        width: `${fillPercent}%`,
                        transition: 'width 0.5s ease'
                      }} />
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '9px',
                        fontWeight: 800,
                        color: fillPercent > 50 ? '#ffffff' : 'var(--text-dark)',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap'
                      }}>
                        {lang === 'vi' ? 'ĐÃ BÁN' : 'SOLD'} {soldQty} / {totalQty}
                      </span>
                    </div>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => handleQuickBuy(product)}
                    style={{
                      width: '100%',
                      backgroundColor: '#111111',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.75rem',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#111111';
                    }}
                  >
                    <i className="ri-shopping-bag-line" /> {t('buy_now')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '3.5rem'
          }}>
            {/* Previous Button */}
            <button
              className="btn btn-outline"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(prev => Math.max(prev - 1, 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                padding: '0.6rem 1.25rem',
                height: '40px',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                opacity: currentPage === 1 ? 0.4 : 1,
                pointerEvents: currentPage === 1 ? 'none' : 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <i className="ri-arrow-left-s-line" />
              {lang === 'vi' ? 'Trước' : 'Prev'}
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  width: '40px',
                  height: '40px',
                  padding: 0,
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...(currentPage === page ? {
                    backgroundColor: 'var(--primary-color)',
                    borderColor: 'var(--primary-color)',
                    color: '#ffffff'
                  } : {})
                }}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              className="btn btn-outline"
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage(prev => Math.min(prev + 1, totalPages));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                padding: '0.6rem 1.25rem',
                height: '40px',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                opacity: currentPage === totalPages ? 0.4 : 1,
                pointerEvents: currentPage === totalPages ? 'none' : 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              {lang === 'vi' ? 'Sau' : 'Next'}
              <i className="ri-arrow-right-s-line" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
