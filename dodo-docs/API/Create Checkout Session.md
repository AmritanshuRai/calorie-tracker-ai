# Create Checkout Session

> Unified endpoint for creating checkout sessions for all types of billing requirements.

## OpenAPI

```yaml post /checkouts
paths:
  path: /checkouts
  method: post
  servers:
    - url: https://test.dodopayments.com/
      description: Test Mode Server Host
    - url: https://live.dodopayments.com/
      description: Live Mode Server Host
  request:
    security:
      - title: API KEY
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              allowed_payment_method_types:
                allOf:
                  - type:
                      - array
                      - 'null'
                    items:
                      $ref: '#/components/schemas/PaymentMethodTypes'
                    description: >-
                      Customers will never see payment methods that are not in
                      this list.

                      However, adding a method here does not guarantee customers
                      will see it.

                      Availability still depends on other factors (e.g.,
                      customer location, merchant settings).


                      Disclaimar: Always provide 'credit' and 'debit' as a
                      fallback.

                      If all payment methods are unavailable, checkout session
                      will fail.
                    uniqueItems: true
              billing_address:
                allOf:
                  - oneOf:
                      - type: 'null'
                      - $ref: '#/components/schemas/CheckoutSessionBillingAddress'
                        description: Billing address information for the session
              billing_currency:
                allOf:
                  - oneOf:
                      - type: 'null'
                      - $ref: '#/components/schemas/Currency'
                        description: This field is ingored if adaptive pricing is disabled
              confirm:
                allOf:
                  - type: boolean
                    description: >-
                      If confirm is true, all the details will be finalized. If
                      required data is missing, an API error is thrown.
              customer:
                allOf:
                  - oneOf:
                      - type: 'null'
                      - $ref: '#/components/schemas/CustomerRequest'
                        description: Customer details for the session
              customization:
                allOf:
                  - $ref: '#/components/schemas/CheckoutSessionCustomization'
                    description: Customization for the checkout session page
              discount_code:
                allOf:
                  - type:
                      - string
                      - 'null'
              feature_flags:
                allOf:
                  - $ref: '#/components/schemas/CheckoutSessionFlags'
              force_3ds:
                allOf:
                  - type:
                      - boolean
                      - 'null'
                    description: Override merchant default 3DS behaviour for this session
              metadata:
                allOf:
                  - oneOf:
                      - type: 'null'
                      - $ref: '#/components/schemas/Metadata'
                        description: >-
                          Additional metadata associated with the payment.
                          Defaults to empty if not provided.
              product_cart:
                allOf:
                  - type: array
                    items:
                      $ref: '#/components/schemas/ProductItemReq'
              return_url:
                allOf:
                  - type:
                      - string
                      - 'null'
                    description: The url to redirect after payment failure or success.
              show_saved_payment_methods:
                allOf:
                  - type: boolean
                    description: >-
                      Display saved payment methods of a returning customer
                      False by default
              subscription_data:
                allOf:
                  - oneOf:
                      - type: 'null'
                      - $ref: '#/components/schemas/SubscriptionData'
            required: true
            refIdentifier: '#/components/schemas/CreateCheckoutSessionRequest'
            requiredProperties:
              - product_cart
        examples:
          example:
            value:
              allowed_payment_method_types:
                - credit
              billing_address: null
              billing_currency: null
              confirm: true
              customer: null
              customization:
                force_language: <string>
                show_on_demand_tag: true
                show_order_details: true
                theme: dark
              discount_code: <string>
              feature_flags:
                allow_currency_selection: true
                allow_discount_code: true
                allow_phone_number_collection: true
                allow_tax_id: true
                always_create_new_customer: true
              force_3ds: true
              metadata: null
              product_cart:
                - addons:
                    - addon_id: <string>
                      quantity: 1
                  amount: 123
                  product_id: <string>
                  quantity: 1
              return_url: <string>
              show_saved_payment_methods: true
              subscription_data: null
    codeSamples:
      - lang: JavaScript
        source: |-
          import DodoPayments from 'dodopayments';

          const client = new DodoPayments({
            bearerToken: 'My Bearer Token',
          });

          const checkoutSessionResponse = await client.checkoutSessions.create({
            product_cart: [{ product_id: 'product_id', quantity: 0 }],
          });

          console.log(checkoutSessionResponse.session_id);
      - lang: Python
        source: |-
          from dodopayments import DodoPayments

          client = DodoPayments(
              bearer_token="My Bearer Token",
          )
          checkout_session_response = client.checkout_sessions.create(
              product_cart=[{
                  "product_id": "product_id",
                  "quantity": 0,
              }],
          )
          print(checkout_session_response.session_id)
      - lang: Go
        source: |
          package main

          import (
            "context"
            "fmt"

            "github.com/dodopayments/dodopayments-go"
            "github.com/dodopayments/dodopayments-go/option"
          )

          func main() {
            client := dodopayments.NewClient(
              option.WithBearerToken("My Bearer Token"),
            )
            checkoutSessionResponse, err := client.CheckoutSessions.New(context.TODO(), dodopayments.CheckoutSessionNewParams{
              CheckoutSessionRequest: dodopayments.CheckoutSessionRequestParam{
                ProductCart: dodopayments.F([]dodopayments.CheckoutSessionRequestProductCartParam{dodopayments.CheckoutSessionRequestProductCartParam{
                  ProductID: dodopayments.F("product_id"),
                  Quantity: dodopayments.F(int64(0)),
                }}),
              },
            })
            if err != nil {
              panic(err.Error())
            }
            fmt.Printf("%+v\n", checkoutSessionResponse.SessionID)
          }
      - lang: Java
        source: >-
          package com.dodopayments.api.example;


          import com.dodopayments.api.client.DodoPaymentsClient;

          import com.dodopayments.api.client.okhttp.DodoPaymentsOkHttpClient;

          import
          com.dodopayments.api.models.checkoutsessions.CheckoutSessionCreateParams;

          import
          com.dodopayments.api.models.checkoutsessions.CheckoutSessionRequest;

          import
          com.dodopayments.api.models.checkoutsessions.CheckoutSessionResponse;


          public final class Main {
              private Main() {}

              public static void main(String[] args) {
                  DodoPaymentsClient client = DodoPaymentsOkHttpClient.fromEnv();

                  CheckoutSessionRequest params = CheckoutSessionRequest.builder()
                      .addProductCart(CheckoutSessionRequest.ProductCart.builder()
                          .productId("product_id")
                          .quantity(0)
                          .build())
                      .build();
                  CheckoutSessionResponse checkoutSessionResponse = client.checkoutSessions().create(params);
              }
          }
      - lang: Kotlin
        source: >-
          package com.dodopayments.api.example


          import com.dodopayments.api.client.DodoPaymentsClient

          import com.dodopayments.api.client.okhttp.DodoPaymentsOkHttpClient

          import
          com.dodopayments.api.models.checkoutsessions.CheckoutSessionCreateParams

          import
          com.dodopayments.api.models.checkoutsessions.CheckoutSessionRequest

          import
          com.dodopayments.api.models.checkoutsessions.CheckoutSessionResponse


          fun main() {
              val client: DodoPaymentsClient = DodoPaymentsOkHttpClient.fromEnv()

              val params: CheckoutSessionRequest = CheckoutSessionRequest.builder()
                  .addProductCart(CheckoutSessionRequest.ProductCart.builder()
                      .productId("product_id")
                      .quantity(0)
                      .build())
                  .build()
              val checkoutSessionResponse: CheckoutSessionResponse = client.checkoutSessions().create(params)
          }
      - lang: Ruby
        source: >-
          require "dodopayments"


          dodo_payments = Dodopayments::Client.new(
            bearer_token: "My Bearer Token",
            environment: "test_mode" # defaults to "live_mode"
          )


          checkout_session_response =
          dodo_payments.checkout_sessions.create(product_cart: [{product_id:
          "product_id", quantity: 0}])


          puts(checkout_session_response)
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              checkout_url:
                allOf:
                  - type: string
                    description: Checkout url
              session_id:
                allOf:
                  - type: string
                    description: The ID of the created checkout session
            refIdentifier: '#/components/schemas/CreateSessionResponse'
            requiredProperties:
              - session_id
              - checkout_url
        examples:
          example:
            value:
              checkout_url: <string>
              session_id: <string>
        description: Checkout session successfully created
    '422':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: Invalid Request Object or Parameters
        examples: {}
        description: Invalid Request Object or Parameters
    '500':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: Something went wrong :(
        examples: {}
        description: Something went wrong :(
  deprecated: false
  type: path
components:
  schemas:
    AttachAddonReq:
      type: object
      title: Attach Addon Request
      required:
        - addon_id
        - quantity
      properties:
        addon_id:
          type: string
        quantity:
          type: integer
          format: int32
          minimum: 0
    AttachExistingCustomer:
      type: object
      title: Attach Existing Customer
      required:
        - customer_id
      properties:
        customer_id:
          type: string
    CheckoutSessionBillingAddress:
      type: object
      title: Checkout Session Billing Address
      required:
        - country
      properties:
        city:
          type:
            - string
            - 'null'
          description: City name
        country:
          $ref: '#/components/schemas/CountryCodeAlpha2'
          description: Two-letter ISO country code (ISO 3166-1 alpha-2)
        state:
          type:
            - string
            - 'null'
          description: State or province name
        street:
          type:
            - string
            - 'null'
          description: >-
            Street address including house number and unit/apartment if
            applicable
        zipcode:
          type:
            - string
            - 'null'
          description: Postal code or ZIP code
    CheckoutSessionCustomization:
      type: object
      title: Checkout Session Customization
      properties:
        force_language:
          type:
            - string
            - 'null'
          description: >-
            Force the checkout interface to render in a specific language (e.g.
            `en`, `es`)
        show_on_demand_tag:
          type: boolean
          description: |-
            Show on demand tag

            Default is true
        show_order_details:
          type: boolean
          description: |-
            Show order details by default

            Default is true
        theme:
          $ref: '#/components/schemas/CheckoutTheme'
          description: |-
            Theme of the page

            Default is `System`.
    CheckoutSessionFlags:
      type: object
      title: Checkout Session Flags
      properties:
        allow_currency_selection:
          type: boolean
          description: |-
            if customer is allowed to change currency, set it to true

            Default is true
        allow_discount_code:
          type: boolean
          description: |-
            If the customer is allowed to apply discount code, set it to true.

            Default is true
        allow_phone_number_collection:
          type: boolean
          description: |-
            If phone number is collected from customer, set it to rue

            Default is true
        allow_tax_id:
          type: boolean
          description: |-
            If the customer is allowed to add tax id, set it to true

            Default is true
        always_create_new_customer:
          type: boolean
          description: >-
            Set to true if a new customer object should be created.

            By default email is used to find an existing customer to attach the
            session to


            Default is false
    CheckoutTheme:
      type: string
      enum:
        - dark
        - light
        - system
    CountryCodeAlpha2:
      type: string
      description: ISO country code alpha2 variant
      enum:
        - AF
        - AX
        - AL
        - DZ
        - AS
        - AD
        - AO
        - AI
        - AQ
        - AG
        - AR
        - AM
        - AW
        - AU
        - AT
        - AZ
        - BS
        - BH
        - BD
        - BB
        - BY
        - BE
        - BZ
        - BJ
        - BM
        - BT
        - BO
        - BQ
        - BA
        - BW
        - BV
        - BR
        - IO
        - BN
        - BG
        - BF
        - BI
        - KH
        - CM
        - CA
        - CV
        - KY
        - CF
        - TD
        - CL
        - CN
        - CX
        - CC
        - CO
        - KM
        - CG
        - CD
        - CK
        - CR
        - CI
        - HR
        - CU
        - CW
        - CY
        - CZ
        - DK
        - DJ
        - DM
        - DO
        - EC
        - EG
        - SV
        - GQ
        - ER
        - EE
        - ET
        - FK
        - FO
        - FJ
        - FI
        - FR
        - GF
        - PF
        - TF
        - GA
        - GM
        - GE
        - DE
        - GH
        - GI
        - GR
        - GL
        - GD
        - GP
        - GU
        - GT
        - GG
        - GN
        - GW
        - GY
        - HT
        - HM
        - VA
        - HN
        - HK
        - HU
        - IS
        - IN
        - ID
        - IR
        - IQ
        - IE
        - IM
        - IL
        - IT
        - JM
        - JP
        - JE
        - JO
        - KZ
        - KE
        - KI
        - KP
        - KR
        - KW
        - KG
        - LA
        - LV
        - LB
        - LS
        - LR
        - LY
        - LI
        - LT
        - LU
        - MO
        - MK
        - MG
        - MW
        - MY
        - MV
        - ML
        - MT
        - MH
        - MQ
        - MR
        - MU
        - YT
        - MX
        - FM
        - MD
        - MC
        - MN
        - ME
        - MS
        - MA
        - MZ
        - MM
        - NA
        - NR
        - NP
        - NL
        - NC
        - NZ
        - NI
        - NE
        - NG
        - NU
        - NF
        - MP
        - 'NO'
        - OM
        - PK
        - PW
        - PS
        - PA
        - PG
        - PY
        - PE
        - PH
        - PN
        - PL
        - PT
        - PR
        - QA
        - RE
        - RO
        - RU
        - RW
        - BL
        - SH
        - KN
        - LC
        - MF
        - PM
        - VC
        - WS
        - SM
        - ST
        - SA
        - SN
        - RS
        - SC
        - SL
        - SG
        - SX
        - SK
        - SI
        - SB
        - SO
        - ZA
        - GS
        - SS
        - ES
        - LK
        - SD
        - SR
        - SJ
        - SZ
        - SE
        - CH
        - SY
        - TW
        - TJ
        - TZ
        - TH
        - TL
        - TG
        - TK
        - TO
        - TT
        - TN
        - TR
        - TM
        - TC
        - TV
        - UG
        - UA
        - AE
        - GB
        - UM
        - US
        - UY
        - UZ
        - VU
        - VE
        - VN
        - VG
        - VI
        - WF
        - EH
        - YE
        - ZM
        - ZW
    Currency:
      type: string
      enum:
        - AED
        - ALL
        - AMD
        - ANG
        - AOA
        - ARS
        - AUD
        - AWG
        - AZN
        - BAM
        - BBD
        - BDT
        - BGN
        - BHD
        - BIF
        - BMD
        - BND
        - BOB
        - BRL
        - BSD
        - BWP
        - BYN
        - BZD
        - CAD
        - CHF
        - CLP
        - CNY
        - COP
        - CRC
        - CUP
        - CVE
        - CZK
        - DJF
        - DKK
        - DOP
        - DZD
        - EGP
        - ETB
        - EUR
        - FJD
        - FKP
        - GBP
        - GEL
        - GHS
        - GIP
        - GMD
        - GNF
        - GTQ
        - GYD
        - HKD
        - HNL
        - HRK
        - HTG
        - HUF
        - IDR
        - ILS
        - INR
        - IQD
        - JMD
        - JOD
        - JPY
        - KES
        - KGS
        - KHR
        - KMF
        - KRW
        - KWD
        - KYD
        - KZT
        - LAK
        - LBP
        - LKR
        - LRD
        - LSL
        - LYD
        - MAD
        - MDL
        - MGA
        - MKD
        - MMK
        - MNT
        - MOP
        - MRU
        - MUR
        - MVR
        - MWK
        - MXN
        - MYR
        - MZN
        - NAD
        - NGN
        - NIO
        - NOK
        - NPR
        - NZD
        - OMR
        - PAB
        - PEN
        - PGK
        - PHP
        - PKR
        - PLN
        - PYG
        - QAR
        - RON
        - RSD
        - RUB
        - RWF
        - SAR
        - SBD
        - SCR
        - SEK
        - SGD
        - SHP
        - SLE
        - SLL
        - SOS
        - SRD
        - SSP
        - STN
        - SVC
        - SZL
        - THB
        - TND
        - TOP
        - TRY
        - TTD
        - TWD
        - TZS
        - UAH
        - UGX
        - USD
        - UYU
        - UZS
        - VES
        - VND
        - VUV
        - WST
        - XAF
        - XCD
        - XOF
        - XPF
        - YER
        - ZAR
        - ZMW
    CustomerRequest:
      oneOf:
        - $ref: '#/components/schemas/AttachExistingCustomer'
        - $ref: '#/components/schemas/NewCustomer'
      title: Customer Request
    Metadata:
      type: object
      additionalProperties:
        type: string
      propertyNames:
        type: string
    NewCustomer:
      type: object
      title: New Customer
      required:
        - email
      properties:
        email:
          type: string
          description: Email is required for creating a new customer
        name:
          type:
            - string
            - 'null'
          description: >-
            Optional full name of the customer. If provided during session
            creation,

            it is persisted and becomes immutable for the session. If omitted
            here,

            it can be provided later via the confirm API.
        phone_number:
          type:
            - string
            - 'null'
    OnDemandSubscriptionReq:
      type: object
      title: On Demand Subscription Request
      required:
        - mandate_only
      properties:
        adaptive_currency_fees_inclusive:
          type:
            - boolean
            - 'null'
          description: >-
            Whether adaptive currency fees should be included in the
            product_price (true) or added on top (false).

            This field is ignored if adaptive pricing is not enabled for the
            business.
        mandate_only:
          type: boolean
          description: >-
            If set as True, does not perform any charge and only authorizes
            payment method details for future use.
        product_currency:
          oneOf:
            - type: 'null'
            - $ref: '#/components/schemas/Currency'
              description: >-
                Optional currency of the product price. If not specified,
                defaults to the currency of the product.
        product_description:
          type:
            - string
            - 'null'
          description: >-
            Optional product description override for billing and line items.

            If not specified, the stored description of the product will be
            used.
        product_price:
          type:
            - integer
            - 'null'
          format: int32
          description: >-
            Product price for the initial charge to customer

            If not specified the stored price of the product will be used

            Represented in the lowest denomination of the currency (e.g., cents
            for USD).

            For example, to charge $1.00, pass `100`.
    PaymentMethodTypes:
      type: string
      enum:
        - credit
        - debit
        - upi_collect
        - upi_intent
        - apple_pay
        - cashapp
        - google_pay
        - multibanco
        - bancontact_card
        - eps
        - ideal
        - przelewy24
        - affirm
        - klarna
        - sepa
        - ach
        - amazon_pay
        - afterpay_clearpay
    ProductItemReq:
      type: object
      title: Product Item Request
      required:
        - product_id
        - quantity
      properties:
        addons:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/AttachAddonReq'
          description: only valid if product is a subscription
        amount:
          type:
            - integer
            - 'null'
          format: int32
          description: >-
            Amount the customer pays if pay_what_you_want is enabled. If
            disabled then amount will be ignored

            Represented in the lowest denomination of the currency (e.g., cents
            for USD).

            For example, to charge $1.00, pass `100`.

            Only applicable for one time payments


            If amount is not set for pay_what_you_want product,

            customer is allowed to select the amount.
        product_id:
          type: string
          description: unique id of the product
        quantity:
          type: integer
          format: int32
          minimum: 0
    SubscriptionData:
      type: object
      title: Subscription Data
      properties:
        on_demand:
          oneOf:
            - type: 'null'
            - $ref: '#/components/schemas/OnDemandSubscriptionReq'
        trial_period_days:
          type:
            - integer
            - 'null'
          format: int32
          description: >-
            Optional trial period in days If specified, this value overrides the
            trial period set in the product's price Must be between 0 and 10000
            days
```
