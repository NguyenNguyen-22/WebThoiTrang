import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';

const QUICK_REPLIES = [
  { id: 'outfit', text: '👗 Gợi ý Outfit' },
  { id: 'size', text: '📏 Chọn Size AI' },
  { id: 'preference', text: '🛍️ Tư vấn sở thích' },
  { id: 'tracking', text: '📦 Tra cứu đơn hàng' },
  { id: 'shipping', text: '🚚 Giao hàng & Ship' },
  { id: 'exchange', text: '🔄 Đổi trả & Hoàn tiền' }
];


// --- WIDGET 5: INTERACTIVE CHECKOUT WIDGET ---
const CheckoutWidget = ({ items: initialItems, dbProducts }) => {
  const [items, setItems] = React.useState(initialItems || []);
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [shippingAddress, setShippingAddress] = React.useState('');
  const [couponCode, setCouponCode] = React.useState('');
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const [couponSuccess, setCouponSuccess] = React.useState('');
  const [couponError, setCouponError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [orderInvoice, setOrderInvoice] = React.useState(null);
  const [errorMsg, setErrorMsg] = React.useState('');

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const totalAmount = subtotal + tax + shippingFee - discountAmount;

  const getItemOptions = (prodId) => {
    const prod = dbProducts.find(p => p.id === prodId);
    if (!prod) return { sizes: ['S', 'M', 'L', 'XL'], colors: ['Trắng', 'Đen'] };
    
    const sizes = prod.variants && prod.variants.length > 0
      ? Array.from(new Set(prod.variants.map(v => v.size)))
      : ['S', 'M', 'L', 'XL'];
      
    const colors = prod.variants && prod.variants.length > 0
      ? Array.from(new Set(prod.variants.map(v => v.color))).filter(c => c)
      : ['Trắng', 'Đen'];
      
    return { sizes, colors };
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponSuccess('');
    
    const c = couponCode.trim().toUpperCase();
    if (c === 'KM10') {
      if (subtotal >= 200000) {
        const disc = Math.min(subtotal * 0.1, 50000);
        setDiscountAmount(disc);
        setCouponSuccess(`Áp dụng mã KM10 thành công! Giảm ${disc.toLocaleString('vi-VN')} đ`);
      } else {
        setCouponError('Mã KM10 yêu cầu đơn hàng tối thiểu từ 200,000 đ.');
      }
    } else if (c === 'GIAM50K') {
      if (subtotal >= 400000) {
        setDiscountAmount(50000);
        setCouponSuccess('Áp dụng mã GIAM50K thành công! Giảm 50.000 đ');
      } else {
        setCouponError('Mã GIAM50K yêu cầu đơn hàng tối thiểu từ 400,000 đ.');
      }
    } else {
      setCouponError('Mã giảm giá không hợp lệ.');
    }
  };

  const handleOrderSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Tên, Sđt và Địa chỉ giao hàng.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const payload = {
        userId: 1,
        paymentMethod: "COD",
        shippingFee: shippingFee,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        couponCode: discountAmount > 0 ? couponCode.trim().toUpperCase() : "",
        items: items.map(it => ({
          id: it.id,
          quantity: it.quantity,
          rawPrice: it.price,
          size: it.size || 'M',
          color: it.color || 'Trắng'
        }))
      };

      const response = await fetch('/identity/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Đặt hàng không thành công');
      }

      const orderResult = await response.json();
      setOrderInvoice(orderResult);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi khi đặt hàng. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderInvoice) {
    return (
      <div style={{
        marginTop: '0.8rem',
        padding: '1.25rem',
        backgroundColor: 'var(--bg-light)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-dark)',
        fontFamily: 'monospace, Courier New',
        fontSize: '0.78rem',
        lineHeight: '1.4'
      }}>
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
          HÓA ĐƠN ĐƠN HÀNG
        </div>
        <div style={{ borderTop: '1px dashed var(--border-medium)', margin: '0.5rem 0' }}></div>
        <div>Mã đơn hàng: #{orderInvoice.id}</div>
        <div>Mã vận đơn (GHN): <span style={{ color: 'var(--primary-color)' }}>{orderInvoice.ghnOrderCode}</span></div>
        <div>Người nhận: {orderInvoice.customerName}</div>
        <div>SĐT: {orderInvoice.customerPhone}</div>
        <div>Địa chỉ: {orderInvoice.shippingAddress}</div>
        <div style={{ borderTop: '1px dashed var(--border-medium)', margin: '0.5rem 0' }}></div>
        <div>Sản phẩm:</div>
        {orderInvoice.orderDetails && orderInvoice.orderDetails.map((det, idx) => (
          <div key={idx} style={{ paddingLeft: '0.5rem' }}>
            - {det.productName || `Sản phẩm #${det.productId}`} x{det.quantity} ({det.price.toLocaleString('vi-VN')} đ)
          </div>
        ))}
        <div style={{ borderTop: '1px dashed var(--border-medium)', margin: '0.5rem 0' }}></div>
        <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
          TỔNG CỘNG: {orderInvoice.total.toLocaleString('vi-VN')} đ
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--bg-light)',
      borderRadius: 'var(--radius-sm)',
      marginTop: '0.8rem',
      padding: '1.25rem',
      color: 'var(--text-dark)',
      border: '1px solid var(--border-light)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      textAlign: 'left',
      boxSizing: 'border-box'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '0.82rem', borderBottom: '2px solid var(--border-light)', paddingBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-color)' }}>
        🛒 Bảng thanh toán & Lên đơn
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {items.map((it, idx) => {
          const { sizes, colors } = getItemOptions(it.id);
          return (
            <div key={it.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.75rem', backgroundColor: 'var(--bg-light)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%', color: 'var(--text-dark)' }}>{it.name}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{(it.price * it.quantity).toLocaleString('vi-VN')} đ</span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>SL:</span>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={it.quantity} 
                    onChange={e => {
                      const val = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
                      const newItems = [...items];
                      newItems[idx].quantity = val;
                      setItems(newItems);
                    }}
                    style={{ width: '45px', padding: '3px 6px', fontSize: '0.7rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Size:</span>
                  <select 
                    value={it.size} 
                    onChange={e => {
                      const newItems = [...items];
                      newItems[idx].size = e.target.value;
                      setItems(newItems);
                    }}
                    style={{ padding: '3px 6px', fontSize: '0.7rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', outline: 'none', cursor: 'pointer' }}
                  >
                    {sizes.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Màu:</span>
                  <select 
                    value={it.color} 
                    onChange={e => {
                      const newItems = [...items];
                      newItems[idx].color = e.target.value;
                      setItems(newItems);
                    }}
                    style={{ padding: '3px 6px', fontSize: '0.7rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', outline: 'none', cursor: 'pointer' }}
                  >
                    {colors.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input 
          type="text" 
          placeholder="Họ và Tên người nhận *" 
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          style={{ width: '100%', padding: '0.6rem 0.8rem', fontSize: '0.78rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', outline: 'none', boxSizing: 'border-box' }}
        />
        <input 
          type="text" 
          placeholder="Số điện thoại *" 
          value={customerPhone}
          onChange={e => setCustomerPhone(e.target.value)}
          style={{ width: '100%', padding: '0.6rem 0.8rem', fontSize: '0.78rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', outline: 'none', boxSizing: 'border-box' }}
        />
        <textarea 
          placeholder="Địa chỉ giao hàng *" 
          value={shippingAddress}
          onChange={e => setShippingAddress(e.target.value)}
          rows="2"
          style={{ width: '100%', padding: '0.6rem 0.8rem', fontSize: '0.78rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          placeholder="Mã giảm giá (KM10, GIAM50K)" 
          value={couponCode}
          onChange={e => setCouponCode(e.target.value)}
          style={{ flex: 1, padding: '0.6rem 0.8rem', fontSize: '0.72rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', outline: 'none' }}
        />
        <button 
          onClick={handleApplyCoupon}
          style={{ padding: '0.6rem 1rem', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 700 }}
        >
          Áp dụng
        </button>
      </div>
      {couponSuccess && <div style={{ fontSize: '0.68rem', color: 'var(--secondary-color)', fontWeight: 600 }}>{couponSuccess}</div>}
      {couponError && <div style={{ fontSize: '0.68rem', color: '#f5222d', fontWeight: 600 }}>{couponError}</div>}

      <div style={{ borderTop: '2px solid var(--border-light)', paddingTop: '0.6rem', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Tạm tính:</span>
          <span>{subtotal.toLocaleString('vi-VN')} đ</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Phí ship:</span>
          <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')} đ`}</span>
        </div>
        {discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff4d4f' }}>
            <span>Giảm giá:</span>
            <span>-{discountAmount.toLocaleString('vi-VN')} đ</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--border-light)', paddingTop: '0.3rem', fontSize: '0.78rem', color: 'var(--primary-color)' }}>
          <span>TỔNG TIỀN:</span>
          <span>{totalAmount.toLocaleString('vi-VN')} đ</span>
        </div>
      </div>

      {errorMsg && <div style={{ fontSize: '0.72rem', color: '#ff4d4f', fontWeight: 'bold' }}>{errorMsg}</div>}

      <button 
        onClick={handleOrderSubmit}
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '0.8rem',
          backgroundColor: 'var(--primary-color)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 'bold',
          fontSize: '0.78rem',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        {isSubmitting ? 'ĐANG TẠO ĐƠN HÀNG...' : 'XÁC NHẬN ĐẶT HÀNG (COD)'}
      </button>
    </div>
  );
};

// Fallback high quality// --- WIDGET 1: INTERACTIVE OUTFIT BOARD WIDGET ---
const OutfitBoardWidget = ({ dbProducts, addToCart, initialTab = 'casual' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // casual, office, evening
  const [purchaseStatus, setPurchaseStatus] = useState('');
  
  // Helper to find a product in dbProducts by keywords
  const findProductByKeywords = (keywords) => {
    if (!dbProducts || dbProducts.length === 0) return null;
    return dbProducts.find(p => 
      keywords.some(kw => p.name.toLowerCase().includes(kw))
    );
  };

  const rawOutfits = {
    casual: {
      name: 'Dạo Phố Tối Giản',
      desc: 'Một bản phối năng động và thoáng mát kết hợp kính mát/phụ kiện dạo phố. Thích hợp dạo phố, hẹn hò cuối tuần.',
      items: [
        { keywords: ['áo thun', 'cotton organic', 'áo phông', 'áo dáng suông'], fallbackSizes: ['S', 'M', 'L', 'XL'], type: 'Áo Top', defaultSize: 'M' },
        { keywords: ['kính mát', 'kính râm', 'mũ', 'lưỡi trai', 'phụ kiện'], fallbackSizes: ['FS'], type: 'Phụ Kiện', defaultSize: 'FS' }
      ],
      accent: '#B99B6B'
    },
    office: {
      name: 'Công Sở Thanh Lịch',
      desc: 'Bản phối phối hợp giữa sự thoải mái của áo thun/sơ mi cao cấp và phom dáng đứng chuẩn mực của quần tây xếp ly. Đơn giản mà cực kỳ sang trọng.',
      items: [
        { keywords: ['sơ mi', 'áo thun', 'cotton organic', 'áo phông', 'áo'], fallbackSizes: ['S', 'M', 'L', 'XL'], type: 'Áo Top', defaultSize: 'M' },
        { keywords: ['quần tây', 'quần âu', 'jean', 'quần xếp ly'], fallbackSizes: ['28', '29', '30', '31', '32', '34'], type: 'Quần Bottom', defaultSize: '30' }
      ],
      accent: '#000000'
    },
    evening: {
      name: 'Tiệc Tối Quyến Rũ',
      desc: 'Bản phối dạ tiệc hoàn hảo. Đầm lụa satin bóng mướt tự nhiên tôn trọn đường cong hoặc áo sơ mi lụa kết hợp phụ kiện.',
      items: [
        { keywords: ['đầm', 'váy', 'satin', 'sơ mi lụa'], fallbackSizes: ['S', 'M', 'L'], type: 'Váy Dress', defaultSize: 'M' },
        { keywords: ['kính mát', 'kính râm', 'giày', 'sneaker'], fallbackSizes: ['FS'], type: 'Phụ Kiện', defaultSize: 'FS' }
      ],
      accent: '#B99B6B'
    }
  };

  // Resolve items dynamically from dbProducts
  const resolveItem = (item) => {
    const dbProduct = findProductByKeywords(item.keywords);
    if (!dbProduct) return null;

    const sizes = dbProduct.variants && dbProduct.variants.length > 0
      ? Array.from(new Set(dbProduct.variants.map(v => v.size)))
      : item.fallbackSizes;

    let imageUrl = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200";
    if (dbProduct.images && dbProduct.images.length > 0) {
      const foundMain = dbProduct.images.find(img => img.isMain);
      imageUrl = foundMain ? foundMain.imageUrl : dbProduct.images[0].imageUrl;
    } else if (dbProduct.image) {
      imageUrl = dbProduct.image;
    }

    const hasSale = dbProduct.salePrice && dbProduct.salePrice > 0 && dbProduct.salePrice < dbProduct.price;
    const finalPrice = hasSale ? dbProduct.salePrice : dbProduct.price;
    return {
      id: dbProduct.id,
      productObj: dbProduct,
      type: item.type,
      name: dbProduct.name,
      price: finalPrice,
      originalPrice: dbProduct.price,
      hasSale: hasSale,
      defaultSize: sizes[0] || item.defaultSize,
      sizes: sizes,
      image: imageUrl
    };
  };

  // Filter outfits to only those that have resolved items
  const outfits = {};
  Object.keys(rawOutfits).forEach(key => {
    const resolvedItems = rawOutfits[key].items
      .map(resolveItem)
      .filter(item => item !== null);
    if (resolvedItems.length > 0) {
      outfits[key] = {
        ...rawOutfits[key],
        items: resolvedItems
      };
    }
  });

  const activeOutfitKey = outfits[activeTab] ? activeTab : Object.keys(outfits)[0];
  const currentOutfit = outfits[activeOutfitKey];

  const [selectedSizes, setSelectedSizes] = useState({});

  if (!currentOutfit) {
    return (
      <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
        Không tìm thấy sản phẩm phù hợp trong database để gợi ý Outfit.
      </div>
    );
  }

  const totalAmount = currentOutfit.items.reduce((sum, item) => sum + item.price, 0);

  const handleAddOutfitToCart = async () => {
    setPurchaseStatus('adding');
    
    try {
      for (const item of currentOutfit.items) {
        const chosenSize = selectedSizes[item.id] || item.defaultSize;
        await addToCart(item.productObj, 1, chosenSize, '');
      }
      setPurchaseStatus('success');
      setTimeout(() => setPurchaseStatus(''), 4000);
    } catch (err) {
      console.error(err);
      setPurchaseStatus('error');
      setTimeout(() => setPurchaseStatus(''), 3000);
    }
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--bg-light)',
      borderRadius: '20px',
      marginTop: '0.8rem',
      padding: '1.25rem',
      overflow: 'hidden',
      border: '1px solid var(--border-light)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
      boxSizing: 'border-box'
    }}>
      {/* Tab Switcher */}
      <div style={{ 
        display: 'flex', 
        backgroundColor: 'var(--bg-light)',
        padding: '4px',
        borderRadius: '12px',
        border: '1px solid var(--border-light)',
        marginBottom: '1rem'
      }}>
        {Object.keys(outfits).map(key => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              flex: 1,
              padding: '0.5rem 0.3rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textAlign: 'center',
              backgroundColor: activeOutfitKey === key ? 'var(--secondary-color)' : 'transparent',
              color: activeOutfitKey === key ? 'var(--primary-color)' : 'var(--text-muted)',
              borderRadius: '8px',
              border: activeOutfitKey === key ? '1px solid var(--border-medium)' : 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            {outfits[key].name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.5rem', lineHeight: '1.4' }}>
          "{currentOutfit.desc}"
        </p>

        {/* Outfit Components list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem' }}>
          {currentOutfit.items.map(item => {
            const size = selectedSizes[item.id] || item.defaultSize;
            const imgUrl = item.image;
            
            return (
              <div key={item.id} style={{
                display: 'flex',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-light)',
                border: '1px solid var(--border-light)',
                padding: '0.75rem',
                alignItems: 'center',
                borderRadius: '12px'
              }}>
                <Link
                  to={`/product/${item.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flex: 1,
                    minWidth: 0,
                    textDecoration: 'none',
                    color: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <img 
                    src={imgUrl} 
                    alt={item.name} 
                    style={{
                      width: '45px',
                      height: '60px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '6px',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-hover)', fontWeight: 700 }}>
                      {item.type}
                    </div>
                    <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)', margin: '0.1rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </h5>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      flexWrap: 'wrap'
                    }}>
                      <span>{item.price.toLocaleString('vi-VN')} đ</span>
                      {item.hasSale && (
                        <span style={{ fontSize: '0.72rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                          {item.originalPrice.toLocaleString('vi-VN')} đ
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Size Mini Picker */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cỡ:</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {item.sizes.map(sz => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSizes(prev => ({ ...prev, [item.id]: sz }))}
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '6px',
                          border: size === sz ? 'none' : '1px solid var(--border-medium)',
                          backgroundColor: size === sz ? 'var(--primary-color)' : 'var(--bg-light)',
                          color: size === sz ? '#FFFFFF' : 'var(--text-dark)',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Price & Add All Button */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Trọn bộ Outfit:</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-color)' }}>
              {totalAmount.toLocaleString('vi-VN')} đ
            </div>
          </div>

          <button
            onClick={handleAddOutfitToCart}
            disabled={purchaseStatus === 'adding'}
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: '10px',
              backgroundColor: purchaseStatus === 'success' ? '#52c41a' : 'var(--primary-color)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: purchaseStatus === 'adding' ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: purchaseStatus === 'success' ? 'none' : '0 4px 12px rgba(108, 99, 255, 0.2)'
            }}
          >
            {purchaseStatus === 'adding' ? (
              <>
                <i className="ri-loader-4-line" style={{ animation: 'spin 1s linear infinite' }}></i>
                Đang xử lý...
              </>
            ) : purchaseStatus === 'success' ? (
              <>
                <i className="ri-checkbox-circle-line"></i>
                Đã thêm cả bộ ✓
              </>
            ) : (
              <>
                <i className="ri-shopping-bag-3-line"></i>
                MUA TRỌN BỘ OUTFIT
              </>
            )}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};


// --- WIDGET 2: INTERACTIVE AI SIZE SELECTOR WIDGET ---
const SizeCalculatorWidget = ({ onApplySize, initialHeight = 165, initialWeight = 55 }) => {
  const [category, setCategory] = useState('clothing'); // clothing, pants, shoes
  const [height, setHeight] = useState(initialHeight);
  const [weight, setWeight] = useState(initialWeight);
  const [fit, setFit] = useState('fit'); // small, fit, large
  const [length, setLength] = useState('just right'); // slightly short, just right, slightly long
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (initialHeight) setHeight(initialHeight);
    if (initialWeight) setWeight(initialWeight);
  }, [initialHeight, initialWeight]);

  const calculateSize = async () => {
    setIsLoading(true);
    setResult(null);

    // Prepare sizes list based on category
    let sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    if (category === 'pants') sizes = ['28', '29', '30', '31', '32', '33', '34', '36'];
    if (category === 'shoes') sizes = ['36', '37', '38', '39', '40', '41', '42', '43'];

    try {
      const response = await fetch('/ai-fit/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          available_sizes: sizes,
          height: parseFloat(height),
          weight: parseFloat(weight),
          fit: fit,
          length: length
        })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setResult(data);
    } catch (e) {
      console.warn("Lỗi khi kết nối API Recommend, sử dụng Heuristic offline...", e);
      // Fallback Heuristic
      simulateHeuristicResult(sizes);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateHeuristicResult = (sizes) => {
    setTimeout(() => {
      let recSize = 'M';
      let score = 95;
      let quality = 'Excellent';

      if (category === 'clothing') {
        if (weight <= 48) { recSize = 'S'; score = 93; }
        else if (weight <= 56) { recSize = 'M'; score = 96; }
        else if (weight <= 64) { recSize = 'L'; score = 95; }
        else if (weight <= 73) { recSize = 'XL'; score = 92; }
        else { recSize = 'XXL'; score = 89; }

        if (fit === 'large') {
          const idx = sizes.indexOf(recSize);
          if (idx !== -1 && idx < sizes.length - 1) recSize = sizes[idx + 1];
        } else if (fit === 'small') {
          const idx = sizes.indexOf(recSize);
          if (idx !== -1 && idx > 0) recSize = sizes[idx - 1];
        }
      } else if (category === 'pants') {
        if (weight <= 50) recSize = '28';
        else if (weight <= 55) recSize = '29';
        else if (weight <= 60) recSize = '30';
        else if (weight <= 66) recSize = '31';
        else if (weight <= 73) recSize = '32';
        else recSize = '34';
      } else {
        if (height <= 155) recSize = '36';
        else if (height <= 162) recSize = '37';
        else if (height <= 168) recSize = '38';
        else if (height <= 174) recSize = '39';
        else if (height <= 180) recSize = '40';
        else recSize = '42';
      }

      setResult({
        recommended_size: recSize,
        recommended_fit_quality: quality,
        recommended_satisfaction_score: score
      });
    }, 800);
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--bg-light)',
      borderRadius: '20px',
      marginTop: '0.8rem',
      padding: '1.25rem',
      border: '1px solid var(--border-light)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
      boxSizing: 'border-box'
    }}>
      <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '0.8rem' }}>
        📏 SmartFit AI - Tính Size Chuẩn Xác
      </h4>

      {/* Category Selection */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { id: 'clothing', label: '🧥 Áo & Đầm' },
          { id: 'pants', label: '👖 Quần Tây' },
          { id: 'shoes', label: '👟 Giày dép' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => { setCategory(cat.id); setResult(null); }}
            style={{
              flex: 1,
              padding: '0.45rem 0.2rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: category === cat.id ? 'none' : '1px solid var(--border-medium)',
              backgroundColor: category === cat.id ? 'var(--primary-color)' : 'var(--bg-light)',
              color: category === cat.id ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Height / Weight Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>
            <span>Chiều cao:</span>
            <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{height} cm</span>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button onClick={() => setHeight(prev => Math.max(140, prev - 1))} style={{ width: '26px', height: '26px', border: '1px solid var(--border-medium)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', cursor: 'pointer' }}>-</button>
            <input 
              type="range" 
              min="140" 
              max="200" 
              value={height}
              onChange={e => setHeight(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--primary-color)', height: '6px', cursor: 'pointer', borderRadius: '3px' }}
            />
            <button onClick={() => setHeight(prev => Math.min(200, prev + 1))} style={{ width: '26px', height: '26px', border: '1px solid var(--border-medium)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', cursor: 'pointer' }}>+</button>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>
            <span>Cân nặng:</span>
            <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{weight} kg</span>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button onClick={() => setWeight(prev => Math.max(35, prev - 1))} style={{ width: '26px', height: '26px', border: '1px solid var(--border-medium)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', cursor: 'pointer' }}>-</button>
            <input 
              type="range" 
              min="35" 
              max="120" 
              value={weight}
              onChange={e => setWeight(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--primary-color)', height: '6px', cursor: 'pointer', borderRadius: '3px' }}
            />
            <button onClick={() => setWeight(prev => Math.min(120, prev + 1))} style={{ width: '26px', height: '26px', border: '1px solid var(--border-medium)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', cursor: 'pointer' }}>+</button>
          </div>
        </div>
      </div>

      {/* Advanced Customizations */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Sở thích mặc:</label>
          <select 
            value={fit}
            onChange={e => setFit(e.target.value)}
            style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: '8px', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', outline: 'none', cursor: 'pointer' }}
          >
            <option value="small">Ôm sát dáng</option>
            <option value="fit">Vừa vặn (Tiêu chuẩn)</option>
            <option value="large">Mặc rộng rãi</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Chiều dài áo/quần:</label>
          <select 
            value={length}
            onChange={e => setLength(e.target.value)}
            style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: '8px', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', outline: 'none', cursor: 'pointer' }}
          >
            <option value="slightly short">Hơi ngắn cá tính</option>
            <option value="just right">Vừa chuẩn chiều cao</option>
            <option value="slightly long">Hơi dài thụng</option>
          </select>
        </div>
      </div>

      {/* Run Action */}
      {!result ? (
        <button
          onClick={calculateSize}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'var(--primary-color)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 12px rgba(108, 99, 255, 0.2)'
          }}
        >
          {isLoading ? (
            <>
              <i className="ri-loader-4-line" style={{ animation: 'spin 1s linear infinite' }}></i>
              Đang phân tích số đo...
            </>
          ) : (
            <>
              <i className="ri-scan-focus-line"></i>
              PHÂN TÍCH KÍCH CỠ BẰNG AI
            </>
          )}
        </button>
      ) : (
        /* Result Rendering */
        <div style={{
          backgroundColor: 'var(--bg-light)',
          border: '1px solid var(--border-light)',
          borderRadius: '16px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: 600 }}>
            Size đề xuất cho bạn:
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-color)', fontFamily: 'var(--font-display)', lineHeight: '1', margin: '0.2rem 0' }}>
            Size {result.recommended_size}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', margin: '0.4rem 0' }}>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '0.2rem 0.5rem',
              backgroundColor: 'rgba(94, 106, 210, 0.1)',
              color: 'var(--primary-hover)',
              borderRadius: '6px',
              border: '1px solid var(--border-medium)'
            }}>
              Độ Khớp: {result.recommended_fit_quality === 'Excellent' ? 'Tuyệt Vời ✓' : 'Tốt ✓'}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dark)' }}>
              Độ hài lòng: {result.recommended_satisfaction_score}%
            </span>
          </div>

          {/* Glowing progress bar */}
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-light)', borderRadius: '4px', margin: '0.6rem 0 1rem 0', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              width: `${result.recommended_satisfaction_score}%`,
              height: '100%',
              backgroundColor: 'var(--primary-color)',
              borderRadius: '4px',
              transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />
          </div>

          <button
            onClick={() => onApplySize(result.recommended_size)}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--primary-color)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(108, 99, 255, 0.2)'
            }}
          >
            ÁP DỤNG KÍCH CỠ NÀY
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};


// --- PRODUCT CAROUSEL COMPONENT ---
const ProductCarousel = ({ products, addToCart }) => {
  const [addedIds, setAddedIds] = useState({});

  const handleAdd = (product) => {
    addToCart(product, 1, 'M', '');
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      marginTop: '0.75rem',
      width: '100%'
    }}>
      <div style={{
        fontSize: '0.8rem',
        fontWeight: 750,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--primary-color)',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '0.3rem'
      }}>
        Sản phẩm gợi ý:
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%'
      }}>
        {products.map(p => {
          let mainImage = null;
          if (p.images && p.images.length > 0) {
            const foundMain = p.images.find(img => img.isMain);
            mainImage = foundMain ? foundMain.imageUrl : p.images[0].imageUrl;
          }
          if (!mainImage) {
            mainImage = p.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100";
          }
          
          const hasSale = p.salePrice && p.salePrice > 0 && p.salePrice < p.price;
          const priceStr = hasSale 
            ? `${parseInt(p.salePrice).toLocaleString('vi-VN')} đ`
            : (p.price ? `${parseInt(p.price).toLocaleString('vi-VN')} đ` : 'N/A');

          return (
            <div key={p.id} style={{
              display: 'flex',
              gap: '0.75rem',
              backgroundColor: 'var(--bg-light)',
              border: '1px solid var(--border-light)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              padding: '0.6rem 0.75rem',
              alignItems: 'center',
              transition: 'all 0.2s ease',
              width: '100%',
              borderRadius: '12px',
              boxSizing: 'border-box'
            }}>
              <Link 
                to={`/product/${p.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flex: 1,
                  minWidth: 0,
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer'
                }}
              >
                {mainImage ? (
                  <img 
                    src={mainImage} 
                    alt={p.name} 
                    style={{
                      width: '50px',
                      height: '65px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      borderRadius: '6px'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '50px',
                    height: '65px',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    borderRadius: '6px'
                  }}>
                    No Img
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--text-dark)',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {p.name}
                  </h4>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--primary-color)',
                    marginTop: '0.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    flexWrap: 'wrap'
                  }}>
                    <span>{priceStr}</span>
                    {hasSale && (
                      <span style={{ fontSize: '0.72rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                        {parseInt(p.price).toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
                <Link 
                  to={`/product/${p.id}`}
                  style={{
                    fontSize: '0.72rem',
                    textDecoration: 'none',
                    color: 'var(--primary-color)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-light)',
                    padding: '0.35rem 0.5rem',
                    textAlign: 'center',
                    fontWeight: 700,
                    transition: 'all 0.2s ease',
                    borderRadius: '6px'
                  }}
                >
                  Chi tiết
                </Link>
                <button
                  onClick={() => handleAdd(p)}
                  style={{
                    fontSize: '0.72rem',
                    backgroundColor: addedIds[p.id] ? 'var(--secondary-color)' : 'var(--primary-color)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.35rem 0.5rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                    transition: 'all 0.2s ease',
                    borderRadius: '6px'
                  }}
                >
                  {addedIds[p.id] ? 'Đã thêm ✓' : 'Thêm giỏ'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// --- WIDGET 4: INTERACTIVE PRODUCT PREFERENCE SELECTOR ---
const PreferenceWidget = ({ dbProducts, addToCart }) => {
  const [style, setStyle] = useState('all'); 
  const [category, setCategory] = useState('all'); 
  const [priceRange, setPriceRange] = useState('all'); 
  const [filtered, setFiltered] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    let prods = [...dbProducts];

    if (prods.length === 0) {
      setFiltered([]);
      setSearched(true);
      return;
    }

    // Filter style
    if (style !== 'all') {
      if (style === 'minimalist') {
        prods = prods.filter(p => p.name.toLowerCase().includes('cotton') || p.name.toLowerCase().includes('basic') || p.name.toLowerCase().includes('dáng suông') || p.name.toLowerCase().includes('hoodie'));
      } else if (style === 'elegant') {
        prods = prods.filter(p => p.name.toLowerCase().includes('âu tây') || p.name.toLowerCase().includes('xếp ly') || p.name.toLowerCase().includes('sơ mi') || p.name.toLowerCase().includes('slimfit'));
      } else if (style === 'evening') {
        prods = prods.filter(p => p.name.toLowerCase().includes('satin') || p.name.toLowerCase().includes('đầm') || p.name.toLowerCase().includes('váy') || p.name.toLowerCase().includes('kính'));
      } else if (style === 'activewear') {
        prods = prods.filter(p => p.name.toLowerCase().includes('jean') || p.name.toLowerCase().includes('sneaker') || p.name.toLowerCase().includes('short') || p.name.toLowerCase().includes('mũ') || p.name.toLowerCase().includes('lưỡi trai'));
      }
    }

    // Filter category
    if (category !== 'all') {
      if (category === 'top') {
        prods = prods.filter(p => p.name.toLowerCase().includes('áo') || p.name.toLowerCase().includes('đầm') || p.name.toLowerCase().includes('hoodie') || p.name.toLowerCase().includes('váy'));
      } else if (category === 'bottom') {
        prods = prods.filter(p => p.name.toLowerCase().includes('quần'));
      } else if (category === 'accessory') {
        prods = prods.filter(p => p.name.toLowerCase().includes('kính') || p.name.toLowerCase().includes('mũ') || p.name.toLowerCase().includes('giày') || p.name.toLowerCase().includes('sneaker') || p.name.toLowerCase().includes('lưỡi trai'));
      }
    }

    // Filter price
    if (priceRange !== 'all') {
      prods = prods.filter(p => {
        const actualPrice = p.salePrice && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price;
        if (!actualPrice) return false;
        if (priceRange === 'under300') {
          return actualPrice < 300000;
        } else if (priceRange === '300to500') {
          return actualPrice >= 300000 && actualPrice <= 500000;
        } else if (priceRange === 'over500') {
          return actualPrice > 500000;
        }
        return true;
      });
    }

    setFiltered(prods);
    setSearched(true);
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--bg-light)',
      borderRadius: '20px',
      marginTop: '0.8rem',
      padding: '1.25rem',
      border: '1px solid var(--border-light)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
      boxSizing: 'border-box'
    }}>
      <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '0.8rem' }}>
        🛍️ Gợi Ý Phong Cách Theo Sở Thích
      </h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Phong cách của bạn:</label>
          <select value={style} onChange={e => { setStyle(e.target.value); setSearched(false); }} style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: '8px', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', outline: 'none', cursor: 'pointer' }}>
            <option value="all">Tất cả phong cách</option>
            <option value="minimalist">Tối giản (Quiet Luxury)</option>
            <option value="elegant">Thanh lịch (Office / Công sở)</option>
            <option value="evening">Quyến rũ (Dạ tiệc / Tối)</option>
            <option value="activewear">Năng động (Dạo phố / Thể thao)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Danh mục sản phẩm:</label>
          <select value={category} onChange={e => { setCategory(e.target.value); setSearched(false); }} style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: '8px', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', outline: 'none', cursor: 'pointer' }}>
            <option value="all">Tất cả danh mục</option>
            <option value="top">Áo & Đầm váy</option>
            <option value="bottom">Quần tây & Jean</option>
            <option value="accessory">Giày, Kính & Mũ nón</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Tầm giá tiền:</label>
          <select value={priceRange} onChange={e => { setPriceRange(e.target.value); setSearched(false); }} style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: '8px', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', outline: 'none', cursor: 'pointer' }}>
            <option value="all">Mọi mức giá</option>
            <option value="under300">Dưới 300,000đ</option>
            <option value="300to500">Từ 300,000đ - 500,000đ</option>
            <option value="over500">Trên 500,000đ</option>
          </select>
        </div>
      </div>

      <button onClick={handleSearch} style={{
        width: '100%',
        padding: '0.7rem',
        backgroundColor: 'var(--primary-color)',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '10px',
        fontWeight: 700,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 4px 12px rgba(108, 99, 255, 0.2)'
      }}>
        TÌM SẢN PHẨM PHÙ HỢP
      </button>

      {searched && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.8rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
            Sản phẩm gợi ý ({filtered.length}):
          </div>
          {filtered.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem 0' }}>
              Không tìm thấy mẫu phù hợp. Hãy thử bộ lọc khác nhé!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '180px', overflowY: 'auto' }}>
              {filtered.map(p => {
                let imgUrl = null;
                if (p.images && p.images.length > 0) {
                  const foundMain = p.images.find(img => img.isMain);
                  imgUrl = foundMain ? foundMain.imageUrl : p.images[0].imageUrl;
                }
                if (!imgUrl) {
                  imgUrl = p.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100";
                }
                return (
                  <div key={p.id} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', backgroundColor: 'var(--bg-light)', border: '1px solid var(--border-medium)', padding: '0.5rem', borderRadius: '10px' }}>
                    <Link
                      to={`/product/${p.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        flex: 1,
                        minWidth: 0,
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer'
                      }}
                    >
                      <img src={imgUrl} alt={p.name} style={{ width: '35px', height: '45px', objectFit: 'cover', border: '1px solid var(--border-light)', flexShrink: 0, borderRadius: '6px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-dark)' }}>{p.name}</div>
                        <div style={{
                          fontSize: '0.7rem',
                          fontWeight: 750,
                          color: 'var(--primary-color)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          flexWrap: 'wrap'
                        }}>
                          <span>{parseInt(p.salePrice && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price).toLocaleString('vi-VN')} đ</span>
                          {p.salePrice && p.salePrice > 0 && p.salePrice < p.price && (
                            <span style={{ fontSize: '0.65rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                              {parseInt(p.price).toLocaleString('vi-VN')} đ
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <Link to={`/product/${p.id}`} style={{ fontSize: '0.68rem', textDecoration: 'none', color: 'var(--primary-color)', padding: '0.25rem 0.45rem', fontWeight: 700, borderRadius: '6px', backgroundColor: 'var(--bg-light)', border: '1px solid var(--border-medium)' }}>Xem</Link>
                      <button onClick={() => addToCart(p, 1, 'M', '')} style={{ fontSize: '0.68rem', backgroundColor: 'var(--primary-color)', color: '#FFF', border: 'none', padding: '0.25rem 0.45rem', cursor: 'pointer', fontWeight: 700, borderRadius: '6px' }}>+Giỏ</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// --- WIDGET 5: INTERACTIVE ORDER TRACKER WIDGET ---
const OrderTrackerWidget = ({ initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrders = async (searchVal) => {
    if (!searchVal.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setOrders([]);
    
    let cleanSearchVal = searchVal.trim();
    if (cleanSearchVal.startsWith('#')) {
      cleanSearchVal = cleanSearchVal.substring(1).trim();
    }
    
    try {
      const response = await fetch(`/identity/api/orders/track?query=${encodeURIComponent(cleanSearchVal)}`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.warn("Lỗi khi kết nối API Order Tracker, sử dụng LocalStorage fallback...", err);
      // Fallback: search in localorders
      const localOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
      const results = localOrders.filter(o => 
        String(o.id) === cleanSearchVal || 
        (o.orderCode && String(o.orderCode).toUpperCase() === cleanSearchVal.toUpperCase()) ||
        (o.customerPhone && o.customerPhone.includes(cleanSearchVal)) ||
        (o.ghnOrderCode && o.ghnOrderCode.toUpperCase() === cleanSearchVal.toUpperCase())
      );
      setOrders(results);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const getStatusText = (status) => {
    const s = status ? status.toUpperCase() : 'PENDING';
    if (s === 'PENDING') return 'Chờ xác nhận';
    if (s === 'CONFIRMED') return 'Đang chuẩn bị';
    if (s === 'SHIPPING') return 'Đang giao hàng';
    if (s === 'COMPLETED') return 'Giao hàng thành công';
    if (s === 'CANCELLED') return 'Đã hủy đơn';
    return status;
  };

  const getStatusStep = (status) => {
    const s = status ? status.toUpperCase() : 'PENDING';
    if (s === 'CANCELLED') return -1;
    if (s === 'PENDING') return 1;
    if (s === 'CONFIRMED') return 2;
    if (s === 'SHIPPING') return 3;
    if (s === 'COMPLETED') return 4;
    return 1;
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      fetchOrders(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = () => {
    fetchOrders(query);
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--bg-light)',
      borderRadius: '20px',
      marginTop: '0.8rem',
      padding: '1.25rem',
      border: '1px solid var(--border-light)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
      boxSizing: 'border-box'
    }}>
      <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '0.8rem' }}>
        🚚 Tra Cứu Trạng Thái Đơn Hàng
      </h4>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
        <input
          type="text"
          placeholder="Nhập SĐT hoặc Mã đơn hàng (VD: 1, GHN12345)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '0.6rem 0.8rem',
            fontSize: '0.8rem',
            border: '1px solid var(--border-medium)',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-light)',
            color: 'var(--text-dark)',
            outline: 'none'
          }}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: '0.6rem 1rem',
            backgroundColor: 'var(--primary-color)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {loading ? '...' : 'TÌM'}
        </button>
      </div>

      {searched && (
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.8rem' }}>
          {orders.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'red', fontStyle: 'italic', textAlign: 'center' }}>
              Không tìm thấy thông tin đơn hàng trùng khớp.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map((order, idx) => {
                const step = getStatusStep(order.status);
                return (
                  <div key={order.id || idx} style={{ border: '1px solid var(--border-light)', padding: '0.85rem', backgroundColor: 'var(--bg-light)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-medium)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                        ĐƠN HÀNG #{order.orderCode || order.id}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: order.status === 'CANCELLED' ? 'red' : 'var(--secondary-color)' }}>
                        {getStatusText(order.status)}
                      </span>
                    </div>

                    {/* Shipping Timeline Progress Bar */}
                    {step !== -1 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 1.25rem 0', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '9px', left: '10px', right: '10px', height: '4px', backgroundColor: 'var(--border-light)', borderRadius: '2px', zIndex: 1 }}>
                          <div style={{ width: `${(step - 1) * 33.3}%`, height: '100%', backgroundColor: 'var(--primary-color)', transition: 'width 0.4s ease', borderRadius: '2px' }} />
                        </div>
                        {[
                          { val: 1, label: 'Đặt đơn' },
                          { val: 2, label: 'Chuẩn bị' },
                          { val: 3, label: 'Đang giao' },
                          { val: 4, label: 'Đã nhận' }
                        ].map(s => (
                          <div key={s.val} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: step >= s.val ? 'var(--primary-color)' : 'var(--bg-light)',
                              border: step >= s.val ? 'none' : '1px solid var(--border-medium)',
                              color: step >= s.val ? '#FFFFFF' : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.6rem',
                              fontWeight: 700
                            }}>
                              {step >= s.val ? '✓' : s.val}
                            </div>
                            <span style={{ fontSize: '0.55rem', color: step >= s.val ? 'var(--text-dark)' : 'var(--text-muted)', marginTop: '0.25rem', fontWeight: step >= s.val ? 700 : 500 }}>
                              {s.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Order Details */}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                      <div>👨 Khách hàng: <strong style={{ color: 'var(--text-dark)' }}>{order.customerName || 'N/A'}</strong></div>
                      <div>📞 Điện thoại: {order.customerPhone || 'N/A'}</div>
                      <div>📍 Địa chỉ: {order.shippingAddress || 'N/A'}</div>
                      {order.ghnOrderCode && (
                        <div style={{ color: 'var(--primary-color)', fontWeight: 700 }}>
                          📦 Vận đơn GHN: {order.ghnOrderCode}
                        </div>
                      )}
                    </div>

                    {/* Items List */}
                    {order.items && order.items.length > 0 && (
                      <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: 600 }}>Sản phẩm:</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {order.items.map((item, iIdx) => {
                            const pName = item.productName || (item.product ? item.product.name : 'Sản phẩm Bờ Nờ');
                            let imgUrl = null;
                            if (item.product && item.product.images && item.product.images.length > 0) {
                              const foundMain = item.product.images.find(img => img.isMain);
                              imgUrl = foundMain ? foundMain.imageUrl : item.product.images[0].imageUrl;
                            }
                            if (!imgUrl) {
                              imgUrl = item.productImage || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100";
                            }
                            return (
                              <div key={iIdx} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.72rem' }}>
                                <img src={imgUrl} alt={pName} style={{ width: '25px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-dark)' }}>
                                  {pName}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                                  ({item.size || 'M'}) x{item.quantity}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: '0.4rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Thanh toán: <strong style={{ color: 'var(--text-dark)' }}>{order.paymentMethod || 'COD'}</strong></span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                        Tổng: {parseInt(order.totalAmount).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// --- MAIN CHATBOX COMPONENT ---
export default function Chatbox() {
  const { cartItems, cartCount, addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(() => {
    return sessionStorage.getItem('chatbox_is_open') === 'true';
  });
  const [dbProducts, setDbProducts] = useState([]);
  const [userName, setUserName] = useState('');
  
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Lỗi khi parse chat history từ sessionStorage:', e);
      }
    }
    return [
      {
        id: 1,
        sender: 'bot',
        text: 'Xin chào quý khách! Tôi là Trợ Lý Thời Trang AI của Bờ Nờ Store. Rất hân hạnh được đồng hành và tư vấn phong cách tối giản cao cấp cho bạn hôm nay.',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  useEffect(() => {
    sessionStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem('chatbox_is_open', isOpen);
  }, [isOpen]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const renderWidget = (widget) => {
    if (!widget) return null;
    switch (widget.type) {
      case 'size':
        return <SizeCalculatorWidget onApplySize={handleApplySizeResult} initialHeight={widget.props.initialHeight} initialWeight={widget.props.initialWeight} />;
      case 'outfit':
        return <OutfitBoardWidget dbProducts={dbProducts} addToCart={addToCart} />;
      case 'preference':
        return <PreferenceWidget dbProducts={dbProducts} addToCart={addToCart} />;
      case 'tracking':
        return <OrderTrackerWidget initialQuery={widget.props.initialQuery} />;
      case 'checkout':
        return <CheckoutWidget items={widget.props.items} dbProducts={dbProducts} />;
      case 'carousel':
        const carouselProducts = dbProducts.filter(p => widget.props.productIds.includes(p.id));
        if (carouselProducts.length === 0) return null;
        return <ProductCarousel products={carouselProducts} addToCart={addToCart} />;
      default:
        return null;
    }
  };

  // Fetch products catalog for real-time recommendations
  useEffect(() => {
    fetch('/identity/api/products')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('API error');
      })
      .then(data => {
        // Unwrap paginated data structure if necessary
        const productList = data && data.content ? data.content : (Array.isArray(data) ? data : []);
        if (productList.length > 0) {
          setDbProducts(productList);
        }
      })
      .catch(err => console.log('Lỗi khi fetch sản phẩm trong Chatbox:', err));
  }, []);

  const [showWelcome, setShowWelcome] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Show welcome popup after 3 seconds if not open
  useEffect(() => {
    const hasBeenClosed = sessionStorage.getItem('chatbox_welcome_closed');
    if (!isOpen && !hasBeenClosed) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Sync user details and customize greeting dynamically
  useEffect(() => {
    const userData = localStorage.getItem('user');
    let name = '';
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed && parsed.name) {
          name = parsed.name;
          setUserName(name);
        }
      } catch (e) {}
    } else {
      setUserName('');
    }

    // Chỉ cập nhật lời chào ban đầu nếu chưa có lịch sử trò chuyện được lưu
    const hasHistory = sessionStorage.getItem('chat_history');
    if (!hasHistory) {
      let welcomeText = name 
        ? `Xin chào **${name}**! Chào mừng bạn quay trở lại với **Bờ Nờ Store**.\n\nTôi là **Bờ Nờ AI** - Trợ lý Thời trang và Phong cách cá nhân của bạn. Rất vui được đồng hành cùng bạn hôm nay để:\n- 📏 **Chọn size chuẩn xác** bằng công nghệ SmartFit AI.\n- 👗 **Tư vấn và gợi ý phối đồ** (Outfit) theo phong cách tối giản Quiet Luxury.\n- 🎁 Cập nhật **Ưu đãi độc quyền & Sale** mới nhất.\n\nBạn muốn tôi bắt đầu tư vấn từ đâu ạ?` 
        : 'Xin chào quý khách! Chào mừng bạn đến với **Bờ Nờ Store**.\n\nTôi là **Bờ Nờ AI** - Trợ lý Thời trang và Phong cách cá nhân của bạn. Hôm nay tôi có thể đồng hành cùng bạn để:\n- 📏 **Chọn size chuẩn xác** bằng công nghệ SmartFit AI.\n- 👗 **Tư vấn và gợi ý phối đồ** (Outfit) theo phong cách tối giản Quiet Luxury.\n- 🎁 Cập nhật **Ưu đãi độc quyền & Sale** mới nhất.\n\nBạn muốn tôi bắt đầu tư vấn từ đâu ạ?';

      setMessages([
        {
          id: 1,
          sender: 'bot',
          text: welcomeText,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [userName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isTyping, isOpen]);

  // Intercept size application
  const handleApplySizeResult = (size) => {
    localStorage.setItem('user_preferred_size', size);
    
    // Add user response simulated in chat
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: `Tôi chọn áp dụng size ${size} cho tài khoản.`,
      component: null,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const botMsg = {
      id: Date.now() + 1,
      sender: 'bot',
      text: `Tuyệt vời! Hệ thống đã ghi nhận kích cỡ chuẩn của bạn là **Size ${size}**. Từ bây giờ, các sản phẩm sẽ được tự động tối ưu phom dáng này cho bạn. Bạn có cần tôi tư vấn thêm về sản phẩm hoặc cách phối đồ nào khác không ạ?`,
      component: null,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  // Main sending router
  const handleSendMessage = async (text, isQuickReply = false) => {
    if (!text.trim() || isTyping) return;

    const userMessageText = text;
    
    // Add user message to state
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: userMessageText,
      component: null,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!isQuickReply) {
      setInputText('');
    }

    setIsTyping(true);

    // Core intent routing check for ultra-fast responsive automatic widgets
    const normalizedText = userMessageText.toLowerCase();

    // 1. OUTFIT WIDGET INTENT
    if (normalizedText.includes('outfit') || normalizedText.includes('phối đồ') || normalizedText.includes('mix đồ') || normalizedText.includes('set đồ')) {
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Dạ, tôi xin gợi ý 3 bản phối outfit phong cách tối giản cao cấp (Quiet Luxury) được ưa chuộng nhất tại Bờ Nờ Store. Bạn có thể chọn size riêng lẻ từng món và đặt mua trọn bộ trực tiếp tại đây nhé:',
          widget: { type: 'outfit' },
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // 2. SIZE SELECTOR INTENT
    if (normalizedText.includes('size') || normalizedText.includes('chọn cỡ') || normalizedText.includes('chọn size') || normalizedText.includes('chiều cao') || normalizedText.includes('cân nặng')) {
      let userHeight = 165;
      let userWeight = 55;
      
      const cleanInput = normalizedText
        .replace(/\b1m([5-9]\d)\b/g, '1$1')
        .replace(/\b1m([5-9])\b/g, '1$10')
        .replace(/\b1[.,]([5-9]\d)\s*m\b/g, '1$1')
        .replace(/\b1[.,]([5-9]\d)\b/g, '1$1');
        
      const hMatch = cleanInput.match(/\b(1[4-9]\d|2[0-1]\d)\b/);
      const wMatch = cleanInput.match(/\b([3-9]\d|1[0-4]\d)\b/);
      if (hMatch) userHeight = parseInt(hMatch[1]);
      if (wMatch) userWeight = parseInt(wMatch[1]);

      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Vâng ạ! Để tư vấn kích cỡ chuẩn xác, bạn vui lòng điều chỉnh chiều cao, cân nặng và chọn loại sản phẩm bên dưới. Trí tuệ nhân tạo SmartFit AI sẽ tính toán ngay size phù hợp nhất cho bạn:',
          widget: { type: 'size', props: { initialHeight: userHeight, initialWeight: userWeight } },
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // 2.2 PREFERENCE INTENT
    if (normalizedText.includes('sở thích') || normalizedText.includes('phong cách') || normalizedText.includes('hobbies') || normalizedText.includes('style')) {
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Dạ, mời bạn lựa chọn phong cách và danh mục bên dưới để tôi gợi ý sản phẩm phù hợp nhất nhé:',
          widget: { type: 'preference' },
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // 2.3 ORDER TRACKER INTENT
    if (normalizedText.includes('tra cứu đơn') || normalizedText.includes('theo dõi đơn') || normalizedText.includes('đơn hàng') || normalizedText.includes('vận đơn') || normalizedText.includes('track')) {
      // Extract numeric query, GHN code, or phone number if available
      const ghnMatch = normalizedText.match(/\b(ghn\d+|ghn-\d+|ghn\s+\d+)\b/i);
      const phoneMatch = normalizedText.match(/\b(0[35789]\d{8})\b/);
      const idMatch = normalizedText.match(/\b(\d{1,6})\b/);
      
      let initQuery = '';
      if (ghnMatch) initQuery = ghnMatch[1].replace(/\s+/g, '').toUpperCase();
      else if (phoneMatch) initQuery = phoneMatch[1];
      else if (idMatch && !normalizedText.includes('cm') && !normalizedText.includes('kg')) initQuery = idMatch[1];

      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: initQuery 
            ? `Dạ, tôi ghi nhận thông tin tra cứu **${initQuery}**. Bạn xem trạng thái chi tiết của đơn hàng dưới đây nhé:`
            : 'Dạ, mời bạn nhập số điện thoại hoặc mã đơn hàng vào tiện ích bên dưới để tôi kiểm tra hành trình đơn hàng nhé:',
          widget: { type: 'tracking', props: { initialQuery: initQuery } },
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // 3. OTHER GENERAL AUTO-RESPONSES (Fast, Offline-first checks)
    let autoReplyText = '';
    if (normalizedText.includes('ưu đãi') || normalizedText.includes('khuyến mãi') || normalizedText.includes('sale') || normalizedText.includes('giảm giá')) {
      autoReplyText = 'Hiện tại Bờ Nờ Store đang áp dụng chương trình ưu đãi độc quyền: **FREESHIP** toàn quốc cho đơn hàng từ 500k và tặng ngay mã giảm giá **LUXURY10** (giảm 10% tổng đơn) dành riêng cho khách hàng mới đấy ạ!';
    } else if (normalizedText.includes('ship') || normalizedText.includes('giao hàng') || normalizedText.includes('vận chuyển') || normalizedText.includes('phí ship')) {
      autoReplyText = 'Dạ, Bờ Nờ Store hỗ trợ giao hàng toàn quốc:\n- **Miễn phí vận chuyển (Freeship)** cho tất cả đơn hàng từ 500,000đ trở lên.\n- Các đơn hàng dưới 500,000đ sẽ tính phí ship đồng giá 30,000đ qua đơn vị vận chuyển GHN. Thời gian nhận hàng là từ 2 - 4 ngày làm việc.';
    } else if (normalizedText.includes('đổi trả') || normalizedText.includes('trả hàng') || normalizedText.includes('hoàn tiền')) {
      autoReplyText = 'Với mong muốn bạn hoàn toàn hài lòng, Bờ Nờ hỗ trợ chính sách **đổi trả miễn phí tại nhà trong vòng 30 ngày** kể từ khi nhận hàng. Chỉ cần hàng còn nguyên tag mác và chưa qua sử dụng, shipper sẽ đến tận nhà thu hồi và đổi hàng mới cho bạn hoàn toàn miễn phí!';
    } else if (normalizedText.includes('chất liệu') || normalizedText.includes('vải') || normalizedText.includes('cotton')) {
      autoReplyText = 'Các sản phẩm cốt lõi tại Bờ Nờ Store được dệt từ **100% Cotton Organic** tự nhiên cao cấp và lụa satin hảo hạng. Sợi vải hữu cơ siêu mềm, thấm hút mồ hôi cực tốt, bền bỉ và không gây kích ứng da, bảo vệ sức khoẻ tối đa.';
    } else if (normalizedText.includes('địa chỉ') || normalizedText.includes('cửa hàng') || normalizedText.includes('ở đâu') || normalizedText.includes('location') || normalizedText.includes('address') || normalizedText.includes('chi nhánh')) {
      autoReplyText = 'Dạ! Hệ thống cửa hàng **Bờ Nờ Store** hiện đang có mặt tại các vị trí đắc địa:\n\n- 📍 **Flagship Store**: 123 Đường Lụa, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh.\n- 📍 **Hà Nội Boutique**: 45 Phố Bông Hữu Cơ, Quận Hoàn Kiếm, Hà Nội.\n\nCửa hàng được bài trí theo phong cách tối giản sang trọng, có đầy đủ các mẫu thử và buồng thử thông minh SmartFit. Rất hân hạnh được đón tiếp bạn ghé thăm!';
    } else if (normalizedText.includes('liên hệ') || normalizedText.includes('sđt') || normalizedText.includes('hotline') || normalizedText.includes('điện thoại') || normalizedText.includes('contact') || normalizedText.includes('zalo')) {
      autoReplyText = 'Dạ! Bạn có thể dễ dàng kết nối với bộ phận chăm sóc khách hàng của **Bờ Nờ Store** qua các kênh sau:\n\n- 📞 **Hotline hỗ trợ 24/7**: **1900 888 999** (miễn phí cước gọi).\n- 💬 **Zalo hỗ trợ nhanh**: **0987 654 321**.\n- 📧 **Email**: support@bonostore.vn.\n\nChúng tôi cam kết sẽ phản hồi và xử lý mọi yêu cầu của bạn trong vòng tối đa 15 phút!';
    } else if (normalizedText.includes('giờ mở cửa') || normalizedText.includes('mở cửa') || normalizedText.includes('đóng cửa') || normalizedText.includes('hoạt động') || normalizedText.includes('time') || normalizedText.includes('hours')) {
      autoReplyText = 'Dạ! Thời gian hoạt động của toàn bộ hệ thống cửa hàng và tổng đài CSKH trực tuyến của **Bờ Nờ Store** như sau:\n\n- ⏰ **Thứ Hai đến Chủ Nhật**: **09:00 - 22:00** (không nghỉ trưa và mở cửa suốt các ngày lễ Tết).\n\nTrợ lý ảo **Bờ Nờ AI** của chúng tôi thì hoạt động **24/7** để hỗ trợ bạn bất kỳ lúc nào đấy ạ!';
    } else if (normalizedText.includes('thanh toán') || normalizedText.includes('momo') || normalizedText.includes('vnpay') || normalizedText.includes('cod') || normalizedText.includes('chuyển khoản') || normalizedText.includes('banking')) {
      autoReplyText = 'Dạ! Để thuận tiện nhất cho việc mua sắm, **Bờ Nờ Store** hỗ trợ đa dạng phương thức thanh toán an toàn:\n\n- 📦 **COD**: Nhận hàng và thanh toán tiền mặt trực tiếp tại nhà.\n- 💳 **Thẻ ngân hàng**: Thanh toán qua cổng ATM nội địa hoặc thẻ quốc tế (Visa, Mastercard).\n- 📱 **Ví điện tử & QR**: Thanh toán nhanh chóng qua Momo, VNPay với các chương trình hoàn tiền siêu hời.\n\nĐặc biệt, hệ thống mã hoá bảo mật 3D-Secure giúp bảo vệ 100% dữ liệu thanh toán của bạn.';
    } else if (normalizedText.includes('bảo quản') || normalizedText.includes('giặt') || normalizedText.includes('ủi') || normalizedText.includes('phơi') || normalizedText.includes('giặt là')) {
      autoReplyText = 'Dạ! Các chất liệu hữu cơ thiên nhiên như **Cotton Organic** và **Lụa Satin** cao cấp của Bờ Nờ cần được chăm sóc khéo léo để luôn bền bỉ như mới:\n\n- 🧺 **Giặt**: Khuyến khích giặt tay nhẹ nhàng hoặc dùng túi giặt chế độ nhẹ. Tránh dùng chất tẩy rửa mạnh.\n- ☀️ **Phơi**: Nên phơi trong bóng râm, tránh ánh nắng gắt trực tiếp làm phai màu sợi tự nhiên.\n- 💨 **Ủi**: Ủi ở nhiệt độ thấp hoặc vừa phải (chế độ Silk/Cotton), nên dùng bàn ủi hơi nước để bảo vệ bề mặt lụa bóng bẩy.';
    }

    if (autoReplyText) {
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: autoReplyText,
          component: null,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 800);
      return;
    }

    // 4. GENERAL CHAT (Proxied to FastAPI / Gemini)
    try {
      const historyPayload = messages.map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      const response = await fetch('/ai-fit/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageText,
          history: historyPayload
        })
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const rawText = data.response || 'Dạ, tôi chưa nghe rõ câu hỏi của bạn. Bạn vui lòng nhập lại nhé.';
      
      // Parse trigger tags in AI text
      let sizeCalculatorMatch = /\[TRIGGER_SIZE_CALCULATOR(?::\s*([^\]]+))?\]/gi.exec(rawText);
      let hasSizeTrigger = sizeCalculatorMatch !== null;
      let sizeParams = sizeCalculatorMatch ? (sizeCalculatorMatch[1] || '').trim() : '';

      let hasOutfitTrigger = /\[TRIGGER_OUTFIT_BOARD\]/gi.test(rawText);
      let hasPreferenceTrigger = /\[TRIGGER_PREFERENCE_RECOMMENDER\]/gi.test(rawText);
      
      let orderTrackerMatch = /\[TRIGGER_ORDER_TRACKER(?::\s*([^\]]+))?\]/gi.exec(rawText);
      let hasOrderTrackerTrigger = orderTrackerMatch !== null;
      let orderTrackerQuery = orderTrackerMatch ? (orderTrackerMatch[1] || '').trim() : '';

      let checkoutMatch = /\[TRIGGER_CHECKOUT:\s*items=(\[.*?\])\]/gi.exec(rawText);
      let hasCheckoutTrigger = checkoutMatch !== null;
      let checkoutItems = [];
      if (hasCheckoutTrigger) {
        try {
          checkoutItems = JSON.parse(checkoutMatch[1]);
        } catch (e) {
          console.error("Lỗi khi parse items JSON trong trigger checkout:", e);
        }
      }

      let initialHeight = 165;
      let initialWeight = 55;
      if (sizeParams) {
        const hMatch = sizeParams.match(/height=(\d+)/);
        const wMatch = sizeParams.match(/weight=(\d+)/);
        if (hMatch) initialHeight = parseInt(hMatch[1]);
        if (wMatch) initialWeight = parseInt(wMatch[1]);
      }

      // Parse product recommendations
      const productRegex = /\[RECOMMEND_PRODUCT_ID:\s*(\d+)\]/gi;
      const matchedIds = [];
      let match;
      while ((match = productRegex.exec(rawText)) !== null) {
        matchedIds.push(parseInt(match[1]));
      }

      // Clean up text response (strip tags)
      let cleanedText = rawText
        .replace(/\[TRIGGER_SIZE_CALCULATOR(?::\s*[^\]]+)?\]/gi, '')
        .replace(/\[TRIGGER_OUTFIT_BOARD\]/gi, '')
        .replace(/\[TRIGGER_PREFERENCE_RECOMMENDER\]/gi, '')
        .replace(/\[TRIGGER_ORDER_TRACKER(?::\s*[^\]]+)?\]/gi, '')
        .replace(/\[TRIGGER_CHECKOUT:\s*items=\[.*?\]\]/gi, '')
        .replace(/\[RECOMMEND_PRODUCT_ID:\s*\d+\]/gi, '')
        .trim();

      const recommendedProducts = dbProducts.filter(p => matchedIds.includes(p.id));
      
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: cleanedText,
        widget: (() => {
          if (hasSizeTrigger) return { type: 'size', props: { initialHeight, initialWeight } };
          if (hasOutfitTrigger) return { type: 'outfit' };
          if (hasPreferenceTrigger) return { type: 'preference' };
          if (hasOrderTrackerTrigger) return { type: 'tracking', props: { initialQuery: orderTrackerQuery } };
          if (hasCheckoutTrigger) return { type: 'checkout', props: { items: checkoutItems } };
          if (recommendedProducts.length > 0) return { type: 'carousel', props: { productIds: recommendedProducts.map(p => p.id) } };
          return null;
        })(),
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.warn("Lỗi khi kết nối với Bờ Nờ AI:", err);
      
      // Fallback offline reply
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Xin lỗi quý khách, hệ thống mạng của **Bờ Nờ AI** hiện tại đang quá tải nhẹ.\n\nTôi có thể hỗ trợ bạn trực tiếp các thông tin về:\n- 📏 **Chọn size chuẩn AI**\n- 👗 **Gợi ý phối đồ Outfit**\n- 🚚 **Giao hàng & Đổi trả**\n\nBạn vui lòng click các nút trợ giúp nhanh bên dưới nhé!',
        component: null,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
        handleSendMessage(inputText);
      }
    }
  };

  // Helper to parse inline markdown like **bold**
  const parseInlineMarkdown = (text) => {
    if (!text) return '';
    const parts = text.split('**');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return (
          <strong key={`bold-${idx}`} style={{ 
            color: 'var(--primary-color)', 
            fontWeight: 750,
            letterSpacing: '0.01em'
          }}>
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  // Elegant lightweight markdown parser for stylist responses
  const renderMessageContent = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    let isInsideList = false;
    let listItems = [];
    const elements = [];
    
    const flushList = (key) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} style={{ 
            listStyleType: 'none', 
            padding: 0, 
            margin: '0.4rem 0 0.6rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            {listItems}
          </ul>
        );
        listItems = [];
        isInsideList = false;
      }
    };
    
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
      
      if (isBullet) {
        if (!isInsideList) {
          isInsideList = true;
        }
        const content = trimmed.substring(2).trim();
        listItems.push(
          <li key={`li-${idx}`} style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            alignItems: 'flex-start',
            fontSize: '0.85rem',
            lineHeight: '1.45'
          }}>
            <span style={{ 
              color: 'var(--accent-gold)', 
              fontSize: '1rem', 
              lineHeight: 1,
              marginTop: '-0.1rem',
              userSelect: 'none'
            }}>•</span>
            <span style={{ flex: 1 }}>{parseInlineMarkdown(content)}</span>
          </li>
        );
      } else {
        if (isInsideList) {
          flushList(idx);
        }
        
        if (trimmed === '') {
          elements.push(<div key={`spacer-${idx}`} style={{ height: '0.4rem' }} />);
        } else {
          elements.push(
            <p key={`p-${idx}`} style={{ 
              margin: '0.3rem 0', 
              fontSize: '0.85rem', 
              lineHeight: '1.48',
              textAlign: 'justify'
            }}>
              {parseInlineMarkdown(trimmed)}
            </p>
          );
        }
      }
    });
    
    if (isInsideList) {
      flushList(lines.length);
    }
    
    return elements;
  };

  return (
    <>
      {/* Floating Welcome message popup from cloned project */}
      {showWelcome && !isOpen && (
        <div 
          className="welcome-popup"
          style={{
            position: 'fixed',
            bottom: '120px',
            right: '30px',
            backgroundColor: 'var(--bg-light)',
            padding: '12px 25px 12px 18px',
            borderRadius: '16px',
            border: '1px solid var(--border-light)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            zIndex: 9998,
            maxWidth: '300px',
            animation: 'fadeIn 0.5s ease'
          }}
        >
          <button 
            className="close-welcome"
            onClick={(e) => {
              e.stopPropagation();
              sessionStorage.setItem('chatbox_welcome_closed', 'true');
              setShowWelcome(false);
            }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1,
              padding: '2px'
            }}
          >
            &times;
          </button>
          <p className="welcome-message" style={{ fontSize: '14px', color: 'var(--text-dark)', margin: 0, paddingRight: '10px', fontWeight: 500 }}>
            Need help? I'm here to assist you! 👋
          </p>
        </div>
      )}

      {/* Floating Chat Trigger Button (Chatbot Logo from cloned project) */}
      <div 
        className="chatbot-logo"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowWelcome(false);
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          if (!isOpen) setShowWelcome(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '75px',
          height: '75px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          border: '1px solid var(--border-light)',
          boxShadow: isHovered 
            ? '0 8px 24px rgba(0,0,0,0.15)' 
            : '0 4px 16px rgba(0,0,0,0.1)',
          backgroundColor: 'var(--bg-light)',
          overflow: 'hidden'
        }}
        title="Trợ lý thời trang Bờ Nờ AI"
      >
        <img 
          src="/chatbot-icon-2-.png" 
          alt="chatbot logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Chatbot Widget (from cloned project, styled with minimalist black-and-white theme) */}
      <div 
        className="chat-widget"
        style={{
          position: 'fixed',
          bottom: '120px',
          right: '30px',
          width: '440px',
          height: '580px',
          maxHeight: 'calc(100vh - 150px)',
          maxWidth: 'calc(100vw - 60px)',
          backgroundColor: 'var(--bg-light)',
          borderRadius: '32px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
          zIndex: 10000,
          fontFamily: 'var(--font-sans)',
          transition: 'transform 0.3s ease',
          overflow: 'hidden',
          border: '1px solid var(--border-light)'
        }}
      >
        {/* Chat Header (from cloned project) */}
        <div 
          className="chat-header"
          style={{
            background: 'transparent',
            color: 'var(--text-dark)',
            padding: '15px 20px',
            borderRadius: '32px 32px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '16px', fontWeight: 700 }}>
            <img 
              src="/chatbot-icon-1.png" 
              alt="Chatbot Logo" 
              style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-light)' }}
            />
            Customer Support
          </h3>
          <button 
            className="close-popup"
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0px 5px',
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>

        {/* Messages Container (from cloned project style: grey background, white/black bubbles) */}
        <div 
          className="chat-messages"
          style={{
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: 'transparent'
          }}
        >
          {messages.map(msg => (
            <div 
              key={msg.id}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                animation: 'messageSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              <div 
                className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
                style={{
                  padding: '12px 16px',
                  backgroundColor: msg.sender === 'user' ? 'var(--primary-color)' : 'var(--secondary-color)',
                  color: msg.sender === 'user' ? '#ffffff' : 'var(--text-dark)',
                  borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-light)',
                  boxShadow: 'none',
                  fontSize: '14px',
                  lineHeight: '1.45',
                  wordBreak: 'break-word',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                  {renderMessageContent(msg.text)}
                </div>
                {(msg.component || msg.widget) && (
                  <div style={{ marginTop: '10px', width: '100%' }}>
                    {msg.component || renderWidget(msg.widget)}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px', fontWeight: 500 }}>
                {msg.time}
              </span>
            </div>
          ))}

          {isTyping && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div 
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--secondary-color)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '16px 16px 16px 2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span className="typing-dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary-color)', borderRadius: '50%', display: 'inline-block', animation: 'typingDot 1.4s infinite both' }}></span>
                <span className="typing-dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary-color)', borderRadius: '50%', display: 'inline-block', animation: 'typingDot 1.4s infinite both', animationDelay: '0.2s' }}></span>
                <span className="typing-dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary-color)', borderRadius: '50%', display: 'inline-block', animation: 'typingDot 1.4s infinite both', animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies Panel */}
        <div 
          style={{
            padding: '10px 15px',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: 'transparent',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px'
          }}
        >
          {QUICK_REPLIES.map(reply => (
            <button
              key={reply.id}
              onClick={() => handleSendMessage(reply.text, true)}
              style={{
                fontSize: '12px',
                padding: '6px 12px',
                backgroundColor: 'var(--bg-light)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-dark)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: 700
              }}
            >
              {reply.text}
            </button>
          ))}
        </div>

        {/* Input Area (from cloned project style: textarea and button with 12px border-radius) */}
        <div 
          className="chat-input"
          style={{
            padding: '15px',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            gap: '10px',
            background: 'transparent',
            borderRadius: '0 0 32px 32px',
            alignItems: 'center'
          }}
        >
          <textarea 
            placeholder={isTyping ? "Bờ Nờ AI đang trả lời..." : "Hỏi trợ lý Bờ Nờ (outfit, size...)..."}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
            style={{
              flex: 1,
              padding: '12px 15px',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-light)',
              borderRadius: '16px',
              resize: 'none',
              minHeight: '40px',
              maxHeight: '80px',
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.4',
              outline: 'none',
              boxSizing: 'border-box',
              color: 'var(--text-dark)',
              cursor: isTyping ? 'not-allowed' : 'text'
            }}
          />
          <button 
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
            style={{
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '16px',
              cursor: (inputText.trim() && !isTyping) ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
              fontWeight: 700,
              height: '42px',
              opacity: (inputText.trim() && !isTyping) ? 1 : 0.5
            }}
          >
            Send
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@300;400;500;700&display=swap');
        
        @keyframes typingDot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes messageSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
