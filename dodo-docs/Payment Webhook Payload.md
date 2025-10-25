Payment Webhook Payload

Copy page

The payload sent to your webhook endpoint when a payment is created or updated.

​
billing
objectrequired
Billing address details for payments

Show child attributes

​
brand_id
stringrequired
brand id this payment belongs to

​
business_id
stringrequired
Identifier of the business associated with the payment

​
created_at
string<date-time>required
Timestamp when the payment was created

​
currency
enum<string>required
Currency used for the payment

Available options: AED, ALL, AMD, ANG, AOA, ARS, AUD, AWG, AZN, BAM, BBD, BDT, BGN, BHD, BIF, BMD, BND, BOB, BRL, BSD, BWP, BYN, BZD, CAD, CHF, CLP, CNY, COP, CRC, CUP, CVE, CZK, DJF, DKK, DOP, DZD, EGP, ETB, EUR, FJD, FKP, GBP, GEL, GHS, GIP, GMD, GNF, GTQ, GYD, HKD, HNL, HRK, HTG, HUF, IDR, ILS, INR, IQD, JMD, JOD, JPY, KES, KGS, KHR, KMF, KRW, KWD, KYD, KZT, LAK, LBP, LKR, LRD, LSL, LYD, MAD, MDL, MGA, MKD, MMK, MNT, MOP, MRU, MUR, MVR, MWK, MXN, MYR, MZN, NAD, NGN, NIO, NOK, NPR, NZD, OMR, PAB, PEN, PGK, PHP, PKR, PLN, PYG, QAR, RON, RSD, RUB, RWF, SAR, SBD, SCR, SEK, SGD, SHP, SLE, SLL, SOS, SRD, SSP, STN, SVC, SZL, THB, TND, TOP, TRY, TTD, TWD, TZS, UAH, UGX, USD, UYU, UZS, VES, VND, VUV, WST, XAF, XCD, XOF, XPF, YER, ZAR, ZMW
​
customer
objectrequired
Details about the customer who made the payment

Show child attributes

​
digital_products_delivered
booleanrequired
brand id this payment belongs to

​
disputes
object[]required
List of disputes associated with this payment

Show child attributes

​
metadata
objectrequired
Additional custom data associated with the payment

Show child attributes

​
payment_id
stringrequired
Unique identifier for the payment

​
refunds
object[]required
List of refunds issued for this payment

Show child attributes

​
settlement_amount
integerrequired
The amount that will be credited to your Dodo balance after currency conversion and processing.
Especially relevant for adaptive pricing where the customer's payment currency differs from your settlement currency.

​
settlement_currency
enum<string>required
The currency in which the settlement_amount will be credited to your Dodo balance.
This may differ from the customer's payment currency in adaptive pricing scenarios.

Available options: AED, ALL, AMD, ANG, AOA, ARS, AUD, AWG, AZN, BAM, BBD, BDT, BGN, BHD, BIF, BMD, BND, BOB, BRL, BSD, BWP, BYN, BZD, CAD, CHF, CLP, CNY, COP, CRC, CUP, CVE, CZK, DJF, DKK, DOP, DZD, EGP, ETB, EUR, FJD, FKP, GBP, GEL, GHS, GIP, GMD, GNF, GTQ, GYD, HKD, HNL, HRK, HTG, HUF, IDR, ILS, INR, IQD, JMD, JOD, JPY, KES, KGS, KHR, KMF, KRW, KWD, KYD, KZT, LAK, LBP, LKR, LRD, LSL, LYD, MAD, MDL, MGA, MKD, MMK, MNT, MOP, MRU, MUR, MVR, MWK, MXN, MYR, MZN, NAD, NGN, NIO, NOK, NPR, NZD, OMR, PAB, PEN, PGK, PHP, PKR, PLN, PYG, QAR, RON, RSD, RUB, RWF, SAR, SBD, SCR, SEK, SGD, SHP, SLE, SLL, SOS, SRD, SSP, STN, SVC, SZL, THB, TND, TOP, TRY, TTD, TWD, TZS, UAH, UGX, USD, UYU, UZS, VES, VND, VUV, WST, XAF, XCD, XOF, XPF, YER, ZAR, ZMW
​
total_amount
integerrequired
Total amount charged to the customer including tax, in smallest currency unit (e.g. cents)

