# List Products

> Get a list of all products associated with your account.

## OpenAPI

```yaml get /products
paths:
  path: /products
  method: get
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
      query:
        page_size:
          schema:
            - type: integer
              required: false
              description: Page size default is 10 max is 100
              minimum: 0
          style: form
        page_number:
          schema:
            - type: integer
              required: false
              description: Page number default is 0
              minimum: 0
          style: form
        archived:
          schema:
            - type: boolean
              required: false
              description: List archived products
          style: form
        recurring:
          schema:
            - type: boolean
              required: false
              description: >-
                Filter products by pricing type:

                - `true`: Show only recurring pricing products (e.g.
                subscriptions)

                - `false`: Show only one-time price products

                - `null` or absent: Show both types of products
          style: form
        brand_id:
          schema:
            - type: string
              required: false
              description: filter by Brand id
          style: form
      header: {}
      cookie: {}
    body: {}
    codeSamples:
      - lang: JavaScript
        source: |-
          import DodoPayments from 'dodopayments';

          const client = new DodoPayments({
            bearerToken: 'My Bearer Token',
          });

          // Automatically fetches more pages as needed.
          for await (const productListResponse of client.products.list()) {
            console.log(productListResponse.business_id);
          }
      - lang: Python
        source: |-
          from dodopayments import DodoPayments

          client = DodoPayments(
              bearer_token="My Bearer Token",
          )
          page = client.products.list()
          page = page.items[0]
          print(page.business_id)
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
            page, err := client.Products.List(context.TODO(), dodopayments.ProductListParams{

            })
            if err != nil {
              panic(err.Error())
            }
            fmt.Printf("%+v\n", page)
          }
      - lang: Java
        source: |-
          package com.dodopayments.api.example;

          import com.dodopayments.api.client.DodoPaymentsClient;
          import com.dodopayments.api.client.okhttp.DodoPaymentsOkHttpClient;
          import com.dodopayments.api.models.products.ProductListPage;
          import com.dodopayments.api.models.products.ProductListParams;

          public final class Main {
              private Main() {}

              public static void main(String[] args) {
                  DodoPaymentsClient client = DodoPaymentsOkHttpClient.fromEnv();

                  ProductListPage page = client.products().list();
              }
          }
      - lang: Kotlin
        source: |-
          package com.dodopayments.api.example

          import com.dodopayments.api.client.DodoPaymentsClient
          import com.dodopayments.api.client.okhttp.DodoPaymentsOkHttpClient
          import com.dodopayments.api.models.products.ProductListPage
          import com.dodopayments.api.models.products.ProductListParams

          fun main() {
              val client: DodoPaymentsClient = DodoPaymentsOkHttpClient.fromEnv()

              val page: ProductListPage = client.products().list()
          }
      - lang: Ruby
        source: |-
          require "dodopayments"

          dodo_payments = Dodopayments::Client.new(
            bearer_token: "My Bearer Token",
            environment: "test_mode" # defaults to "live_mode"
          )

          page = dodo_payments.products.list

          puts(page)
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              items:
                allOf:
                  - type: array
                    items:
                      $ref: '#/components/schemas/GetProductsListResponseItem'
            refIdentifier: '#/components/schemas/GetProductsListResponse'
            requiredProperties:
              - items
        examples:
          example:
            value:
              items:
                - business_id: <string>
                  created_at: '2023-11-07T05:31:56Z'
                  currency: null
                  description: <string>
                  image: <string>
                  is_recurring: true
                  metadata: {}
                  name: <string>
                  price: 123
                  price_detail: null
                  product_id: <string>
                  tax_category: digital_products
                  tax_inclusive: true
                  updated_at: '2023-11-07T05:31:56Z'
        description: Products List
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
    AddMeterToPrice:
      type: object
      title: Add Meter To Price
      required:
        - meter_id
        - price_per_unit
      properties:
        description:
          type:
            - string
            - 'null'
          description: >-
            Meter description. Will ignored on Request, but will be shown in
            response
        free_threshold:
          type:
            - integer
            - 'null'
          format: int64
        measurement_unit:
          type:
            - string
            - 'null'
          description: >-
            Meter measurement unit. Will ignored on Request, but will be shown
            in response
        meter_id:
          type: string
        name:
          type:
            - string
            - 'null'
          description: Meter name. Will ignored on Request, but will be shown in response
        price_per_unit:
          type: string
          description: >-
            The price per unit in lowest denomination. Must be greater than
            zero. Supports up to 5 digits before decimal point and 12 decimal
            places.
          example: '10.50'
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
    GetProductsListResponseItem:
      type: object
      required:
        - product_id
        - business_id
        - created_at
        - updated_at
        - is_recurring
        - tax_category
        - metadata
      properties:
        business_id:
          type: string
          description: Unique identifier for the business to which the product belongs.
        created_at:
          type: string
          format: date-time
          description: Timestamp when the product was created.
        currency:
          oneOf:
            - type: 'null'
            - $ref: '#/components/schemas/Currency'
              description: Currency of the price
        description:
          type:
            - string
            - 'null'
          description: Description of the product, optional.
        image:
          type:
            - string
            - 'null'
          description: URL of the product image, optional.
        is_recurring:
          type: boolean
          description: Indicates if the product is recurring (e.g., subscriptions).
        metadata:
          $ref: '#/components/schemas/Metadata'
          description: Additional custom data associated with the product
        name:
          type:
            - string
            - 'null'
          description: Name of the product, optional.
        price:
          type:
            - integer
            - 'null'
          format: int32
          description: >-
            Price of the product, optional.


            The price is represented in the lowest denomination of the currency.

            For example:

            - In USD, a price of `$12.34` would be represented as `1234`
            (cents).

            - In JPY, a price of `¥1500` would be represented as `1500` (yen).

            - In INR, a price of `₹1234.56` would be represented as `123456`
            (paise).


            This ensures precision and avoids floating-point rounding errors.
        price_detail:
          oneOf:
            - type: 'null'
            - $ref: '#/components/schemas/Price'
              description: Details of the price
        product_id:
          type: string
          description: Unique identifier for the product.
        tax_category:
          $ref: '#/components/schemas/TaxCategory'
          description: Tax category associated with the product.
        tax_inclusive:
          type:
            - boolean
            - 'null'
          description: Indicates if the price is tax inclusive
        updated_at:
          type: string
          format: date-time
          description: Timestamp when the product was last updated.
    Metadata:
      type: object
      additionalProperties:
        type: string
      propertyNames:
        type: string
    OneTimePrice:
      type: object
      title: One Time Price
      required:
        - price
        - currency
        - discount
        - purchasing_power_parity
      properties:
        currency:
          $ref: '#/components/schemas/Currency'
          description: The currency in which the payment is made.
        discount:
          type: integer
          format: int64
          description: >-
            Discount applied to the price, represented as a percentage (0 to
            100).
        pay_what_you_want:
          type: boolean
          description: >-
            Indicates whether the customer can pay any amount they choose.

            If set to `true`, the [`price`](Self::price) field is the minimum
            amount.
        price:
          type: integer
          format: int32
          description: >-
            The payment amount, in the smallest denomination of the currency
            (e.g., cents for USD).

            For example, to charge $1.00, pass `100`.


            If [`pay_what_you_want`](Self::pay_what_you_want) is set to `true`,
            this field represents

            the **minimum** amount the customer must pay.
        purchasing_power_parity:
          type: boolean
          description: >-
            Indicates if purchasing power parity adjustments are applied to the
            price.

            Purchasing power parity feature is not available as of now.
        suggested_price:
          type:
            - integer
            - 'null'
          format: int32
          description: >-
            A suggested price for the user to pay. This value is only considered
            if

            [`pay_what_you_want`](Self::pay_what_you_want) is `true`. Otherwise,
            it is ignored.
        tax_inclusive:
          type:
            - boolean
            - 'null'
          description: Indicates if the price is tax inclusive.
    Price:
      oneOf:
        - allOf:
            - $ref: '#/components/schemas/OneTimePrice'
              description: One-time price details.
            - type: object
              required:
                - type
              properties:
                type:
                  type: string
                  enum:
                    - one_time_price
          title: One Time Price
          description: One-time price details.
        - allOf:
            - $ref: '#/components/schemas/RecurringPrice'
              description: Recurring price details.
            - type: object
              required:
                - type
              properties:
                type:
                  type: string
                  enum:
                    - recurring_price
          title: Recurring Price
          description: Recurring price details.
        - allOf:
            - $ref: '#/components/schemas/UsageBasedPrice'
              description: Usage Based price details.
            - type: object
              required:
                - type
              properties:
                type:
                  type: string
                  enum:
                    - usage_based_price
          title: Usage Based Price
          description: Usage Based price details.
    RecurringPrice:
      type: object
      title: Recurring Price
      required:
        - price
        - currency
        - discount
        - purchasing_power_parity
        - payment_frequency_count
        - payment_frequency_interval
        - subscription_period_count
        - subscription_period_interval
      properties:
        currency:
          $ref: '#/components/schemas/Currency'
          description: The currency in which the payment is made.
        discount:
          type: integer
          format: int64
          description: >-
            Discount applied to the price, represented as a percentage (0 to
            100).
        payment_frequency_count:
          type: integer
          format: int32
          description: >-
            Number of units for the payment frequency.

            For example, a value of `1` with a `payment_frequency_interval` of
            `month` represents monthly payments.
        payment_frequency_interval:
          $ref: '#/components/schemas/TimeInterval'
          description: >-
            The time interval for the payment frequency (e.g., day, month,
            year).
        price:
          type: integer
          format: int32
          description: >-
            The payment amount. Represented in the lowest denomination of the
            currency (e.g., cents for USD).

            For example, to charge $1.00, pass `100`.
        purchasing_power_parity:
          type: boolean
          description: >-
            Indicates if purchasing power parity adjustments are applied to the
            price.

            Purchasing power parity feature is not available as of now
        subscription_period_count:
          type: integer
          format: int32
          description: >-
            Number of units for the subscription period.

            For example, a value of `12` with a `subscription_period_interval`
            of `month` represents a one-year subscription.
        subscription_period_interval:
          $ref: '#/components/schemas/TimeInterval'
          description: >-
            The time interval for the subscription period (e.g., day, month,
            year).
        tax_inclusive:
          type:
            - boolean
            - 'null'
          description: Indicates if the price is tax inclusive
        trial_period_days:
          type: integer
          format: int32
          description: >-
            Number of days for the trial period. A value of `0` indicates no
            trial period.
    TaxCategory:
      type: string
      description: >-
        Represents the different categories of taxation applicable to various
        products and services.
      enum:
        - digital_products
        - saas
        - e_book
        - edtech
    TimeInterval:
      type: string
      enum:
        - Day
        - Week
        - Month
        - Year
    UsageBasedPrice:
      type: object
      title: Usage Based Price
      required:
        - fixed_price
        - currency
        - discount
        - purchasing_power_parity
        - payment_frequency_count
        - payment_frequency_interval
        - subscription_period_count
        - subscription_period_interval
      properties:
        currency:
          $ref: '#/components/schemas/Currency'
          description: The currency in which the payment is made.
        discount:
          type: integer
          format: int64
          description: >-
            Discount applied to the price, represented as a percentage (0 to
            100).
        fixed_price:
          type: integer
          format: int32
          description: >-
            The fixed payment amount. Represented in the lowest denomination of
            the currency (e.g., cents for USD).

            For example, to charge $1.00, pass `100`.
        meters:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/AddMeterToPrice'
        payment_frequency_count:
          type: integer
          format: int32
          description: >-
            Number of units for the payment frequency.

            For example, a value of `1` with a `payment_frequency_interval` of
            `month` represents monthly payments.
        payment_frequency_interval:
          $ref: '#/components/schemas/TimeInterval'
          description: >-
            The time interval for the payment frequency (e.g., day, month,
            year).
        purchasing_power_parity:
          type: boolean
          description: >-
            Indicates if purchasing power parity adjustments are applied to the
            price.

            Purchasing power parity feature is not available as of now
        subscription_period_count:
          type: integer
          format: int32
          description: >-
            Number of units for the subscription period.

            For example, a value of `12` with a `subscription_period_interval`
            of `month` represents a one-year subscription.
        subscription_period_interval:
          $ref: '#/components/schemas/TimeInterval'
          description: >-
            The time interval for the subscription period (e.g., day, month,
            year).
        tax_inclusive:
          type:
            - boolean
            - 'null'
          description: Indicates if the price is tax inclusive
```
