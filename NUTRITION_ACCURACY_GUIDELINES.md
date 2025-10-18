# Nutrition Data Accuracy Guidelines

**Date:** October 18, 2025  
**Purpose:** Ensure OpenAI provides accurate USDA-verified nutritional data

---

## Core Principles

### 1. **Always Use USDA FoodData Central (FDC)**

- Primary source: https://fdc.nal.usda.gov/
- Reference specific FDC IDs when known
- Never estimate or approximate micronutrient values

### 2. **Common Accuracy Pitfalls**

#### ⚠️ **Fiber Content**

**Problem:** Often underestimated  
**Reality:** Many plant foods have 12-15g per 100g

**Examples:**

- Popcorn (air-popped): **14.5g** (not 11g)
- Chia seeds: **34g**
- Whole wheat bread: **6-8g**

#### ⚠️ **B Vitamins (B1, B2, B3, B5, B6)**

**Problem:** Often overestimated  
**Reality:** Most foods have LOW B vitamin content

**Examples - Popcorn (air-popped):**

- B1 (Thiamine): **0.18 mg** (not 0.34)
- B2 (Riboflavin): **0.08 mg** (not 0.21)
- B3 (Niacin): **2.6 mg** (not 5.0)
- B5 (Pantothenic acid): **0.42 mg** (not 0.9)
- B6 (Pyridoxine): **0.15 mg** (not 0.9)

**High B-vitamin foods:**

- Nutritional yeast, liver, fortified cereals
- Most other foods have <0.5 mg per 100g

#### ⚠️ **Calcium**

**Problem:** Often overestimated in plant foods  
**Reality:** Plant foods typically have 5-20mg unless fortified

**Examples:**

- Popcorn: **7 mg** (not 37)
- Rice: **10-28 mg**
- Wheat flour: **15 mg**

**High calcium foods:**

- Dairy (milk: 120mg, cheese: 700mg)
- Leafy greens (kale: 150mg, spinach: 99mg)
- Fortified foods (tofu: 350mg)

#### ⚠️ **Selenium**

**Problem:** Often MASSIVELY overestimated  
**Reality:** Trace mineral - usually <1µg unless seafood/brazil nuts

**Examples:**

- Popcorn: **0.3 µg** (not 15.5 µg!)
- Most grains: **0.2-5 µg**
- Rice: **15 µg**

**High selenium foods:**

- Brazil nuts: **1917 µg** per 100g
- Tuna: **90 µg**
- Eggs: **31 µg**

#### ⚠️ **Omega-3 Fatty Acids**

**Problem:** Often overestimated  
**Reality:** Very low in most foods (<0.1g)

**Examples:**

- Popcorn: **0.02 g** (not 0.1)
- Chicken breast: **0.03 g**
- Bread: **0.05 g**

**High omega-3 foods:**

- Flaxseeds: **22.8 g**
- Chia seeds: **17.8 g**
- Salmon: **2.3 g**

#### ⚠️ **Water Content**

**Problem:** Not accounting for food state  
**Reality:** Varies dramatically by preparation

**Examples:**

- Dry foods (popcorn, crackers, pasta): **2-4%**
- Semi-dry (bread): **35-40%**
- Fresh fruits: **80-95%**
- Cooked vegetables: **70-90%**

**Popcorn water content:** **3.0 g** (not 4.9) per 100g

#### ⚠️ **Vitamin E and K**

**Problem:** Often shown as 0 when present  
**Reality:** Present in small amounts in many foods

**Examples - Popcorn:**

- Vitamin E: **0.29 mg** (not 0)
- Vitamin K: **1.1 µg** (not 0)

---

## Verification Checklist for Common Foods

### **Air-Popped Popcorn (100g) - FDC ID 170188**

✅ **Correct USDA Values:**

```json
{
  "calories": 387,
  "protein": 12.9,
  "carbs": 77.9,
  "fats": 4.5,
  "fiber": 14.5, // ⚠️ Often underestimated
  "sugar": 0.9,
  "sodium": 7,
  "cholesterol": 0,
  "water": 3.0, // ⚠️ Often overestimated
  "omega3": 0.02, // ⚠️ Often overestimated
  "vitaminA": 10, // IU
  "vitaminE": 0.29, // ⚠️ Often shown as 0
  "vitaminK": 1.1, // ⚠️ Often shown as 0
  "vitaminB1": 0.18, // ⚠️ Often overestimated
  "vitaminB2": 0.08, // ⚠️ Often overestimated
  "vitaminB3": 2.6, // ⚠️ Often overestimated
  "vitaminB5": 0.42, // ⚠️ Often overestimated
  "vitaminB6": 0.15, // ⚠️ Often overestimated
  "vitaminB9": 31,
  "calcium": 7, // ⚠️ Often overestimated
  "iron": 1.3,
  "magnesium": 145,
  "phosphorus": 358, // ⚠️ Often underestimated
  "potassium": 274,
  "zinc": 2.2,
  "manganese": 0.9,
  "copper": 0.3,
  "selenium": 0.3 // ⚠️ Often MASSIVELY overestimated
}
```