​
card_issuing_country
enum<string> | null
ISO2 country code of the card

Available options: AF, AX, AL, DZ, AS, AD, AO, AI, AQ, AG, AR, AM, AW, AU, AT, AZ, BS, BH, BD, BB, BY, BE, BZ, BJ, BM, BT, BO, BQ, BA, BW, BV, BR, IO, BN, BG, BF, BI, KH, CM, CA, CV, KY, CF, TD, CL, CN, CX, CC, CO, KM, CG, CD, CK, CR, CI, HR, CU, CW, CY, CZ, DK, DJ, DM, DO, EC, EG, SV, GQ, ER, EE, ET, FK, FO, FJ, FI, FR, GF, PF, TF, GA, GM, GE, DE, GH, GI, GR, GL, GD, GP, GU, GT, GG, GN, GW, GY, HT, HM, VA, HN, HK, HU, IS, IN, ID, IR, IQ, IE, IM, IL, IT, JM, JP, JE, JO, KZ, KE, KI, KP, KR, KW, KG, LA, LV, LB, LS, LR, LY, LI, LT, LU, MO, MK, MG, MW, MY, MV, ML, MT, MH, MQ, MR, MU, YT, MX, FM, MD, MC, MN, ME, MS, MA, MZ, MM, NA, NR, NP, NL, NC, NZ, NI, NE, NG, NU, NF, MP, NO, OM, PK, PW, PS, PA, PG, PY, PE, PH, PN, PL, PT, PR, QA, RE, RO, RU, RW, BL, SH, KN, LC, MF, PM, VC, WS, SM, ST, SA, SN, RS, SC, SL, SG, SX, SK, SI, SB, SO, ZA, GS, SS, ES, LK, SD, SR, SJ, SZ, SE, CH, SY, TW, TJ, TZ, TH, TL, TG, TK, TO, TT, TN, TR, TM, TC, TV, UG, UA, AE, GB, UM, US, UY, UZ, VU, VE, VN, VG, VI, WF, EH, YE, ZM, ZW
​
card_last_four
string | null
The last four digits of the card

​
card_network
string | null
Card network like VISA, MASTERCARD etc.

​
card_type
string | null
The type of card DEBIT or CREDIT

​
checkout_session_id
string | null
If payment is made using a checkout session,
this field is set to the id of the session.

​
discount_id
string | null
The discount id if discount is applied

​
error_code
string | null
An error code if the payment failed

​
error_message
string | null
An error message if the payment failed

​
payment_link
string | null
Checkout URL

​
payment_method
string | null
Payment method used by customer (e.g. "card", "bank_transfer")

​
payment_method_type
string | null
Specific type of payment method (e.g. "visa", "mastercard")

​
product_cart
One-Time Product Cart Item Response · object[] | null
List of products purchased in a one-time payment

Show child attributes

​
settlement_tax
integer | null
This represents the portion of settlement_amount that corresponds to taxes collected.
Especially relevant for adaptive pricing where the tax component must be tracked separately
in your Dodo balance.

​
status
enum<string> | null
Current status of the payment intent

Available options: succeeded, failed, cancelled, processing, requires_customer_action, requires_merchant_action, requires_payment_method, requires_confirmation, requires_capture, partially_captured, partially_captured_and_capturable
​
subscription_id
string | null
Identifier of the subscription if payment is part of a subscription

​
tax
integer | null
Amount of tax collected in smallest currency unit (e.g. cents)

​
updated_at
string<date-time> | null
Timestamp when the payment was last updated
