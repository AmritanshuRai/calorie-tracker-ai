# Timezone Handling

This application properly handles dates across different timezones by storing all dates in UTC and normalizing them to represent calendar days.

## How it works

### Backend (Server)

- All dates are stored in the database as UTC timestamps
- Dates represent midnight UTC of the selected calendar day
- When querying for a specific date (e.g., "2025-10-18"), the server searches for entries between `2025-10-18T00:00:00.000Z` and `2025-10-18T23:59:59.999Z`

### Frontend (Client)

- When a user selects a date, it's normalized to UTC midnight using `Date.UTC(year, month, day, 0, 0, 0, 0)`
- The normalized date is sent to the server as an ISO string
- This ensures that Oct 18 in any timezone is stored as `2025-10-18T00:00:00.000Z` in the database

## Why this approach?

This approach ensures that:

1. Users in different timezones see consistent dates
2. Food entries logged on "Oct 18" will always appear on Oct 18, regardless of timezone
3. No timezone conversion issues when traveling or using the app from different locations

## Key Implementation Details

### Saving Food Entries (`FoodLogModal.jsx`)

```javascript
const year = selectedDate.getFullYear();
const month = selectedDate.getMonth();
const day = selectedDate.getDate();
const normalizedDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
```

### Querying Food Entries (`food.js` route)

```javascript
const startOfDay = new Date(date + 'T00:00:00.000Z');
const endOfDay = new Date(date + 'T23:59:59.999Z');
```

This pattern works correctly for users in any timezone around the world.
