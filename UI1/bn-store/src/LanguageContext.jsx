import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  vi: {
    // Promo Bar
    free_ship: "Miễn phí vận chuyển cho đơn từ 499k",
    member_benefit: "🎁 Ưu đãi thành viên",
    support: "📞 Hỗ trợ 24/7",
    
    // Header
    search_placeholder: "Bạn cần tìm gì...",
    cart: "Giỏ hàng",
    cart_items: "món",
    account: "Tài khoản",
    login_register: "Đăng nhập / Đăng ký",
    hotline: "Hotline",
    logout: "Đăng xuất",
    welcome: "Xin chào",
    favorite: "Yêu thích",
    favorite_subtitle: "Sản phẩm",
    
    // Nav Links
    nav_home: "TRANG CHỦ",
    nav_products: "SẢN PHẨM",
    nav_flash_sale: "FLASH SALE",
    nav_shirts: "ÁO NAM",
    nav_pants: "QUẦN NAM",
    nav_accessories: "PHỤ KIỆN",
    
    // Homepage Categories Sidebar
    sidebar_title: "DANH MỤC SẢN PHẨM",
    cat_tshirt: "Áo thun nam",
    cat_shirt: "Áo sơ mi nam",
    cat_polo: "Áo polo nam",
    cat_hoodie: "Áo khoác & Hoodie",
    cat_jeans: "Quần Jeans nam",
    cat_trousers: "Quần Tây & Kaki nam",
    cat_shorts: "Quần short nam",
    cat_shoes: "Giày & Sneaker nam",
    cat_belt: "Thắt lưng & Ví da",
    cat_bag: "Túi xách & Balo",
    cat_hat: "Nón & Kính thời trang",
    cat_jewelry: "Phụ kiện thời trang",

    // Homepage Titles & Buttons
    buy_now: "MUA NGAY",
    best_sellers: "🔥 SẢN PHẨM BÁN CHẠY",
    best_sellers_desc: "Những mẫu thiết kế được săn đón nhất trong BST Hè 2026",
    new_arrivals: "✨ BỘ SƯU TẬP MỚI VỀ",
    new_arrivals_desc: "Cập nhật xu hướng thời trang nam mới nhất mỗi ngày",
    categories_title: "📦 DANH MỤC NỔI BẬT",
    categories_desc: "Khám phá tủ đồ đầy đủ cho mọi phong cách của bạn",
    why_us: "🛡️ TẠI SAO BẠN NÊN CHỌN BỜ NỜ STORE?",
    why_us_1_title: "Sản xuất tại Việt Nam",
    why_us_1_desc: "Tự hào sản xuất 100% tại xưởng dệt may đạt chuẩn chất lượng cao Việt Nam.",
    why_us_2_title: "Thiết kế hiện đại",
    why_us_2_desc: "Luôn dẫn đầu xu hướng, phong cách trẻ trung năng động và lịch lãm.",
    why_us_3_title: "Chất liệu cao cấp",
    why_us_3_desc: "Sử dụng vải cotton 100% Organic, vải sợi sồi modal mát lạnh siêu mịn thoáng mát.",
    why_us_4_title: "Đổi trả dễ dàng",
    why_us_4_desc: "Chính sách đổi trả 30 ngày tận nhà miễn phí, hoàn tiền 100% nhanh chóng.",
    
    // Flash Sale Page
    flash_sale_title: "🔥 FLASH SALE CHỚP NHOÁNG",
    countdown_text: "KẾT THÚC SAU",
    hour: "Giờ",
    minute: "Phút",
    second: "Giây",
    sold_out: "Hết hàng",
    sold_count: "Đã bán {x} / {y} sản phẩm",
    filters_title: "BỘ LỌC SẢN PHẨM",
    filter_all: "Tất cả",
    filter_shirts: "Áo",
    filter_pants: "Quần",
    filter_accessories: "Phụ kiện",
    add_to_cart: "Thêm vào giỏ",
    buy_now_btn: "Mua ngay",
    view_details: "Xem chi tiết",

    // Footer
    footer_desc: "Bờ Nờ Store - Thương hiệu thời trang nam tối giản, hiện đại và chất lượng cao dành cho phái mạnh.",
    footer_address: "Địa chỉ: 123 Đường 3/2, Quận 10, TP. Hồ Chí Minh",
    footer_links_title: "VỀ CHÚNG TÔI",
    footer_link_about: "Giới thiệu thương hiệu",
    footer_link_news: "Tin tức thời trang",
    footer_link_careers: "Tuyển dụng",
    footer_link_stores: "Hệ thống cửa hàng",
    footer_help_title: "HỖ TRỢ KHÁCH HÀNG",
    footer_help_policy: "Chính sách đổi trả 30 ngày",
    footer_help_ship: "Chính sách vận chuyển",
    footer_help_size: "Bảng quy đổi kích cỡ",
    footer_help_faq: "Câu hỏi thường gặp",
    footer_newsletter_title: "NHẬN ƯU ĐÃI ĐỘC QUYỀN",
    footer_newsletter_desc: "Đăng ký email để nhận ngay voucher giảm 10% cho đơn hàng đầu tiên.",
    footer_newsletter_placeholder: "Nhập email của bạn...",
    footer_newsletter_btn: "ĐĂNG KÝ",
    footer_copyright: "© 2026 Bờ Nờ Store. Tất cả quyền được bảo lưu."
  },
  en: {
    // Promo Bar
    free_ship: "Free shipping for orders over 499k",
    member_benefit: "🎁 Member Benefits",
    support: "📞 Support 24/7",
    
    // Header
    search_placeholder: "What are you looking for...",
    cart: "Cart",
    cart_items: "items",
    account: "Account",
    login_register: "Login / Register",
    hotline: "Hotline",
    logout: "Log out",
    welcome: "Welcome",
    favorite: "Favorites",
    favorite_subtitle: "Products",
    
    // Nav Links
    nav_home: "HOME",
    nav_products: "PRODUCTS",
    nav_flash_sale: "FLASH SALE",
    nav_shirts: "MEN'S SHIRTS",
    nav_pants: "MEN'S PANTS",
    nav_accessories: "ACCESSORIES",
    
    // Homepage Categories Sidebar
    sidebar_title: "PRODUCT CATEGORIES",
    cat_tshirt: "Men's T-Shirts",
    cat_shirt: "Men's Casual Shirts",
    cat_polo: "Men's Polo Shirts",
    cat_hoodie: "Jackets & Hoodies",
    cat_jeans: "Men's Jeans",
    cat_trousers: "Kakis & Trousers",
    cat_shorts: "Men's Shorts",
    cat_shoes: "Shoes & Sneakers",
    cat_belt: "Belts & Wallets",
    cat_bag: "Bags & Backpacks",
    cat_hat: "Caps & Sunglasses",
    cat_jewelry: "Fashion Accessories",

    // Homepage Titles & Buttons
    buy_now: "SHOP NOW",
    best_sellers: "🔥 BEST SELLERS",
    best_sellers_desc: "The most sought-after designs in the Summer 2026 Collection",
    new_arrivals: "✨ NEW ARRIVALS",
    new_arrivals_desc: "Updating the latest men's fashion trends every day",
    categories_title: "📦 FEATURED CATEGORIES",
    categories_desc: "Explore the complete wardrobe for your every style",
    why_us: "🛡️ WHY CHOOSE BỜ NỜ STORE?",
    why_us_1_title: "Made in Vietnam",
    why_us_1_desc: "Proudly manufactured 100% in high-quality standard Vietnamese textile factories.",
    why_us_2_title: "Modern Design",
    why_us_2_desc: "Always leading the trend with a young, dynamic, and elegant style.",
    why_us_3_title: "Premium Materials",
    why_us_3_desc: "Using 100% Organic Cotton and ultra-cool, silky beechwood modal fibers.",
    why_us_4_title: "Easy Return & Exchange",
    why_us_4_desc: "Free 30-day home exchange policy with quick 100% refunds.",

    // Flash Sale Page
    flash_sale_title: "🔥 FLASH SALE",
    countdown_text: "ENDS IN",
    hour: "Hrs",
    minute: "Mins",
    second: "Secs",
    sold_out: "Sold out",
    sold_count: "{x} / {y} items sold",
    filters_title: "PRODUCT FILTERS",
    filter_all: "All",
    filter_shirts: "Shirts",
    filter_pants: "Pants",
    filter_accessories: "Accessories",
    add_to_cart: "Add to cart",
    buy_now_btn: "Buy now",
    view_details: "View details",

    // Footer
    footer_desc: "Bờ Nờ Store - A minimalist, modern, and high-quality men's fashion brand.",
    footer_address: "Address: 123 3/2 Street, District 10, Ho Chi Minh City",
    footer_links_title: "ABOUT US",
    footer_link_about: "Brand Introduction",
    footer_link_news: "Fashion News",
    footer_link_careers: "Careers",
    footer_link_stores: "Store Locator",
    footer_help_title: "CUSTOMER SUPPORT",
    footer_help_policy: "30-Day Return Policy",
    footer_help_ship: "Shipping Policy",
    footer_help_size: "Size Conversion Chart",
    footer_help_faq: "FAQs",
    footer_newsletter_title: "GET EXCLUSIVE OFFERS",
    footer_newsletter_desc: "Subscribe to our email list to receive a 10% voucher for your first order.",
    footer_newsletter_placeholder: "Enter your email address...",
    footer_newsletter_btn: "SUBSCRIBE",
    footer_copyright: "© 2026 Bờ Nờ Store. All rights reserved."
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('app-lang') || 'vi';
  });

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
  };

  const t = (key, params = {}) => {
    let text = translations[lang]?.[key] || translations['vi']?.[key] || key;
    // Replace any dynamic parameters like {x} or {y}
    Object.keys(params).forEach(paramKey => {
      text = text.replace(`{${paramKey}}`, params[paramKey]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
