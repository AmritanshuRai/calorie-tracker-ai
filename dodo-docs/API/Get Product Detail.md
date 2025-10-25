# Get Product Detail

> Get detailed information about a specific product.

## OpenAPI

```yaml get /products/{id}
paths:
  path: /products/{id}
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
      path:
        id:
          schema:
            - type: string
              required: true
              description: Product Id
      query: {}
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

          const product = await client.products.retrieve('id');

          console.log(product.brand_id);
      - lang: Python
        source: |-
          from dodopayments import DodoPayments

          client = DodoPayments(
              bearer_token="My Bearer Token",
          )
          product = client.products.retrieve(
              "id",
          )
          print(product.brand_id)
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
            product, err := client.Products.Get(context.TODO(), "id")
            if err != nil {
              panic(err.Error())
            }
            fmt.Printf("%+v\n", product.BrandID)
          }
      - lang: Java
        source: |-
          package com.dodopayments.api.example;

          import com.dodopayments.api.client.DodoPaymentsClient;
          import com.dodopayments.api.client.okhttp.DodoPaymentsOkHttpClient;
          import com.dodopayments.api.models.products.Product;
          import com.dodopayments.api.models.products.ProductRetrieveParams;

          public final class Main {
              private Main() {}

              public static void main(String[] args) {
                  DodoPaymentsClient client = DodoPaymentsOkHttpClient.fromEnv();

                  Product product = client.products().retrieve("id");
              }
          }
      - lang: Kotlin
        source: |-
          package com.dodopayments.api.example

          import com.dodopayments.api.client.DodoPaymentsClient
          import com.dodopayments.api.client.okhttp.DodoPaymentsOkHttpClient
          import com.dodopayments.api.models.products.Product
          import com.dodopayments.api.models.products.ProductRetrieveParams

          fun main() {
              val client: DodoPaymentsClient = DodoPaymentsOkHttpClient.fromEnv()

              val product: Product = client.products().retrieve("id")
          }
      - lang: Ruby
        source: |-
          require "dodopayments"

          dodo_payments = Dodopayments::Client.new(
            bearer_token: "My Bearer Token",
            environment: "test_mode" # defaults to "live_mode"
          )

          product = dodo_payments.products.retrieve("id")

          puts(product)
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              addons:
                allOf:
                  - type:
                      - array
                      - 'null'
                    items:
                      type: string
                    description: Available Addons for subscription products
              brand_id:
                allOf:
                  - type: string
              business_id:
                allOf:
                  - type: string
                    description: >-
                      Unique identifier for the business to which the product
                      belongs.
              created_at:
                allOf:
                  - type: string
                    format: date-time
                    description: Timestamp when the product was created.
              description:
                allOf:
                  - type:
                      - string
                      - 'null'
                    description: Description of the product, optional.
              digital_product_delivery:
                allOf:
                  - oneOf:
                      - type: 'null'
                      - $ref: '#/components/schemas/DigitalProductDelivery'
              image:
                allOf:
                  - type:
                      - string
                      - 'null'
                    description: URL of the product image, optional.
              is_recurring:
                allOf:
                  - type: boolean
                    description: >-
                      Indicates if the product is recurring (e.g.,
                      subscriptions).
              license_key_activation_message:
                allOf:
                  - type:
                      - string
                      - 'null'
                    description: Message sent upon license key activation, if applicable.
              license_key_activations_limit:
                allOf:
                  - type:
                      - integer
                      - 'null'
                    format: int32
                    description: >-
                      Limit on the number of activations for the license key, if
                      enabled.
              license_key_duration:
                allOf:
                  - oneOf:
                      - type: 'null'
                      - $ref: '#/components/schemas/LicenseKeyDuration'
                        description: Duration of the license key validity, if enabled.
              license_key_enabled:
                allOf:
                  - type: boolean
                    description: Indicates whether the product requires a license key.
              metadata:
                allOf:
                  - $ref: '#/components/schemas/Metadata'
                    description: Additional custom data associated with the product
              name:
                allOf:
                  - type:
                      - string
                      - 'null'
                    description: Name of the product, optional.
              price:
                allOf:
                  - $ref: '#/components/schemas/Price'
                    description: Pricing information for the product.
              product_id:
                allOf:
                  - type: string
                    description: Unique identifier for the product.
              tax_category:
                allOf:
                  - $ref: '#/components/schemas/TaxCategory'
                    description: Tax category associated with the product.
              updated_at:
                allOf:
                  - type: string
                    format: date-time
                    description: Timestamp when the product was last updated.
            refIdentifier: '#/components/schemas/GetProductResponse'
            requiredProperties:
              - product_id
              - business_id
              - created_at
              - updated_at
              - is_recurring
              - tax_category
              - price
              - license_key_enabled
              - brand_id
              - metadata
        examples:
          example:
            value:
              addons:
                - <string>
              brand_id: <string>
              business_id: <string>
              created_at: '2023-11-07T05:31:56Z'
              description: <string>
              digital_product_delivery: null
              image: <string>
              is_recurring: true
              license_key_activation_message: <string>
              license_key_activations_limit: 123
              license_key_duration: null
              license_key_enabled: true
              metadata: {}
              name: <string>
              price:
                currency: AED
                discount: 123
                pay_what_you_want: true
                price: 123
                purchasing_power_parity: true
                suggested_price: 123
                tax_inclusive: true
                type: one_time_price
              product_id: <string>
              tax_category: digital_products
              updated_at: '2023-11-07T05:31:56Z'
        description: Product Details
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
    DigitalProductDelivery:
      type: object
      title: Digital Product Delivery
      properties:
        external_url:
          type:
            - string
            - 'null'
          description: External URL to digital product
        files:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/DigitalProductDeliveryFile'
          description: Uploaded files ids of digital product
        instructions:
          type:
            - string
            - 'null'
          description: Instructions to download and use the digital product
    DigitalProductDeliveryFile:
      type: object
      title: Digital Product Delivery File
      required:
        - file_id
        - file_name
        - url
      properties:
        file_id:
          type: string
          format: uuid
        file_name:
          type: string
        url:
          type: string
    LicenseKeyDuration:
      type: object
      title: License Key Duration
      required:
        - count
        - interval
      properties:
        count:
          type: integer
          format: int32
        interval:
          $ref: '#/components/schemas/TimeInterval'
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
