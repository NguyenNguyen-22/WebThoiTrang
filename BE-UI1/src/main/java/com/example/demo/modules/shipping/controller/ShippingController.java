package com.example.demo.modules.shipping.controller;

import com.example.demo.modules.shipping.config.GhnConfig;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/shipping")
public class ShippingController {

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("token", GhnConfig.GHN_TOKEN);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    @GetMapping("/provinces")
    public ResponseEntity<?> getProvinces() {
        try {
            HttpEntity<String> entity = new HttpEntity<>(getHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    GhnConfig.GET_PROVINCE_URL,
                    HttpMethod.GET,
                    entity,
                    String.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/districts")
    public ResponseEntity<?> getDistricts(@RequestParam int provinceId) {
        try {
            HttpHeaders headers = getHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    GhnConfig.GET_DISTRICT_URL + "?province_id=" + provinceId,
                    HttpMethod.GET,
                    entity,
                    String.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/wards")
    public ResponseEntity<?> getWards(@RequestParam int districtId) {
        try {
            HttpHeaders headers = getHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    GhnConfig.GET_WARD_URL + "?district_id=" + districtId,
                    HttpMethod.GET,
                    entity,
                    String.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/fee")
    public ResponseEntity<?> calculateFee(@RequestBody Map<String, Object> payload) {
        try {
            int toDistrictId = Integer.parseInt(payload.get("toDistrictId").toString());
            String toWardCode = payload.get("toWardCode").toString();
            
            // Giả lập trọng lượng và kích thước mặc định cho quần áo
            int weight = payload.containsKey("weight") ? Integer.parseInt(payload.get("weight").toString()) : 200; // gram
            int length = 20; // cm
            int width = 15;
            int height = 10;
            
            // Mã dịch vụ của GHN: 2 = E-Commerce, 5 = Truyền thống
            int serviceId = 53320; // Có thể thay đổi tuỳ theo district, nên dùng getServices để chuẩn hơn. Nhưng 53320 hoặc service_type_id = 2 thường dùng.

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from_district_id", GhnConfig.FROM_DISTRICT_ID);
            requestBody.put("from_ward_code", GhnConfig.FROM_WARD_CODE);
            requestBody.put("service_type_id", 2); // Sử dụng service_type_id = 2 (Giao chuẩn) sẽ an toàn hơn service_id cố định
            requestBody.put("to_district_id", toDistrictId);
            requestBody.put("to_ward_code", toWardCode);
            requestBody.put("weight", weight);
            requestBody.put("length", length);
            requestBody.put("width", width);
            requestBody.put("height", height);

            HttpHeaders headers = getHeaders();
            headers.set("ShopId", GhnConfig.GHN_SHOP_ID);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    GhnConfig.CALCULATE_FEE_URL,
                    HttpMethod.POST,
                    entity,
                    String.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
