# Update Files

> Update the files associated with a product.

## OpenAPI

```yaml put /products/{id}/files
paths:
  path: /products/{id}/files
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
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              file_name:
                allOf:
                  - type: string
            required: true
            refIdentifier: '#/components/schemas/UploadProductFile'
            requiredProperties:
              - file_name
        examples:
          example:
            value:
              file_name: <string>
    codeSamples:
      - lang: JavaScript
        source: >-
          import DodoPayments from 'dodopayments';


          const client = new DodoPayments({
            bearerToken: 'My Bearer Token',
          });


          const response = await client.products.updateFiles('id', { file_name:
          'file_name' });


          console.log(response.file_id);
      - lang: Python
        source: |-
          from dodopayments import DodoPayments

          client = DodoPayments(
              bearer_token="My Bearer Token",
          )
          response = client.products.update_files(
              id="id",
              file_name="file_name",
          )
          print(response.file_id)
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
            response, err := client.Products.UpdateFiles(
              context.TODO(),
              "id",
              dodopayments.ProductUpdateFilesParams{
                FileName: dodopayments.F("file_name"),
              },
            )
            if err != nil {
              panic(err.Error())
            }
            fmt.Printf("%+v\n", response.FileID)
          }
      - lang: Java
        source: >-
          package com.dodopayments.api.example;


          import com.dodopayments.api.client.DodoPaymentsClient;

          import com.dodopayments.api.client.okhttp.DodoPaymentsOkHttpClient;

          import com.dodopayments.api.models.products.ProductUpdateFilesParams;

          import
          com.dodopayments.api.models.products.ProductUpdateFilesResponse;


          public final class Main {
              private Main() {}

              public static void main(String[] args) {
                  DodoPaymentsClient client = DodoPaymentsOkHttpClient.fromEnv();

                  ProductUpdateFilesParams params = ProductUpdateFilesParams.builder()
                      .id("id")
                      .fileName("file_name")
                      .build();
                  ProductUpdateFilesResponse response = client.products().updateFiles(params);
              }
          }
      - lang: Kotlin
        source: |-
          package com.dodopayments.api.example

          import com.dodopayments.api.client.DodoPaymentsClient
          import com.dodopayments.api.client.okhttp.DodoPaymentsOkHttpClient
          import com.dodopayments.api.models.products.ProductUpdateFilesParams
          import com.dodopayments.api.models.products.ProductUpdateFilesResponse

          fun main() {
              val client: DodoPaymentsClient = DodoPaymentsOkHttpClient.fromEnv()

              val params: ProductUpdateFilesParams = ProductUpdateFilesParams.builder()
                  .id("id")
                  .fileName("file_name")
                  .build()
              val response: ProductUpdateFilesResponse = client.products().updateFiles(params)
          }
      - lang: Ruby
        source: >-
          require "dodopayments"


          dodo_payments = Dodopayments::Client.new(
            bearer_token: "My Bearer Token",
            environment: "test_mode" # defaults to "live_mode"
          )


          response = dodo_payments.products.update_files("id", file_name:
          "file_name")


          puts(response)
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              file_id:
                allOf:
                  - type: string
                    format: uuid
              url:
                allOf:
                  - type: string
            refIdentifier: '#/components/schemas/UploadProductFileResponse'
            requiredProperties:
              - url
              - file_id
        examples:
          example:
            value:
              file_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
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
