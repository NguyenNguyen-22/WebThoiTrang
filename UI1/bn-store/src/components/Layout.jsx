import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useLanguage } from '../LanguageContext';
import Chatbox from './Chatbox';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, changeLanguage, t } = useLanguage();
  const [user, setUser] = useState(null);
  const { cartCount, cartTotal } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const isHomepage = location.pathname === '/';

  useEffect(() => {
    setShowMegaMenu(false);
    setIsMobileMenuOpen(false);
  }, [location]);
  
  const [formStyle, setFormStyle] = useState(() => {
    return localStorage.getItem('form-style-preference') || 'classic';
  });
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const themePanelRef = React.useRef(null);

  useEffect(() => {
    // Sync the CSS class to document.body
    document.body.classList.remove('form-style-classic', 'form-style-material', 'form-style-minimal');
    document.body.classList.add(`form-style-${formStyle}`);
    localStorage.setItem('form-style-preference', formStyle);
  }, [formStyle]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (themePanelRef.current && !themePanelRef.current.contains(event.target)) {
        setIsThemePanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notices = [
    "⚡ FREESHIP ĐƠN TỪ 500K - GIAO HÀNG SIÊU TỐC TOÀN QUỐC ⚡",
    "🔄 ĐỔI TRẢ 30 NGÀY TẬN NHÀ - HOÀN TIỀN DỄ DÀNG 🔄",
    "🔥 SPECIAL SUMMER SALE: GIẢM ĐẾN 50% TẤT CẢ DANH MỤC 🔥"
  ];
  
  const [currentNotice, setCurrentNotice] = useState(0);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Lỗi khi parse dữ liệu user", e);
      }
    }

    const timer = setInterval(() => {
      setCurrentNotice((prev) => (prev + 1) % notices.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = React.useRef(null);

  useEffect(() => {
    fetch('/identity/api/products')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(err => console.error("Error loading products for search:", err));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = products.filter(p => 
      p.name && p.name.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 5);
    setSuggestions(filtered);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (productId) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/product/${productId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert("Cảm ơn bạn đã đăng ký nhận ưu đãi độc quyền từ Bờ Nờ Store!");
    e.target.reset();
  };

  return (
    <div className={`app ${isHomepage ? 'is-homepage' : ''}`} style={{ backgroundColor: 'var(--bg-light)', minHeight: '100vh', position: 'relative' }}>
      
      {/* 1. Top bar */}
      <div className="promo-bar" style={{
        height: '34px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid var(--border-light)',
        color: 'var(--text-dark)',
        fontSize: '0.75rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2.5rem'
      }}>
        <div>
          🚚 {t('free_ship')}
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); alert(lang === 'vi' ? "Hệ thống tích điểm thành viên Bờ Nờ VIP!" : "Bờ Nờ Store Member Points System!"); }} style={{ color: 'var(--text-muted)' }}>{t('member_benefit')}</a>
          <span style={{ color: 'var(--border-medium)' }}>|</span>
          <span style={{ color: 'var(--text-muted)' }}>{t('support')}: <strong style={{ color: 'var(--primary-color)' }}>1900 1234</strong></span>
          <span style={{ color: 'var(--border-medium)' }}>|</span>
          <span style={{ color: 'var(--text-muted)' }}>✉ contact@bonostore.vn</span>
          <span style={{ color: 'var(--border-medium)' }}>|</span>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button 
              onClick={() => changeLanguage('vi')} 
              style={{
                background: 'none',
                border: 'none',
                color: lang === 'vi' ? 'var(--primary-color)' : 'var(--text-muted)',
                fontWeight: lang === 'vi' ? 700 : 500,
                cursor: 'pointer',
                padding: '2px 4px',
                fontSize: '0.7rem'
              }}
            >
              VI
            </button>
            <span style={{ color: 'var(--border-medium)', fontSize: '0.65rem' }}>/</span>
            <button 
              onClick={() => changeLanguage('en')} 
              style={{
                background: 'none',
                border: 'none',
                color: lang === 'en' ? 'var(--primary-color)' : 'var(--text-muted)',
                fontWeight: lang === 'en' ? 700 : 500,
                cursor: 'pointer',
                padding: '2px 4px',
                fontSize: '0.7rem'
              }}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Header (Sticky) */}
      <header className="header" style={{ position: 'fixed', top: '34px', left: 0, width: '100%', zIndex: 1000, background: '#ffffff', borderBottom: '1px solid var(--border-light)' }}>
        
        {/* Header Main: Logo, Search, Cart & Account */}
        <div className="header-main" style={{ height: '70px', background: '#ffffff' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 1.5rem' }}>
            {/* Hamburger Menu on Mobile */}
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
              style={{ display: 'none', alignItems: 'center', justifyContent: 'center' }}
            >
              <i className="ri-menu-line" style={{ color: '#111111', fontSize: '1.5rem' }}></i>
            </button>
            
            {/* ShopNow Logo */}
            <Link to="/" className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{
                width: '38px',
                height: '38px',
                backgroundColor: 'var(--primary-color)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(99, 93, 199, 0.2)'
              }}>
                <i className="ri-shopping-bag-3-fill" style={{ color: '#ffffff', fontSize: '1.35rem' }}></i>
              </div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.6rem',
                fontWeight: 900,
                color: '#111111',
                letterSpacing: '-0.03em',
                display: 'flex',
                alignItems: 'center',
                textTransform: 'none'
              }}>
                Bờ<span style={{ color: 'var(--primary-color)' }}>Nờ</span>
              </span>
            </Link>
            
            {/* Premium Pill Search Bar */}
            <form 
              ref={searchContainerRef}
              onSubmit={(e) => {
                e.preventDefault();
                setShowSuggestions(false);
                navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
              }} style={{
                display: 'flex',
                alignItems: 'center',
                width: '35%',
                height: '38px',
                backgroundColor: (isSearchFocused || (showSuggestions && searchQuery.trim() !== '')) ? '#ffffff' : '#f1f5f9',
                borderRadius: '30px',
                padding: '0 1rem',
                position: 'relative',
                border: (isSearchFocused || (showSuggestions && searchQuery.trim() !== '')) ? '1px solid var(--primary-color)' : '1px solid transparent',
                boxShadow: (isSearchFocused || (showSuggestions && searchQuery.trim() !== '')) ? '0 0 0 3px rgba(99, 93, 199, 0.1)' : 'none',
                transition: 'all 0.2s',
                margin: '0 1.5rem',
                zIndex: 1100
              }}
            >
              <input 
                name="search"
                type="text" 
                autoComplete="off"
                className="header-nav-search-input"
                placeholder={t('search_placeholder')} 
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  setIsSearchFocused(true);
                  if (searchQuery.trim() !== '') setShowSuggestions(true);
                }}
                onBlur={() => setIsSearchFocused(false)}
                style={{
                  flex: 1,
                  height: '100%',
                  border: 'none',
                  backgroundColor: 'transparent',
                  outline: 'none',
                  fontSize: '0.8rem',
                  color: 'var(--text-dark)'
                }}
              />
              <button type="submit" style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ri-search-line" style={{ fontSize: '1.2rem' }}></i>
              </button>

              {/* Suggestions Dropdown */}
              {showSuggestions && searchQuery.trim() !== '' && (
                <div className="search-suggestions-dropdown" style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  border: '1px solid var(--border-light)',
                  zIndex: 1200,
                  overflow: 'hidden',
                  padding: '0.5rem 0'
                }}>
                  <div style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid var(--border-light)' }}>
                    {lang === 'vi' ? 'Sản phẩm gợi ý' : 'Suggested Products'}
                  </div>
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {suggestions.length > 0 ? (
                      suggestions.map((p) => {
                        const finalPrice = p.salePrice > 0 ? p.salePrice : p.price;
                        const imgUrl = (p.images && p.images.length > 0) ? (p.images.find(img => img.isMain)?.imageUrl || p.images[0].imageUrl) : '';
                        return (
                          <div 
                            key={p.id}
                            onClick={() => handleSelectSuggestion(p.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '0.75rem 1rem',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                              borderBottom: '1px solid #f1f5f9'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <img src={imgUrl} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #f1f5f9' }} />
                            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: p.salePrice > 0 ? '#ff4d4f' : 'var(--text-dark)' }}>
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
                                </span>
                                {p.salePrice > 0 && (
                                  <span style={{ fontSize: '0.7rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        {lang === 'vi' ? 'Không tìm thấy sản phẩm nào' : 'No products found'}
                      </div>
                    )}
                  </div>
                  {suggestions.length > 0 && (
                    <div 
                      onClick={() => {
                        setShowSuggestions(false);
                        navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.75rem',
                        color: 'var(--primary-color)',
                        fontWeight: 600,
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#f8fafc',
                        borderTop: '1px solid #f1f5f9'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    >
                      {lang === 'vi' ? `Xem tất cả kết quả cho "${searchQuery}"` : `View all results for "${searchQuery}"`}
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Cart & Profile Area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              
              {/* Wishlist */}
              <Link to="/products?category=sale" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dark)' }}>
                <i className="ri-heart-line" style={{ fontSize: '1.4rem', color: 'var(--text-muted)' }}></i>
                <div className="cart-text" style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>{t('favorite_subtitle')}</span>
                  <strong style={{ fontSize: '0.75rem', color: '#000000', display: 'block' }}>{t('favorite')}</strong>
                </div>
              </Link>

              {/* Account */}
              {user ? (
                <div className="user-dropdown-container">
                  <span className="icon-btn" style={{ cursor: 'pointer', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', height: 'auto', padding: '0.5rem 0' }}>
                    <i className="ri-user-line" style={{ fontSize: '1.4rem' }}></i>
                    <div className="cart-text" style={{ textAlign: 'left', lineHeight: 1.2 }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>{t('welcome')}</span>
                      <strong style={{ fontSize: '0.75rem', color: '#000000', display: 'block' }}>{user.name} <i className="ri-arrow-down-s-line" style={{ fontSize: '0.6rem' }}></i></strong>
                    </div>
                  </span>
                  <div className="user-dropdown-menu">
                    <div style={{
                      padding: '0.5rem 1rem',
                      borderBottom: '1px solid var(--border-light)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}>
                      {t('welcome')}, <strong>{user.name}</strong>
                    </div>
                    <Link to="/profile" className="dropdown-item">{lang === 'vi' ? 'Tài khoản của tôi' : 'My Account'}</Link>
                    <Link to="/orders" className="dropdown-item">{lang === 'vi' ? 'Đơn hàng của tôi' : 'My Orders'}</Link>
                    {user.role === 'ADMIN' && (
                      <Link to="/admin" className="dropdown-item" style={{ color: 'var(--primary-color)' }}>{lang === 'vi' ? 'Quản trị hệ thống' : 'System Administration'}</Link>
                    )}
                    <button onClick={handleLogout} className="dropdown-item" style={{
                      width: '100%',
                      borderTop: 'none',
                      color: '#c94a4a',
                      fontWeight: 700
                    }}>{t('logout')}</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dark)' }}>
                  <i className="ri-user-line" style={{ fontSize: '1.4rem', color: 'var(--text-muted)' }}></i>
                  <div className="cart-text" style={{ textAlign: 'left', lineHeight: 1.2 }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>{t('login_register')}</span>
                    <strong style={{ fontSize: '0.75rem', color: '#000000', display: 'block' }}>{t('account')} <i className="ri-arrow-down-s-line" style={{ fontSize: '0.6rem' }}></i></strong>
                  </div>
                </Link>
              )}

              {/* Cart Button */}
              <Link to="/cart" className="header-cart-btn" style={{
                textDecoration: 'none',
                backgroundColor: 'var(--primary-color)',
                color: '#ffffff',
                padding: '0.5rem 1.25rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(99, 93, 199, 0.15)',
                transition: 'background-color 0.2s'
              }}>
                <i className="ri-shopping-cart-2-line" style={{ fontSize: '1.2rem' }}></i>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>{t('cart')}</span>
                  <strong style={{ fontSize: '0.75rem', color: '#ffffff', display: 'block', whiteSpace: 'nowrap' }}>
                    {cartCount} {t('cart_items')} - {new Intl.NumberFormat('vi-VN').format(cartTotal || 0)}đ
                  </strong>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Sub-Navigation Bar */}
        <div className="header-nav-bar" style={{ backgroundColor: '#ffffff', height: '42px', borderBottom: '1px solid var(--border-light)' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', padding: '0 1.5rem', position: 'relative' }}>
            <nav className="header-nav-menu" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              
              {/* Horizontal Links */}
              <div style={{ display: 'flex', gap: '1.75rem', height: '100%', alignItems: 'center', marginLeft: 'calc(260px + 1.5rem)' }}>
                {[
                  { label: t('nav_home'), link: "/" },
                  { label: t('nav_products'), link: "/products" },
                  { label: "🔥 " + t('nav_flash_sale'), link: "/flash-sale", isSale: true },
                  { label: t('nav_shirts'), link: "/products?category=áo" },
                  { label: t('nav_pants'), link: "/products?category=quần" },
                  { label: t('nav_accessories'), link: "/products?category=phụ%20kiện" }
                ].map((item, idx) => {
                  const isTabActive = (() => {
                    if (item.link === '/') {
                      return location.pathname === '/';
                    }
                    if (item.link === '/flash-sale') {
                      return location.pathname === '/flash-sale';
                    }
                    if (item.link === '/products') {
                      return location.pathname === '/products' && !location.search;
                    }
                    const query = item.link.split('?')[1];
                    if (query) {
                      return location.pathname === '/products' && decodeURIComponent(location.search).includes(query);
                    }
                    return false;
                  })();

                  return (
                    <Link
                      key={idx}
                      to={item.link}
                      className={`header-nav-link ${isTabActive ? 'active' : ''} ${item.isSale ? 'sale' : ''}`}
                      style={{
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: isTabActive || item.isSale ? 800 : 700,
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        height: '100%'
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
            
            <div className="header-hotline-badge" style={{ display: 'flex', alignItems: 'center', color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.8rem', gap: '6px', border: '1px solid var(--primary-color)', padding: '0.35rem 1rem', borderRadius: '20px', backgroundColor: '#f5f3ff' }}>
              <i className="ri-phone-line" style={{ fontSize: '0.95rem' }}></i>
              <span>{t('hotline')}: 1900 1234</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation Drawer */}
      <div className={`mobile-drawer ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-drawer-header">
          <Link to="/" className="logo-container" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--primary-color)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                border: '2px solid #ffffff',
                borderBottom: 'none',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                position: 'absolute',
                top: '3px',
                left: '8px'
              }} />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '6px' }}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              textTransform: 'none'
            }}>
              Shop<span style={{ color: 'var(--primary-color)' }}>Now</span>
            </span>
          </Link>
          <button className="mobile-drawer-close" onClick={() => setIsMobileMenuOpen(false)} aria-label="Đóng menu">
            <i className="ri-close-line"></i>
          </button>
        </div>
        
        <nav className="mobile-drawer-nav">
          <div className="mobile-drawer-section">
            <h5 className="mobile-drawer-title">Bộ Sưu Tập</h5>
            <Link to="/products" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>Tất cả sản phẩm</Link>
            <Link to="/products?category=áo" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>Áo Nam</Link>
            <Link to="/products?category=quần" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>Quần Nam</Link>
            <Link to="/products?category=phụ%20kiện" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>Phụ Kiện</Link>
            <Link to="/products?category=sale" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--primary-color)', fontWeight: 700 }}>Summer Sale -50%</Link>
          </div>

          <div className="mobile-drawer-section" style={{ marginTop: '1.5rem', borderTop: '1px solid #222222', paddingTop: '1.5rem' }}>
            <h5 className="mobile-drawer-title">Tài Khoản</h5>
            {user ? (
              <>
                <div className="mobile-drawer-user-info" style={{ marginBottom: '1rem', fontSize: '0.8rem', color: '#666', paddingLeft: '0.25rem' }}>
                  Xin chào, <strong style={{ color: '#fff' }}>{user.name}</strong>
                </div>
                <Link to="/profile" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>Tài khoản của tôi</Link>
                <Link to="/orders" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>Đơn hàng của tôi</Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--primary-color)' }}>Quản trị hệ thống</Link>
                )}
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="mobile-drawer-link" style={{ color: '#c94a4a', textAlign: 'left', width: '100%', marginTop: '0.5rem', fontWeight: 700 }}>Đăng xuất</button>
              </>
            ) : (
              <Link to="/login" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}><i className="ri-user-line" style={{ marginRight: '0.5rem' }}></i> Đăng nhập / Đăng ký</Link>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay active" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Content wrapper */}
      <main>
        <Outlet />
      </main>

      {/* Flat Black Footer */}
      <footer className="footer" style={{
        backgroundColor: 'var(--bg-footer)',
        color: '#ffffff',
        padding: '3rem 0 1.5rem',
        marginTop: '3rem'
      }}>
        <div className="container">
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem' }}>
            <div>
              <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '1rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  backgroundColor: 'var(--primary-color)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-shopping-bag-3-fill" style={{ color: '#ffffff', fontSize: '1.35rem' }}></i>
                </div>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  textTransform: 'none'
                }}>
                  Bờ<span style={{ color: 'var(--primary-color)' }}>Nờ</span>
                </span>
              </div>
              
              <div style={{ fontSize: '0.8rem', color: '#ffffff', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                <p style={{ marginBottom: '0.75rem' }}><strong>{lang === 'vi' ? 'HỆ THỐNG CỬA HÀNG:' : 'STORE LOCATOR:'}</strong></p>
                <p style={{ marginBottom: '0.5rem' }}>📍 12 Cách Mạng Tháng 8, P. Bến Thành, Q.1, TP.HCM</p>
                <p style={{ marginBottom: '0.5rem' }}>📍 477 Sư Vạn Hạnh, Phường 12, Quận 10, TP.HCM</p>
                <p style={{ marginBottom: '0.5rem' }}>📍 1357 Phạm Văn Thuận, Biên Hòa, Đồng Nai</p>
                <p style={{ marginTop: '0.75rem' }}>📞 {lang === 'vi' ? 'Hotline tư vấn' : 'Consulting Hotline'}: 028.7306.6060 (8:30 - 22:00)</p>
              </div>

              <div className="footer-social" style={{ display: 'flex', gap: '0.75rem' }}>
                <a href="#" className="icon-btn" aria-label="Facebook" style={{ color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)', width: '36px', height: '36px', fontSize: '1rem' }}><i className="ri-facebook-fill"></i></a>
                <a href="#" className="icon-btn" aria-label="Instagram" style={{ color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)', width: '36px', height: '36px', fontSize: '1rem' }}><i className="ri-instagram-line"></i></a>
                <a href="#" className="icon-btn" aria-label="TikTok" style={{ color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)', width: '36px', height: '36px', fontSize: '1rem' }}><i className="ri-tiktok-fill"></i></a>
              </div>
            </div>
            
            <div>
              <h4 className="footer-title" style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1.2rem',
                color: '#ffffff'
              }}>{t('footer_help_title')}</h4>
              <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem', fontWeight: 500 }}>
                <a href="#">{lang === 'vi' ? 'Chính sách giao nhận & thanh toán' : 'Shipping & Payment Policy'}</a>
                <a href="#">{t('footer_help_policy')}</a>
                <a href="#">{t('footer_help_size')}</a>
                <a href="#">{lang === 'vi' ? 'Chính sách bảo mật thông tin' : 'Privacy Policy'}</a>
              </div>
            </div>
            
            <div>
              <h4 className="footer-title" style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1.2rem',
                color: '#ffffff'
              }}>{lang === 'vi' ? 'Về Bờ Nờ Store' : 'About Bờ Nờ Store'}</h4>
              <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem', fontWeight: 500 }}>
                <a href="#">{t('footer_link_about')}</a>
                <a href="#">{lang === 'vi' ? 'Hành trình sản xuất Denim bền vững' : 'Sustainable Denim Production Journey'}</a>
                <a href="#">{t('footer_link_careers')}</a>
                <a href="#">{lang === 'vi' ? 'Liên hệ gửi phản hồi' : 'Contact & Feedback'}</a>
              </div>
            </div>
            
            <div>
              <h4 className="footer-title" style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1.2rem',
                color: '#ffffff'
              }}>{t('footer_newsletter_title')}</h4>
              <p style={{ color: '#ffffff', fontSize: '0.8rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                {t('footer_newsletter_desc')}
              </p>
              <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="email" 
                  placeholder={t('footer_newsletter_placeholder')} 
                  required 
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    outline: 'none',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem', borderRadius: 'var(--radius-sm)' }} aria-label="Gửi">
                  <i className="ri-arrow-right-line" style={{ color: '#ffffff' }}></i>
                </button>
              </form>
              
              {/* Payment Methods */}
              <div style={{ marginTop: '1.5rem' }}>
                <p style={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{lang === 'vi' ? 'Phương thức thanh toán' : 'Payment Methods'}</p>
                <div style={{ display: 'flex', gap: '0.6rem', fontSize: '1.5rem', color: '#ffffff' }}>
                  <i className="ri-visa-line" title="Visa"></i>
                  <i className="ri-mastercard-line" title="Mastercard"></i>
                  <i className="ri-paypal-line" title="Paypal"></i>
                  <i className="ri-bank-card-line" title="ATM/Nội Địa"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <Chatbox />


      {/* FLOATING FORM STYLE SWITCHER (NEUMORPHIC OVERLAY - HELD HIDDEN BY CSS) */}
      <div 
        ref={themePanelRef}
        className="form-style-switcher"
      >
        <button onClick={() => setIsThemePanelOpen(!isThemePanelOpen)}>Theme</button>
      </div>
    </div>
  );
}
