# Database Schema Update - Diet & Health Fields

## Date: October 18, 2025

## Summary

Added new fields to store diet preferences and health conditions in the onboarding flow.

## Schema Changes

### UserOnboarding Model

Added 3 new fields to `UserOnboarding` table:

```prisma
dietPreference          String?   // User's preferred diet type
healthConditions        String[]  // Array of selected health condition IDs
customHealthConditions  String[]  // Array of custom health conditions entered by user
```

### Field Descriptions

1. **dietPreference** (String, Optional)

   - Stores the user's dietary preference
   - Possible values:
     - `ai_recommended` - Let AI suggest best diet
     - `balanced` - Mix of all food groups
     - `mediterranean` - Mediterranean diet
     - `keto` - Ketogenic diet
     - `paleo` - Paleo diet
     - `vegetarian` - Vegetarian diet
     - `vegan` - Vegan diet
     - `low_carb` - Low carbohydrate diet
     - `high_protein` - High protein diet
     - `low_fat` - Low fat diet

2. **healthConditions** (String Array, Default: [])

   - Stores selected common health conditions
   - Possible values:
     - `diabetes`
     - `high_blood_pressure`
     - `high_cholesterol`
     - `fatty_liver`
     - `thyroid`
     - `pcos`
     - `heart_disease`
     - `kidney_disease`
     - `gout`
     - `ibs`
     - `food_allergies`
     - `none`

3. **customHealthConditions** (String Array, Default: [])
   - Stores user-entered custom health conditions
   - Free text entries for conditions not in the predefined list
   - Example: `["Lactose intolerance", "Gluten sensitivity"]`

## Migration Details

**Migration Name:** `20251018102928_add_diet_and_health_fields`

**Migration SQL:**

```sql
ALTER TABLE "UserOnboarding"
ADD COLUMN "dietPreference" TEXT,
ADD COLUMN "healthConditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "customHealthConditions" TEXT[] DEFAULT ARRAY[]::TEXT[];
```

## API Changes

### POST `/api/auth/onboarding`

**New Request Body Fields:**

```json
{
  // ... existing fields ...
  "dietPreference": "keto",
  "healthConditions": ["diabetes", "high_blood_pressure"],
  "customHealthConditions": ["Lactose intolerance"]
}
```

### GET `/api/auth/profile`

**New Response Fields:**

```json
{
  // ... existing fields ...
  "dietPreference": "keto",
  "healthConditions": ["diabetes", "high_blood_pressure"],
  "customHealthConditions": ["Lactose intolerance"]
}
```

## Frontend Changes

### New Onboarding Pages

1. **DietPreferencePage** (`/onboarding/diet-preference`)

   - Step 8 of 10
   - Allows selection of diet preference
   - Grid layout with 10 options

2. **HealthConditionsPage** (`/onboarding/health-conditions`)
   - Step 9 of 10
   - Allows selection of health conditions
   - Supports custom condition entries

### Updated Onboarding Flow

**Previous (8 steps):**
Gender → Age → Goal → Height → Weight → Activity → Timeline → Final

**New (10 steps):**
Gender → Age → Goal → Height → Weight → Activity → Timeline → **Diet Preference** → **Health Conditions** → Final

### Store Updates

`useUserStore` now tracks:

```javascript
onboardingData: {
  // ... existing fields ...
  dietPreference: string,
  healthConditions: string[],
  customHealthConditions: string[]
}
```

## Testing Checklist

- [x] Schema migration applied successfully
- [x] Prisma Client regenerated
- [ ] Test onboarding flow end-to-end
- [ ] Verify data is saved to database
- [ ] Verify data is retrieved on profile load
- [ ] Test with all diet preference options
- [ ] Test with multiple health conditions
- [ ] Test with custom health conditions
- [ ] Test "None" option for health conditions
- [ ] Verify backward compatibility (existing users)

## Rollback Plan

If issues arise, rollback migration:

```bash
npx prisma migrate resolve --rolled-back 20251018102928_add_diet_and_health_fields
```

Then manually revert schema.prisma changes and run:

```bash
npx prisma generate
```

## Notes

- All new fields are optional to maintain backward compatibility
- Existing users will have `null` for dietPreference and empty arrays for health conditions
- The "None" option in health conditions allows users to explicitly state they have no conditions
- Custom health conditions provide flexibility for rare or unlisted conditions
