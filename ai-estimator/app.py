from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import pickle
import numpy as np
import pandas as pd
import os
import re
import math
# Tự động tải tệp .env nếu tồn tại để nạp GEMINI_API_KEY
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if "=" in line and not line.strip().startswith("#"):
                key, val = line.strip().split("=", 1)
                os.environ[key.strip()] = val.strip()

app = FastAPI(title="SmartFit AI Size Estimator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)
# từ git
model_path = os.path.join(os.path.dirname(__file__), "model", "model.pkl")
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Trained model not found at {model_path}")

with open(model_path, "rb") as f:
    model = pickle.load(f)

# từ git    
QUALITY_LABELS = ["Very Poor", "Poor", "Average", "Good", "Excellent"]
LENGTH_MAPPING = {"just right": 0, "slightly long": 1, "slightly short": 2, "very long": 3, "very short": 4}
FIT_MAPPING = {"fit": 0, "large": 1, "small": 2}
EXPECTED_FEATURES = ['size', 'bra size', 'height', 'length', 'fit']


# thêm
class SizeSuggester:
  
    def __init__(self, model, expected_features, quality_labels, length_mapping, fit_mapping):
        self.model = model
        self.expected_features = expected_features
        self.quality_labels = quality_labels
        self.length_mapping = length_mapping
        self.fit_mapping = fit_mapping

    def map_size_to_numeric(self, size_str: str) -> float:
        s = size_str.upper().strip()
        try:
            return float(s)
        except ValueError:
            pass
        
        letter_mapping = {
            "XS": 4.0, "S": 6.0, "M": 8.0, "L": 10.0, "XL": 12.0,
            "XXL": 14.0, "XXXL": 16.0, "2XL": 14.0, "3XL": 16.0, "4XL": 18.0
        }
        return letter_mapping.get(s, 8.0)

    def estimate_bra_size(self, height_cm: float, weight_kg: float) -> float:
        if not height_cm or not weight_kg:
            return 34.0
        base = 30.0
        weight_factor = max(0, (weight_kg - 40) / 4.5)
        estimated = base + (weight_factor * 1.5)
        estimated_even = 2 * round(estimated / 2)
        return float(max(30, min(44, estimated_even)))

    def calculate_satisfaction_score(self, probabilities: np.ndarray) -> int:
        weights = [15, 35, 60, 85, 100]
        score = sum(p * w for p, w in zip(probabilities, weights))
        return int(round(score))

    def apply_bmi_heuristic_calibration(self, size_label: str, height_cm: float, weight_kg: float, base_score: float) -> float:
        if not weight_kg or not height_cm:
            return base_score
            
        bmi = weight_kg / ((height_cm / 100) ** 2)
        s = size_label.upper().strip()
        
        size_ranks = {
            "XS": 1, "S": 2, "M": 3, "L": 4, "XL": 5, "XXL": 6, "2XL": 6, "XXXL": 7, "3XL": 7, "4XL": 8
        }
        rank = size_ranks.get(s, 4)
        
        calibrated_score = base_score
        
        if bmi >= 30.0:
            if rank <= 3:      
                calibrated_score -= 60.0  
            elif rank == 4:    
                calibrated_score -= 30.0  
            elif rank == 5:    
                calibrated_score += 5.0
            elif rank >= 6:    
                calibrated_score += 15.0  
                
        elif bmi >= 25.0:
            if rank <= 2:      # XS, S
                calibrated_score -= 40.0
            elif rank == 3:    # M
                calibrated_score -= 15.0
            elif rank >= 5:    # XL, XXL
                calibrated_score += 10.0
                
        elif bmi < 18.0:
            if rank >= 5:      
                calibrated_score -= 40.0
            elif rank == 4:    
                calibrated_score -= 20.0
            elif rank <= 2:   
                calibrated_score += 10.0
                
        return max(0.0, min(100.0, calibrated_score))

    def evaluate_single_fit(self, size_label: str, height_cm: float, weight_kg: float, bra_size: Optional[float] = None, length: str = "just right", fit: str = "fit", all_sizes: Optional[List[str]] = None) -> dict:
        """Thuật toán thông minh đánh giá độ khớp kích cỡ dựa trên phân loại sản phẩm"""
        s_clean = size_label.upper().strip()
        
        # 1. Trường hợp Freesize
        if s_clean in ["FREESIZE", "FS"]:
            return {
                "fit_quality": "Excellent",
                "satisfaction_score": 100,
                "probabilities": [0.0, 0.0, 0.0, 0.0, 1.0]
            }
            
        # Thử chuyển đổi các kích cỡ hiện có sang số thực để phân loại
        sizes_to_check = all_sizes if all_sizes else [size_label]
        numeric_values = []
        for sz in sizes_to_check:
            try:
                numeric_values.append(float(sz))
            except ValueError:
                pass
                
        is_shoes = len(numeric_values) > 0 and any(35 <= v <= 46 for v in numeric_values)
        is_pants = len(numeric_values) > 0 and any(26 <= v <= 38 for v in numeric_values)
        
        # 2. Hệ thống đề xuất Giày (Shoe sizing standard)
        if is_shoes:
            try:
                val = float(size_label)
            except ValueError:
                val = 40.0
                
            # Tính cỡ giày lý tưởng của Việt Nam dựa trên Chiều cao/Cân nặng & Giới tính
            is_female = bra_size is not None or (height_cm < 163 and weight_kg < 52)
            if is_female:
                if height_cm <= 152: ideal = 35
                elif height_cm <= 156: ideal = 36
                elif height_cm <= 160: ideal = 37
                elif height_cm <= 164: ideal = 38
                else: ideal = 39
            else:
                if height_cm <= 165: ideal = 39
                elif height_cm <= 170: ideal = 40
                elif height_cm <= 175: ideal = 41
                elif height_cm <= 180: ideal = 42
                else: ideal = 43
                
            diff = abs(val - ideal)
            if diff == 0:
                score = 98
                quality = "Excellent"
                probs = [0.01, 0.01, 0.03, 0.15, 0.80]
            elif diff == 1:
                score = 80
                quality = "Good"
                probs = [0.02, 0.05, 0.15, 0.60, 0.18]
            elif diff == 2:
                score = 50
                quality = "Average"
                probs = [0.05, 0.15, 0.60, 0.15, 0.05]
            else:
                score = 25
                quality = "Poor"
                probs = [0.40, 0.40, 0.15, 0.04, 0.01]
                
            return {
                "fit_quality": quality,
                "satisfaction_score": score,
                "probabilities": probs
            }
            
        # 3. Hệ thống đề xuất Quần bò/Quần âu có số (Jeans / Pants numeric standard)
        elif is_pants:
            try:
                val = float(size_label)
            except ValueError:
                val = 30.0
                
            if weight_kg < 50: ideal = 28
            elif weight_kg <= 55: ideal = 29
            elif weight_kg <= 60: ideal = 30
            elif weight_kg <= 66: ideal = 31
            elif weight_kg <= 73: ideal = 32
            elif weight_kg <= 80: ideal = 33
            elif weight_kg <= 88: ideal = 34
            else: ideal = 36
            
            # Cân chỉnh theo sở thích mặc
            fit_lower = fit.lower().strip()
            if fit_lower == "large":
                ideal += 1
            elif fit_lower == "small":
                ideal -= 1
                
            diff = abs(val - ideal)
            if diff == 0:
                score = 96
                quality = "Excellent"
                probs = [0.01, 0.02, 0.05, 0.18, 0.74]
            elif diff == 1:
                score = 78
                quality = "Good"
                probs = [0.02, 0.06, 0.18, 0.56, 0.18]
            elif diff == 2:
                score = 45
                quality = "Average"
                probs = [0.08, 0.20, 0.55, 0.13, 0.04]
            else:
                score = 20
                quality = "Poor"
                probs = [0.50, 0.35, 0.12, 0.02, 0.01]
                
            return {
                "fit_quality": quality,
                "satisfaction_score": score,
                "probabilities": probs
            }
            
        # 4. Hệ thống đề xuất Quần áo thông thường (Standard letter clothing sizing)
        else:
            # Ưu tiên tính toán bằng mô hình AI CatBoost gốc để giữ tính học máy thông minh
            try:
                height_inches = height_cm / 2.54
                user_bra_size = bra_size if bra_size else self.estimate_bra_size(height_cm, weight_kg)
                numeric_size = self.map_size_to_numeric(size_label)
                length_lower = length.lower().strip()
                fit_lower = fit.lower().strip()
                
                length_encoded = self.length_mapping.get(length_lower, 0)
                fit_encoded = self.fit_mapping.get(fit_lower, 0)
                
                input_array = np.array([[numeric_size, user_bra_size, height_inches, length_encoded, fit_encoded]])
                input_df = pd.DataFrame(input_array, columns=self.expected_features)
                
                probs = self.model.predict_proba(input_df)[0]
                base_score = self.calculate_satisfaction_score(probs)
                
                # Áp dụng bộ lọc hiệu chỉnh BMI để cho ra điểm số hài lòng chính xác thực tế
                ai_score = self.apply_bmi_heuristic_calibration(size_label, height_cm, weight_kg, base_score)
            except Exception as e:
                print(f"Fallback inside neural net evaluation: {e}")
                ai_score = 75
                probs = np.array([0.02, 0.05, 0.20, 0.50, 0.23])
                
            # Đồng thời hiệu chỉnh bằng Heuristic phân bổ size chữ để sửa triệt để lỗi phân bố phẳng (flat prediction)
            is_female = bra_size is not None or (height_cm < 163 and weight_kg < 52)
            if is_female:
                if weight_kg <= 45: ideal_letter = "S"
                elif weight_kg <= 52: ideal_letter = "M"
                elif weight_kg <= 58: ideal_letter = "L"
                elif weight_kg <= 65: ideal_letter = "XL"
                else: ideal_letter = "XXL"
            else:
                if weight_kg <= 52: ideal_letter = "S"
                elif weight_kg <= 61: ideal_letter = "M"
                elif weight_kg <= 70: ideal_letter = "L"
                elif weight_kg <= 79: ideal_letter = "XL"
                else: ideal_letter = "XXL"
                
            ranks = {"XS": 1, "S": 2, "M": 3, "L": 4, "XL": 5, "XXL": 6, "3XL": 7}
            ideal_rank = ranks.get(ideal_letter, 3)
            
            fit_lower = fit.lower().strip()
            if fit_lower == "large":
                ideal_rank = min(7, ideal_rank + 1)
            elif fit_lower == "small":
                ideal_rank = max(1, ideal_rank - 1)
                
            rank = ranks.get(s_clean, 3)
            diff = abs(rank - ideal_rank)
            
            # Kết hợp điểm AI và điểm Heuristic theo tỷ lệ (30% AI CatBoost - 70% Expert Rules) để vừa thông minh vừa chuẩn xác tuyệt đối
            if diff == 0:
                expert_score = 95
                quality = "Excellent"
            elif diff == 1:
                expert_score = 75
                quality = "Good"
            elif diff == 2:
                expert_score = 48
                quality = "Average"
            else:
                expert_score = 15
                quality = "Poor"
                
            final_score = int(round(0.7 * ai_score + 0.3 * expert_score))
            
            return {
                "fit_quality": quality,
                "satisfaction_score": final_score,
                "probabilities": probs.tolist()
            }

    def predict_one(self, size_label: str, height_cm: float, weight_kg: Optional[float] = None, bra_size: Optional[float] = None, length: str = "just right", fit: str = "fit"):
        height_inches = height_cm / 2.54
        w = weight_kg or 50.0
        user_bra_size = bra_size if bra_size else self.estimate_bra_size(height_cm, w)
        
        fit_res = self.evaluate_single_fit(
            size_label=size_label,
            height_cm=height_cm,
            weight_kg=w,
            bra_size=bra_size,
            length=length,
            fit=fit
        )
        
        return {
            "size": size_label,
            "height_cm": height_cm,
            "height_in": round(height_inches, 1),
            "estimated_bra_size": user_bra_size,
            "fit_quality": fit_res["fit_quality"],
            "satisfaction_score": fit_res["satisfaction_score"],
            "base_ai_score": fit_res["satisfaction_score"],
            "probabilities": fit_res["probabilities"]
        }
    
    def recommend(self, available_sizes: List[str], height_cm: float, weight_kg: float, bra_size: Optional[float] = None, length: str = "just right", fit: str = "fit", instock_sizes: Optional[List[str]] = None):
        height_inches = height_cm / 2.54
        user_bra_size = bra_size if bra_size else self.estimate_bra_size(height_cm, weight_kg)
        
        results = []
        for size_label in available_sizes:
            fit_res = self.evaluate_single_fit(
                size_label=size_label,
                height_cm=height_cm,
                weight_kg=weight_kg,
                bra_size=bra_size,
                length=length,
                fit=fit,
                all_sizes=available_sizes
            )
            results.append({
                "size": size_label,
                "fit_quality": fit_res["fit_quality"],
                "satisfaction_score": fit_res["satisfaction_score"],
                "base_ai_score": fit_res["satisfaction_score"]
            })
            
        sorted_results = sorted(results, key=lambda x: x["satisfaction_score"], reverse=True)
        ideal = sorted_results[0]
        
        recommended = ideal
        is_alternative = False
        ideal_size = ideal["size"]
        
        # Nếu có danh sách các size còn hàng, và size lý tưởng nhất đã hết hàng
        if instock_sizes is not None and len(instock_sizes) > 0:
            instock_set = set(instock_sizes)
            if ideal_size not in instock_set:
                instock_results = [r for r in results if r["size"] in instock_set]
                if instock_results:
                    # Chọn size có điểm hài lòng cao nhất trong các size còn hàng
                    sorted_instock = sorted(instock_results, key=lambda x: x["satisfaction_score"], reverse=True)
                    recommended = sorted_instock[0]
                    is_alternative = True
        
        return {
            "recommended_size": recommended["size"],
            "recommended_fit_quality": recommended["fit_quality"],
            "recommended_satisfaction_score": recommended["satisfaction_score"],
            "all_evaluated_sizes": results,
            "estimated_bra_size": user_bra_size,
            "height_in": round(height_inches, 1),
            "ideal_size": ideal_size,
            "ideal_fit_quality": ideal["fit_quality"],
            "ideal_satisfaction_score": ideal["satisfaction_score"],
            "is_alternative": is_alternative
        }


suggester = SizeSuggester(model, EXPECTED_FEATURES, QUALITY_LABELS, LENGTH_MAPPING, FIT_MAPPING)


class SizePredictionRequest(BaseModel):
    size: str = Field(..., description="Size label (e.g. S, M, L or numerical like 8.0)")
    height: float = Field(..., description="User height in centimeters (e.g. 165)")
    weight: Optional[float] = Field(None, description="User weight in kg (e.g. 55)")
    bra_size: Optional[float] = Field(None, alias="bra_size", description="Bra size / chest in inches (e.g. 34.0)")
    length: str = Field("just right", description="Preferred length: 'just right', 'slightly long', 'slightly short', 'very long', 'very short'")
    fit: str = Field("fit", description="Preferred fit: 'fit', 'large', 'small'")

class SizeRecommendationRequest(BaseModel):
    available_sizes: List[str] = Field(..., description="List of sizes available in stock (e.g. ['S', 'M', 'L'])")
    instock_sizes: Optional[List[str]] = Field(None, description="List of sizes that are actually in stock")
    height: float = Field(..., description="User height in centimeters (e.g. 165)")
    weight: Optional[float] = Field(None, description="User weight in kg (e.g. 55)")
    bra_size: Optional[float] = Field(None, description="Bra size / chest in inches (e.g. 34.0)")
    length: str = Field("just right", description="Preferred length: 'just right', 'slightly long', etc.")
    fit: str = Field("fit", description="Preferred fit: 'fit', 'large', 'small'")



@app.post("/predict")
def predict_size_fit(req: SizePredictionRequest):
    try:
        res = suggester.predict_one(
            size_label=req.size,
            height_cm=req.height,
            weight_kg=req.weight,
            bra_size=req.bra_size,
            length=req.length,
            fit=req.fit
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model prediction error: {str(e)}")

@app.post("/recommend")
def recommend_best_size(req: SizeRecommendationRequest):
    if not req.available_sizes:
        raise HTTPException(status_code=400, detail="available_sizes list cannot be empty")
        
    try:
        res = suggester.recommend(
            available_sizes=req.available_sizes,
            height_cm=req.height,
            weight_kg=req.weight or 50.0,
            bra_size=req.bra_size,
            length=req.length,
            fit=req.fit,
            instock_sizes=req.instock_sizes
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation system error: {str(e)}")



from typing import Dict

class ProductRecommender:
   
    def __init__(self, weight_text: float = 0.5, weight_category: float = 0.3, weight_price: float = 0.2):
        self.w_text = weight_text
        self.w_category = weight_category
        self.w_price = weight_price

    def tokenize_and_normalize(self, text: str) -> List[str]:
        if not text:
            return []
        text = text.lower().strip()
      
        text = re.sub(r'[^\w\s]', '', text)
        return [word for word in text.split() if word]

    def get_word_frequencies(self, tokens: List[str]) -> Dict[str, int]:
        freq = {}
        for token in tokens:
            freq[token] = freq.get(token, 0) + 1
        return freq

    def calculate_cosine_similarity(self, freq1: Dict[str, int], freq2: Dict[str, int]) -> float:
        intersection = set(freq1.keys()) & set(freq2.keys())
        dot_product = sum(freq1[x] * freq2[x] for x in intersection)
        
        norm1 = sum(val**2 for val in freq1.values())
        norm2 = sum(val**2 for val in freq2.values())
        
        if not norm1 or not norm2:
            return 0.0
            
        return dot_product / (math.sqrt(norm1) * math.sqrt(norm2))

    def get_recommendations(self, current_prod: dict, all_products: List[dict], top_k: int = 4) -> List[dict]:
        curr_text = f"{current_prod.get('name', '')} {current_prod.get('category', '')} {current_prod.get('desc', '')}"
        curr_tokens = self.tokenize_and_normalize(curr_text)
        curr_freqs = self.get_word_frequencies(curr_tokens)
        curr_price = float(current_prod.get('salePrice') if current_prod.get('salePrice') and current_prod.get('salePrice') > 0 else current_prod.get('price', 0))
        curr_category = current_prod.get('category', '').lower().strip()
        curr_id = current_prod.get('id')

        recommended_list = []

        for p in all_products:
            if p.get('id') == curr_id:
                continue

            cand_text = f"{p.get('name', '')} {p.get('category', '')} {p.get('desc', '')}"
            cand_tokens = self.tokenize_and_normalize(cand_text)
            cand_freqs = self.get_word_frequencies(cand_tokens)
            
          
            s_text = self.calculate_cosine_similarity(curr_freqs, cand_freqs)

         
            cand_category = p.get('category', '').lower().strip()
            s_category = 1.0 if curr_category == cand_category else 0.0

            
            cand_price = float(p.get('salePrice') if p.get('salePrice') and p.get('salePrice') > 0 else p.get('price', 0))
            max_price = max(curr_price, cand_price, 1.0)
            s_price = 1.0 - (abs(curr_price - cand_price) / max_price)

            final_score = (self.w_text * s_text) + (self.w_category * s_category) + (self.w_price * s_price)

            recommended_list.append({
                "id": p.get('id'),
                "name": p.get('name'),
                "category": p.get('category'),
                "price": p.get('salePrice') if p.get('salePrice') and p.get('salePrice') > 0 else p.get('price'),
                "image": p.get('image'),
                "text_similarity": round(s_text, 3),
                "category_match": s_category,
                "price_similarity": round(s_price, 3),
                "similarity_score": round(final_score, 3)
            })

       
        sorted_list = sorted(recommended_list, key=lambda x: x['similarity_score'], reverse=True)
        return sorted_list[:top_k]



class ProductItem(BaseModel):
    id: int
    name: str
    category: str
    price: float
    desc: Optional[str] = ""
    image: Optional[str] = ""
    salePrice: Optional[float] = None

class ProductRecommendationRequest(BaseModel):
    current_product: ProductItem
    all_products: List[ProductItem]


# Khởi tạo đối tượng thuật toán gợi ý sản phẩm
recommender = ProductRecommender()

@app.post("/recommend-products")
def recommend_products(req: ProductRecommendationRequest):
    try:
        curr_prod = req.current_product.model_dump()
        all_prods = [p.model_dump() for p in req.all_products]
        
        # Thực thi thuật toán gợi ý AI Cosine Similarity
        recommendations = recommender.get_recommendations(curr_prod, all_prods)
        return {"recommended_products": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommender system error: {str(e)}")


# Điểm cuối phục vụ việc kiểm tra trạng thái hoạt động của Máy chủ AI
@app.get("/health")
def health():
    return {"status": "ok", "model": "loaded"}


# === 4. CHATBOX CONVERSATION PROXY WITH GEMINI AI ===

import urllib.request
import urllib.error
import json

class ChatMessage(BaseModel):
    sender: str  # 'user' or 'bot'
    text: str

class ReviewSentimentRequest(BaseModel):
    rating: int
    comment: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

# In-memory cache for catalog to speed up chatbot response times
_products_cache = {
    "data": None,
    "last_fetched": 0.0
}

def get_active_products_list() -> List[dict]:
    """Lấy danh sách sản phẩm động từ Spring Boot API (có cache trong 5 phút để tối ưu tốc độ)"""
    import time
    global _products_cache
    now = time.time()
    
    # Dùng dữ liệu cache nếu chưa quá 5 phút (300 giây)
    if _products_cache["data"] is not None and (now - _products_cache["last_fetched"] < 300):
        return _products_cache["data"]
        
    try:
        req = urllib.request.Request("http://localhost:8080/identity/api/products")
        with urllib.request.urlopen(req, timeout=2) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                _products_cache["data"] = data
                _products_cache["last_fetched"] = now
                return data
    except Exception as e:
        print(f"Error calling products API: {repr(e)}")
        # Fallback dùng dữ liệu cache cũ nếu gặp lỗi kết nối
        if _products_cache["data"] is not None:
            return _products_cache["data"]
    return []

def fetch_products_catalog() -> str:
    """Gọi động API Spring Boot để lấy danh mục sản phẩm hoặc dùng dữ liệu tĩnh dự phòng"""
    try:
        products = get_active_products_list()
        if not products:
            return "Danh mục sản phẩm hiện đang trống."
        catalog_text = "Danh mục sản phẩm hiện có của Bờ Nờ Store:\n"
        for p in products:
            orig_price = p.get('price', 0)
            sale_price = p.get('salePrice')
            if sale_price and sale_price > 0 and sale_price < orig_price:
                price_str = f"{int(sale_price):,d} VND (Đang giảm giá từ {int(orig_price):,d} VND)"
            else:
                price_str = f"{int(orig_price):,d} VND" if orig_price else "N/A"
            desc = p.get('description', '') or ''
            catalog_text += f"- [Mã sản phẩm: {p.get('id')}] - {p.get('name', 'N/A')}: Giá {price_str}. Mô tả: {desc[:100]}... [RECOMMEND_PRODUCT_ID: {p.get('id')}]\n"
        return catalog_text
    except Exception as e:
        print(f"Error fetching catalog from Spring Boot: {repr(e)}")
    
    return "Không thể tải danh mục sản phẩm từ cơ sở dữ liệu."

def parse_price_constraint(query: str):
    query = query.lower().strip()
    
    def to_amount(val_str, unit_str):
        try:
            val = float(val_str)
        except ValueError:
            return 0.0
            
        if not unit_str:
            if val < 50:
                return val * 1_000_000
            elif val < 1000:
                return val * 1_000
            else:
                return val
        
        unit_str = unit_str.strip()
        if unit_str in ['k', 'nghìn', 'nghin', 'ngàn', 'ngan']:
            return val * 1_000
        elif unit_str in ['tr', 'triệu', 'trieu']:
            return val * 1_000_000
        return val

    # 1. Check range first: "từ X đến Y" or "X - Y"
    range_match = re.search(
        r'(?:từ|trong khoảng|khoảng từ)?\s*(\d+(?:\.\d+)?)\s*(k|tr|triệu|trieu|d|đ)?\s*(?:đến|tới|-|và)\s*(\d+(?:\.\d+)?)\s*(k|tr|triệu|trieu|d|đ)?',
        query
    )
    if range_match:
        val1_str, unit1, val2_str, unit2 = range_match.groups()
        if not unit1 and unit2:
            unit1 = unit2
        min_price = to_amount(val1_str, unit1)
        max_price = to_amount(val2_str, unit2)
        return {"type": "range", "min": min_price, "max": max_price}

    # 2. Check upper limit: "dưới X", "thấp hơn X", "nhỏ hơn X", "tối đa X", "< X"
    upper_match = re.search(
        r'(?:dưới|thấp hơn|nhỏ hơn|tối đa|<)\s*(\d+(?:\.\d+)?)\s*(k|tr|triệu|trieu|d|đ)?',
        query
    )
    if upper_match:
        val_str, unit = upper_match.groups()
        max_price = to_amount(val_str, unit)
        return {"type": "max", "val": max_price}

    # 3. Check lower limit: "trên X", "cao hơn X", "lớn hơn X", "tối thiểu X", "> X"
    lower_match = re.search(
        r'(?:trên|cao hơn|lớn hơn|tối thiểu|>)\s*(\d+(?:\.\d+)?)\s*(k|tr|triệu|trieu|d|đ)?',
        query
    )
    if lower_match:
        val_str, unit = lower_match.groups()
        min_price = to_amount(val_str, unit)
        return {"type": "min", "val": min_price}
        
    # 4. Check approximate: "khoảng X", "tầm X", "quanh X", "xấp xỉ X"
    approx_match = re.search(
        r'(?:khoảng|tầm|quanh|xấp xỉ|khoang|tam|xap xi)\s*(\d+(?:\.\d+)?)\s*(k|tr|triệu|trieu|d|đ)?',
        query
    )
    if approx_match:
        val_str, unit = approx_match.groups()
        target_price = to_amount(val_str, unit)
        return {"type": "range", "min": target_price * 0.8, "max": target_price * 1.2}
        
    return None

def parse_purchase_intent(query: str, db_products: List[dict]) -> Optional[List[dict]]:
    query = query.lower().strip()
    
    # 1. Check if the query indicates a purchase intent
    purchase_keywords = ["mua", "đặt", "order", "purchase", "lên đơn", "chốt đơn", "lấy tôi"]
    if not any(kw in query for kw in purchase_keywords):
        return None
        
    # 2. Extract items and quantities
    matches = re.findall(r'(\d+)\s*(?:cái|chiếc|chiêc|mẫu|set)?\s*([a-zA-Zà-ỹÀ-Ỹ\s\-]+?)(?=\b\d+\b|$|và|,|size|cỡ|giá|ở|tại)', query)
    
    items = []
    for qty_str, prod_name_raw in matches:
        qty = int(qty_str)
        prod_name_raw = prod_name_raw.strip()
        
        prod_name_raw = re.split(r'\b(size|cỡ|màu|color)\b', prod_name_raw)[0].strip()
        
        if not prod_name_raw:
            continue
            
        best_match = None
        for p in db_products:
            p_name = p.get('name', '').lower()
            if prod_name_raw in p_name or p_name in prod_name_raw:
                best_match = p
                break
                
        if not best_match:
            for p in db_products:
                p_name = p.get('name', '').lower()
                words = prod_name_raw.split()
                if all(w in p_name for w in words if len(w) > 2):
                    best_match = p
                    break
                    
        if best_match:
            size = "M"
            size_match = re.search(r'\b(?:size|cỡ)\s*([smlxlSMLXL]|\d+)\b', query)
            if size_match:
                size = size_match.group(1).upper()
                
            color = ""
            colors = ["trắng", "đen", "xanh", "navy", "hồng", "đỏ", "vàng", "xám"]
            for c in colors:
                if c in query:
                    color = c.capitalize()
                    break
            if not color and best_match.get('variants'):
                color = best_match['variants'][0].get('color', '')
                
            items.append({
                "id": best_match.get('id'),
                "name": best_match.get('name'),
                "price": best_match.get('salePrice') if best_match.get('salePrice') and best_match.get('salePrice') > 0 else best_match.get('price'),
                "quantity": qty,
                "size": size,
                "color": color
            })
            
    return items if items else None

def get_product_categories(p_name: str, p_desc: str) -> List[str]:
    name = p_name.lower()
    desc = (p_desc or '').lower()
    cats = []
    
    # 1. Áo sơ mi
    if "sơ mi" in name or "somi" in name:
        cats.append("áo sơ mi")
        
    # 2. Áo thun
    if ("thun" in name or "t-shirt" in name or "phông" in name) and not any(x in name for x in ["polo", "sơ mi", "khoác"]):
        cats.append("áo thun")
        
    # 3. Áo polo
    if "polo" in name:
        cats.append("áo polo")
        
    # 4. Áo hoodie
    if "hoodie" in name:
        cats.append("áo hoodie")
        
    # 5. Áo khoác
    if any(x in name for x in ["khoác", "bomber", "jacket"]):
        cats.append("áo khoác")
        
    # 6. Quần jean
    if ("jean" in name or "bò" in name or "denim" in name) and not any(x in name for x in ["áo", "khoác", "jacket"]):
        cats.append("quần jean")
        
    # 7. Quần short
    if any(x in name for x in ["short", "quần đùi", "quần cộc"]) and not any(x in name for x in ["áo", "khoác", "jacket", "bomber"]):
        cats.append("quần short")
        
    # 8. Quần kaki
    if "kaki" in name and not any(x in name for x in ["áo", "khoác", "jacket", "bomber", "short", "quần đùi"]):
        cats.append("quần kaki")
        
    # 9. Giày
    if "giày" in name or "sneaker" in name:
        cats.append("giày")
        
    # 10. Mũ nón
    if "mũ" in name or "nón" in name or "lưỡi trai" in name:
        cats.append("mũ nón")
        
    # 11. Đầm váy
    if "đầm" in name or "váy" in name:
        cats.append("đầm váy")
        
    # 12. Kính mắt
    if "kính" in name or "kinh" in name or "mắt kính" in name:
        cats.append("kính mắt")
        
    return cats

def split_query_into_segments(query: str) -> List[str]:
    q = query.lower()
    for conj in [" và ", " với ", " cùng ", " kèm ", " với cả "]:
        q = q.replace(conj, ", ")
        
    # Split trước số lượng đi kèm từ chỉ loại sản phẩm ví dụ "1 áo thun 1 quần jean"
    q = re.sub(r'(?<!^)\b(\d+)\s*(áo|quần|giày|mũ|nón|kính|đầm|váy)\b', r', \1 \2', q)
    
    segments = [s.strip() for s in q.split(",") if s.strip()]
    return segments

def find_matched_products_for_segment(segment: str, db_products: List[dict], price_constraint: dict) -> dict:
    categories = {
        "áo sơ mi": ["sơ mi", "somi"],
        "áo thun": ["thun", "t-shirt", "t shirt", "phông"],
        "áo polo": ["polo"],
        "áo hoodie": ["hoodie"],
        "áo khoác": ["khoác", "bomber", "jacket"],
        "quần jean": ["jean", "bò", "denim"],
        "quần short": ["short", "quần đùi", "quần cộc"],
        "quần kaki": ["kaki"],
        "giày": ["giày", "sneaker"],
        "mũ nón": ["mũ", "nón"],
        "đầm váy": ["đầm", "váy"],
        "kính mắt": ["kính", "kinh", "mắt kính"]
    }
    
    modifiers = {
        "jean": ["jean", "bò", "denim"],
        "kaki": ["kaki"],
        "thun": ["thun", "t-shirt", "t shirt"],
        "lụa": ["lụa", "satin"],
        "polo": ["polo"],
        "bomber": ["bomber"],
        "hoodie": ["hoodie"],
        "oversize": ["oversize"]
    }
    
    temp_query = segment
    if "áo khoác" in temp_query or "jacket" in temp_query or "bomber" in temp_query:
        temp_query = temp_query.replace("áo khoác jean", "áo khoác").replace("áo khoác denim", "áo khoác").replace("áo khoác bò", "áo khoác")
        temp_query = temp_query.replace("jacket jean", "jacket").replace("jacket denim", "jacket")
        
    detected_categories = []
    for cat_name, keywords in categories.items():
        if any(kw in temp_query for kw in keywords):
            detected_categories.append(cat_name)
            
    # Phân giải xung đột phân loại (áo vs quần, short vs dài) trong cùng một phân đoạn
    if any(c in detected_categories for c in ["áo khoác", "áo sơ mi", "áo thun", "áo polo", "áo hoodie"]):
        for q_cat in ["quần jean", "quần kaki", "quần short"]:
            if q_cat in detected_categories:
                detected_categories.remove(q_cat)
                
    if "quần short" in detected_categories:
        for q_cat in ["quần kaki", "quần jean"]:
            if q_cat in detected_categories:
                detected_categories.remove(q_cat)
            
    category_matches = {}
    matched = []
    
    if detected_categories:
        for cat in detected_categories:
            cat_prods = []
            for p in db_products:
                p_name = p.get('name', '')
                p_desc = p.get('description', '') or ''
                p_cats = get_product_categories(p_name, p_desc)
                if cat in p_cats:
                    cat_prods.append(p)
                    
            # Áp dụng bộ lọc modifier dựa trên phân đoạn này
            active_modifiers = []
            for mod_name, mod_keywords in modifiers.items():
                if any(mk in segment for mk in mod_keywords):
                    cat_keywords = categories[cat]
                    if not any(ck in mod_keywords for ck in cat_keywords):
                        active_modifiers.append(mod_keywords)
                        
            if active_modifiers:
                filtered = []
                for p in cat_prods:
                    p_name = p.get('name', '').lower()
                    p_desc = (p.get('description', '') or '').lower()
                    match_all = True
                    for mod_keywords in active_modifiers:
                        if not any(mk in p_name or mk in p_desc for mk in mod_keywords):
                            match_all = False
                            break
                    if match_all:
                        filtered.append(p)
                cat_prods = filtered
                
            # Áp dụng bộ lọc giá cho danh mục này nếu có
            if price_constraint and cat_prods:
                filtered = []
                for p in cat_prods:
                    price = float(p.get('salePrice') if p.get('salePrice') and p.get('salePrice') > 0 else p.get('price', 0))
                    if price_constraint["type"] == "max":
                        if price <= price_constraint["val"]:
                            filtered.append(p)
                    elif price_constraint["type"] == "min":
                        if price >= price_constraint["val"]:
                            filtered.append(p)
                    elif price_constraint["type"] == "range":
                        if price_constraint["min"] <= price <= price_constraint["max"]:
                            filtered.append(p)
                cat_prods = filtered
                
            category_matches[cat] = cat_prods
            matched.extend(cat_prods)
            
    return {
        "matched": matched,
        "detected_categories": detected_categories,
        "category_matches": category_matches
    }

def find_matched_products(query: str, db_products: List[dict]) -> dict:
    query = query.lower().strip()
    price_constraint = parse_price_constraint(query)
    
    segments = split_query_into_segments(query)
    
    all_detected_categories = []
    all_category_matches = {}
    all_matched = []
    
    for seg in segments:
        res = find_matched_products_for_segment(seg, db_products, price_constraint)
        for cat in res["detected_categories"]:
            if cat not in all_detected_categories:
                all_detected_categories.append(cat)
                
            prods = res["category_matches"].get(cat, [])
            if cat not in all_category_matches:
                all_category_matches[cat] = []
                
            for p in prods:
                if p not in all_category_matches[cat]:
                    all_category_matches[cat].append(p)
                if p not in all_matched:
                    all_matched.append(p)
                    
    # Nếu không khớp bất kỳ phân loại cụ thể nào cho từng phân đoạn
    if not all_matched:
        # Dùng tìm kiếm từ khóa chung chung cho toàn bộ query như cũ làm fallback cuối cùng
        clothing_keywords = ["áo", "quần", "váy", "đầm", "kính", "mũ", "nón", "giày", "sneaker", "hoodie", "sơ mi", "short", "kaki", "jean", "satin", "t-shirt", "thun"]
        general_matched = []
        for kw in clothing_keywords:
            if kw in query:
                for p in db_products:
                    p_name = p.get('name', '').lower()
                    p_desc = (p.get('description', '') or '').lower()
                    if kw in p_name or kw in p_desc:
                        if p not in general_matched:
                            general_matched.append(p)
                            
        if not general_matched:
            words = [w for w in query.split() if len(w) > 2]
            for w in words:
                for p in db_products:
                    p_name = p.get('name', '').lower()
                    p_desc = (p.get('description', '') or '').lower()
                    if w in p_name or w in p_desc:
                        if p not in general_matched:
                            general_matched.append(p)
                            
        is_general_price_query = (not general_matched) and (price_constraint is not None) and any(x in query for x in ["tìm", "mua", "sản phẩm", "gợi ý", "đồ", "món"])
        if is_general_price_query:
            general_matched = db_products
            
        if price_constraint and general_matched:
            filtered = []
            for p in general_matched:
                price = float(p.get('salePrice') if p.get('salePrice') and p.get('salePrice') > 0 else p.get('price', 0))
                if price_constraint["type"] == "max":
                    if price <= price_constraint["val"]:
                        filtered.append(p)
                elif price_constraint["type"] == "min":
                    if price >= price_constraint["val"]:
                        filtered.append(p)
                elif price_constraint["type"] == "range":
                    if price_constraint["min"] <= price <= price_constraint["max"]:
                        filtered.append(p)
            general_matched = filtered
            
        all_matched = general_matched
        
    # Loại bỏ trùng lặp trong all_matched
    unique_matched = []
    seen = set()
    for p in all_matched:
        p_id = p.get('id')
        if p_id not in seen:
            seen.add(p_id)
            unique_matched.append(p)
            
    return {
        "matched": unique_matched,
        "detected_categories": all_detected_categories,
        "category_matches": all_category_matches
    }

@app.post("/chat")
def chat_with_gemini(req: ChatRequest):
    # Doc dong .env de dong bo ngay khi nguoi dung thay doi khoa trong file .env
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if "=" in line and not line.strip().startswith("#"):
                        k, v = line.strip().split("=", 1)
                        os.environ[k.strip()] = v.strip()
        except Exception as e:
            print(f"Loi khi doc dong file .env: {e}")
            
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    gemini_error = None
    
    gemini_contents = []
    
    catalog = fetch_products_catalog()
    
    system_instruction = f"""[CHỈ THỊ HỆ THỐNG - BẮT BUỘC TUÂN THỦ]
Bạn là Elite Fashion Stylist của Bờ Nờ Store.
Quy tắc nghiêm ngặt:
1. HỎI GÌ ĐÁP NẤY: Trả lời trực tiếp vào câu hỏi của khách hàng, tuyệt đối không nói dông dài, không giới thiệu lan man về thương hiệu hay phong cách nếu khách không yêu cầu. Đặc biệt: nếu khách hỏi về một loại sản phẩm cụ thể (ví dụ: áo sơ mi, áo thun, quần jean, áo polo, áo khoác, mũ, giày, áo hoodie, v.v.), chỉ được gợi ý và giới thiệu đúng loại sản phẩm đó từ catalog. Tuyệt đối không được gợi ý thêm hay giới thiệu các sản phẩm thuộc loại khác (ví dụ: khách muốn mua áo sơ mi thì chỉ tư vấn áo sơ mi, KHÔNG tư vấn áo thun hay áo polo).
2. SIÊU CÔ ĐỌNG: Mỗi câu trả lời tối đa 1-3 câu ngắn (dưới 50 từ). Đi thẳng vào sản phẩm hoặc dịch vụ được hỏi.
3. KHÔNG CÓ SẢN PHẨM: Nếu khách hỏi sản phẩm cửa hàng không có, hãy báo ngay là không có và gợi ý 1 sản phẩm thay thế gần nhất (nếu có).
4. DÙNG MARKDOWN IN ĐẬM: In đậm tên sản phẩm hoặc thông số quan trọng bằng `**`.
5. ĐÍNH KÈM THẺ:
   - Khi gợi ý sản phẩm: đính kèm [RECOMMEND_PRODUCT_ID: <id>].
   - Khi hỏi số đo/tư vấn size: đính kèm [TRIGGER_SIZE_CALCULATOR].
   - Khi hỏi phối đồ/mix đồ: đính kèm [TRIGGER_OUTFIT_BOARD].
   - Khi khách muốn gợi ý sản phẩm theo sở thích, phong cách, nhu cầu cá nhân: đính kèm [TRIGGER_PREFERENCE_RECOMMENDER].
   - Khi hỏi theo dõi đơn hàng, tra cứu đơn hàng: đính kèm [TRIGGER_ORDER_TRACKER]. Nếu khách hàng cung cấp số điện thoại hoặc mã đơn hàng trong câu hỏi, đính kèm [TRIGGER_ORDER_TRACKER: <query>] (ví dụ: [TRIGGER_ORDER_TRACKER: GHN10423] hoặc [TRIGGER_ORDER_TRACKER: 0987654321]).
6. LỌC THEO GIÁ: Nếu khách hàng đưa ra yêu cầu về giá (ví dụ: 'dưới 400k', 'trên 500k', 'từ 200k đến 400k', v.v.), bạn phải đối chiếu với giá của sản phẩm trong catalog Bờ Nờ Store và CHỈ gợi ý các sản phẩm thỏa mãn điều kiện mức giá đó.

Thông tin catalog Bờ Nờ Store:
{catalog}

Dịch vụ & Chính sách:
- Ship: Freeship từ 500k. Dưới 500k phí ship 30k. Nhận sau 2-4 ngày.
- Đổi trả: Miễn phí tại nhà trong vòng 30 ngày.
- Giờ mở cửa: 09:00 - 22:00 hàng ngày.
- Địa chỉ: 123 Đường Lụa, Quận 1, TP.HCM & 45 Phố Bông Hữu Cơ, Hoàn Kiếm, Hà Nội.
- Hotline: 1900 888 999.
"""

    # User gửi chỉ thị hệ thống
    gemini_contents.append({
        "role": "user",
        "parts": [{"text": system_instruction}]
    })
    
    # Model xác nhận chỉ thị hệ thống
    gemini_contents.append({
        "role": "model",
        "parts": [{"text": "Dạ, tôi đã ghi nhận. Tôi sẽ trả lời cực kỳ ngắn gọn, đi thẳng vào câu hỏi và tuyệt đối không lan man dài dòng."}]
    })
    
    # Thêm lịch sử trò chuyện của người dùng (bỏ qua tin nhắn model đầu tiên để giữ tính luân phiên của Gemini)
    started_with_user = False
    for msg in req.history:
        role = "user" if msg.sender == "user" else "model"
        if role == "user":
            started_with_user = True
            
        if started_with_user and msg.text.strip():
            gemini_contents.append({
                "role": role,
                "parts": [{"text": msg.text}]
            })
            
    # Thêm câu hỏi hiện tại của người dùng
    if req.message.strip():
        gemini_contents.append({
            "role": "user",
            "parts": [{"text": req.message}]
        })
  
    if api_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={api_key}"
            payload = {
                "contents": gemini_contents,
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 1024
                }
            }
            
            req_data = json.dumps(payload).encode('utf-8')
            api_req = urllib.request.Request(
                url,
                data=req_data,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            
            with urllib.request.urlopen(api_req, timeout=30) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                candidates = res_data.get("candidates", [])
                if candidates:
                    content = candidates[0].get("content", {})
                    parts = content.get("parts", [])
                    if parts:
                        text_response = parts[0].get("text", "")
                        return {"response": text_response, "source": "gemini"}
                
                raise Exception("Could not extract text response from Gemini.")
                
        except urllib.error.HTTPError as he:
            error_body = he.read().decode('utf-8')
            print(f"Gemini API HTTP Error {he.code}: {error_body}")
            try:
                err_json = json.loads(error_body)
                gemini_error = f"HTTP {he.code}: {err_json.get('error', {}).get('message', 'Unknown Error')}"
            except Exception:
                gemini_error = f"HTTP {he.code}: {error_body[:100]}"
        except Exception as e:
            print(f"Error connecting to Gemini API (switching to Fallback): {repr(e)}")
            gemini_error = str(e)

    # --- HỆ THỐNG PHẢN HỒI THÔNG MINH OFFLINE (FALLBACK) ---
    query = req.message.lower().strip()
    
    # Chuẩn hóa chiều cao dạng 1m67 hoặc 1.67m thành 167 để phân tích chính xác
    normalized_query = query
    normalized_query = re.sub(r'\b1m([5-9]\d)\b', r'1\1', normalized_query)
    normalized_query = re.sub(r'\b1m([5-9])\b', r'1\g<1>0', normalized_query)
    normalized_query = re.sub(r'\b1[.,]([5-9]\d)\s*m\b', r'1\1', normalized_query)
    normalized_query = re.sub(r'\b1[.,]([5-9]\d)\b', r'1\1', normalized_query)
    
    h_match = re.search(r'\b(1[4-9]\d|2[0-1]\d)\s*(?:cm)?\b', normalized_query)
    w_match = re.search(r'\b([3-9]\d|1[0-4]\d)\s*(?:kg)?\b', normalized_query)
    
    # Phân tích chào hỏi trước
    if any((re.search(rf'\b{x}\b', normalized_query) if x in ["hi", "hello"] else x in normalized_query) for x in ["chào", "hi", "hello"]):
        reply = "Xin chào! Bờ Nờ AI có thể giúp gì cho bạn? Tôi hỗ trợ **chọn size**, **gợi ý phối đồ**, thông tin sản phẩm và chính sách của cửa hàng."
        
    # Phân tích số đo chiều cao & cân nặng (chuyển sang mở Size Selector Widget)
    elif h_match and w_match:
        h = float(h_match.group(1))
        w = float(w_match.group(1))
        reply = f"Dạ, tôi ghi nhận chiều cao của bạn là **{int(h)}cm** và cân nặng **{int(w)}kg**. Bạn vui lòng nhấn nút dưới đây để SmartFit AI tính toán và áp dụng kích cỡ phù hợp nhất cho bạn nhé: [TRIGGER_SIZE_CALCULATOR: height={int(h)}, weight={int(w)}]"
        
    # Phối đồ, mix đồ, outfit
    elif any(x in normalized_query for x in ["phối đồ", "outfit", "set đồ", "mix đồ", "phối hợp"]):
        reply = "Dạ, tôi gợi ý bảng phối đồ thông minh tương tác dưới đây để bạn dễ dàng lựa chọn sản phẩm phù hợp: [TRIGGER_OUTFIT_BOARD]"

    # Theo dõi đơn hàng / tra cứu đơn hàng
    elif any(x in normalized_query for x in ["theo dõi đơn", "tra cứu đơn", "đơn hàng", "vận đơn", "kiểm tra đơn", "tình trạng đơn", "trạng thái đơn", "track"]):
        # Thử trích xuất mã đơn hàng dạng GHNxxxxx hoặc chữ số hoặc số điện thoại
        ghn_match = re.search(r'\b(ghn\d+|ghn-\d+|ghn\s+\d+)\b', normalized_query)
        phone_match = re.search(r'\b(0[35789]\d{8})\b', normalized_query)
        id_match = re.search(r'\b(\d{1,6})\b', normalized_query)
        
        extracted_query = ""
        if ghn_match:
            extracted_query = ghn_match.group(1).replace(" ", "").upper()
        elif phone_match:
            extracted_query = phone_match.group(1)
        elif id_match and not any(h in normalized_query for h in ["cm", "kg", "size", "cỡ", "chiều cao", "cân nặng"]):
            # Tránh nhầm với số đo chiều cao cân nặng
            extracted_query = id_match.group(1)
            
        if extracted_query:
            reply = f"Dạ, tôi ghi nhận yêu cầu tra cứu đơn hàng với thông tin: **{extracted_query}**. Vui lòng kiểm tra kết quả trực tiếp tại tiện ích bên dưới: [TRIGGER_ORDER_TRACKER: {extracted_query}]"
        else:
            reply = "Dạ, mời bạn nhập Mã đơn hàng (VD: 1 hoặc GHNxxxx) hoặc Số điện thoại vào ô tra cứu dưới đây để tôi hỗ trợ kiểm tra nhé: [TRIGGER_ORDER_TRACKER]"

    # Tư vấn theo sở thích / phong cách
    elif any(x in normalized_query for x in ["sở thích", "phong cách", "gợi ý thích", "khuyến nghị phong cách", "preference", "style"]):
        reply = "Dạ, để tìm được sản phẩm ưng ý nhất theo phong cách và nhu cầu cá nhân của bạn, bạn hãy chọn các bộ lọc dưới đây nhé: [TRIGGER_PREFERENCE_RECOMMENDER]"

    # Yêu cầu tư vấn chọn size
    elif any(x in normalized_query for x in ["size", "cỡ", "chọn size", "tư vấn size", "chiều cao", "cân nặng"]):
        reply = "Dạ, mời bạn nhập chiều cao và cân nặng vào bảng tính **SmartFit AI** dưới đây để tôi đề xuất kích cỡ chuẩn xác nhất cho bạn nhé: [TRIGGER_SIZE_CALCULATOR]"
        
    # Phí ship
    elif any(x in normalized_query for x in ["ship", "vận chuyển", "giao hàng", "phí"]):
        reply = "Dạ, Freeship đơn từ **500.000đ**. Đơn dưới 500k phí ship đồng giá **30.000đ** qua GHN. Thời gian giao 2 - 4 ngày."
        
    # Đổi trả
    elif any(x in normalized_query for x in ["đổi trả", "hoàn tiền", "trả hàng"]):
        reply = "Dạ, Bờ Nờ miễn phí đổi trả tận nhà trong vòng **30 ngày** kể từ khi nhận hàng. Hàng cần nguyên tag mác."
        
    # Chất liệu vải
    elif any(x in normalized_query for x in ["vải", "chất liệu", "cotton"]):
        reply = "Dạ, sản phẩm dệt từ **100% Cotton Organic** tự nhiên siêu mịn và **Lụa Satin** bóng mướt tinh xảo."
        
    # Địa chỉ cửa hàng
    elif any(x in normalized_query for x in ["địa chỉ", "cửa hàng", "ở đâu", "location", "address", "chi nhánh"]):
        reply = "Dạ, Bờ Nờ Store ở **123 Đường Lụa, Q.1, TP.HCM** & **45 Phố Bông Hữu Cơ, Hoàn Kiếm, Hà Nội**. Mở cửa **09:00 - 22:00**."

    # Liên hệ hotline
    elif any(x in normalized_query for x in ["liên hệ", "sđt", "hotline", "điện thoại", "contact", "zalo"]):
        reply = "Dạ, hotline hỗ trợ 24/7 của chúng tôi là **1900 888 999** và Zalo: **0987 654 321**."

    # Giờ hoạt động
    elif any(x in normalized_query for x in ["giờ mở cửa", "mở cửa", "đóng cửa", "hoạt động", "time", "hours"]):
        reply = "Dạ, hệ thống cửa hàng mở cửa từ **09:00 đến 22:00** hàng ngày."

    # Thanh toán
    elif any(x in normalized_query for x in ["thanh toán", "momo", "vnpay", "cod", "chuyển khoản", "banking"]):
        reply = "Dạ, Bờ Nờ hỗ trợ thanh toán tiền mặt khi nhận hàng (COD), chuyển khoản ngân hàng, ví Momo và VNPay."

    # Bảo quản quần áo
    elif any(x in normalized_query for x in ["bảo quản", "giặt", "ủi", "phơi", "giặt là"]):
        reply = "Dạ, bạn nên giặt tay hoặc dùng túi giặt chế độ nhẹ, phơi bóng râm và ủi bàn hơi ở nhiệt độ thấp."
        
    # Tìm kiếm sản phẩm bằng ngôn ngữ tự nhiên (truy vấn động từ database)
    else:
        db_products = get_active_products_list()
        clothing_keywords = ["áo", "quần", "váy", "đầm", "kính", "mũ", "nón", "giày", "sneaker", "hoodie", "sơ mi", "short", "kaki", "jean", "satin", "t-shirt", "thun"]
        
        has_clothing_mention = any(kw in normalized_query for kw in clothing_keywords)
        is_search_intent = any(x in normalized_query for x in ["tìm", "mua", "sản phẩm", "có bán", "muốn tìm", "kiếm", "gợi ý", "tư vấn"]) or has_clothing_mention
        
        if is_search_intent and db_products:
            res = find_matched_products(normalized_query, db_products)
            matched_products = res["matched"]
            detected_categories = res["detected_categories"]
            category_matches = res["category_matches"]
            
            # Trường hợp có các danh mục cụ thể được chỉ định
            if detected_categories:
                available_cats = {}
                unavailable_cats = []
                
                for cat in detected_categories:
                    prods = category_matches.get(cat, [])
                    if prods:
                        available_cats[cat] = prods[:3]  # Giới hạn tối đa 3 sản phẩm mỗi danh mục
                    else:
                        unavailable_cats.append(cat)
                        
                if available_cats or unavailable_cats:
                    parts = []
                    if available_cats:
                        parts.append("Dạ, Bờ Nờ Store có sản phẩm phù hợp với bạn:")
                        for cat, prods in available_cats.items():
                            p_names = ", ".join([f"**{p.get('name')}**" for p in prods])
                            p_tags = " ".join([f"[RECOMMEND_PRODUCT_ID: {p.get('id')}]" for p in prods])
                            parts.append(f"- Về **{cat}**: {p_names} {p_tags}")
                            
                    if unavailable_cats:
                        cats_str = ", ".join([f"**{cat}**" for cat in unavailable_cats])
                        parts.append(f"Còn đối với {cats_str}, hiện tại shop chưa có sản phẩm này.")
                        
                    reply = "\n".join(parts)
                else:
                    reply = "Dạ, hiện tại dòng sản phẩm này chưa có hoặc đã hết hàng trong database của Bờ Nờ Store."
            
            # Trường hợp tìm kiếm chung chung (không phát hiện danh mục cụ thể)
            else:
                if matched_products:
                    matched_products = matched_products[:4]
                    tags = " ".join([f"[RECOMMEND_PRODUCT_ID: {p.get('id')}]" for p in matched_products])
                    product_names = ", ".join([f"**{p.get('name')}**" for p in matched_products])
                    reply = f"Dạ, Bờ Nờ Store có sản phẩm phù hợp với bạn: {product_names}. Bạn có thể xem chi tiết bên dưới nhé: {tags}"
                else:
                    reply = "Dạ, hiện tại dòng sản phẩm này chưa có hoặc đã hết hàng trong database của Bờ Nờ Store."
        elif is_search_intent and not db_products:
            reply = "Dạ, hiện tại danh mục sản phẩm trên website đang trống hoặc không kết nối được database."
        else:
            reply = "Dạ, tôi có thể giúp bạn **chọn size**, tư vấn **phối đồ**, xem **chính sách vận chuyển/đổi trả** hoặc thông tin sản phẩm có trong cửa hàng. Bạn cần hỗ trợ gì ạ?"

        
    # Log lỗi Gemini ra console backend để quản trị viên nắm thông tin, không hiển thị thô ra giao diện người dùng
    if gemini_error:
        print(f"[CHAT ERROR] Gemini API Rate Limit / Quota error: {repr(gemini_error)}")
    
 
    return {"response": reply, "source": "offline_fallback"}



@app.post("/check-sentiment")
def check_sentiment(req: ReviewSentimentRequest):
    # Sử dụng lazy import để tăng tốc độ khởi động FastAPI
    try:
        from underthesea import sentiment
        predicted = sentiment(req.comment) # Trả về 'positive', 'negative', 'neutral' hoặc None
    except Exception as e:
        print(f"[SENTIMENT ERROR] Error during sentiment analysis: {repr(e)}")
        predicted = "neutral"
    
    is_consistent = True
    warning = ""
    
    # 4 hoặc 5 sao nhưng bình luận tiêu cực
    if req.rating >= 4 and predicted == "negative":
        is_consistent = False
        warning = "Bạn đã đánh giá số sao cao (tích cực) nhưng nội dung bình luận lại mang tính tiêu cực."
    # 1 hoặc 2 sao nhưng bình luận tích cực
    elif req.rating <= 2 and predicted == "positive":
        is_consistent = False
        warning = "Bạn đã đánh giá số sao thấp (tiêu cực) nhưng nội dung bình luận lại mang tính tích cực."
        
    return {
        "sentiment": predicted,
        "is_consistent": is_consistent,
        "warning": warning
    }


