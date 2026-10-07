import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductReview from '../components/ProductReview';
import { useCart } from '../CartContext';
import { useLanguage } from '../LanguageContext';
import { getCssColor } from './Shop';

const categories = [
  { id: 1, name: 'Áo Nam', filterName: 'Áo', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Quần Nam & Jeans', filterName: 'Quần', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Giày & Sneaker Nam', filterName: 'Giày', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Phụ Kiện', filterName: 'Phụ kiện', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80' }
];

const mockProducts = [
  { id: 1, name: 'Áo Thun Slim-Fit ProCOOL Premium', price: '290.000đ', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80', category: 'Áo', desc: 'Áo thun cotton cao cấp tích hợp công nghệ làm mát ProCOOL. Vải dệt kim siêu mỏng nhẹ, co giãn thoải mái cả ngày dài.', variants: [{size: 'S', color: 'Trắng'}, {size: 'M', color: 'Trắng'}, {size: 'L', color: 'Trắng'}, {size: 'XL', color: 'Trắng'}] },
  { id: 2, name: 'Quần Jeans Nam AIRFLEX Straight', price: '490.000đ', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80', category: 'Quần', desc: 'Chất liệu Denim Airflex siêu nhẹ co giãn tối đa. Phom dáng suông đứng thẳng thớm tôn chiều cao cực đỉnh.', variants: [{size: '29', color: 'Xanh dương'}, {size: '30', color: 'Xanh dương'}, {size: '31', color: 'Xanh dương'}] },
  { id: 3, name: 'Áo Polo Nam ICONDENIM Imperial', price: '390.000đ', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80', category: 'Áo', desc: 'Thiết kế áo polo thêu logo Imperial tinh xảo trước ngực. Chất thun Pique cá sấu dày dặn đứng phom lịch sự.', variants: [{size: 'M', color: 'Đen'}, {size: 'L', color: 'Đen'}, {size: 'XL', color: 'Đen'}] },
  { id: 4, name: 'Túi Balo Urban Explorer Da Thật', price: '680.000đ', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', category: 'Phụ kiện', desc: 'Balo da trơn phom hộp cứng cáp, quai đeo đệm êm giảm tải lực tốt. Phong cách đô thị tinh gọn hiện đại.', variants: [{size: 'F', color: 'Nâu'}] }
];

export default function Home() {
  const { t, lang } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSizeModal, setSelectedSizeModal] = useState('M');
  const [selectedColorModal, setSelectedColorModal] = useState('');
  const [dbProducts, setDbProducts] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const lookbookSlides = [
    {
      subtitle: "NEW COLLECTION / RETRO SPORTS",
      title: lang === 'vi' ? "NĂNG ĐỘNG & BỨT PHÁ" : "DYNAMIC & BREAKTHROUGH",
      desc: lang === 'vi' ? "Cảm hứng cổ điển giao thoa cùng nhịp sống thể thao hiện đại. Thiết kế phom dáng nam tính phóng khoáng từ sợi vải organic dệt bền vững." : "Classic inspiration meets modern sports lifestyle. Masculine, free-spirited designs from sustainably woven organic fibers.",
      image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1200&q=80",
      link: "/products"
    },
    {
      subtitle: "SIGNATURE TECHNOLOGY / SMART JEANS",
      title: lang === 'vi' ? "SIÊU CO GIÃN THÔNG MINH" : "SMART ULTRA-STRETCH",
      desc: lang === 'vi' ? "Dòng sản phẩm Jeans cao cấp tích hợp sợi co giãn đa chiều, giữ phom tốt sau nhiều lần giặt. Cảm nhận sự tự do trong từng bước chuyển động." : "Premium Jeans collection integrating multi-directional stretch fibers, maintaining shape wash after wash. Feel the freedom in every move.",
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80",
      link: "/products?category=quần"
    },
    {
      subtitle: "PROCOOL TECHNOLOGY / STAY COOL",
      title: lang === 'vi' ? "MÁT LẠNH TRONG TỪNG SỢI VẢI" : "COOLING SENSATION IN EVERY FIBER",
      desc: lang === 'vi' ? "Đập tan cơn nóng mùa hè với công nghệ làm mát sợi vải tân tiến. Khô thoáng tức thì, thoải mái tận hưởng trọn vẹn mọi khoảnh khắc thường nhật." : "Defeat summer heat with advanced fiber cooling technology. Dry instantly, comfortably enjoying every everyday moment.",
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=80",
      link: "/products"
    }
  ];

  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const target = new Date().getTime() + (12 * 3600 + 45 * 60 + 30) * 1000;
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

  // Slide Auto-play Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % lookbookSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch db products
  useEffect(() => {
    fetch('/identity/api/products')
      .then(res => {
        if (!res.ok) throw new Error("API Error: " + res.status);
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          const getCategoryName = (id, name = '') => {
            if (id === 1 || id === 2 || id === 3 || id === 4) return 'Áo';
            if (id === 6 || id === 9) return 'Quần';
            if (id === 15) return 'Giày';
            if (id === 17) return 'Phụ kiện';
            
            const lowerName = name.toLowerCase();
            if (lowerName.includes('áo') || lowerName.includes('hoodie') || lowerName.includes('polo') || lowerName.includes('bomber') || lowerName.includes('sweater') || lowerName.includes('t-shirt')) return 'Áo';
            if (lowerName.includes('quần') || lowerName.includes('jean') || lowerName.includes('trouser') || lowerName.includes('pant') || lowerName.includes('short')) return 'Quần';
            if (lowerName.includes('giày') || lowerName.includes('sneaker') || lowerName.includes('boot') || lowerName.includes('sandal')) return 'Giày';
            if (lowerName.includes('mũ') || lowerName.includes('nón') || lowerName.includes('túi') || lowerName.includes('kính') || lowerName.includes('phụ kiện') || lowerName.includes('belt') || lowerName.includes('thắt lưng')) return 'Phụ kiện';
            if (lowerName.includes('váy') || lowerName.includes('đầm') || lowerName.includes('dress') || lowerName.includes('skirt')) return 'Váy';
            
            if (id === 5) return 'Giày';
            return 'Khác';
          };

          const formattedData = data.map(p => {
            const finalPrice = p.salePrice > 0 ? p.salePrice : p.price;
            return {
              id: p.id,
              name: p.name,
              hasSale: p.salePrice > 0,
              salePriceStr: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.salePrice || 0),
              originalPriceStr: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price || 0),
              price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice),
              image: (p.images && p.images.length > 0) ? (p.images.find(img => img.isMain)?.imageUrl || p.images[0].imageUrl) : '',
              variants: p.variants || [],
              category: getCategoryName(p.categoryId, p.name),
              desc: p.description
            };
          });
          setDbProducts(formattedData);
        }
      })
      .catch(err => {
        console.error("Lỗi khi load sản phẩm từ DB:", err);
      });
  }, []);

  const openModal = (product) => {
    setSelectedProduct(product);
    if (product.variants && product.variants.length > 0) {
      setSelectedSizeModal(product.variants[0].size || 'M');
      const availableColors = Array.from(new Set(product.variants.map(v => v.color).filter(c => c)));
      if (availableColors.length > 0) {
        setSelectedColorModal(availableColors[0]);
      } else {
        setSelectedColorModal('');
      }
    } else {
      const isShoe = (product.category || '').toLowerCase().includes('giày') || (product.name || '').toLowerCase().includes('giày');
      setSelectedSizeModal(isShoe ? '40' : 'M');
      setSelectedColorModal('');
    }
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleAddToCartModal = async () => {
    if (!selectedProduct) return;
    await addToCart(selectedProduct, 1, selectedSizeModal, selectedColorModal);
    closeModal();
    navigate('/cart');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
    document.body.style.overflow = 'auto';
  };

  const displayedProducts = dbProducts.length > 0 ? dbProducts.slice(0, 8) : mockProducts;

  return (
    <>
      {/* 1. Hero Layout (Sidebar + Slider Grid) */}
      <section style={{ backgroundColor: '#ffffff', padding: '1rem 0 0.5rem' }}>
        <div className="container">
          <div className="hero-grid-container">
            {/* Left Column: Category Sidebar */}
            <div className="vertical-menu-container">
              <div className="vertical-menu-header" style={{ height: '42px', display: 'flex', alignItems: 'center' }}>
                <i className="ri-menu-line"></i> {t('sidebar_title')}
              </div>
              <ul className="vertical-menu">
                {[
                  { label: t('cat_tshirt'), icon: "ri-shirt-line", link: "/products?category=áo&q=thun" },
                  { label: t('cat_shirt'), icon: "ri-t-shirt-line", link: "/products?category=áo&q=sơ%20mi" },
                  { label: t('cat_polo'), icon: "ri-t-shirt-2-line", link: "/products?category=áo&q=polo" },
                  { label: t('cat_hoodie'), icon: "ri-windy-line", link: "/products?category=áo&q=khoác" },
                  { label: t('cat_jeans'), icon: "ri-coupon-line", link: "/products?category=quần&q=jean" },
                  { label: t('cat_trousers'), icon: "ri-briefcase-line", link: "/products?category=quần&q=kaki" },
                  { label: t('cat_shorts'), icon: "ri-scissors-line", link: "/products?category=quần&q=short" },
                  { label: t('cat_shoes'), icon: "ri-footprint-line", link: "/products?category=giày" },
                  { label: t('cat_belt'), icon: "ri-wallet-line", link: "/products?category=phụ%20kiện&q=thắt%20lưng" },
                  { label: t('cat_bag'), icon: "ri-shopping-bag-line", link: "/products?category=phụ%20kiện&q=túi" },
                  { label: t('cat_hat'), icon: "ri-glasses-line", link: "/products?category=phụ%20kiện&q=nón" },
                  { label: t('cat_jewelry'), icon: "ri-vip-diamond-line", link: "/products?category=phụ%20kiện" }
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link to={item.link} className="vertical-menu-item-link" style={{ height: '38px', padding: '0 1.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className={item.icon} style={{ fontSize: '1.1rem', width: '20px' }}></i>
                        {item.label}
                      </span>
                      <i className="ri-arrow-right-s-line"></i>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Navigation + Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', overflow: 'hidden' }}>

              {/* Slider Carousel */}
              <div className="home-lookbook-slider">
                <div style={{
                  display: 'flex',
                  width: `${lookbookSlides.length * 100}%`,
                  height: '100%',
                  transform: `translateX(-${(activeSlide * 100) / lookbookSlides.length}%)`,
                  transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  {lookbookSlides.map((slide, index) => (
                    <div key={index} style={{
                      width: `${100 / lookbookSlides.length}%`,
                      flexShrink: 0,
                      height: '100%',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      background: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%), url(${slide.image}) no-repeat center center / cover`
                    }}>
                      <div style={{ padding: '0 3rem', zIndex: 10 }}>
                        <div style={{ maxWidth: '550px', animation: activeSlide === index ? 'slideUpFade 1s forwards' : 'none' }}>
                          <span style={{ 
                            color: 'var(--primary-color)', 
                            fontWeight: 700, 
                            letterSpacing: '0.15em', 
                            textTransform: 'uppercase', 
                            fontSize: '0.7rem', 
                            marginBottom: '0.5rem', 
                            display: 'block' 
                          }}>{slide.subtitle}</span>
                          <h2 style={{ 
                            fontSize: '2rem', 
                            fontWeight: 900, 
                            lineHeight: '1.2', 
                            color: '#ffffff',
                            marginBottom: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {slide.title}
                          </h2>
                          <p style={{ 
                            fontSize: '0.85rem', 
                            lineHeight: '1.6', 
                            color: '#cccccc', 
                            marginBottom: '1.25rem',
                            fontWeight: 500
                          }}>{slide.desc}</p>
                          <Link to={slide.link} className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', fontSize: '0.75rem', backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>{t('buy_now')}</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Carousel Indicators */}
                <div style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '0.5rem',
                  zIndex: 20
                }}>
                  {lookbookSlides.map((_, index) => (
                    <button 
                      key={index} 
                      onClick={() => setActiveSlide(index)}
                      style={{
                        width: '25px',
                        height: '3px',
                        borderRadius: '0',
                        backgroundColor: activeSlide === index ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.3)',
                        transition: 'all 0.3s ease',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer'
                      }}
                      aria-label={`Slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Benefit Bar (Thanh Cam Kết) */}
      <section style={{ backgroundColor: '#ffffff', padding: '0.5rem 0' }}>
        <div className="container">
          <div className="benefit-bar">
            {[
              { title: lang === 'vi' ? "MIỄN PHÍ VẬN CHUYỂN" : "FREE SHIPPING", desc: lang === 'vi' ? "Đơn hàng từ 499k" : "Orders from 499k", icon: "ri-truck-line" },
              { title: lang === 'vi' ? "ĐỔI TRẢ 30 NGÀY" : "30-DAY RETURNS", desc: lang === 'vi' ? "Đổi trả tận nhà" : "Home exchange pick-up", icon: "ri-arrow-left-right-line" },
              { title: lang === 'vi' ? "THANH TOÁN AN TOÀN" : "SECURE PAYMENT", desc: lang === 'vi' ? "Bảo mật tuyệt đối" : "100% secure", icon: "ri-shield-check-line" },
              { title: lang === 'vi' ? "TƯ VẤN SIZE AI" : "AI SIZE ADVISORY", desc: lang === 'vi' ? "Chính xác đến 99%" : "99% accurate", icon: "ri-user-settings-line" },
              { title: lang === 'vi' ? "HỖ TRỢ 24/7" : "SUPPORT 24/7", desc: "Hotline 1900 1234", icon: "ri-customer-service-2-line" }
            ].map((item, idx) => (
              <div key={idx} className="benefit-item">
                <div className="benefit-icon-wrapper">
                  <i className={item.icon}></i>
                </div>
                <div>
                  <h4 className="benefit-title" style={{ margin: 0 }}>{item.title}</h4>
                  <p className="benefit-desc" style={{ margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Quick Category Icons */}
      <section style={{ backgroundColor: '#ffffff', padding: '1rem 0 0.5rem' }}>
        <div className="container">
          <div className="quick-cat-grid">
            {[
              { label: lang === 'vi' ? "Áo Thun" : "T-Shirts", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=100&q=80", link: "/products?category=áo&q=thun" },
              { label: lang === 'vi' ? "Áo Sơ Mi" : "Shirts", img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=100&q=80", link: "/products?category=áo&q=sơ%20mi" },
              { label: lang === 'vi' ? "Áo Polo" : "Polos", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=100&q=80", link: "/products?category=áo&q=polo" },
              { label: lang === 'vi' ? "Hoodie nam" : "Hoodies", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=100&q=80", link: "/products?category=áo&q=khoác" },
              { label: lang === 'vi' ? "Quần Jeans" : "Jeans", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=100&q=80", link: "/products?category=quần&q=jean" },
              { label: lang === 'vi' ? "Quần Kaki" : "Kakis", img: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=100&q=80", link: "/products?category=quần&q=kaki" },
              { label: lang === 'vi' ? "Quần Short" : "Shorts", img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=100&q=80", link: "/products?category=quần&q=short" },
              { label: lang === 'vi' ? "Giày Sneaker" : "Sneakers", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=100&q=80", link: "/products?category=giày" },
              { label: lang === 'vi' ? "Thắt lưng nam" : "Belts", img: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=100&q=80", link: "/products?category=phụ%20kiện&q=thắt" },
              { label: lang === 'vi' ? "Balo & Túi" : "Bags", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=100&q=80", link: "/products?category=phụ%20kiện&q=túi" }
            ].map((cat, idx) => (
              <Link key={idx} to={cat.link} className="quick-cat-item">
                <div className="quick-cat-circle">
                  <img src={cat.img} alt={cat.label} />
                </div>
                <span className="quick-cat-name">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Flash Sale Container */}
      <section style={{ backgroundColor: '#ffffff', padding: '1rem 0' }}>
        <div className="container">
          <div className="flash-sale-container">
            {/* Left Flash Sale Banner with Countdown */}
            <div className="flash-sale-left-banner">
              <h3 className="flash-sale-title">⚡ FLASH SALE</h3>
              <p className="flash-sale-sub">{t('countdown_text')}:</p>
              
              <div className="countdown-timer-wrap">
                <div className="countdown-box">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.25rem', alignSelf: 'center' }}>:</div>
                <div className="countdown-box">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.25rem', alignSelf: 'center' }}>:</div>
                <div className="countdown-box">{String(timeLeft.seconds).padStart(2, '0')}</div>
              </div>
              
              <Link to="/flash-sale" className="flash-sale-btn">{lang === 'vi' ? 'Xem tất cả' : 'View all'}</Link>
            </div>
            
            {/* Right Flash Sale Products (5 items) */}
            <div className="flash-sale-grid">
              {displayedProducts.slice(0, 5).map((product, idx) => {
                const soldQty = 10 + (idx * 2);
                const totalQty = 20;
                const fillPercent = (soldQty / totalQty) * 100;
                
                return (
                  <div key={product.id} className="product-card" onClick={() => openModal(product)} style={{ border: 'none', padding: '0.5rem', boxShadow: 'none' }}>
                    <div className="product-image-container" style={{ aspectRatio: '1', borderRadius: 'var(--radius-sm)' }}>
                      <img src={product.image} alt={product.name} className="product-image" />
                      {product.hasSale && (
                        <span style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          zIndex: 2
                        }}>-20%</span>
                      )}
                    </div>
                    
                    <div className="product-info" style={{ padding: '0.5rem 0' }}>
                      <h4 className="product-name" style={{ fontSize: '0.8rem', height: '2.4rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: '0 0 0.25rem' }}>{product.name}</h4>
                      <div className="product-price" style={{ fontSize: '0.9rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ color: '#ef4444', fontWeight: 800 }}>{product.price}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="flash-sale-progress-container">
                        <div className="flash-sale-progress-bg">
                          <div className="flash-sale-progress-fill" style={{ width: `${fillPercent}%` }}></div>
                          <span className="flash-sale-progress-text">{lang === 'vi' ? `Đã bán ${soldQty}` : `Sold ${soldQty}`}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Promotional Banners Grid */}
      <section style={{ backgroundColor: '#ffffff', padding: '1rem 0' }}>
        <div className="container">
          <div className="promo-grid">
            {[
              { title: lang === 'vi' ? "Áo Thun Phong Cách" : "Stylish T-Shirts", desc: lang === 'vi' ? "Giảm đến 20%" : "Up to 20% Off", btnText: t('buy_now'), img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80", link: "/products?category=áo&q=thun" },
              { title: lang === 'vi' ? "Denim Bụi Bặm" : "Rugged Denim", desc: lang === 'vi' ? "Giảm đến 30%" : "Up to 30% Off", btnText: lang === 'vi' ? "Khám Phá" : "Explore", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=300&q=80", link: "/products?category=quần&q=jean" },
              { title: lang === 'vi' ? "Phụ Kiện Da Thật" : "Real Leather Accs", desc: lang === 'vi' ? "Giảm đến 40%" : "Up to 40% Off", btnText: lang === 'vi' ? "Xem Thêm" : "See More", img: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=300&q=80", link: "/products?category=phụ%20kiện" }
            ].map((promo, idx) => (
              <div key={idx} className="promo-banner-card">
                <div className="promo-banner-content">
                  <h4 className="promo-banner-title">{promo.title}</h4>
                  <p className="promo-banner-desc">{promo.desc}</p>
                  <Link to={promo.link} className="promo-banner-btn">{promo.btnText}</Link>
                </div>
                <img src={promo.img} alt={promo.title} className="promo-banner-bg-img" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Lưới Sản phẩm Hot / Bán chạy */}
      <section className="section" style={{ backgroundColor: '#ffffff', paddingTop: '1rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <span style={{ color: 'var(--primary-color)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>TRENDING NOW</span>
            <h2 className="section-title" style={{ margin: '0px' }}>{lang === 'vi' ? 'Sản Phẩm Bán Chạy Nhất' : 'Best Seller Products'}</h2>
          </div>
          
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {displayedProducts.map(product => (
              <div 
                key={product.id} 
                className="product-card" 
                onClick={() => openModal(product)}
              >
                {/* Image and discount tags */}
                <div className="product-image-container">
                  <img src={product.image} alt={product.name} className="product-image" />
                  {product.hasSale && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'var(--primary-color)',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      zIndex: 2
                    }}>Sale</span>
                  )}
                  <div className="product-action">
                    <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 800 }}>{lang === 'vi' ? 'Xem Chi Tiết' : 'View Details'}</button>
                  </div>
                </div>
                
                <div className="product-info">
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: '0.25rem' }}>{product.category}</span>
                  <h4 className="product-name">{product.name}</h4>
                  <div className="product-price" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {product.hasSale ? (
                      <>
                        <span style={{ color: 'var(--primary-color)', fontWeight: 800 }}>{product.salePriceStr}</span>
                        <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '0.8rem', fontWeight: 500 }}>{product.originalPriceStr}</span>
                      </>
                    ) : (
                      <span style={{ color: '#111111', fontWeight: 800 }}>{product.price}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Quick View Modal */}
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`} onClick={closeModal} style={{ display: isModalOpen ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{
          backgroundColor: '#ffffff',
          width: '90%',
          maxWidth: '850px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <button className="modal-close" onClick={closeModal} style={{ 
            position: 'absolute',
            top: '1rem',
            right: '1.25rem',
            zIndex: 10,
            fontSize: '1.8rem',
            fontWeight: '300'
          }}>&times;</button>
          
          {selectedProduct && (
            <>
              {/* Left Column: Image */}
              <div style={{ backgroundColor: '#f9f9f9', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '4/5' }}>
                <img 
                   src={
                       (selectedColorModal && selectedProduct.images && selectedProduct.images.length > 0 
                       && selectedProduct.images.find(img => img.color === selectedColorModal)) 
                       ? selectedProduct.images.find(img => img.color === selectedColorModal).imageUrl 
                       : selectedProduct.image
                   } 
                   alt={selectedProduct.name} 
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              
              {/* Right Column: Info details */}
              <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ color: 'var(--primary-color)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>{selectedProduct.category}</span>
                <Link to={`/product/${selectedProduct.id}`} onClick={closeModal}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#111111', marginBottom: '1rem' }}>{selectedProduct.name}</h2>
                </Link>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {selectedProduct.hasSale ? (
                     <>
                        <span style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '1.3rem' }}>{selectedProduct.salePriceStr}</span>
                        <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '0.95rem' }}>{selectedProduct.originalPriceStr}</span>
                     </>
                  ) : (
                     <span style={{ color: '#111111', fontWeight: 800, fontSize: '1.3rem' }}>{selectedProduct.price}</span>
                  )}
                </div>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.75rem' }}>{selectedProduct.desc}</p>

                {/* Color Selector */}
                {selectedProduct.variants && selectedProduct.variants.some(v => v.color) && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111111', fontWeight: 700 }}>{lang === 'vi' ? 'Màu sắc:' : 'Color:'}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {Array.from(new Set(selectedProduct.variants.map(v => v.color).filter(c => c))).map(c => {
                        const bgClr = getCssColor(c);
                        const isWhite = c.toLowerCase().includes('trắng') || bgClr === '#ffffff';
                        return (
                          <button 
                            key={c} 
                            onClick={() => setSelectedColorModal(c)}
                            style={{ 
                              width: '28px', 
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: bgClr || '#cccccc',
                              border: selectedColorModal === c ? '2px solid var(--primary-color)' : (isWhite ? '1px solid #ddd' : 'none'),
                              boxShadow: selectedColorModal === c ? '0 0 0 1px #ffffff' : 'none',
                              cursor: 'pointer',
                              position: 'relative'
                            }}
                            title={c}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Size Selector */}
                {selectedProduct.variants && selectedProduct.variants.some(v => v.size) && (
                  <div style={{ marginBottom: '1.75rem' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111111', fontWeight: 700 }}>Size:</span>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {selectedColorModal ? (
                         selectedProduct.variants.filter(v => v.color === selectedColorModal).map(v => (
                           <button 
                             key={v.size} 
                             onClick={() => setSelectedSizeModal(v.size)}
                             className={`size-option ${selectedSizeModal === v.size ? 'active' : ''}`}
                             style={{ 
                               width: '38px', 
                               height: '38px', 
                               fontSize: '0.8rem'
                             }}
                           >{v.size}</button>
                         ))
                      ) : (
                         Array.from(new Set(selectedProduct.variants.map(v => v.size))).map(s => (
                           <button 
                             key={s} 
                             onClick={() => setSelectedSizeModal(s)}
                             className={`size-option ${selectedSizeModal === s ? 'active' : ''}`}
                             style={{ 
                               width: '38px', 
                               height: '38px', 
                               fontSize: '0.8rem'
                             }}
                           >{s}</button>
                         ))
                      )}
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline" style={{ width: '48px', height: '48px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="ri-heart-line" style={{ fontSize: '1.2rem' }}></i>
                  </button>
                  <button onClick={handleAddToCartModal} className="btn btn-primary" style={{ flex: 1, padding: '0.85rem', fontSize: '0.8rem' }}>
                    {lang === 'vi' ? 'Thêm Vào Giỏ Hàng' : 'Add to Cart'}
                  </button>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #eee' }}>
                  <ProductReview productId={selectedProduct.id} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 5. Sleek Flat Value Banners */}
      <section className="section trust-section" style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="trust-item" style={{ padding: '2.5rem 1.5rem', border: '1px solid var(--border-light)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <i className="ri-truck-line" style={{ fontSize: '1.8rem', color: 'var(--primary-color)' }}></i>
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>{lang === 'vi' ? 'Giao Hàng Siêu Tốc' : 'Fast Shipping'}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'vi' ? 'Miễn phí vận chuyển cho các đơn hàng trị giá từ 500.000đ.' : 'Free shipping for orders over 500,000đ.'}</p>
          </div>
          
          <div className="trust-item" style={{ padding: '2.5rem 1.5rem', border: '1px solid var(--border-light)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <i className="ri-loop-left-line" style={{ fontSize: '1.8rem', color: 'var(--primary-color)' }}></i>
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>{lang === 'vi' ? 'Đổi Trả 30 Ngày' : '30-Day Returns'}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'vi' ? 'Thu hồi và đổi trả sản phẩm hoàn toàn miễn phí tại nhà trong 30 ngày.' : 'Free 30-day home pickup exchange.'}</p>
          </div>
          
          <div className="trust-item" style={{ padding: '2.5rem 1.5rem', border: '1px solid var(--border-light)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <i className="ri-shield-star-line" style={{ fontSize: '1.8rem', color: 'var(--primary-color)' }}></i>
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>{lang === 'vi' ? 'Cotton Organic Sạch' : 'Clean Organic Cotton'}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'vi' ? 'Nguyên liệu sạch tự nhiên organic, chứng nhận an toàn tuyệt đối với làn da.' : 'Pure natural organic materials, certified skin-safe.'}</p>
          </div>
        </div>
      </section>

      {/* 6. Mid-Season Promo Section */}
      <section className="section" style={{
        backgroundColor: '#111111',
        color: '#ffffff',
        padding: '6.5rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <span style={{ 
            display: 'inline-block', 
            border: '1px solid var(--primary-color)', 
            color: 'var(--primary-color)', 
            padding: '6px 16px', 
            fontWeight: 800, 
            letterSpacing: '0.1em', 
            marginBottom: '1.5rem', 
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            borderRadius: '2px'
          }}>🔥 MID-SEASON SALE OFFER</span>
          
          <h2 style={{ 
            fontSize: '2.8rem', 
            fontWeight: 900, 
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#ffffff',
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-display)'
          }}>{lang === 'vi' ? 'BẢN GIAO HƯỞNG DENIM' : 'DENIM SYMPHONY'}</h2>
          
          <p style={{ 
            fontSize: '0.95rem', 
            color: '#cccccc',
            maxWidth: '600px', 
            margin: '0 auto 2.5rem',
            lineHeight: '1.7',
            fontWeight: 500
          }}>{lang === 'vi' ? 'Cơ hội sở hữu những thiết kế Smart Jeans và ProCOOL Jeans huyền thoại với ưu đãi độc quyền giảm đến 50% toàn bộ danh mục.' : 'Opportunity to own legendary Smart Jeans and ProCOOL Jeans with exclusive discounts up to 50% off sitewide.'}</p>
          
          <Link to="/products?category=sale" className="btn btn-primary animate-scale-in" style={{ padding: '1rem 3rem', backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>{lang === 'vi' ? 'Mua Ngay Hôm Nay' : 'Shop Now Today'}</Link>
        </div>
      </section>
    </>
  );
}