---

## Common Food Categories - Quick Reference

### **Grains & Cereals**

- **Fiber:** 10-15g (whole grain), 2-3g (refined)
- **B vitamins:** Low to moderate (0.1-0.5 mg)
- **Calcium:** 10-30 mg
- **Selenium:** 0.2-15 µg
- **Water:** 8-12% (dry), 35-40% (bread)

### **Meat & Poultry**

- **Protein:** 20-30g
- **B vitamins:** Moderate to high (especially B12)
- **Iron:** 1-3 mg (chicken), 2.5 mg (beef)
- **Selenium:** 20-40 µg
- **Water:** 60-75%

### **Fruits**

- **Fiber:** 2-4g
- **Vitamin C:** Varies (0-60 mg)
- **Calcium:** 5-20 mg
- **Water:** 80-95%

### **Vegetables**

- **Fiber:** 2-5g
- **Calcium:** Leafy greens 50-150mg, others 10-40mg
- **Water:** 85-95%

### **Dairy**

- **Calcium:** 100-1200 mg
- **Vitamin B12:** High (0.4-1.0 µg)
- **Vitamin D:** Often fortified (1-2 µg)

### **Nuts & Seeds**

- **Fats:** 45-75g
- **Fiber:** 8-12g
- **Selenium:** Brazil nuts (1917 µg!), others (<10 µg)
- **Omega-3:** Flax/chia (high), others (low)

---

## Prompt Engineering Strategy

### System Prompt Key Points:

1. **Authority:** "USDA FoodData Central as your ONLY reference"
2. **Specificity:** Reference FDC IDs when possible
3. **Caution:** "NEVER estimate or approximate"
4. **Focus Areas:** List problematic nutrients explicitly
5. **Validation:** "Double-check logical relationships"

### User Prompt Key Points:

1. **Source:** "using USDA FoodData Central nutritional database"
2. **Guidelines:** Specific ranges for problematic nutrients
3. **Examples:** "Fiber: many plant foods have 12-15g per 100g"
4. **Warnings:** "Selenium: Usually <1µg unless seafood/nuts"

### Model Parameters:

- **max_completion_tokens:** 2500 (allow thorough analysis)
- **reasoning_effort:** "medium" (not "minimal" - need accuracy over speed)
- **temperature:** Default (deterministic with structured outputs)

---

## Testing Protocol

### Test Foods for Accuracy:

1. **Air-popped popcorn** (high fiber, low B vitamins, low selenium)
2. **Chicken breast** (high protein, moderate B vitamins)
3. **Spinach** (high calcium for a plant, high iron)
4. **Salmon** (high omega-3, high vitamin D, high selenium)
5. **Brazil nuts** (EXTREMELY high selenium - 1917 µg)
6. **White rice** (low fiber, low B vitamins)
7. **Orange** (high vitamin C, low everything else)

### Validation Steps:

1. Parse the food with OpenAI
2. Compare against USDA FDC database
3. Check the 7 problematic nutrients:
   - ✅ Fiber (not underestimated)
   - ✅ B vitamins (not overestimated)
   - ✅ Calcium (not overestimated in plants)
   - ✅ Selenium (not massively overestimated)
   - ✅ Omega-3 (not overestimated)
   - ✅ Water (matches food state)
   - ✅ Vitamin E/K (not shown as 0 when present)

---

## Model Limitations & Workarounds

### Known GPT-5-nano Issues:

1. **Training data cutoff:** May not have latest USDA updates
2. **Reasoning depth:** "minimal" mode too quick, "medium" better
3. **Numeric precision:** Sometimes rounds to nearest whole number

### Workarounds:

1. **Explicit instructions:** Be very specific in prompts
2. **Examples:** Provide correct ranges in user prompt
3. **Validation layer:** Consider backend validation against USDA API
4. **User feedback:** Allow manual corrections and learn from them

### Future Enhancements:

1. **USDA API integration:** Direct lookup for common foods
2. **Confidence scores:** Flag uncertain values
3. **Multi-model approach:** Use GPT-4 for complex/ambiguous foods
4. **Crowdsourced corrections:** Learn from user-submitted accurate data

---

## References

- **USDA FoodData Central:** https://fdc.nal.usda.gov/
- **Popcorn (Air-popped):** https://fdc.nal.usda.gov/fdc-app.html#/food-details/170188/nutrients
- **Daily Values (DV):** https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels
- **Nutrient Requirements:** https://ods.od.nih.gov/

---

**Last Updated:** October 18, 2025  
**Next Review:** After 100 food parsing tests
