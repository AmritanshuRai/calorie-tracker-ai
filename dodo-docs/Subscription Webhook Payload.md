Subscription Webhook Payload

Copy page

The payload sent to your webhook endpoint when a subscription is created or updated.

Response struct representing subscription details

​
addons
Addon Cart Response Item · object[]required
Addons associated with this subscription

Show child attributes

​
billing
objectrequired
Billing address details for payments

Show child attributes

​
cancel_at_next_billing_date
booleanrequired
Indicates if the subscription will cancel at the next billing date

​
created_at
string<date-time>required
Timestamp when the subscription was created

​
currency
enum<string>required
Currency used for the subscription payments

Available options: AED, ALL, AMD, ANG, AOA, ARS, AUD, AWG, AZN, BAM, BBD, BDT, BGN, BHD, BIF, BMD, BND, BOB, BRL, BSD, BWP, BYN, BZD, CAD, CHF, CLP, CNY, COP, CRC, CUP, CVE, CZK, DJF, DKK, DOP, DZD, EGP, ETB, EUR, FJD, FKP, GBP, GEL, GHS, GIP, GMD, GNF, GTQ, GYD, HKD, HNL, HRK, HTG, HUF, IDR, ILS, INR, IQD, JMD, JOD, JPY, KES, KGS, KHR, KMF, KRW, KWD, KYD, KZT, LAK, LBP, LKR, LRD, LSL, LYD, MAD, MDL, MGA, MKD, MMK, MNT, MOP, MRU, MUR, MVR, MWK, MXN, MYR, MZN, NAD, NGN, NIO, NOK, NPR, NZD, OMR, PAB, PEN, PGK, PHP, PKR, PLN, PYG, QAR, RON, RSD, RUB, RWF, SAR, SBD, SCR, SEK, SGD, SHP, SLE, SLL, SOS, SRD, SSP, STN, SVC, SZL, THB, TND, TOP, TRY, TTD, TWD, TZS, UAH, UGX, USD, UYU, UZS, VES, VND, VUV, WST, XAF, XCD, XOF, XPF, YER, ZAR, ZMW
​
customer
objectrequired
Customer details associated with the subscription

Show child attributes

​
metadata
objectrequired
Additional custom data associated with the subscription

Show child attributes

​
meters
object[]required
Meters associated with this subscription (for usage-based billing)

Show child attributes

​
next_billing_date
string<date-time>required
Timestamp of the next scheduled billing. Indicates the end of current billing period

​
on_demand
booleanrequired
Wether the subscription is on-demand or not

​
payment_frequency_count
integerrequired
Number of payment frequency intervals

​
payment_frequency_interval
enum<string>required
Time interval for payment frequency (e.g. month, year)

Available options: Day, Week, Month, Year
​
previous_billing_date
string<date-time>required
Timestamp of the last payment. Indicates the start of current billing period

​
product_id
stringrequired
Identifier of the product associated with this subscription

​
quantity
integerrequired
Number of units/items included in the subscription

​
recurring_pre_tax_amount
integerrequired
Amount charged before tax for each recurring payment in smallest currency unit (e.g. cents)

​
status
enum<string>required
Current status of the subscription

Available options: pending, active, on_hold, cancelled, failed, expired
​
subscription_id
stringrequired
Unique identifier for the subscription

​
subscription_period_count
integerrequired
Number of subscription period intervals

​
subscription_period_interval
enum<string>required
Time interval for the subscription period (e.g. month, year)

Available options: Day, Week, Month, Year
​
tax_inclusive
booleanrequired
Indicates if the recurring_pre_tax_amount is tax inclusive

​
trial_period_days
integerrequired
Number of days in the trial period (0 if no trial)

​
cancelled_at
string<date-time> | null
Cancelled timestamp if the subscription is cancelled

​
discount_cycles_remaining
integer | null
Number of remaining discount cycles if discount is applied

​
discount_id
string | null
The discount id if discount is applied

​
expires_at
string<date-time> | null
Timestamp when the subscription will expire

​
tax_id
string | null
Tax identifier provided for this subscription (if applicable)
