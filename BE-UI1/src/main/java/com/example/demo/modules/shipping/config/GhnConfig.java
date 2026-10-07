package com.example.demo.modules.shipping.config;

public class GhnConfig {
    // Thông tin này lấy từ https://khachhang.ghn.vn/ (Môi trường test hoặc thật)
    public static final String GHN_TOKEN = "a025d1d8-2e71-11f0-afab-c2dd849a5f98"; 
    public static final String GHN_SHOP_ID = "5768745";
    
    // API Endpoints của GHN (Môi trường thật)
    public static final String GHN_API_URL = "https://online-gateway.ghn.vn/shiip/public-api";
    
    // API lấy danh sách địa chỉ
    public static final String GET_PROVINCE_URL = GHN_API_URL + "/master-data/province";
    public static final String GET_DISTRICT_URL = GHN_API_URL + "/master-data/district";
    public static final String GET_WARD_URL = GHN_API_URL + "/master-data/ward";
    
    // API tính phí
    public static final String CALCULATE_FEE_URL = GHN_API_URL + "/v2/shipping-order/fee";
    public static final String GET_SERVICES_URL = GHN_API_URL + "/v2/shipping-order/available-services";
    
    // Cấu hình kho gửi hàng mặc định (Ví dụ: Quận 1, TP.HCM)
    public static final int FROM_DISTRICT_ID = 1442; // Quận 1
    public static final String FROM_WARD_CODE = "20101"; // Phường Bến Nghé
}
