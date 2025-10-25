# Update Product Images

> Update a product's images.

## OpenAPI

```yaml put /products/{id}/images
paths:
  path: /products/{id}/images
  method: put
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
      query:
        force_update:
          schema:
            - type: boolean
              required: false
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

          const image = await client.products.images.update('id');

          console.log(image.image_id);
      - lang: Python
        source: |-
          from dodopayments import DodoPayments

          client = DodoPayments(
              bearer_token="My Bearer Token",
          )
          image = client.products.images.update(
              id="id",
          )
          print(image.image_id)
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
            image, err := client.Products.Images.Update(
              context.TODO(),
              "id",
              dodopayments.ProductImageUpdateParams{

              },
            )
            if err != nil {
              panic(err.Error())
            }
            fmt.Printf("%+v\n", image.ImageID)
          }
      - lang: Java
        source: >-
          package com.dodopayments.api.example;


          import com.dodopayments.api.client.DodoPaymentsClient;

          import com.dodopayments.api.client.okhttp.DodoPaymentsOkHttpClient;

          import com.dodopayments.api.models.products.images.ImageUpdateParams;

          import
          com.dodopayments.api.models.products.images.ImageUpdateResponse;


          public final class Main {
              private Main() {}

              public static void main(String[] args) {
                  DodoPaymentsClient client = DodoPaymentsOkHttpClient.fromEnv();

                  ImageUpdateResponse image = client.products().images().update("id");
              }
          }
      - lang: Kotlin
        source: |-
          package com.dodopayments.api.example

          import com.dodopayments.api.client.DodoPaymentsClient
          import com.dodopayments.api.client.okhttp.DodoPaymentsOkHttpClient
          import com.dodopayments.api.models.products.images.ImageUpdateParams
          import com.dodopayments.api.models.products.images.ImageUpdateResponse

          fun main() {
              val client: DodoPaymentsClient = DodoPaymentsOkHttpClient.fromEnv()

              val image: ImageUpdateResponse = client.products().images().update("id")
          }
      - lang: Ruby
        source: |-
          require "dodopayments"

          dodo_payments = Dodopayments::Client.new(
            bearer_token: "My Bearer Token",
            environment: "test_mode" # defaults to "live_mode"
          )

          image = dodo_payments.products.images.update("id")

          puts(image)
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              image_id:
                allOf:
                  - type:
                      - string
                      - 'null'
                    format: uuid
              url:
                allOf:
                  - type: string
            refIdentifier: '#/components/schemas/UpdateProductImageResponse'
            requiredProperties:
              - url
        examples:
          example:
            value:
              image_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
              url: <string>
        description: Aws s3 presigned URL. Upload image to this URL within 60s
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
  schemas: {}
```
