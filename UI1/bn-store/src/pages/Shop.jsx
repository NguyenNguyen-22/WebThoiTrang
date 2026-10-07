import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import ProductReview from '../components/ProductReview';
import SizeAdvisor from '../components/SizeAdvisor';
import { useCart } from '../CartContext';
import { useLanguage } from '../LanguageContext';

// === HELPER FUNCTIONS FOR GLOBAL EXPORT ===
export const getCssColor = (colorName) => {
  if (!colorName) return null;
  const c = colorName.toLowerCase().trim();
  if (c.includes('đen') || c === 'black') return '#000000';
  if (c.includes('trắng') || c === 'white') return '#ffffff';
  if (c.includes('đỏ') || c === 'red') return '#ff4d4f';
  if (c.includes('xanh navi') || c.includes('navy')) return '#000080';
  if (c.includes('xanh dương') || c.includes('xanh lam') || c === 'blue') return '#1890ff';
  if (c.includes('xanh lá') || c === 'green') return '#52c41a';
  if (c.includes('vàng') || c === 'yellow') return '#fadb14';
  if (c.includes('hồng') || c === 'pink') return '#ff85c0';
  if (c.includes('tím') || c === 'purple') return '#722ed1';
  if (c.includes('cam') || c === 'orange') return '#fa8c16';
  if (c.includes('xám') || c === 'grey' || c === 'gray') return '#8c8c8c';
  if (c.includes('nâu') || c === 'brown') return '#5c2104';
  if (c.includes('bạc') || c === 'silver') return '#bfbfbf';
  if (c.includes('be') || c === 'beige') return '#f5f5dc';
  
  if (c.startsWith('#') || c.match(/^[a-zA-Z]+$/)) return c;
  return null;
};

export const getAvailableColors = (product) => {
  if (!product) return [];
  if (product.images && product.images.some(img => img.color)) {
    return Array.from(new Set(product.images.map(img => img.color).filter(c => c)));
  }
  if (product.variants && product.variants.some(v => v.color)) {
    return Array.from(new Set(product.variants.map(v => v.color).filter(c => c)));
  }
  return [];
};

export const getCategoryName = (id, name = '') => {
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

// === CHECKOUT BREADCRUMB COMPONENT ===
function CheckoutSteps({ currentStep }) {
  const { lang } = useLanguage();
  const steps = [
    { num: "01", label: lang === 'vi' ? "Giỏ hàng" : "Shopping Cart", active: currentStep === 1 },
    { num: "02", label: lang === 'vi' ? "Thanh toán" : "Checkout", active: currentStep === 2 },
    { num: "03", label: lang === 'vi' ? "Hoàn tất" : "Confirmation", active: currentStep === 3 }
  ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0px',
      margin: '0 auto 3rem auto',
      maxWidth: '650px',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden'
    }}>
      {steps.map((s, idx) => (
        <div key={idx} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1rem',
          backgroundColor: s.active ? 'var(--accent-secondary)' : '#ffffff',
          color: s.active ? '#ffffff' : 'var(--text-muted)',
          transition: 'var(--transition-fast)',
          flex: 1,
          justifyContent: 'center',
          borderRight: idx < steps.length - 1 ? '1px solid var(--border-light)' : 'none'
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.85rem',
            fontWeight: 800,
            color: s.active ? 'var(--primary-color)' : 'var(--text-muted)'
          }}>{s.num}</span>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.75rem',
            fontWeight: s.active ? 700 : 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// === FILTER PANEL CONTENT COMPONENT ===
function FilterPanelContent({
  searchQuery,
  setSearchQuery,
  selectedGender,
  setSelectedGender,
  selectedType,
  setSelectedType,
  maxPrice,
  setMaxPrice
}) {
  const { t, lang } = useLanguage();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Tìm kiếm */}
      <div>
        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', fontWeight: 700 }}>{lang === 'vi' ? 'Tìm Kiếm Từ Khoá' : 'Search Keyword'}</h4>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            autoComplete="off"
            placeholder={lang === 'vi' ? "Gõ tên sản phẩm..." : "Search product name..."} 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              border: '1px solid var(--border-medium)', 
              padding: '0.75rem 2.5rem 0.75rem 1rem', 
              borderRadius: 'var(--radius-sm)', 
              outline: 'none', 
              backgroundColor: '#ffffff',
              fontSize: '0.85rem',
              color: 'var(--text-dark)'
            }}
          />
          <i className="ri-search-line" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1rem' }}></i>
        </div>
      </div>

      {/* 2. Giới Tính */}
      <div>
        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', fontWeight: 700 }}>{lang === 'vi' ? 'Giới Tính' : 'Gender'}</h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { value: '', label: lang === 'vi' ? 'Tất cả' : 'All' },
            { value: 'nam', label: lang === 'vi' ? 'Nam' : 'Men' },
            { value: 'nu', label: lang === 'vi' ? 'Nữ' : 'Women' }
          ].map(opt => {
            const isChecked = selectedGender === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedGender(opt.value)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  border: isChecked ? '1px solid var(--primary-color)' : '1px solid var(--border-medium)',
                  backgroundColor: isChecked ? 'var(--primary-color)' : '#ffffff',
                  color: isChecked ? '#ffffff' : 'var(--text-dark)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'var(--transition-fast)'
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Phân Loại */}
      <div>
        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', fontWeight: 700 }}>{lang === 'vi' ? 'Phân Loại Sản Phẩm' : 'Product Categories'}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
          {[
            { value: '', label: lang === 'vi' ? 'Tất cả phân loại' : 'All categories' },
            { value: 'áo', label: lang === 'vi' ? 'Áo' : 'Tops' },
            { value: 'quần', label: lang === 'vi' ? 'Quần' : 'Bottoms' },
            { value: 'giày', label: lang === 'vi' ? 'Giày' : 'Shoes' },
            { value: 'phụ kiện', label: lang === 'vi' ? 'Phụ kiện' : 'Accessories' }
          ].map(opt => {
            const isChecked = selectedType === opt.value;
            return (
              <label 
                key={opt.value}
                onClick={() => setSelectedType(opt.value)}
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isChecked ? 'var(--secondary-color)' : '#ffffff',
                  border: isChecked ? '1px solid #111111' : '1px solid var(--border-light)',
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #111111',
                  backgroundColor: '#ffffff'
                }}>
                  {isChecked && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }}></div>}
                </div>
                <span style={{ fontWeight: isChecked ? 700 : 500, color: isChecked ? 'var(--primary-color)' : 'var(--text-dark)' }}>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Ngưỡng Giá */}
      <div>
        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', fontWeight: 700 }}>
          {lang === 'vi' ? 'Ngưỡng Giá: ' : 'Max Price: '}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(maxPrice)}
        </h4>
        <div style={{ padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff' }}>
          <input 
            type="range" 
            min="100000" 
            max="2000000" 
            step="50000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={{ 
              width: '100%', 
              accentColor: 'var(--primary-color)', 
              cursor: 'pointer',
              backgroundColor: 'transparent',
              outline: 'none'
            }} 
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          <span>100.000đ</span>
          <span>2.000.000đ</span>
        </div>
      </div>

      {/* Reset bộ lọc */}
      {(searchQuery || selectedGender !== 'nam' || selectedType || maxPrice < 2000000) && (
        <button 
          onClick={() => {
            setSearchQuery('');
            setSelectedGender('nam');
            setSelectedType('');
            setMaxPrice(2000000);
          }}
          className="btn btn-outline"
          style={{
            alignSelf: 'stretch',
            marginTop: '1rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0.75rem'
          }}
        >
          Reset bộ lọc
        </button>
      )}
    </div>
  );
}

