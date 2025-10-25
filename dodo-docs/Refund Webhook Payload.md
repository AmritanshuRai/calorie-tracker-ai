Webhook Payloads
Refund Webhook Payload

Copy page

The payload sent to your webhook endpoint when a refund is created or updated.

​
business_id
stringrequired
The unique identifier of the business issuing the refund.

​
created_at
string<date-time>required
The timestamp of when the refund was created in UTC.

​
customer
objectrequired
Details about the customer for this refund (from the associated payment)

Show child attributes

​
is_partial
booleanrequired
If true the refund is a partial refund

​
payment_id
stringrequired
The unique identifier of the payment associated with the refund.

​
refund_id
stringrequired
The unique identifier of the refund.

​
status
enum<string>required
The current status of the refund.

Available options: succeeded, failed, pending, review
​
amount
integer | null
The refunded amount.

​
currency
enum<string> | null
The currency of the refund, represented as an ISO 4217 currency code.

Available options: AED, ALL, AMD, ANG, AOA, ARS, AUD, AWG, AZN, BAM, BBD, BDT, BGN, BHD, BIF, BMD, BND, BOB, BRL, BSD, BWP, BYN, BZD, CAD, CHF, CLP, CNY, COP, CRC, CUP, CVE, CZK, DJF, DKK, DOP, DZD, EGP, ETB, EUR, FJD, FKP, GBP, GEL, GHS, GIP, GMD, GNF, GTQ, GYD, HKD, HNL, HRK, HTG, HUF, IDR, ILS, INR, IQD, JMD, JOD, JPY, KES, KGS, KHR, KMF, KRW, KWD, KYD, KZT, LAK, LBP, LKR, LRD, LSL, LYD, MAD, MDL, MGA, MKD, MMK, MNT, MOP, MRU, MUR, MVR, MWK, MXN, MYR, MZN, NAD, NGN, NIO, NOK, NPR, NZD, OMR, PAB, PEN, PGK, PHP, PKR, PLN, PYG, QAR, RON, RSD, RUB, RWF, SAR, SBD, SCR, SEK, SGD, SHP, SLE, SLL, SOS, SRD, SSP, STN, SVC, SZL, THB, TND, TOP, TRY, TTD, TWD, TZS, UAH, UGX, USD, UYU, UZS, VES, VND, VUV, WST, XAF, XCD, XOF, XPF, YER, ZAR, ZMW
​
reason
string | null
The reason provided for the refund, if any. Optional.