// === 1. PRODUCT LIST (CATALOG) ===
function ProductList() {
  const { t, lang } = useLanguage();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const initCat = searchParams.get('category') || '';
  const initQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initQuery);
  const [selectedGender, setSelectedGender] = useState((initCat.toLowerCase() === 'nam' || initCat.toLowerCase() === 'nu') ? initCat.toLowerCase() : 'nam');
  
  const getMappedInitCat = (cat) => {
    const c = cat.toLowerCase();
    if (c === 'all' || c === '') return '';
    if (c === 'ao') return 'áo';
    if (c === 'quan') return 'quần';
    if (c === 'giay' || c === 'giày') return 'giày';
    if (c === 'nam' || c === 'nu') return '';
    return cat;
  };
  const [selectedType, setSelectedType] = useState(getMappedInitCat(initCat));
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [sortBy, setSortBy] = useState('Mới nhất');

  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
    
    const c = cat.toLowerCase();
    if (c === 'all' || c === '') {
      setSelectedGender('nam');
      setSelectedType('');
    } else if (c === 'nam' || c === 'nu') {
      setSelectedGender(c);
      setSelectedType('');
    } else {
      setSelectedGender('nam');
      let mapped = cat;
      if (c === 'ao') mapped = 'áo';
      if (c === 'quan') mapped = 'quần';
      if (c === 'giay' || c === 'giày') mapped = 'giày';
      setSelectedType(mapped);
    }
  }, [searchParams]);
  
  const [dbProducts, setDbProducts] = useState([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false); // Expandable sleek filters drawer for mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columns = isMobile ? 2 : 3;

  useEffect(() => {
    fetch('/identity/api/products')
      .then(res => {
        if (!res.ok) throw new Error("API Error: " + res.status);
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          const formattedData = data.map(p => {
            const finalPrice = p.salePrice > 0 ? p.salePrice : p.price;
            return {
              id: p.id,
              name: p.name,
              rawPrice: finalPrice,
              hasSale: p.salePrice > 0,
              salePriceStr: new Intl.NumberFormat('vi-VN').format(p.salePrice || 0) + ' VND',
              originalPriceStr: new Intl.NumberFormat('vi-VN').format(p.price || 0) + ' VND',
              price: new Intl.NumberFormat('vi-VN').format(finalPrice) + ' VND',
              image: (p.images && p.images.length > 0) ? (p.images.find(img => img.isMain)?.imageUrl || p.images[0].imageUrl) : '',
              images: p.images || [],
              variants: p.variants || [],
              discountPercent: p.salePrice > 0 ? Math.round(((p.price - p.salePrice) / p.price) * 100) : 0,
              category: getCategoryName(p.categoryId, p.name),
              desc: p.description,
              stock: p.stock !== undefined ? p.stock : 0
            };
          });
          setDbProducts(formattedData);
        }
      })
      .catch(err => console.error("Lỗi khi load sản phẩm từ DB:", err));
  }, []);

  // Filtering
  let filteredProducts = dbProducts.filter(p => {
    const cat = (p.category || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    const matchSearch = searchQuery === '' || name.includes(searchQuery.toLowerCase());
    const matchType = selectedType === '' || selectedType.toLowerCase() === 'sale' || cat.includes(selectedType.toLowerCase());
    
    let matchGender = true;
    if (selectedGender === 'nam') {
      const isNu = /\bnữ\b/.test(name) || cat.includes('váy') || name.includes('váy') || name.includes('đầm');
      matchGender = !isNu;
    } else if (selectedGender === 'nu') {
      const isNam = /\bnam\b/.test(name);
      const isVay = cat.includes('váy') || name.includes('váy') || name.includes('đầm');
      matchGender = isVay || !isNam;
    }
    
    const matchPrice = p.rawPrice <= maxPrice;
    return matchSearch && matchType && matchGender && matchPrice;
  });

  // Sorting
  filteredProducts = filteredProducts.sort((a, b) => {
    if (sortBy === 'Giá tăng dần') return a.rawPrice - b.rawPrice;
    if (sortBy === 'Giá giảm dần') return b.rawPrice - a.rawPrice;
    if (sortBy === 'Bán chạy') return -1;
    return 0;
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 8 : 9; // 8 items on mobile, 9 items on desktop for perfect rows
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGender, selectedType, maxPrice, sortBy]);

  const handleQuickAddToCart = async (product) => {
    const hasVariants = product.variants && product.variants.length > 0;
    const allOutOfStock = hasVariants
      ? !product.variants.some(v => v.stock > 0)
      : (product.stock <= 0);
      
    if (allOutOfStock) {
      alert(`Sản phẩm "${product.name}" hiện tại đã hết hàng!`);
      return;
    }

    let size = 'M';
    let color = '';
    if (hasVariants) {
      const inStockVariant = product.variants.find(v => v.stock > 0);
      if (inStockVariant) {
        size = inStockVariant.size || 'M';
        color = inStockVariant.color || '';
      } else {
        size = product.variants[0].size || 'M';
        color = product.variants[0].color || '';
      }
    }
    
    const res = await addToCart(product, 1, size, color);
    if (res && res.success) {
      alert(`Đã thêm "${product.name}" vào giỏ hàng thành công!`);
    }
  };

  return (
    <div className="container" style={{ padding: '1.5rem 0' }}>
      
      {/* Inject scoped animations */}
      <style>{`
        @keyframes slideRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .neumorphic-select-wrapper {
          position: relative;
          background-color: var(--bg-light);
          border-radius: 4px;
        }
        .neumorphic-select {
          appearance: none;
          -webkit-appearance: none;
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          padding: 0.6rem 2.5rem 0.6rem 1.25rem;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-dark);
          cursor: pointer;
        }
      `}</style>

      {/* Breadcrumbs and Top Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #eaeaea',
        paddingBottom: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>
          <Link to="/" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>{lang === 'vi' ? 'Trang chủ' : 'Home'}</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span style={{ color: '#333', fontWeight: '500' }}>{lang === 'vi' ? 'Cửa hàng' : 'Shop'}</span>
          {selectedType && (
            <>
              <span style={{ margin: '0 0.5rem' }}>/</span>
              <span style={{ color: '#333', textTransform: 'capitalize' }}>{selectedType}</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="neumorphic-select-wrapper" style={{ border: '1px solid #eaeaea', borderRadius: '4px' }}>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="neumorphic-select"
              style={{ padding: '0.5rem 2rem 0.5rem 1rem', fontSize: '0.8rem', fontWeight: '500' }}
            >
              <option value="Mới nhất">{lang === 'vi' ? 'Mới nhất' : 'Newest'}</option>
              <option value="Bán chạy">{lang === 'vi' ? 'Bán chạy' : 'Best Sellers'}</option>
              <option value="Giá tăng dần">{lang === 'vi' ? 'Giá: Thấp đến Cao' : 'Price: Low to High'}</option>
              <option value="Giá giảm dần">{lang === 'vi' ? 'Giá: Cao đến Thấp' : 'Price: High to Low'}</option>
            </select>
            <i className="ri-arrow-down-s-line" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }}></i>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{
        display: 'flex',
        gap: '2.5rem',
        alignItems: 'flex-start'
      }}>
        {/* DESKTOP SIDEBAR: BEST SELLERS, PROMO BANNER, COMMITMENTS */}
        {!isMobile && (
          <div className="shop-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Sản Phẩm Bán Chạy */}
            <div>
              <h3 className="shop-sidebar-title">{lang === 'vi' ? 'SẢN PHẨM BÁN CHẠY' : 'BEST SELLERS'}</h3>
              <div className="sidebar-product-list">
                {dbProducts.slice(0, 5).map(prod => (
                  <Link to={`/product/${prod.id}`} key={prod.id} className="sidebar-product-item">
                    <img src={prod.image} alt={prod.name} className="sidebar-product-img" />
                    <div className="sidebar-product-info">
                      <h4 className="sidebar-product-name">{prod.name}</h4>
                      <div className="sidebar-product-price">
                        {prod.hasSale ? (
                          <>
                            <span className="sidebar-product-price-new" style={{ color: 'var(--primary-color)' }}>{prod.salePriceStr}</span>
                            <span className="sidebar-product-price-old">{prod.originalPriceStr}</span>
                          </>
                        ) : (
                          <span style={{ color: '#333333' }}>{prod.price}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. Sản Phẩm Mới Nhất */}
            {dbProducts.length > 12 && (
              <div>
                <h3 className="shop-sidebar-title">{lang === 'vi' ? 'SẢN PHẨM MỚI NHẤT' : 'NEW ARRIVALS'}</h3>
                <div className="sidebar-product-list">
                  {dbProducts.slice(12, 17).map(prod => (
                    <Link to={`/product/${prod.id}`} key={prod.id} className="sidebar-product-item">
                      <img src={prod.image} alt={prod.name} className="sidebar-product-img" />
                      <div className="sidebar-product-info">
                        <h4 className="sidebar-product-name">{prod.name}</h4>
                        <div className="sidebar-product-price">
                          {prod.hasSale ? (
                            <>
                              <span className="sidebar-product-price-new" style={{ color: 'var(--primary-color)' }}>{prod.salePriceStr}</span>
                              <span className="sidebar-product-price-old">{prod.originalPriceStr}</span>
                            </>
                          ) : (
                            <span style={{ color: '#333333' }}>{prod.price}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Thẻ Voucher Khuyến Mãi */}
            <div style={{
              background: 'linear-gradient(135deg, #111111 0%, var(--primary-color) 100%)',
              color: '#ffffff',
              padding: '1.75rem',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 25px rgba(99, 93, 199, 0.15)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-10px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                pointerEvents: 'none'
              }} />

              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '0.15em',
                color: '#ffffff',
                textTransform: 'uppercase',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '3px 8px',
                borderRadius: '2px',
                display: 'inline-block',
                marginBottom: '1rem'
              }}>MEMBER VOUCHER</span>
              
              <h4 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 900,
                lineHeight: 1.25,
                color: '#ffffff',
                marginBottom: '0.75rem',
                textTransform: 'uppercase'
              }}>
                {lang === 'vi' ? 'Ưu Đãi Đăng Ký' : 'Registration Offer'}
              </h4>
              
              <p style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.5,
                marginBottom: '1.5rem'
              }}>
                {lang === 'vi' ? 'Freeship đơn đầu tiên & tặng ngay voucher giảm 10% khi đăng ký thành viên mới hôm nay!' : 'Freeship first order & get 10% voucher when signing up today!'}
              </p>

              <Link 
                to="/register" 
                className="btn btn-outline" 
                style={{
                  borderColor: '#ffffff',
                  color: '#ffffff',
                  backgroundColor: 'transparent',
                  width: '100%',
                  fontSize: '0.75rem',
                  padding: '0.75rem',
                  fontWeight: 800
                }}
              >
                {lang === 'vi' ? 'Đăng ký ngay' : 'Register now'}
              </Link>
            </div>

            {/* 5. Cam Kết Dịch Vụ */}
            <div style={{
              backgroundColor: 'var(--secondary-color)',
              border: '1px dashed var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              <h4 style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-dark)',
                borderBottom: '1px solid var(--border-light)',
                paddingBottom: '0.5rem',
                marginBottom: '0.25rem'
              }}>{lang === 'vi' ? 'CAM KẾT DỊCH VỤ' : 'OUR COMMITMENT'}</h4>

              {[
                { icon: "ri-truck-line", title: lang === 'vi' ? "Giao hàng siêu tốc 2H" : "Fast 2H Delivery", desc: lang === 'vi' ? "Nội thành Hà Nội & TP.HCM" : "Hanoi & HCMC inner areas" },
                { icon: "ri-arrow-go-back-line", title: lang === 'vi' ? "Đổi trả tận nơi 7 ngày" : "7-Day Home Exchange", desc: lang === 'vi' ? "Đổi size đơn giản tại nhà" : "Easy size swap at your door" },
                { icon: "ri-shield-check-line", title: lang === 'vi' ? "Cam kết chính hãng" : "100% Genuine Guarantee", desc: lang === 'vi' ? "Hoàn tiền 100% nếu phát hiện giả" : "100% refund if fake detected" },
                { icon: "ri-scissors-line", title: lang === 'vi' ? "Sửa đồ miễn phí" : "Free Alterations", desc: lang === 'vi' ? "Hỗ trợ cắt gấu, sửa form trọn đời" : "Lifetime hem & fit support" }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--primary-color)',
                    fontSize: '1rem'
                  }}>
                    <i className={item.icon}></i>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>{item.title}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* RIGHT COLUMN: PRODUCT GRID + PAGINATION */}
        <div style={{ flexGrow: 1, width: isMobile ? '100%' : '75%' }}>
          
          {/* PRODUCT GRID */}
          <div className="product-grid" style={{ 
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`, 
            gap: '2rem' 
          }}>
            {currentItems.length > 0 ? currentItems.map(product => (
              <div 
                key={product.id} 
                className="product-card"
              >
                <div className="product-image-container">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} className="product-image" />
                  </Link>
                  {product.hasSale && (
                    <span className="product-discount-badge">-{product.discountPercent}%</span>
                  )}
                  <div className="product-action">
                    <Link to={`/product/${product.id}`} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 800, textDecoration: 'none', textAlign: 'center' }}>
                      {lang === 'vi' ? 'Xem Chi Tiết' : 'View Details'}
                    </Link>
                  </div>
                </div>
                
                <div className="product-info" style={{ padding: '0.75rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: '0.25rem' }}>{product.category}</span>
                  
                  {/* Swatches dots */}
                  <div className="product-color-swatches-row">
                    {Array.from(new Set((product.variants || []).map(v => v.color).filter(Boolean))).map((col, idx) => {
                      const bgCol = getCssColor(col);
                      return bgCol ? (
                        <span 
                          key={idx} 
                          className="product-color-swatch-dot" 
                          style={{ backgroundColor: bgCol }}
                          title={col}
                        />
                      ) : null;
                    })}
                  </div>

                  <Link to={`/product/${product.id}`}>
                    <h4 className="product-name" style={{ fontSize: '0.85rem', fontWeight: 600, minHeight: '2.4rem', margin: '0.25rem 0' }}>{product.name}</h4>
                  </Link>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <div className="product-price" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {product.hasSale ? (
                        <>
                          <span style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.95rem' }}>{product.salePriceStr}</span>
                          <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '0.8rem', fontWeight: 500 }}>{product.originalPriceStr}</span>
                        </>
                      ) : (
                        <span style={{ color: '#111111', fontWeight: 800, fontSize: '0.95rem' }}>{product.price}</span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleQuickAddToCart(product)}
                      className="btn btn-primary"
                      title={lang === 'vi' ? 'Thêm vào giỏ hàng' : 'Add to cart'}
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: '0',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        flexShrink: 0,
                        backgroundColor: '#111111',
                        color: '#ffffff',
                        border: 'none',
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#111111';
                      }}
                    >
                      <i className="ri-shopping-cart-2-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div 
                style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  padding: '5rem 2rem', 
                  backgroundColor: '#ffffff', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <i className="ri-search-eye-line" style={{ fontSize: '3.5rem', color: 'var(--text-muted)' }}></i>
                <p style={{ marginTop: '1.5rem', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)' }}>{lang === 'vi' ? 'Rất tiếc, không tìm thấy sản phẩm nào!' : 'Sorry, no products found!'}</p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '2rem' }}>{lang === 'vi' ? 'Hãy thử điều chỉnh bộ lọc hoặc xóa bớt tiêu chí tìm kiếm.' : 'Please try adjusting filters or removing search criteria.'}</p>
                <button 
                  className="btn btn-outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGender('nam');
                    setSelectedType('');
                    setMaxPrice(2000000);
                  }}
                >
                  {lang === 'vi' ? 'Đặt Lại Toàn Bộ Lọc' : 'Reset All Filters'}
                </button>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '4rem'
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
    </div>
  );
}

// === 2. PRODUCT DETAIL (STIKY-SPLIT LAYOUT WITH AI ADVISOR) ===
function ProductDetail() {
  const { t, lang } = useLanguage();
  const { id } = useParams();
  const [dbProducts, setDbProducts] = useState([]);

  useEffect(() => {
    fetch('/identity/api/products')
      .then(res => {
        if (!res.ok) throw new Error("API Error: " + res.status);
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          const formattedData = data.map(p => {
            const finalPrice = p.salePrice > 0 ? p.salePrice : p.price;
            return {
              id: p.id,
              name: p.name,
              rawPrice: finalPrice,
              hasSale: p.salePrice > 0,
              salePriceStr: new Intl.NumberFormat('vi-VN').format(p.salePrice || 0) + ' VND',
              originalPriceStr: new Intl.NumberFormat('vi-VN').format(p.price || 0) + ' VND',
              price: new Intl.NumberFormat('vi-VN').format(finalPrice) + ' VND',
              image: (p.images && p.images.length > 0) ? (p.images.find(img => img.isMain)?.imageUrl || p.images[0].imageUrl) : '',
              images: p.images || [],
              variants: p.variants || [],
              category: getCategoryName(p.categoryId, p.name),
              desc: p.description,
              stock: p.stock !== undefined ? p.stock : 0
            };
          });
          setDbProducts(formattedData);
        }
      })
      .catch(err => console.error("Lỗi khi load sản phẩm từ DB:", err));
  }, []);

  const product = dbProducts.find(p => p.id === parseInt(id)) || dbProducts[0];
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [braSize, setBraSize] = useState('');
  const [lengthPref, setLengthPref] = useState('just right');
  const [fitPref, setFitPref] = useState('fit');
  const [isFemale, setIsFemale] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [aiError, setAiError] = useState('');

  const [aiProductRecs, setAiProductRecs] = useState([]);
  const [loadingProductRecs, setLoadingProductRecs] = useState(false);

  useEffect(() => {
    if (product && dbProducts.length > 1) {
      setLoadingProductRecs(true);
      
      const payload = {
        current_product: {
          id: product.id,
          name: product.name,
          category: product.category || 'Thời trang',
          price: product.rawPrice || 0,
          desc: product.desc || ''
        },
        all_products: dbProducts.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category || 'Thời trang',
          price: p.rawPrice || 0,
          desc: p.desc || '',
          image: p.image || ''
        }))
      };

      fetch('/ai-fit/recommend-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then(data => {
        if (data && data.recommended_products) {
          setAiProductRecs(data.recommended_products);
        }
        setLoadingProductRecs(false);
      })
      .catch(err => {
        console.error("Lỗi khi gọi AI gợi ý sản phẩm:", err);
        // Fallback: slice 4 items if backend fails
        setAiProductRecs(dbProducts.filter(p => p.id !== product.id).slice(0, 4).map(p => ({
          ...p,
          similarity_score: 0.85
        })));
        setLoadingProductRecs(false);
      });
    }
  }, [product, dbProducts]);

  // Floating Chat Advisor States
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const chatMessagesEndRef = React.useRef(null);

  const openChat = () => {
    setChatOpen(true);
    setChatMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        type: 'text',
        text: lang === 'vi' 
          ? `Xin chào! Mình là Trợ lý Ảo SmartFit AI. Mình sẽ phân tích số đo cơ thể bạn bằng Neural Net để tìm ra size trang phục hoàn hảo nhất cho **${product.name}**.`
          : `Hello! I am your SmartFit AI Virtual Assistant. I will analyze your body measurements using Neural Net to find the perfect size for **${product.name}**.`
      },
      {
        id: 'form',
        sender: 'assistant',
        type: 'form',
        text: lang === 'vi' 
          ? 'Vui lòng điền nhanh thông tin chiều cao, cân nặng và dáng người của bạn dưới đây:'
          : 'Please quickly fill in your height, weight and body type information below:'
      }
    ]);
  };

  const handleChatSubmit = async (hVal, wVal, isFemVal, braVal, fitVal, lenVal) => {
    const h = parseFloat(hVal);
    const w = parseFloat(wVal);
    if (!h || !w) return;

    const fitLabels = {
      'fit': lang === 'vi' ? 'Vừa vặn (Fit)' : 'Regular Fit',
      'large': lang === 'vi' ? 'Rộng rãi (Loose)' : 'Loose Fit',
      'small': lang === 'vi' ? 'Ôm sát (Slim)' : 'Slim Fit'
    };
    const lenLabels = {
      'just right': lang === 'vi' ? 'Vừa tiêu chuẩn' : 'Standard Length',
      'slightly long': lang === 'vi' ? 'Hơi rộng dài' : 'Slightly Long',
      'slightly short': lang === 'vi' ? 'Hơi ngắn trẻ trung' : 'Slightly Short'
    };
    
    const userMsg = {
      id: 'user_metrics',
      sender: 'user',
      type: 'text',
      text: lang === 'vi'
        ? `Số đo: Cao ${h}cm, Nặng ${w}kg, dáng ${fitLabels[fitVal] || fitVal}, độ dài ${lenLabels[lenVal] || lenVal}.${isFemVal ? ` (Bra size: ${braVal || 'AI tự tính'})` : ''}`
        : `Measurements: Height ${h}cm, Weight ${w}kg, fit ${fitLabels[fitVal] || fitVal}, length ${lenLabels[lenVal] || lenVal}.${isFemVal ? ` (Bra size: ${braVal || 'AI calculated'})` : ''}`
    };

    setChatMessages(prev => [
      ...prev.filter(m => m.id !== 'form'),
      userMsg,
      {
        id: 'loading_recommendation',
        sender: 'assistant',
        type: 'loading',
        text: lang === 'vi' ? 'Đang chạy mô hình AI học máy để dự đoán kích thước lý tưởng...' : 'Running machine learning AI model to predict ideal size...'
      }
    ]);

    setChatLoading(true);

    const allSizes = (product.variants && product.variants.length > 0)
      ? Array.from(new Set(product.variants.map(v => v.size))).filter(s => s)
      : ['S', 'M', 'L', 'XL'];

    const instockSizes = (product.variants && product.variants.length > 0)
      ? Array.from(new Set(product.variants.filter(v => v.stock > 0).map(v => v.size))).filter(s => s)
      : ['S', 'M', 'L', 'XL'];

    const allOutOfStock = (product.variants && product.variants.length > 0) && instockSizes.length === 0;

    try {
      const response = await fetch('/ai-fit/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          available_sizes: allSizes,
          instock_sizes: instockSizes,
          height: h,
          weight: w,
          bra_size: isFemVal && braVal ? parseFloat(braVal) : null,
          length: lenVal,
          fit: fitVal
        })
      });

      if (!response.ok) {
        throw new Error('Dịch vụ AI tư vấn size không phản hồi.');
      }

      const data = await response.json();
      if (allOutOfStock) {
        data.is_all_out_of_stock = true;
      }
      setAiRecommendation(data);
      
      setChatMessages(prev => [
        ...prev.filter(m => m.id !== 'loading_recommendation'),
        {
          id: 'recommendation_result',
          sender: 'assistant',
          type: 'recommendation',
          data: data
        }
      ]);
    } catch (err) {
      console.warn("AI service fallback activated for chat:", err);
      
      let asiaSize = 'M';
      if (h < 160 && w < 50) asiaSize = 'S';
      else if (h <= 168 && w <= 60) asiaSize = 'M';
      else if (h <= 175 && w <= 70) asiaSize = 'L';
      else if (h <= 180 && w <= 80) asiaSize = 'XL';
      else asiaSize = 'XXL';

      let recommendedSize = asiaSize;
      let isAlternative = false;

      if (instockSizes.length > 0 && !instockSizes.includes(asiaSize)) {
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
        const numSizeOrder = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
        const activeOrder = sizeOrder.includes(asiaSize) ? sizeOrder : numSizeOrder;
        
        let bestAlt = instockSizes[0];
        let minDiff = 100;
        const targetIdx = activeOrder.indexOf(asiaSize);
        if (targetIdx !== -1) {
          for (const s of instockSizes) {
            const idx = activeOrder.indexOf(s);
            if (idx !== -1) {
              const diff = Math.abs(idx - targetIdx);
              if (diff < minDiff) {
                minDiff = diff;
                bestAlt = s;
              }
            }
          }
        }
        recommendedSize = bestAlt;
        isAlternative = true;
      }

      const simulatedScore = 80 + Math.floor(Math.random() * 16);
      
      const simulatedData = {
        recommended_size: recommendedSize,
        recommended_fit_quality: isAlternative ? 'Good' : 'Excellent',
        recommended_satisfaction_score: isAlternative ? simulatedScore - 10 : simulatedScore,
        estimated_bra_size: isFemVal && braVal ? parseFloat(braVal) : 34.0,
        ideal_size: asiaSize,
        ideal_fit_quality: 'Excellent',
        ideal_satisfaction_score: simulatedScore,
        is_alternative: isAlternative,
        is_all_out_of_stock: allOutOfStock,
        all_evaluated_sizes: allSizes.map(s => {
          let score = 50;
          let quality = 'Average';
          if (s === asiaSize) {
            score = simulatedScore;
            quality = 'Excellent';
          } else if (s === 'M' || s === 'L') {
            score = 75;
            quality = 'Good';
          } else if (s === 'S') {
            score = 55;
            quality = 'Average';
          } else {
            score = 40;
            quality = 'Poor';
          }
          return {
            size: s,
            fit_quality: quality,
            satisfaction_score: score
          };
        })
      };

      setAiRecommendation(simulatedData);

      setTimeout(() => {
        setChatMessages(prev => [
          ...prev.filter(m => m.id !== 'loading_recommendation'),
          {
            id: 'recommendation_result',
            sender: 'assistant',
            type: 'recommendation',
            data: simulatedData
          }
        ]);
      }, 1000);

    } finally {
      setChatLoading(false);
    }
  };

  const handleApplySize = (size, score) => {
    setSelectedSize(size);
    setChatMessages(prev => [
      ...prev,
      {
        id: `apply_${size}`,
        sender: 'user',
        type: 'text',
        text: lang === 'vi' ? `Chọn Size ${size}` : `Select Size ${size}`
      },
      {
        id: `apply_success_${size}`,
        sender: 'assistant',
        type: 'text',
        text: lang === 'vi'
          ? `✅ Tuyệt vời! Hệ thống đã áp dụng **Size ${size}** cho sản phẩm này của bạn. Mức độ hài lòng ước tính là **${score}%**. Bạn có thể tiến hành thêm sản phẩm vào giỏ hàng ngay bây giờ!`
          : `✅ Great! The system has applied **Size ${size}** for this product. Estimated satisfaction score is **${score}%**. You can proceed to add the item to your cart now!`
      }
    ]);
  };

  useEffect(() => {
    if (chatOpen && chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [previousOrderHint, setPreviousOrderHint] = useState(null);
  const [showSizeAdvisor, setShowSizeAdvisor] = useState(false);
  
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (product) {
      if (product.images && product.images.length > 0) {
        setMainImage(product.images.find(img => img.isMain)?.imageUrl || product.images[0].imageUrl);
      } else {
        setMainImage(product.image);
      }
      
      if (product.variants && product.variants.length > 0) {
        if (!product.variants.some(v => v.size === selectedSize)) {
          setSelectedSize(product.variants[0].size || 'M');
        }
      }
      
      const availableColors = getAvailableColors(product);
      if (availableColors.length > 0 && !availableColors.includes(selectedColor)) {
        setSelectedColor(availableColors[0]);
      }

      // Auto-detect gender for Bra Size UI
      const nameLower = (product.name || '').toLowerCase();
      const catLower = (product.category || '').toLowerCase();
      const isFemaleItem = nameLower.includes('váy') || nameLower.includes('đầm') || nameLower.includes('nữ') || catLower.includes('nữ') || catLower.includes('váy') || catLower.includes('đầm');
      setIsFemale(isFemaleItem);
    }
  }, [product]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedSize, selectedColor]);

  // Load previous order history sizes
  useEffect(() => {
    if (!product) return;
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const u = JSON.parse(userData);
        if (u && u.id) {
          fetch(`/identity/api/orders/user/${u.id}`)
            .then(r => r.json())
            .then(data => {
              if (data && Array.isArray(data)) {
                for (const order of data) {
                  if (order.items) {
                    const foundItem = order.items.find(item => 
                      (item.product && item.product.id === product.id) || 
                      (item.productId === product.id) ||
                      (item.name === product.name)
                    );
                    if (foundItem) {
                      setPreviousOrderHint({
                        size: foundItem.size || foundItem.productSize,
                        color: foundItem.color,
                        date: new Date(order.createdAt || order.date).toLocaleDateString('vi-VN')
                      });
                      break;
                    }
                  }
                }
              }
            }).catch(e => console.log(e));
        }
      } catch (e) {}
    }
  }, [product]);

  useEffect(() => {
    if (selectedColor && product && product.images && product.images.length > 0) {
      const matchedImage = product.images.find(img => img.color === selectedColor);
      if (matchedImage) {
        setMainImage(matchedImage.imageUrl);
      }
    }
  }, [selectedColor, product]);

  const calculateSize = async (e) => {
    if (e) e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w) return;
    
    setLoadingRecommendation(true);
    setAiError('');

    const allSizes = (product.variants && product.variants.length > 0)
      ? Array.from(new Set(product.variants.map(v => v.size))).filter(s => s)
      : ['S', 'M', 'L', 'XL'];

    const instockSizes = (product.variants && product.variants.length > 0)
      ? Array.from(new Set(product.variants.filter(v => v.stock > 0).map(v => v.size))).filter(s => s)
      : ['S', 'M', 'L', 'XL'];

    const allOutOfStock = (product.variants && product.variants.length > 0) && instockSizes.length === 0;

    try {
      const response = await fetch('/ai-fit/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          available_sizes: allSizes,
          instock_sizes: instockSizes,
          height: h,
          weight: w,
          bra_size: isFemale && braSize ? parseFloat(braSize) : null,
          length: lengthPref,
          fit: fitPref
        })
      });

      if (!response.ok) {
        throw new Error('Dịch vụ AI tư vấn size không phản hồi.');
      }

      const data = await response.json();
      if (allOutOfStock) {
        data.is_all_out_of_stock = true;
      }
      setAiRecommendation(data);
      if (data.recommended_size) {
        setSelectedSize(data.recommended_size);
      }
    } catch (err) {
      console.warn("AI service fallback activated:", err);
      setAiError('Dịch vụ AI đang chạy nền. Đang sử dụng thuật toán tối ưu cục bộ...');
      
      let asiaSize = 'M';
      if (h < 160 && w < 50) asiaSize = 'S';
      else if (h <= 168 && w <= 60) asiaSize = 'M';
      else if (h <= 175 && w <= 70) asiaSize = 'L';
      else if (h <= 180 && w <= 80) asiaSize = 'XL';
      else asiaSize = 'XXL';

      let recommendedSize = asiaSize;
      let isAlternative = false;

      if (instockSizes.length > 0 && !instockSizes.includes(asiaSize)) {
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
        const numSizeOrder = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
        const activeOrder = sizeOrder.includes(asiaSize) ? sizeOrder : numSizeOrder;
        
        let bestAlt = instockSizes[0];
        let minDiff = 100;
        const targetIdx = activeOrder.indexOf(asiaSize);
        if (targetIdx !== -1) {
          for (const s of instockSizes) {
            const idx = activeOrder.indexOf(s);
            if (idx !== -1) {
              const diff = Math.abs(idx - targetIdx);
              if (diff < minDiff) {
                minDiff = diff;
                bestAlt = s;
              }
            }
          }
        }
        recommendedSize = bestAlt;
        isAlternative = true;
      }

      const simulatedScore = 80 + Math.floor(Math.random() * 16);
      
      const simulatedData = {
        recommended_size: recommendedSize,
        recommended_fit_quality: isAlternative ? 'Good' : 'Excellent',
        recommended_satisfaction_score: isAlternative ? simulatedScore - 10 : simulatedScore,
        estimated_bra_size: isFemale && braSize ? parseFloat(braSize) : 34.0,
        ideal_size: asiaSize,
        ideal_fit_quality: 'Excellent',
        ideal_satisfaction_score: simulatedScore,
        is_alternative: isAlternative,
        is_all_out_of_stock: allOutOfStock,
        all_evaluated_sizes: allSizes.map(s => {
          let score = 50;
          let quality = 'Average';
          if (s === asiaSize) {
            score = simulatedScore;
            quality = 'Excellent';
          } else if (s === 'M' || s === 'L') {
            score = 75;
            quality = 'Good';
          } else if (s === 'S') {
            score = 55;
            quality = 'Average';
          } else {
            score = 40;
            quality = 'Poor';
          }
          return {
            size: s,
            fit_quality: quality,
            satisfaction_score: score
          };
        })
      };
      
      setAiRecommendation(simulatedData);
      setSelectedSize(recommendedSize);
    } finally {
      setLoadingRecommendation(false);
    }
  };

  // Stock validation helpers
  const getSelectedVariant = () => {
    if (!product || !product.variants || product.variants.length === 0) return null;
    return product.variants.find(v => 
      v.size === selectedSize && 
      (selectedColor === '' || v.color === selectedColor)
    );
  };

  const selectedVariant = getSelectedVariant();
  const isOutOfStock = product
    ? (product.variants && product.variants.length > 0
        ? (!selectedVariant || selectedVariant.stock <= 0)
        : (product.stock <= 0))
    : false;
  const availableStock = product
    ? (product.variants && product.variants.length > 0
        ? (selectedVariant ? (selectedVariant.stock || 0) : 0)
        : (product.stock || 0))
    : 0;

  const handleAddToCart = async () => {
    if (!product) return;
    if (isOutOfStock) {
      alert(lang === 'vi' ? "Sản phẩm phiên bản này hiện đã hết hàng!" : "This variant of the product is currently out of stock!");
      return;
    }
    if (quantity > availableStock) {
      alert(lang === 'vi' 
        ? `Số lượng chọn (${quantity}) vượt quá tồn kho hiện có (${availableStock})!` 
        : `Selected quantity (${quantity}) exceeds currently available stock (${availableStock})!`
      );
      return;
    }
    const res = await addToCart(product, quantity, selectedSize, selectedColor);
    if (res && res.success) {
      navigate('/cart');
    }
  };

  if (!product) return <div style={{ padding: '6rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 500 }}>{lang === 'vi' ? 'Đang tải thông tin sản phẩm...' : 'Loading product information...'}</div>;

  const productImages = (product.images && product.images.length > 0) ? product.images : [{ id: 1, imageUrl: product.image }];

  const handlePrevImage = () => {
    if (productImages.length <= 1) return;
    const currentIndex = productImages.findIndex(img => img.imageUrl === mainImage);
    const prevIndex = (currentIndex - 1 + productImages.length) % productImages.length;
    setMainImage(productImages[prevIndex].imageUrl);
  };

  const handleNextImage = () => {
    if (productImages.length <= 1) return;
    const currentIndex = productImages.findIndex(img => img.imageUrl === mainImage);
    const nextIndex = (currentIndex + 1) % productImages.length;
    setMainImage(productImages[nextIndex].imageUrl);
  };

  return (
    <div className="container" style={{ padding: '1.5rem 0' }}>
      
      {/* STICKY-SPLIT LAYOUT CONTAINER */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: LARGE SINGLE IMAGE IN LIGHT GREY CONTAINER + VERTICAL THUMBNAILS */}
        <div style={{ position: 'sticky', top: '180px' }}>
          <div className="detail-gallery-container">
            
            {/* Vertical Thumbnails Column */}
            {productImages.length > 1 && (
              <div className="detail-thumbnails-col">
                <button 
                  onClick={handlePrevImage} 
                  className="detail-thumbnail-arrow"
                  aria-label="Previous image"
                >
                  <i className="ri-arrow-up-s-line"></i>
                </button>
                <div className="detail-thumbnails-list">
                  {productImages.map((img, index) => {
                    const isActive = img.imageUrl === mainImage;
                    return (
                      <img 
                        key={img.id || index}
                        src={img.imageUrl} 
                        alt="" 
                        onClick={() => setMainImage(img.imageUrl)}
                        className={`detail-thumbnail-item ${isActive ? 'active' : ''}`}
                      />
                    );
                  })}
                </div>
                <button 
                  onClick={handleNextImage} 
                  className="detail-thumbnail-arrow"
                  aria-label="Next image"
                >
                  <i className="ri-arrow-down-s-line"></i>
                </button>
              </div>
            )}

            {/* Main Image View */}
            <div className="detail-main-image-wrap">
              {productImages.length > 1 && (
                <button 
                  onClick={handlePrevImage} 
                  className="detail-image-nav-btn detail-image-nav-prev"
                  aria-label="Previous Image"
                >
                  <i className="ri-arrow-left-s-line"></i>
                </button>
              )}

              <img 
                src={mainImage} 
                alt={product.name} 
                className="detail-main-image"
              />

              {productImages.length > 1 && (
                <button 
                  onClick={handleNextImage} 
                  className="detail-image-nav-btn detail-image-nav-next"
                  aria-label="Next Image"
                >
                  <i className="ri-arrow-right-s-line"></i>
                </button>
              )}

              {/* Zoom Button */}
              <button 
                onClick={() => {
                  window.open(mainImage, '_blank');
                }} 
                className="detail-image-zoom-btn"
                title={lang === 'vi' ? "Phóng to hình ảnh" : "Zoom image"}
              >
                <i className="ri-zoom-in-line"></i>
              </button>
            </div>
            
          </div>
        </div>

        {/* RIGHT COLUMN: PRODUCT INFO & SELECTORS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Breadcrumb / Category */}
          <div>
            <span style={{ 
              fontSize: '0.7rem', 
              color: 'var(--primary-color)', 
              textTransform: 'uppercase', 
              fontWeight: 800, 
              letterSpacing: '0.1em' 
            }}>
              {product.category}
            </span>
            <h1 style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '1.8rem', 
              fontWeight: 800, 
              lineHeight: '1.2', 
              color: 'var(--text-dark)',
              marginTop: '0.25rem',
              marginBottom: '0.75rem',
              textTransform: 'uppercase'
            }}>
              {product.name}
            </h1>
            
            {/* Price section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.75rem 0' }}>
              {product.hasSale ? (
                <>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '1.5rem' }}>
                    {product.salePriceStr}
                  </span>
                  <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '1rem', fontWeight: 500 }}>
                    {product.originalPriceStr}
                  </span>
                </>
              ) : (
                <span style={{ color: 'var(--text-dark)', fontWeight: 800, fontSize: '1.5rem' }}>
                  {product.price}
                </span>
              )}
            </div>
          </div>

          {/* User History size hint */}
          {previousOrderHint && (
            <div style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid #ffccc7', backgroundColor: '#fff2e8', fontSize: '0.8rem', color: 'var(--text-dark)' }}>
              <i className="ri-history-line" style={{ color: 'var(--primary-color)', marginRight: '0.4rem', fontWeight: 'bold' }}></i>
              {lang === 'vi' ? (
                <>Bạn đã từng mua sản phẩm này cỡ <strong style={{ color: 'var(--primary-color)' }}>{previousOrderHint.size}</strong>{previousOrderHint.color && <span> màu <strong style={{ color: 'var(--primary-color)' }}>{previousOrderHint.color}</strong></span>} vào ngày {previousOrderHint.date}.</>
              ) : (
                <>You previously purchased this item in size <strong style={{ color: 'var(--primary-color)' }}>{previousOrderHint.size}</strong>{previousOrderHint.color && <span> color <strong style={{ color: 'var(--primary-color)' }}>{previousOrderHint.color}</strong></span>} on {previousOrderHint.date}.</>
              )}
            </div>
          )}

          {/* Description */}
          <div style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', backgroundColor: '#fcfcfc' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lang === 'vi' ? 'Mô tả sản phẩm' : 'Product description'}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {product.desc || (lang === 'vi' ? "Không có mô tả cho sản phẩm này." : "No description available for this product.")}
            </p>
          </div>

          {/* Color Selector */}
          {getAvailableColors(product).length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>{lang === 'vi' ? 'Màu sắc' : 'Color'}</h4>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {getAvailableColors(product).map(color => {
                  const isActive = color === selectedColor;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: 'var(--radius-sm)',
                        border: isActive ? '1px solid #111111' : '1px solid var(--border-light)',
                        backgroundColor: isActive ? 'var(--secondary-color)' : '#ffffff',
                        color: 'var(--text-dark)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lang === 'vi' ? 'Kích thước' : 'Size'}</h4>
              {/* Trigger AI Size Advisor Drawer */}
              <button 
                onClick={openChat}
                style={{ 
                  padding: '0.4rem 0.8rem', 
                  fontSize: '0.75rem', 
                  backgroundColor: '#ffffff', 
                  border: '1px solid var(--primary-color)',
                  color: 'var(--primary-color)',
                  fontWeight: 700,
                  borderRadius: '2px',
                  cursor: 'pointer'
                }}
              >
                <i className="ri-cpu-line" style={{ marginRight: '0.2rem' }}></i>
                {lang === 'vi' ? 'Tính Size Bằng AI' : 'Predict Size with AI'}
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {((product.variants && product.variants.length > 0)
                ? Array.from(new Set(product.variants.map(v => v.size))).filter(s => s)
                : ((product.category || '').toLowerCase().includes('giày') || (product.name || '').toLowerCase().includes('giày'))
                  ? ['38', '39', '40', '41', '42']
                  : ['S', 'M', 'L', 'XL']
              ).map(size => {
                const isActive = size === selectedSize;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`size-option ${isActive ? 'active' : ''}`}
                    style={{
                      width: '45px',
                      height: '45px',
                      fontSize: '0.8rem'
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI sizing form right on the page */}
          <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', backgroundColor: '#ffffff' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dark)' }}>
              <i className="ri-cpu-line" style={{ color: 'var(--primary-color)' }}></i>
              {lang === 'vi' ? 'Tính toán size phù hợp (AI)' : 'Calculate Fitting Size (AI)'}
            </h4>
            
            <form onSubmit={calculateSize} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>{lang === 'vi' ? 'Chiều cao (cm)' : 'Height (cm)'}</label>
                  <input
                    type="number"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    placeholder={lang === 'vi' ? "Ví dụ: 170" : "Example: 170"}
                    required
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-dark)',
                      outline: 'none',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>{lang === 'vi' ? 'Cân nặng (kg)' : 'Weight (kg)'}</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder={lang === 'vi' ? "Ví dụ: 60" : "Example: 60"}
                    required
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-dark)',
                      outline: 'none',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>
              </div>

              {isFemale && (
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>{lang === 'vi' ? 'Cỡ áo ngực (Bra size - tùy chọn)' : 'Bra size (optional)'}</label>
                  <select
                    value={braSize}
                    onChange={e => setBraSize(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-dark)',
                      outline: 'none',
                      fontSize: '0.8rem'
                    }}
                  >
                    <option value="">{lang === 'vi' ? 'Không bắt buộc (AI tự tính)' : 'Optional (AI calculated)'}</option>
                    <option value="32">{lang === 'vi' ? '32 (Cỡ XS/S)' : '32 (Size XS/S)'}</option>
                    <option value="34">{lang === 'vi' ? '34 (Cỡ M)' : '34 (Size M)'}</option>
                    <option value="36">{lang === 'vi' ? '36 (Cỡ L)' : '36 (Size L)'}</option>
                    <option value="38">{lang === 'vi' ? '38 (Cỡ XL)' : '38 (Size XL)'}</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>{lang === 'vi' ? 'Sở thích mặc' : 'Fit Preference'}</label>
                  <select
                    value={fitPref}
                    onChange={e => setFitPref(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-dark)',
                      outline: 'none',
                      fontSize: '0.8rem'
                    }}
                  >
                    <option value="fit">{lang === 'vi' ? 'Vừa vặn (Fit)' : 'Regular Fit'}</option>
                    <option value="large">{lang === 'vi' ? 'Rộng rãi (Loose)' : 'Loose Fit'}</option>
                    <option value="small">{lang === 'vi' ? 'Ôm sát (Slim)' : 'Slim Fit'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>{lang === 'vi' ? 'Độ dài' : 'Length Preference'}</label>
                  <select
                    value={lengthPref}
                    onChange={e => setLengthPref(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-dark)',
                      outline: 'none',
                      fontSize: '0.8rem'
                    }}
                  >
                    <option value="just right">{lang === 'vi' ? 'Độ dài vừa đủ' : 'Just right'}</option>
                    <option value="slightly long">{lang === 'vi' ? 'Hơi dài rộng' : 'Slightly long'}</option>
                    <option value="slightly short">{lang === 'vi' ? 'Hơi ngắn trẻ trung' : 'Slightly short'}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingRecommendation}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.25rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {loadingRecommendation ? <i className="ri-loader-4-line spin"></i> : <i className="ri-cpu-line"></i>}
                <span>{loadingRecommendation ? (lang === 'vi' ? "AI Đang Tính Toán..." : "AI Calculating...") : (lang === 'vi' ? "Đoán Size Bằng AI" : "Predict Size with AI")}</span>
              </button>
            </form>

            {aiError && (
              <p style={{ color: 'var(--primary-color)', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>
                {aiError}
              </p>
            )}

            {aiRecommendation && (
              <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #ffe8d6', backgroundColor: '#fff9f5' }}>
                {aiRecommendation.is_all_out_of_stock ? (
                  <div style={{ fontSize: '0.8rem', color: '#d9534f', fontWeight: 'bold', textAlign: 'center', padding: '0.5rem 0' }}>
                    <i className="ri-error-warning-line" style={{ marginRight: '0.25rem', verticalAlign: 'middle' }}></i>
                    {lang === 'vi' ? 'Rất tiếc, sản phẩm này đã hết hàng ở toàn bộ kích cỡ!' : 'Sorry, this product is out of stock in all sizes!'}
                  </div>
                ) : (
                  <>
                    {aiRecommendation.is_alternative && (
                      <div style={{ fontSize: '0.72rem', color: '#b25e00', backgroundColor: '#fff2e6', padding: '0.6rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', borderLeft: '3px solid #f28c28', lineHeight: 1.4 }}>
                        <i className="ri-error-warning-line" style={{ marginRight: '0.25rem', verticalAlign: 'middle' }}></i>
                        {lang === 'vi' ? (
                          <><strong>Lưu ý:</strong> Size <strong>{aiRecommendation.ideal_size}</strong> (phù hợp nhất với bạn - {aiRecommendation.ideal_satisfaction_score}%) hiện đã hết hàng. AI đã đề xuất <strong>Size {aiRecommendation.recommended_size}</strong> thay thế.</>
                        ) : (
                          <><strong>Note:</strong> Size <strong>{aiRecommendation.ideal_size}</strong> (best fit for you - {aiRecommendation.ideal_satisfaction_score}%) is out of stock. AI recommended alternative <strong>Size {aiRecommendation.recommended_size}</strong>.</>
                        )}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>{lang === 'vi' ? 'Size khuyên dùng bởi AI:' : 'AI Recommended Size:'}</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-color)' }}>{aiRecommendation.recommended_size}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{lang === 'vi' ? 'Phù hợp: ' : 'Fit: '}<strong>{aiRecommendation.recommended_fit_quality === 'Excellent' ? (lang === 'vi' ? 'Xuất Sắc' : 'Excellent') : (lang === 'vi' ? 'Tốt' : 'Good')}</strong></span>
                      <span>{lang === 'vi' ? 'Độ tin cậy: ' : 'Confidence: '}<strong>{aiRecommendation.recommended_satisfaction_score}%</strong></span>
                    </div>
                    
                    {/* Visual score meter */}
                    <div style={{ height: '4px', backgroundColor: '#e8e8e8', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                      <div style={{ width: `${aiRecommendation.recommended_satisfaction_score}%`, height: '100%', backgroundColor: 'var(--primary-color)' }}></div>
                    </div>

                    {/* Apply recommendation button */}
                    <button
                      onClick={() => setSelectedSize(aiRecommendation.recommended_size)}
                      className="btn btn-outline"
                      style={{
                        width: '100%',
                        padding: '0.4rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        marginTop: '0.75rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {lang === 'vi' ? `Áp dụng Size ${aiRecommendation.recommended_size}` : `Apply Size ${aiRecommendation.recommended_size}`}
                    </button>
                    <button
                      onClick={() => setShowSizeAdvisor(true)}
                      className="btn"
                      style={{
                        width: '100%',
                        padding: '0.4rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        marginTop: '0.5rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {lang === 'vi' ? 'Mở Trợ Lý Kích Thước' : 'Open Size Advisor'}
                    </button>
                  </>
                )}
              </div>
            )}

            {showSizeAdvisor && (
              <SizeAdvisor
                product={product}
                onClose={() => setShowSizeAdvisor(false)}
                onApplySize={(size) => { setSelectedSize(size); setShowSizeAdvisor(false); }}
              />
            )}
          </div>

          {/* Quantity & Add to Cart Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-dark)', letterSpacing: '0.05em' }}>{lang === 'vi' ? 'Số lượng:' : 'Quantity:'}</div>
              <div style={{ display: 'inline-flex', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '40px', width: '120px', backgroundColor: '#ffffff' }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1rem', cursor: 'pointer', color: 'var(--text-dark)' }}
                >
                  -
                </button>
                <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(q => Math.min(availableStock > 0 ? availableStock : 1, q + 1))}
                  style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1rem', cursor: 'pointer', color: 'var(--text-dark)' }}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '0.9rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isOutOfStock ? '#e0e0e0' : 'var(--primary-color)',
                  color: isOutOfStock ? '#888888' : '#ffffff',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  border: 'none',
                  transition: 'var(--transition-fast)'
                }}
              >
                {isOutOfStock ? (lang === 'vi' ? 'Hết hàng' : 'Out of stock') : (lang === 'vi' ? 'Thêm vào giỏ hàng' : 'Add to cart')}
              </button>
            </div>
          </div>

          {/* Trust points */}
          <div style={{ marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <i className="ri-truck-line" style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}></i>
              <span>{lang === 'vi' ? 'Miễn phí vận chuyển cho đơn hàng từ 500K' : 'Free shipping for orders over 500K'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <i className="ri-arrow-go-back-line" style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}></i>
              <span>{lang === 'vi' ? 'Đổi trả dễ dàng trong vòng 30 ngày tại nhà' : 'Easy 30-day home exchange & returns'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <i className="ri-shield-check-line" style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}></i>
              <span>{lang === 'vi' ? 'Sản phẩm chính hãng 100% bảo đảm chất lượng từ Bờ Nờ' : '100% genuine product guaranteed quality by Bờ Nờ Store'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Đánh giá & Bình luận sản phẩm */}
      <ProductReview productId={product.id} />

      {/* 2. AI RECOMMENDED PRODUCTS SECTION */}
      {aiProductRecs.length > 0 && (
        <div style={{ marginTop: '4.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '3.5rem' }}>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.5rem', 
            fontWeight: 800, 
            color: 'var(--text-dark)',
            marginBottom: '0.25rem',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {lang === 'vi' ? 'Có Thể Bạn Cũng Thích' : 'You May Also Like'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '2.5rem' }}>
            {lang === 'vi' ? 'Các sản phẩm được đề xuất riêng dựa trên mức độ tương đồng cao bởi SmartFit AI.' : 'Recommended products based on similarity score by SmartFit AI.'}
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: '2rem' 
          }}>
            {aiProductRecs.map(rec => {
              const fullProduct = dbProducts.find(p => p.id === rec.id) || rec;
              return (
                <div 
                  key={rec.id} 
                  className="product-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <Link to={`/product/${rec.id}`} onClick={() => window.scrollTo(0,0)}>
                    <div className="product-image-container" style={{ height: '260px' }}>
                      <img 
                        src={rec.image} 
                        alt={rec.name} 
                        className="product-image"
                      />
                      {rec.similarity_score && (
                        <span style={{ 
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          fontSize: '0.7rem', 
                          color: '#ffffff', 
                          fontWeight: 800, 
                          backgroundColor: 'var(--primary-color)', 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '2px',
                          zIndex: 2
                        }}>
                          {Math.round(rec.similarity_score * 100)}% Match
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="product-info">
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
                      {rec.category}
                    </span>
                    <Link to={`/product/${rec.id}`} onClick={() => window.scrollTo(0,0)}>
                      <h4 className="product-name" style={{ minHeight: '2.4rem' }}>{rec.name}</h4>
                    </Link>
                    <div className="product-price" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {fullProduct.hasSale ? (
                        <>
                          <span style={{ color: 'var(--primary-color)', fontWeight: 800 }}>{fullProduct.salePriceStr}</span>
                          <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '0.8rem', fontWeight: 500 }}>{fullProduct.originalPriceStr}</span>
                        </>
                      ) : (
                        <span style={{ color: '#111111', fontWeight: 800 }}>
                          {fullProduct.price || (new Intl.NumberFormat('vi-VN').format(rec.price) + ' VND')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FLOATING CHAT ADVISOR OVERLAY */}
      {chatOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 9999,
            transition: 'all 0.3s ease'
          }}
          onClick={() => setChatOpen(false)}
        >
          <div 
            className="shadow-extruded"
            style={{
              width: '450px',
              maxWidth: '100%',
              height: '100%',
              backgroundColor: 'var(--bg-light)',
              display: 'flex',
              flexDirection: 'column',
              padding: '2.5rem 2rem',
              boxShadow: '-9px 0 25px rgba(0,0,0,0.1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-medium)' }}>
                  <i className="ri-cpu-line" style={{ fontSize: '1.4rem', color: 'var(--primary-color)' }}></i>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>SmartFit AI Advisor</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 700 }}>Neural Net Powered</span>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="shadow-extruded"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'var(--bg-light)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="ri-close-line" style={{ fontSize: '1.2rem', color: 'var(--text-dark)' }}></i>
              </button>
            </div>

            {/* Chat Messages Log */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
              {chatMessages.map(msg => {
                const isBot = msg.sender === 'assistant';
                
                if (msg.type === 'form') {
                  return (
                    <div 
                      key={msg.id}
                      className="shadow-inset"
                      style={{
                        padding: '1.5rem',
                        borderRadius: '20px',
                        backgroundColor: 'var(--bg-light)',
                        border: 'none',
                        maxWidth: '90%',
                        alignSelf: 'flex-start'
                      }}
                    >
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)', marginBottom: '1rem', lineHeight: '1.5' }}>
                        {msg.text}
                      </p>
                      {/* Sizing inputs inside the chat bubbles */}
                      <ChatMetricsForm onSubmit={handleChatSubmit} isFemale={isFemale} chatLoading={chatLoading} />
                    </div>
                  );
                }

                if (msg.type === 'loading') {
                  return (
                    <div 
                      key={msg.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        alignSelf: 'flex-start',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                        fontStyle: 'italic'
                      }}
                    >
                      <i className="ri-loader-4-line spin" style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}></i>
                      <span>{msg.text}</span>
                    </div>
                  );
                }

                if (msg.type === 'recommendation') {
                  const rec = msg.data;
                  return (
                    <div 
                      key={msg.id}
                      className="shadow-extruded"
                      style={{
                        padding: '1.5rem',
                        borderRadius: '20px',
                        backgroundColor: 'var(--bg-light)',
                        maxWidth: '90%',
                        alignSelf: 'flex-start',
                        border: 'none'
                      }}
                    >
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <i className="ri-checkbox-circle-line" style={{ color: 'var(--accent-secondary)' }}></i>
                        {lang === 'vi' ? 'Kết quả đề xuất' : 'Recommendation Results'}
                      </h4>
                      {rec.is_all_out_of_stock ? (
                        <p style={{ fontSize: '0.85rem', color: '#d9534f', fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.5' }}>
                          {lang === 'vi' ? 'Rất tiếc, sản phẩm này hiện đã hết hàng ở tất cả các kích cỡ!' : 'Sorry, this product is currently out of stock in all sizes!'}
                        </p>
                      ) : (
                        <>
                          {rec.is_alternative ? (
                            <div style={{ fontSize: '0.72rem', color: '#b25e00', backgroundColor: '#fff2e6', padding: '0.6rem', borderRadius: '10px', marginBottom: '1rem', borderLeft: '3px solid #f28c28', lineHeight: 1.4 }}>
                              <i className="ri-error-warning-line" style={{ marginRight: '0.25rem', verticalAlign: 'middle' }}></i>
                              {lang === 'vi' ? (
                                <><strong>Lưu ý:</strong> Size <strong>{rec.ideal_size}</strong> (phù hợp nhất với bạn - {rec.ideal_satisfaction_score}%) hiện đã hết hàng. AI đã đề xuất <strong>Size {rec.recommended_size}</strong> thay thế.</>
                              ) : (
                                <><strong>Note:</strong> Size <strong>{rec.ideal_size}</strong> (best fit for you - {rec.ideal_satisfaction_score}%) is out of stock. AI recommended alternative <strong>Size {rec.recommended_size}</strong>.</>
                              )}
                            </div>
                          ) : (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.5' }}>
                              {lang === 'vi' ? 'Mô hình AI dự đoán kích thước phù hợp nhất cho bạn là:' : 'The AI model predicts your best fitting size is:'}
                            </p>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>{lang === 'vi' ? 'Size khuyên dùng:' : 'Recommended size:'}</span>
                            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-color)' }}>{rec.recommended_size}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            <span>{lang === 'vi' ? 'Độ khớp: ' : 'Fit: '}<strong>{rec.recommended_fit_quality === 'Excellent' ? (lang === 'vi' ? 'Hoàn hảo' : 'Perfect') : (lang === 'vi' ? 'Tốt' : 'Good')}</strong></span>
                            <span>{lang === 'vi' ? 'Độ hài lòng: ' : 'Satisfaction: '}<strong>{rec.recommended_satisfaction_score}%</strong></span>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                            <button
                              onClick={() => handleApplySize(rec.recommended_size, rec.recommended_satisfaction_score)}
                              className="btn btn-primary"
                              style={{
                                width: '100%',
                                padding: '0.6rem',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                color: '#ffffff',
                                borderRadius: '10px'
                              }}
                            >
                              {lang === 'vi' ? `Chọn Size ${rec.recommended_size}` : `Select Size ${rec.recommended_size}`}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                }

                // Default text messages
                return (
                  <div 
                    key={msg.id}
                    className={isBot ? "shadow-inset" : "shadow-extruded"}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: isBot ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                      backgroundColor: isBot ? 'var(--bg-light)' : 'var(--primary-color)',
                      color: isBot ? 'var(--text-dark)' : '#ffffff',
                      maxWidth: '85%',
                      alignSelf: isBot ? 'flex-start' : 'flex-end',
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                      border: 'none'
                    }}
                  >
                    {msg.text}
                  </div>
                );
              })}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Hint / Status */}
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(163,177,198,0.2)', paddingTop: '1rem' }}>
              {lang === 'vi' ? 'Số đo của bạn được xử lý an toàn bằng mô hình AI cực bộ.' : 'Your measurements are processed securely by a local AI model.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatMetricsForm({ onSubmit, isFemale, chatLoading }) {
  const { lang } = useLanguage();
  const [h, setH] = useState('');
  const [w, setW] = useState('');
  const [b, setB] = useState('');
  const [f, setF] = useState('fit');
  const [l, setL] = useState('just right');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!h || !w) return;
    onSubmit(h, w, isFemale, b, f, l);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="number" 
          placeholder={lang === 'vi' ? "Cao (cm)" : "Height (cm)"} 
          value={h}
          onChange={e => setH(e.target.value)}
          required
          style={{
            width: '50%',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-light)',
            boxShadow: 'none',
            fontSize: '0.8rem',
            color: 'var(--text-dark)',
            outline: 'none'
          }}
        />
        <input 
          type="number" 
          placeholder={lang === 'vi' ? "Nặng (kg)" : "Weight (kg)"} 
          value={w}
          onChange={e => setW(e.target.value)}
          required
          style={{
            width: '50%',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-light)',
            boxShadow: 'none',
            fontSize: '0.8rem',
            color: 'var(--text-dark)',
            outline: 'none'
          }}
        />
      </div>

      {isFemale && (
        <select 
          value={b} 
          onChange={e => setB(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-light)',
            boxShadow: 'none',
            fontSize: '0.8rem',
            color: 'var(--text-dark)',
            outline: 'none'
          }}
        >
          <option value="">{lang === 'vi' ? 'Cỡ áo ngực (Bra size - tùy chọn)' : 'Bra size (optional)'}</option>
          <option value="32">32</option>
          <option value="34">34</option>
          <option value="36">36</option>
          <option value="38">38</option>
        </select>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <select 
          value={f} 
          onChange={e => setF(e.target.value)}
          style={{
            width: '50%',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-light)',
            boxShadow: 'none',
            fontSize: '0.8rem',
            color: 'var(--text-dark)',
            outline: 'none'
          }}
        >
          <option value="fit">{lang === 'vi' ? 'Vừa vặn' : 'Regular Fit'}</option>
          <option value="large">{lang === 'vi' ? 'Rộng rãi' : 'Loose Fit'}</option>
          <option value="small">{lang === 'vi' ? 'Ôm sát' : 'Slim Fit'}</option>
        </select>
        
        <select 
          value={l} 
          onChange={e => setL(e.target.value)}
          style={{
            width: '50%',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-light)',
            boxShadow: 'none',
            fontSize: '0.8rem',
            color: 'var(--text-dark)',
            outline: 'none'
          }}
        >
          <option value="just right">{lang === 'vi' ? 'Vừa dài' : 'Standard'}</option>
          <option value="slightly long">{lang === 'vi' ? 'Hơi dài' : 'Slightly long'}</option>
          <option value="slightly short">{lang === 'vi' ? 'Hơi ngắn' : 'Slightly short'}</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={chatLoading}
        className="btn btn-primary"
        style={{
          width: '100%',
          padding: '0.55rem',
          fontSize: '0.8rem',
          fontWeight: 800,
          color: '#ffffff',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {chatLoading ? (lang === 'vi' ? "Đang phân tích..." : "Analyzing...") : (lang === 'vi' ? "Tư Vấn Kích Thước" : "Get Size Advice")}
      </button>
    </form>
  );
}


// === 3. CART (MODERN 2-COLUMN SHEET) ===
function Cart() {
  const { t, lang } = useLanguage();
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState(() => {
    try {
      const saved = localStorage.getItem('cartCoupon');
      return saved ? JSON.parse(saved).code : '';
    } catch (e) {
      return '';
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('cartCoupon');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [discountAmount, setDiscountAmount] = useState(() => {
    const saved = localStorage.getItem('cartDiscount');
    return saved ? parseFloat(saved) : 0;
  });
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const u = JSON.parse(userData);
        if (u) setUser(u);
      } catch (e) {}
    }
  }, []);

  // Update discount if cartTotal changes (e.g. quantity modified)
  useEffect(() => {
    if (appliedCoupon) {
      let newDiscount = 0;
      if (appliedCoupon.minimumOrderAmount && cartTotal < appliedCoupon.minimumOrderAmount) {
        handleRemoveCoupon();
        return;
      }
      
      if ("PERCENTAGE" === appliedCoupon.discountType) {
        newDiscount = cartTotal * (appliedCoupon.discountValue / 100.0);
        if (appliedCoupon.maxDiscountAmount && newDiscount > appliedCoupon.maxDiscountAmount) {
          newDiscount = appliedCoupon.maxDiscountAmount;
        }
      } else {
        newDiscount = appliedCoupon.discountValue;
      }
      newDiscount = Math.min(newDiscount, cartTotal);
      setDiscountAmount(newDiscount);
      localStorage.setItem('cartDiscount', newDiscount.toString());
    }
  }, [cartTotal, appliedCoupon]);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) {
      setPromoError(lang === 'vi' ? 'Vui lòng nhập mã giảm giá' : 'Please enter a coupon code');
      return;
    }
    setPromoError('');
    setIsApplyingPromo(true);
    try {
      const res = await fetch('/identity/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCodeInput.trim().toUpperCase(),
          orderAmount: cartTotal,
          userId: user?.id || 1
        })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
        setDiscountAmount(data.discountAmount);
        setPromoError('');
        localStorage.setItem('cartCoupon', JSON.stringify(data));
        localStorage.setItem('cartDiscount', data.discountAmount.toString());
      } else {
        setPromoError(data.error || (lang === 'vi' ? 'Mã giảm giá không hợp lệ' : 'Invalid coupon code'));
        setAppliedCoupon(null);
        setDiscountAmount(0);
        localStorage.removeItem('cartCoupon');
        localStorage.removeItem('cartDiscount');
      }
    } catch (e) {
      console.error('Lỗi áp dụng mã giảm giá:', e);
      setPromoError(lang === 'vi' ? 'Không thể kết nối máy chủ để xác thực mã' : 'Unable to connect to the server to validate code');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCodeInput('');
    setPromoError('');
    localStorage.removeItem('cartCoupon');
    localStorage.removeItem('cartDiscount');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '2.5rem 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: '50%', backgroundColor: 'var(--secondary-color)', marginBottom: '1.5rem' }}>
          <i className="ri-shopping-cart-2-line" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
        </div>
        <h2 style={{ marginTop: '1rem', marginBottom: '0.75rem', fontWeight: 800, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lang === 'vi' ? 'Giỏ hàng của bạn đang trống' : 'Your cart is empty'}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.85rem' }}>{lang === 'vi' ? 'Hãy quay lại cửa hàng để khám phá và thêm các sản phẩm ưng ý nhất.' : 'Please go back to the store to discover and add products.'}</p>
        <Link to="/products" className="btn btn-primary" style={{ padding: '0.9rem 2.5rem', backgroundColor: '#1e5088', borderColor: '#1e5088', color: '#ffffff' }}>{lang === 'vi' ? 'QUAY LẠI CỬA HÀNG' : 'RETURN TO SHOP'}</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '1.5rem 0' }}>
      
      {/* STEPS INDICATOR */}
      <CheckoutSteps currentStep={1} />

      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '2rem', fontFamily: 'var(--font-display)', color: 'var(--text-dark)', textTransform: 'uppercase' }}>{lang === 'vi' ? 'Giỏ Hàng Của Bạn' : 'Your Cart'}</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '3.5rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: LIST OF PRODUCTS IN FLAT ROWS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cartItems.map(item => (
            <div 
              key={`${item.id}-${item.size}-${item.color}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                padding: '1rem 1.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                backgroundColor: '#ffffff',
                transition: 'var(--transition-fast)'
              }}
            >
              {/* Product image container */}
              <div style={{ border: '1px solid var(--border-light)', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: '#fcfcfc' }}>
                <img src={item.image} style={{ width: '70px', height: '93px', objectFit: 'cover' }} alt={item.name} />
              </div>

              {/* Product Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{item.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
                  {lang === 'vi' ? 'Cỡ: ' : 'Size: '}<strong style={{ color: 'var(--primary-color)' }}>{item.size}</strong>
                  {item.color && <span> | {lang === 'vi' ? 'Màu: ' : 'Color: '}<strong style={{ color: 'var(--primary-color)' }}>{item.color}</strong></span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', fontWeight: 700, marginTop: '0.4rem' }}>
                  {new Intl.NumberFormat('vi-VN').format(item.rawPrice) + ' VND'}
                </div>
              </div>

              {/* Quantity Selector */}
              <div style={{ display: 'inline-flex', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '34px', width: '80px', backgroundColor: '#ffffff' }}>
                <button style={{ flex: 1, border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none', fontSize: '0.85rem' }} onClick={() => updateQuantity(item.id, item.size, item.color || '', -1)}>-</button>
                <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>{item.quantity}</div>
                <button style={{ flex: 1, border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none', fontSize: '0.85rem' }} onClick={() => updateQuantity(item.id, item.size, item.color || '', 1)}>+</button>
              </div>

              {/* Total Price */}
              <div style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '0.95rem', minWidth: '110px', textAlign: 'right' }}>
                {new Intl.NumberFormat('vi-VN').format(item.rawPrice * item.quantity) + ' VND'}
              </div>

              {/* Remove button */}
              <button 
                style={{
                  width: '32px',
                  height: '32px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  color: 'var(--text-dark)',
                  transition: 'var(--transition-fast)'
                }}
                onClick={() => removeFromCart(item.id, item.size, item.color)}
                aria-label={lang === 'vi' ? 'Xóa' : 'Remove'}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
              >
                <i className="ri-delete-bin-line" style={{ fontSize: '1rem' }}></i>
              </button>
            </div>
          ))}
          
          <Link to="/products" className="btn btn-outline" style={{ marginTop: '1rem', alignSelf: 'flex-start', padding: '0.75rem 1.5rem', fontSize: '0.75rem' }}>
            <i className="ri-arrow-left-line"></i> {lang === 'vi' ? 'Tiếp tục mua sắm' : 'Continue shopping'}
          </Link>
        </div>
        
        {/* RIGHT COLUMN: FLAT ORDER SUMMARY PANEL */}
        <div>
          <div style={{ padding: '2rem', border: '1px solid var(--border-light)', backgroundColor: '#fcfcfc', borderRadius: 'var(--radius-sm)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', color: 'var(--text-dark)', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>{lang === 'vi' ? 'Tóm tắt đơn hàng' : 'Order Summary'}</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{lang === 'vi' ? `Tạm tính (${cartItems.length} sản phẩm)` : `Subtotal (${cartItems.length} items)`}</span>
              <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{new Intl.NumberFormat('vi-VN').format(cartTotal) + ' VND'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.85rem', lineHeight: '1.4' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{lang === 'vi' ? 'Phí vận chuyển' : 'Shipping fee'}</span>
              <span style={{ color: '#000000', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>{lang === 'vi' ? 'Tính ở bước sau' : 'Calculated at checkout'}</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{lang === 'vi' ? 'Mã giảm giá / Voucher' : 'Coupon Code / Voucher'}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flexGrow: 1 }}>
                  <input 
                    type="text" 
                    placeholder={lang === 'vi' ? "Gõ mã giảm giá..." : "Enter coupon..."} 
                    style={{ 
                      width: '100%', 
                      border: '1px solid var(--border-medium)', 
                      outline: 'none', 
                      backgroundColor: '#ffffff', 
                      padding: '0.5rem 0.75rem', 
                      fontSize: '0.8rem',
                      color: 'var(--text-dark)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    disabled={appliedCoupon != null}
                  />
                </div>
                {appliedCoupon ? (
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
                    onClick={handleRemoveCoupon}
                  >
                    {lang === 'vi' ? 'Gỡ bỏ' : 'Remove'}
                  </button>
                ) : (
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
                    onClick={handleApplyCoupon}
                    disabled={isApplyingPromo}
                  >
                    {isApplyingPromo ? '...' : (lang === 'vi' ? 'Áp dụng' : 'Apply')}
                  </button>
                )}
              </div>
              {appliedCoupon && (
                <div style={{ color: 'var(--primary-color)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 700 }}>
                  {lang === 'vi' ? `Đã áp dụng mã: ${appliedCoupon.code} (-${new Intl.NumberFormat('vi-VN').format(discountAmount)}đ)` : `Applied code: ${appliedCoupon.code} (-${new Intl.NumberFormat('vi-VN').format(discountAmount)} VND)`}
                </div>
              )}
              {promoError && (
                <div style={{ color: 'var(--primary-color)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 700 }}>
                  {promoError}
                </div>
              )}
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{lang === 'vi' ? 'Giảm giá' : 'Discount'}</span>
                <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>-{new Intl.NumberFormat('vi-VN').format(discountAmount)} VND</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.75rem', fontSize: '1.1rem', fontWeight: 800, borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
              <span style={{ color: 'var(--text-dark)' }}>{lang === 'vi' ? 'Tổng cộng:' : 'Total Amount:'}</span>
              <span style={{ color: 'var(--primary-color)' }}>{new Intl.NumberFormat('vi-VN').format(cartTotal - discountAmount) + ' VND'}</span>
            </div>
            
            <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '0.85rem', fontWeight: 800, textAlign: 'center', borderRadius: 'var(--radius-sm)' }}>
              {lang === 'vi' ? 'TIẾN HÀNH THANH TOÁN' : 'PROCEED TO CHECKOUT'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Premium Dropdown Component
function PremiumSelect({ label, placeholder, options, value, onChange, disabled }) {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const safeOptions = Array.isArray(options) ? options : [];
  const selectedOption = safeOptions.find(opt => opt.value == value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', display: 'block', marginBottom: '0.6rem' }}>
        {label}
      </label>
      <div ref={dropdownRef} className="premium-select-container" style={{ position: 'relative', width: '100%' }}>
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`premium-select-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <i className="ri-arrow-down-s-line" style={{ transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', color: '#64748b', fontSize: '1.2rem' }}></i>
        </div>
        
        {isOpen && (
          <div className="premium-select-dropdown">
            {safeOptions.length === 0 ? (
              <div style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>{lang === 'vi' ? 'Không có lựa chọn nào' : 'No options available'}</div>
            ) : (
              safeOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange({ target: { value: opt.value } });
                    setIsOpen(false);
                  }}
                  className={`premium-select-option ${value == opt.value ? 'selected' : ''}`}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// === 4. CHECKOUT (MODERN 2-COLUMN SHEET WITH BREADCRUMBS) ===
function Checkout() {
  const { t, lang } = useLanguage();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [shippingFee, setShippingFee] = useState(0);
  const [user, setUser] = useState(null);

  // GHN API States
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [isLoadingFee, setIsLoadingFee] = useState(false);

  // Form States
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('VNPAY');

  // Promotion States
  const [couponCodeInput, setCouponCodeInput] = useState(() => {
    try {
      const saved = localStorage.getItem('cartCoupon');
      return saved ? JSON.parse(saved).code : '';
    } catch (e) {
      return '';
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('cartCoupon');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [discountAmount, setDiscountAmount] = useState(() => {
    const saved = localStorage.getItem('cartDiscount');
    return saved ? parseFloat(saved) : 0;
  });
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [availablePromos, setAvailablePromos] = useState([]);

  // Sync discount if total changes or is loaded from cart
  useEffect(() => {
    if (appliedCoupon) {
      let newDiscount = 0;
      if (appliedCoupon.minimumOrderAmount && cartTotal < appliedCoupon.minimumOrderAmount) {
        handleRemoveCoupon();
        return;
      }
      if ("PERCENTAGE" === appliedCoupon.discountType) {
        newDiscount = cartTotal * (appliedCoupon.discountValue / 100.0);
        if (appliedCoupon.maxDiscountAmount && newDiscount > appliedCoupon.maxDiscountAmount) {
          newDiscount = appliedCoupon.maxDiscountAmount;
        }
      } else {
        newDiscount = appliedCoupon.discountValue;
      }
      newDiscount = Math.min(newDiscount, cartTotal);
      setDiscountAmount(newDiscount);
      localStorage.setItem('cartDiscount', newDiscount.toString());
    }
  }, [cartTotal, appliedCoupon]);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) {
      setPromoError(lang === 'vi' ? 'Vui lòng nhập mã giảm giá' : 'Please enter a coupon code');
      return;
    }
    setPromoError('');
    setIsApplyingPromo(true);
    try {
      const res = await fetch('/identity/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCodeInput.trim().toUpperCase(),
          orderAmount: cartTotal,
          userId: user?.id || 1
        })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
        setDiscountAmount(data.discountAmount);
        setPromoError('');
        localStorage.setItem('cartCoupon', JSON.stringify(data));
        localStorage.setItem('cartDiscount', data.discountAmount.toString());
      } else {
        setPromoError(data.error || (lang === 'vi' ? 'Mã giảm giá không hợp lệ' : 'Invalid coupon code'));
        setAppliedCoupon(null);
        setDiscountAmount(0);
        localStorage.removeItem('cartCoupon');
        localStorage.removeItem('cartDiscount');
      }
    } catch (e) {
      console.error('Lỗi áp dụng mã giảm giá:', e);
      setPromoError(lang === 'vi' ? 'Không thể kết nối máy chủ để xác thực mã' : 'Unable to connect to the server to validate code');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCodeInput('');
    setPromoError('');
    localStorage.removeItem('cartCoupon');
    localStorage.removeItem('cartDiscount');
  };

  useEffect(() => {
    fetch('/identity/api/promotions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const now = new Date();
          // Filter out inactive, expired, or fully exhausted promos
          const activePromos = data.filter(p => {
            const isExpired = p.endDate && new Date(p.endDate) < now;
            const isLimitReached = p.usageLimit && p.usageCount >= p.usageLimit;
            return p.isActive && !isExpired && !isLimitReached;
          });
          setAvailablePromos(activePromos);
        }
      })
      .catch(e => console.error("Lỗi tải chương trình khuyến mãi:", e));
  }, [cartTotal]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const savedCheckout = localStorage.getItem('lastCheckoutInfo');
    
    if (savedCheckout) {
      try {
        const info = JSON.parse(savedCheckout);
        if (info.customerName) setCustomerName(info.customerName);
        if (info.customerPhone) setCustomerPhone(info.customerPhone);
        if (info.addressDetail) setAddressDetail(info.addressDetail);
        if (info.selectedProvince) setSelectedProvince(info.selectedProvince);
        if (info.selectedDistrict) setSelectedDistrict(info.selectedDistrict);
        if (info.selectedWard) setSelectedWard(info.selectedWard);
      } catch (e) {}
    } else if (userData) {
      try { 
        const parsed = JSON.parse(userData);
        setUser(parsed); 
        if (!customerName) setCustomerName(parsed.name || '');
        if (!customerPhone) setCustomerPhone(parsed.phone || '');
      } catch (e) {}
    }
    
    if (userData && !user) {
      try { setUser(JSON.parse(userData)); } catch (e) {}
    }

    if (cartItems.length === 0) navigate('/cart');

    // Tải tỉnh thành
    fetch('/identity/api/shipping/provinces')
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          setProvinces(Array.isArray(data.data) ? data.data : []);
        }
      })
      .catch(e => console.error("Lỗi lấy Tỉnh", e));
  }, [cartItems, navigate]);

  // Quận huyện khi Tỉnh thay đổi
  useEffect(() => {
    if (selectedProvince) {
      fetch(`/identity/api/shipping/districts?provinceId=${selectedProvince}`)
        .then(res => res.json())
        .then(data => {
          if (data.code === 200) setDistricts(Array.isArray(data.data) ? data.data : []);
        });
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  // Phường xã khi Quận thay đổi
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`/identity/api/shipping/wards?districtId=${selectedDistrict}`)
        .then(res => res.json())
        .then(data => {
          if (data.code === 200) setWards(Array.isArray(data.data) ? data.data : []);
        });
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  // Tự động tính phí vận chuyển GHN
  useEffect(() => {
    if (cartTotal >= 500000) {
      setShippingFee(0);
      setIsLoadingFee(false);
      return;
    }
    if (selectedDistrict && selectedWard) {
      setIsLoadingFee(true);
      fetch('/identity/api/shipping/fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toDistrictId: selectedDistrict,
          toWardCode: selectedWard,
          weight: 500
        })
      })
      .then(res => res.json())
      .then(data => {
        setIsLoadingFee(false);
        if (data.code === 200 && data.data) {
          setShippingFee(data.data.total);
        }
      })
      .catch(e => {
        setIsLoadingFee(false);
        console.error("Lỗi tính phí", e);
      });
    } else {
      setShippingFee(0);
    }
  }, [selectedDistrict, selectedWard, cartTotal]);

  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
    setSelectedDistrict('');
    setSelectedWard('');
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setSelectedWard('');
  };

  const handleWardChange = (e) => {
    setSelectedWard(e.target.value);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    if (!selectedProvince || !selectedDistrict || !selectedWard || !addressDetail) {
      alert(lang === 'vi' ? "Vui lòng điền đầy đủ thông tin địa chỉ giao hàng!" : "Please fill in all shipping address information!");
      return;
    }
    
    const provName = (Array.isArray(provinces) ? provinces : []).find(p => p.ProvinceID == selectedProvince)?.ProvinceName || "";
    const distName = (Array.isArray(districts) ? districts : []).find(d => d.DistrictID == selectedDistrict)?.DistrictName || "";
    const wardName = (Array.isArray(wards) ? wards : []).find(w => w.WardCode == selectedWard)?.WardName || "";
    const fullAddress = `${addressDetail}, ${wardName}, ${distName}, ${provName}`;

    const newOrder = {
      id: "BN" + Math.floor(Math.random() * 1000000),
      userId: user?.id || null,
      customerName: customerName || (lang === 'vi' ? "Khách vãng lai" : "Guest Customer"),
      customerPhone: customerPhone || "09xxxx",
      shippingAddress: fullAddress,
      date: new Date().toLocaleDateString('vi-VN'),
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        rawPrice: item.rawPrice,
        size: item.size,
        color: item.color,
        image: item.image
      })),
      shippingFee: shippingFee,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      discountAmount: discountAmount,
      total: cartTotal + shippingFee - discountAmount,
      status: lang === 'vi' ? "Đang xử lý" : "Processing",
      paymentMethod: paymentMethod === 'COD' 
        ? (lang === 'vi' ? 'COD (Thanh toán khi nhận hàng)' : 'COD (Cash on Delivery)')
        : (lang === 'vi' ? 'Thanh toán trực tuyến (VNPAY)' : 'Online Payment (VNPAY)')
    };

    localStorage.setItem('lastCheckoutInfo', JSON.stringify({
      customerName, customerPhone, addressDetail,
      selectedProvince, selectedDistrict, selectedWard
    }));
    
    try {
      const res = await fetch('/identity/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      
      if (!res.ok) {
        const errorMsg = await res.text();
        alert(errorMsg || (lang === 'vi' ? "Lỗi tạo đơn hàng!" : "Order creation failed!"));
        return;
      }
      
      const savedOrder = await res.json();
      // Use the actual backend saved order details for payment
      const checkoutTotal = savedOrder.totalAmount || newOrder.total;
      const checkoutOrderId = savedOrder.id || newOrder.id;

      const existingOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
      localStorage.setItem('myOrders', JSON.stringify([newOrder, ...existingOrders]));
      
      // Clear coupon from localStorage upon successful checkout
      localStorage.removeItem('cartCoupon');
      localStorage.removeItem('cartDiscount');

      if (paymentMethod === 'VNPAY') {
        const paymentRes = await fetch('/identity/api/payment/create_payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: checkoutTotal,
            orderId: checkoutOrderId,
            bankCode: ""
          })
        });
        
        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          if (paymentData.paymentUrl) {
            clearCart();
            window.location.href = paymentData.paymentUrl;
            return;
          }
        }
        alert(lang === 'vi' ? "Đặt hàng thành công, nhưng gặp sự cố kết nối cổng VNPAY!" : "Order placed successfully, but VNPAY connection failed!");
        clearCart();
        navigate('/orders');
      } else {
        // COD path
        clearCart();
        alert(lang === 'vi' ? "Đặt hàng thành công! Đơn hàng COD đang chờ duyệt xử lý." : "Order placed successfully! Cash on Delivery order is pending approval.");
        navigate('/orders');
      }
    } catch (e) {
      console.error("Lỗi xử lý đơn hàng: ", e);
      alert(lang === 'vi' ? "Có lỗi xảy ra trong quá trình đặt hàng!" : "An error occurred while placing your order!");
    }
  };

  return (
    <div className="container" style={{ padding: '1.5rem 0' }}>
      <style>{`
        /* Premium Flat Checkout Inputs */
        .premium-checkout-input {
          width: 100%;
          padding: 0.95rem 1.25rem;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          border: 1px solid var(--border-medium);
          background-color: var(--bg-light);
          color: var(--text-dark);
          transition: var(--transition-smooth);
          outline: none;
          border-radius: var(--radius-sm);
        }
        .premium-checkout-input:focus {
          border-color: var(--primary-color);
        }
        .premium-checkout-input::placeholder {
          color: var(--text-muted);
        }

        /* Custom Premium Dropdown (Select Custom Component) */
        .premium-select-container {
          width: 100%;
        }
        .premium-select-trigger {
          width: 100%;
          padding: 0.95rem 1.25rem;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          border: 1px solid var(--border-medium);
          background-color: var(--bg-light);
          color: var(--text-dark);
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: var(--transition-smooth);
          border-radius: var(--radius-sm);
          user-select: none;
        }
        .premium-select-trigger:hover:not(.disabled) {
          border-color: var(--text-dark);
        }
        .premium-select-trigger.active {
          border-color: var(--primary-color);
        }
        .premium-select-trigger.disabled {
          color: var(--text-muted);
          cursor: not-allowed;
          opacity: 0.6;
          border-color: var(--border-light);
        }

        .premium-select-dropdown {
          position: absolute;
          top: 105%;
          left: 0;
          width: 100%;
          max-height: 260px;
          overflow-y: auto;
          background-color: var(--bg-light);
          border: 1px solid var(--border-medium);
          z-index: 1050;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          animation: dropdownSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          border-radius: var(--radius-sm);
          will-change: transform, opacity;
        }
        /* Custom scrollbar for premium dropdown */
        .premium-select-dropdown::-webkit-scrollbar {
          width: 6px;
        }
        .premium-select-dropdown::-webkit-scrollbar-track {
          background: var(--bg-light);
        }
        .premium-select-dropdown::-webkit-scrollbar-thumb {
          background: var(--border-medium);
          border-radius: 3px;
        }
        .premium-select-dropdown::-webkit-scrollbar-thumb:hover {
          background: var(--primary-color);
        }
        @keyframes dropdownSlideDown {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .premium-select-option {
          padding: 0.85rem 1.25rem;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          color: var(--text-dark);
          cursor: pointer;
          transition: var(--transition-fast);
          text-align: left;
        }
        .premium-select-option:hover {
          background-color: rgba(255, 99, 16, 0.1);
          color: var(--primary-color);
          padding-left: 1.6rem;
        }
        .premium-select-option.selected {
          background-color: rgba(255, 99, 16, 0.15);
          color: var(--primary-color);
          font-weight: 700;
          border-left: 3px solid var(--primary-color);
          padding-left: calc(1.25rem - 3px);
        }

        /* Premium Flat Cards */
        .premium-card {
          border: 1px solid var(--border-light);
          padding: 2.5rem;
          background-color: var(--bg-light);
          transition: var(--transition-smooth);
          border-radius: var(--radius-sm);
        }
        .premium-card:hover {
          border-color: var(--border-medium);
        }

        /* Payment and Shipping Options */
        .payment-option-label {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          border: 1px solid var(--border-light);
          padding: 1.5rem;
          background-color: var(--bg-light);
          cursor: pointer;
          transition: var(--transition-smooth);
          position: relative;
          border-radius: var(--radius-sm);
          color: var(--text-dark);
        }
        .payment-option-label:hover {
          border-color: var(--text-dark);
        }
        .payment-option-active {
          border-color: var(--primary-color) !important;
          background-color: var(--secondary-color) !important;
        }
        
        .shipping-method-box {
          border: 1px solid var(--border-light);
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--bg-light);
          transition: var(--transition-smooth);
          border-radius: var(--radius-sm);
        }
        .shipping-method-active {
          border-color: var(--primary-color) !important;
        }
        
        /* Custom Modern Radio Button */
        .custom-radio {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border: 1px solid var(--border-medium);
          border-radius: 50%;
          outline: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
          margin: 0;
          position: relative;
          background-color: #ffffff;
        }
        .custom-radio:checked {
          border-color: var(--primary-color);
        }
        .custom-radio:checked::after {
          content: '';
          width: 8px;
          height: 8px;
          background-color: var(--primary-color);
          border-radius: 50%;
          display: block;
        }
      `}</style>
      
      {/* STEPS INDICATOR */}
      <CheckoutSteps currentStep={2} />

      <h1 style={{ fontSize: '2.2rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '2.5rem' }}>{lang === 'vi' ? 'Thanh Toán Đơn Hàng' : 'Checkout Order'}</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '4rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: CUSTOMER AND SHIPPING INFO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Customer Info Box */}
          <div className="premium-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <i className="ri-user-line" style={{ color: 'var(--accent-gold)' }}></i>
              <span>{lang === 'vi' ? 'Thông tin khách nhận hàng' : 'Shipping Information'}</span>
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', display: 'block', marginBottom: '0.6rem' }}>{lang === 'vi' ? 'Họ và tên nhận hàng *' : 'Full Name *'}</label>
                <input type="text" className="premium-checkout-input" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder={lang === 'vi' ? "Tên người nhận..." : "Recipient name..."} required />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', display: 'block', marginBottom: '0.6rem' }}>{lang === 'vi' ? 'Số điện thoại liên lạc *' : 'Phone Number *'}</label>
                <input type="text" className="premium-checkout-input" placeholder={lang === 'vi' ? "Số điện thoại..." : "Phone number..."} value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', display: 'block', marginBottom: '0.6rem' }}>{lang === 'vi' ? 'Địa chỉ nhận cụ thể *' : 'Street Address *'}</label>
              <input type="text" className="premium-checkout-input" placeholder={lang === 'vi' ? "Số nhà, ngõ ngách, tên đường..." : "House number, street, ward..."} value={addressDetail} onChange={e => setAddressDetail(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <PremiumSelect
                label={lang === 'vi' ? "Tỉnh/Thành" : "Province/City"}
                placeholder={lang === 'vi' ? "Chọn Tỉnh/Thành" : "Select Province/City"}
                options={(Array.isArray(provinces) ? provinces : []).map(p => ({ value: p.ProvinceID, label: p.ProvinceName }))}
                value={selectedProvince}
                onChange={handleProvinceChange}
              />
              <PremiumSelect
                label={lang === 'vi' ? "Quận/Huyện" : "District"}
                placeholder={lang === 'vi' ? "Chọn Quận/Huyện" : "Select District"}
                options={(Array.isArray(districts) ? districts : []).map(d => ({ value: d.DistrictID, label: d.DistrictName }))}
                value={selectedDistrict}
                onChange={handleDistrictChange}
                disabled={!selectedProvince}
              />
              <PremiumSelect
                label={lang === 'vi' ? "Phường/Xã" : "Ward"}
                placeholder={lang === 'vi' ? "Chọn Phường/Xã" : "Select Ward"}
                options={(Array.isArray(wards) ? wards : []).map(w => ({ value: w.WardCode, label: w.WardName }))}
                value={selectedWard}
                onChange={handleWardChange}
                disabled={!selectedDistrict}
              />
            </div>
          </div>

          {/* Real-time GHN Shipping fee card */}
          <div className="premium-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <i className="ri-truck-line" style={{ color: 'var(--accent-gold)' }}></i>
              <span>{lang === 'vi' ? 'Vận chuyển hàng nhanh' : 'Fast Shipping'}</span>
              <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--accent-gold)', color: '#fff', padding: '3px 8px', borderRadius: '0px', marginLeft: '10px', fontWeight: 600, letterSpacing: '0.05em' }}>API GHN CHÍNH THỨC</span>
            </h3>
            
            {cartTotal >= 500000 ? (
              <div className="shipping-method-box" style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'var(--transition-smooth)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--secondary-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', width: '100%' }}>
                  <div className="shadow-extruded" style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'var(--bg-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className="ri-gift-line" style={{ color: 'var(--primary-color)', fontSize: '1.4rem' }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {lang === 'vi' ? 'Miễn Phí Vận Chuyển' : 'Free Shipping'} 
                      <span className="shadow-inset-small" style={{ 
                        fontSize: '0.65rem', 
                        color: 'var(--accent-secondary)', 
                        padding: '2px 8px', 
                        borderRadius: '6px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>{lang === 'vi' ? 'ĐÃ ÁP DỤNG' : 'APPLIED'}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontWeight: 500 }}>
                      {lang === 'vi' ? 'Ưu đãi đặc biệt cho đơn hàng từ 500.000 VND. Chúc bạn mua sắm vui vẻ!' : 'Special offer for orders over 500,000 VND. Happy shopping!'}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {lang === 'vi' ? 'Miễn phí' : 'Free'}
                  </div>
                </div>
              </div>
            ) : isLoadingFee ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', border: '1px dashed #cbd5e1', backgroundColor: '#f8fafc' }}>
                <i className="ri-loader-4-line spin" style={{ marginRight: '8px', fontSize: '1.2rem', color: 'var(--accent-gold)' }}></i> {lang === 'vi' ? 'Đang liên kết API GHN để báo giá...' : 'Linking to GHN API for shipping quote...'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className={`shipping-method-box ${shippingFee > 0 ? 'shipping-method-active' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <input type="radio" checked={shippingFee > 0} readOnly className="custom-radio" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-dark)' }}>{lang === 'vi' ? 'Đơn vị vận chuyển: Giao Hàng Nhanh (GHN)' : 'Carrier: Giao Hàng Nhanh (GHN)'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        {shippingFee > 0 
                          ? (lang === 'vi' ? "Bảo chứng giao nhận toàn quốc an toàn trong 2-4 ngày" : "Secured nationwide delivery in 2-4 days") 
                          : (lang === 'vi' ? "Vui lòng hoàn tất mục Tỉnh/Quận/Xã để tính phí tự động" : "Please complete Province/District/Ward to calculate fee automatically")}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-gold)' }}>
                    {shippingFee > 0 ? new Intl.NumberFormat('vi-VN').format(shippingFee) + ' VND' : '---'}
                  </div>
                </div>
                
                {/* Incentive (Upsell) Banner */}
                <div style={{
                  border: '1px dashed var(--accent-gold)',
                  background: '#fdfbf7',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(184, 144, 71, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className="ri-truck-line" style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }}></i>
                  </div>
                  <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-dark)', lineHeight: '1.5' }}>
                    {lang === 'vi' ? (
                      <>Mua thêm <strong style={{ color: 'var(--accent-gold)', fontSize: '0.95rem' }}>{new Intl.NumberFormat('vi-VN').format(500000 - cartTotal)} VND</strong> để được nhận ưu đãi <strong style={{ textTransform: 'uppercase', color: 'var(--accent-gold)' }}>Miễn Phí Vận Chuyển</strong> toàn quốc!</>
                    ) : (
                      <>Shop for <strong style={{ color: 'var(--accent-gold)', fontSize: '0.95rem' }}>{new Intl.NumberFormat('vi-VN').format(500000 - cartTotal)} VND</strong> more to get <strong style={{ textTransform: 'uppercase', color: 'var(--accent-gold)' }}>Free Shipping</strong> nationwide!</>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate('/shop')} 
                    style={{
                      background: 'var(--text-dark)',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      letterSpacing: '0.05em'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--accent-gold)'}
                    onMouseLeave={(e) => e.target.style.background = 'var(--text-dark)'}
                  >
                    {lang === 'vi' ? 'Mua thêm' : 'Shop more'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector Grid */}
          <div className="premium-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <i className="ri-bank-card-line" style={{ color: 'var(--accent-gold)' }}></i>
              <span>{lang === 'vi' ? 'Phương thức thanh toán' : 'Payment Method'}</span>
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <label className={`payment-option-label ${paymentMethod === 'VNPAY' ? 'payment-option-active' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} className="custom-radio" />
                <div>
                  <div style={{ fontWeight: 700, color: '#005BAA', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                    <i className="ri-bank-card-fill" style={{ fontSize: '1.1rem' }}></i>
                    <span>{lang === 'vi' ? 'Cổng VNPAY' : 'VNPAY Gateway'}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: '1.4' }}>{lang === 'vi' ? 'Thanh toán trực tuyến bảo mật QR / ATM' : 'Secure online payment QR / ATM'}</div>
                </div>
              </label>

              <label className={`payment-option-label ${paymentMethod === 'COD' ? 'payment-option-active' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="custom-radio" />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                    <i className="ri-money-dollar-circle-fill" style={{ fontSize: '1.1rem' }}></i>
                    <span>Ship COD</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: '1.4' }}>{lang === 'vi' ? 'Thanh toán trực tiếp bằng tiền mặt khi nhận hàng' : 'Cash on delivery cash payment'}</div>
                </div>
              </label>
            </div>
          </div>
        </div>
        
        {/* RIGHT COLUMN: STICKY ORDER DETAIL PREVIEW BAR */}
        <div>
          <div className="premium-card" style={{
            position: 'sticky',
            top: '140px'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>{lang === 'vi' ? 'Chi tiết đơn hàng' : 'Order Details'}</h3>
            
            {/* Scrollable products summary list */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem' }}>
              {cartItems.map(item => (
                <div key={`${item.id}-${item.size}`} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <img src={item.image} style={{ width: '54px', height: '72px', objectFit: 'cover', border: '1px solid var(--border-light)' }} alt={item.name} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', lineHeight: '1.4' }}>{item.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(x{item.quantity})</span></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{lang === 'vi' ? `Size: ${item.size}` : `Size: ${item.size}`} {item.color && `| ${lang === 'vi' ? 'Màu: ' : 'Color: '}${item.color}`}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600, marginTop: '0.2rem' }}>
                      {new Intl.NumberFormat('vi-VN').format(item.rawPrice * item.quantity) + ' VND'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>{lang === 'vi' ? `Tạm tính (${cartItems.length} sản phẩm)` : `Subtotal (${cartItems.length} items)`}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{new Intl.NumberFormat('vi-VN').format(cartTotal) + ' VND'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>{lang === 'vi' ? 'Phí vận chuyển' : 'Shipping fee'}</span>
              <span style={{ fontWeight: 600, color: cartTotal >= 500000 ? '#10b981' : 'var(--text-dark)' }}>
                {cartTotal >= 500000 ? (lang === 'vi' ? 'Miễn phí' : 'Free') : (shippingFee > 0 ? new Intl.NumberFormat('vi-VN').format(shippingFee) + ' VND' : '---')}
              </span>
            </div>

            {/* Promo Code Input Block */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>{lang === 'vi' ? 'Mã giảm giá / Voucher' : 'Coupon Code / Voucher'}</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder={lang === 'vi' ? "Nhập mã..." : "Enter coupon..."} 
                  value={couponCodeInput} 
                  onChange={(e) => setCouponCodeInput(e.target.value)} 
                  className="premium-checkout-input" 
                  style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }} 
                  disabled={appliedCoupon != null}
                />
                {appliedCoupon ? (
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    onClick={handleRemoveCoupon} 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: '#ff4d4f', borderColor: '#ff4d4f' }}
                  >
                    {lang === 'vi' ? 'Gỡ bỏ' : 'Remove'}
                  </button>
                ) : (
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    onClick={handleApplyCoupon} 
                    disabled={isApplyingPromo}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  >
                    {isApplyingPromo ? '...' : (lang === 'vi' ? 'Áp dụng' : 'Apply')}
                  </button>
                )}
              </div>
              {promoError && <div style={{ color: '#ff4d4f', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 500, marginBottom: '0.5rem' }}>{promoError}</div>}
              {appliedCoupon && <div style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600, marginBottom: '0.5rem' }}>{lang === 'vi' ? `Đã áp dụng mã: ${appliedCoupon.code} (-${new Intl.NumberFormat('vi-VN').format(discountAmount)}đ)` : `Applied code: ${appliedCoupon.code} (-${new Intl.NumberFormat('vi-VN').format(discountAmount)} VND)`}</div>}
              
              {/* Available Coupons list click-to-apply */}
              {availablePromos.length > 0 && (
                <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--border-light)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                    {lang === 'vi' ? 'Chọn Voucher của bạn:' : 'Choose your Voucher:'}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {availablePromos.map(promo => {
                      const isEligible = !promo.minimumOrderAmount || cartTotal >= promo.minimumOrderAmount;
                      const isCurrent = appliedCoupon && appliedCoupon.code === promo.code;
                      
                      return (
                        <div 
                          key={promo.id} 
                          style={{ 
                            border: isCurrent ? '1px solid var(--accent-gold)' : '1px solid var(--border-light)',
                            backgroundColor: isCurrent ? 'rgba(185, 155, 107, 0.05)' : 'var(--bg-light)',
                            padding: '0.6rem 0.8rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            opacity: isEligible ? 1 : 0.6,
                            transition: 'all 0.2s ease',
                            fontSize: '0.8rem'
                          }}
                        >
                          <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ fontWeight: 800, color: 'var(--accent-gold)', letterSpacing: '0.02em' }}>{promo.code}</span>
                              <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', backgroundColor: '#e2e8f0', color: '#334155', fontWeight: 700 }}>
                                {promo.discountType === 'PERCENTAGE' ? `-${promo.discountValue}%` : `-${(promo.discountValue / 1000)}k`}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: '1.2' }}>
                              {promo.description || (lang === 'vi' ? 'Giảm giá trên đơn hàng' : 'Discount on order')}
                            </div>
                            {promo.minimumOrderAmount && (
                              <div style={{ fontSize: '0.65rem', color: '#b45309', marginTop: '0.1rem', fontWeight: 600 }}>
                                {lang === 'vi' ? `Đơn từ ${new Intl.NumberFormat('vi-VN').format(promo.minimumOrderAmount)}đ` : `Min order ${new Intl.NumberFormat('vi-VN').format(promo.minimumOrderAmount)} VND`}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            {isCurrent ? (
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-gold)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                <i className="ri-checkbox-circle-fill"></i> {lang === 'vi' ? 'Dùng' : 'Used'}
                              </span>
                            ) : isEligible ? (
                              <button
                                type="button"
                                className="btn btn-outline"
                                style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', height: 'auto', minHeight: 'unset' }}
                                onClick={async () => {
                                  setCouponCodeInput(promo.code);
                                  setPromoError('');
                                  setIsApplyingPromo(true);
                                  try {
                                    const res = await fetch('/identity/api/promotions/validate', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        code: promo.code,
                                        orderAmount: cartTotal,
                                        userId: user?.id || 1
                                      })
                                    });
                                    const data = await res.json();
                                    if (res.ok && data.valid) {
                                      setAppliedCoupon(data);
                                      setDiscountAmount(data.discountAmount);
                                      setPromoError('');
                                    } else {
                                      setPromoError(data.error || (lang === 'vi' ? 'Lỗi áp dụng' : 'Failed to apply'));
                                      setAppliedCoupon(null);
                                      setDiscountAmount(0);
                                    }
                                  } catch (e) {
                                    setPromoError(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error');
                                  } finally {
                                    setIsApplyingPromo(false);
                                  }
                                }}
                              >
                                {lang === 'vi' ? 'Chọn' : 'Select'}
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 500 }} title="Giỏ hàng chưa đủ giá trị tối thiểu">
                                {lang === 'vi' ? `Thiếu ${new Intl.NumberFormat('vi-VN').format(promo.minimumOrderAmount - cartTotal)}đ` : `Need ${new Intl.NumberFormat('vi-VN').format(promo.minimumOrderAmount - cartTotal)} VND`}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Discount row in summary if discount > 0 */}
            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#10b981', fontWeight: 600 }}>
                <span>{lang === 'vi' ? 'Giảm giá' : 'Discount'}</span>
                <span>-{new Intl.NumberFormat('vi-VN').format(discountAmount) + ' VND'}</span>
              </div>
            )}
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '2rem',
              fontSize: '1.25rem',
              fontWeight: 700,
              paddingTop: '1.25rem',
              borderTop: '2px solid rgba(163, 177, 198, 0.3)'
            }}>
              <span>{lang === 'vi' ? 'Tổng cộng:' : 'Total Amount:'}</span>
              <span style={{ color: 'var(--primary-color)' }}>
                {new Intl.NumberFormat('vi-VN').format(cartTotal + shippingFee - discountAmount) + ' VND'}
              </span>
            </div>
            
            <button 
              onClick={handleCheckout} 
              className="btn btn-primary" 
              style={{
                width: '100%',
                padding: '1.2rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: paymentMethod === 'VNPAY' ? '#005BAA' : 'var(--primary-color)',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={e => {
                if (paymentMethod === 'VNPAY') {
                  e.currentTarget.style.backgroundColor = '#004B8C';
                } else {
                  e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                }
              }}
              onMouseLeave={e => {
                if (paymentMethod === 'VNPAY') {
                  e.currentTarget.style.backgroundColor = '#005BAA';
                } else {
                  e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                }
              }}
            >
              {paymentMethod === 'VNPAY' 
                ? (lang === 'vi' ? "THANH TOÁN QUA VNPAY" : "PAY WITH VNPAY") 
                : (lang === 'vi' ? "XÁC NHẬN ĐẶT HÀNG COD" : "CONFIRM CASH ON DELIVERY")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// === 5. PAYMENT RESULT (VNPAY FEEDBACK PAGE) ===
function PaymentResult() {
  const { lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(lang === 'vi' ? 'Đang kiểm tra kết quả giao dịch...' : 'Verifying transaction results...');

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode');
    if (responseCode === '00') {
      setStatus(lang === 'vi' ? 'Thanh toán thành công! Đơn hàng của bạn đã được tiếp nhận và xử lý.' : 'Payment successful! Your order has been received and is being processed.');
    } else {
      setStatus(lang === 'vi' ? 'Giao dịch thanh toán trực tuyến thất bại hoặc đã bị người dùng hủy bỏ.' : 'Online payment transaction failed or was cancelled by the user.');
    }
  }, [searchParams, lang]);

  const isSuccess = searchParams.get('vnp_ResponseCode') === '00';

  return (
    <div className="container" style={{ textAlign: 'center', padding: '3rem 0' }}>
      <CheckoutSteps currentStep={3} />
      
      <div className="shadow-extruded" style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 3rem', backgroundColor: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
        <i className={isSuccess ? "ri-checkbox-circle-line" : "ri-error-warning-line"} 
           style={{ fontSize: '5rem', color: isSuccess ? '#10b981' : '#ff4d4f', display: 'block', marginBottom: '1.5rem' }}></i>
        
        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          {isSuccess ? (lang === 'vi' ? "ĐẶT HÀNG THÀNH CÔNG" : "ORDER PLACED SUCCESSFULLY") : (lang === 'vi' ? "GIAO DỊCH THẤT BẠI" : "TRANSACTION FAILED")}
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '3rem' }}>{status}</p>
        
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center' }}>
          <Link to="/orders" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '0.9rem' }}>{lang === 'vi' ? 'Xem đơn hàng của tôi' : 'View my orders'}</Link>
          <Link to="/products" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '0.9rem' }}>{lang === 'vi' ? 'Tiếp tục mua sắm' : 'Continue shopping'}</Link>
        </div>
      </div>
    </div>
  );
}

const ShopPages = { ProductList, ProductDetail, Cart, Checkout, PaymentResult };
export default ShopPages;
