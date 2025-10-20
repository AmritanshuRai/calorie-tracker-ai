Usage
The Usage API provides detailed insights into your activity across the OpenAI API. It also includes a separate Costs endpoint, which offers visibility into your spend, breaking down consumption by invoice line items and project IDs.

While the Usage API delivers granular usage data, it may not always reconcile perfectly with the Costs due to minor differences in how usage and spend are recorded. For financial purposes, we recommend using the Costs endpoint or the Costs tab in the Usage Dashboard, which will reconcile back to your billing invoice.

Completions
get

https://api.openai.com/v1/organization/usage/completions
Get completions usage details for the organization.

Query parameters
start_time
integer

Required
Start time (Unix seconds) of the query time range, inclusive.

api_key_ids
array

Optional
Return only usage for these API keys.

batch
boolean

Optional
If true, return batch jobs only. If false, return non-batch jobs only. By default, return both.

bucket_width
string

Optional
Defaults to 1d
Width of each time bucket in response. Currently 1m, 1h and 1d are supported, default to 1d.

end_time
integer

Optional
End time (Unix seconds) of the query time range, exclusive.

group_by
array

Optional
Group the usage data by the specified fields. Support fields include project_id, user_id, api_key_id, model, batch, service_tier or any combination of them.

limit
integer

Optional
Specifies the number of buckets to return.

bucket_width=1d: default: 7, max: 31
bucket_width=1h: default: 24, max: 168
bucket_width=1m: default: 60, max: 1440
models
array

Optional
Return only usage for these models.

page
string

Optional
A cursor for use in pagination. Corresponding to the next_page field from the previous response.

project_ids
array

Optional
Return only usage for these projects.

user_ids
array

Optional
Return only usage for these users.

Returns
A list of paginated, time bucketed Completions usage objects.

Example request
curl "https://api.openai.com/v1/organization/usage/completions?start_time=1730419200&limit=1" \
-H "Authorization: Bearer $OPENAI_ADMIN_KEY" \
-H "Content-Type: application/json"
Response
{
"object": "page",
"data": [
{
"object": "bucket",
"start_time": 1730419200,
"end_time": 1730505600,
"results": [
{
"object": "organization.usage.completions.result",
"input_tokens": 1000,
"output_tokens": 500,
"input_cached_tokens": 800,
"input_audio_tokens": 0,
"output_audio_tokens": 0,
"num_model_requests": 5,
"project_id": null,
"user_id": null,
"api_key_id": null,
"model": null,
"batch": null,
"service_tier": null
}
]
}
],
"has_more": true,
"next_page": "page_AAAAAGdGxdEiJdKOAAAAAGcqsYA="
}
Completions usage object
The aggregated completions usage details of the specific time bucket.

api_key_id
string

When group_by=api_key_id, this field provides the API key ID of the grouped usage result.

batch
boolean

When group_by=batch, this field tells whether the grouped usage result is batch or not.

input_audio_tokens
integer

The aggregated number of audio input tokens used, including cached tokens.

input_cached_tokens
integer

The aggregated number of text input tokens that has been cached from previous requests. For customers subscribe to scale tier, this includes scale tier tokens.

input_tokens
integer

The aggregated number of text input tokens used, including cached tokens. For customers subscribe to scale tier, this includes scale tier tokens.

model
string

When group_by=model, this field provides the model name of the grouped usage result.

num_model_requests
integer

The count of requests made to the model.

object
string

output_audio_tokens
integer

The aggregated number of audio output tokens used.

output_tokens
integer

The aggregated number of text output tokens used. For customers subscribe to scale tier, this includes scale tier tokens.

project_id
string

When group_by=project_id, this field provides the project ID of the grouped usage result.

service_tier
string

When group_by=service_tier, this field provides the service tier of the grouped usage result.

user_id
string

When group_by=user_id, this field provides the user ID of the grouped usage result.

OBJECT Completions usage object
{
"object": "organization.usage.completions.result",
"input_tokens": 5000,
"output_tokens": 1000,
"input_cached_tokens": 4000,
"input_audio_tokens": 300,
"output_audio_tokens": 200,
"num_model_requests": 5,
"project_id": "proj_abc",
"user_id": "user-abc",
"api_key_id": "key_abc",
"model": "gpt-4o-mini-2024-07-18",
"batch": false,
"service_tier": "default"
}
Embeddings
get

https://api.openai.com/v1/organization/usage/embeddings
Get embeddings usage details for the organization.

Query parameters
start_time
integer

Required
Start time (Unix seconds) of the query time range, inclusive.

api_key_ids
array

Optional
Return only usage for these API keys.

bucket_width
string

Optional
Defaults to 1d
Width of each time bucket in response. Currently 1m, 1h and 1d are supported, default to 1d.

end_time
integer

Optional
End time (Unix seconds) of the query time range, exclusive.

group_by
array

Optional
Group the usage data by the specified fields. Support fields include project_id, user_id, api_key_id, model or any combination of them.

limit
integer

Optional
Specifies the number of buckets to return.

bucket_width=1d: default: 7, max: 31
bucket_width=1h: default: 24, max: 168
bucket_width=1m: default: 60, max: 1440
models
array

Optional
Return only usage for these models.

page
string

Optional
A cursor for use in pagination. Corresponding to the next_page field from the previous response.

project_ids
array

Optional
Return only usage for these projects.

user_ids
array

Optional
Return only usage for these users.

Returns
A list of paginated, time bucketed Embeddings usage objects.

Example request
curl "https://api.openai.com/v1/organization/usage/embeddings?start_time=1730419200&limit=1" \
-H "Authorization: Bearer $OPENAI_ADMIN_KEY" \
-H "Content-Type: application/json"
Response
{
"object": "page",
"data": [
{
"object": "bucket",
"start_time": 1730419200,
"end_time": 1730505600,
"results": [
{
"object": "organization.usage.embeddings.result",
"input_tokens": 16,
"num_model_requests": 2,
"project_id": null,
"user_id": null,
"api_key_id": null,
"model": null
}
]
}
],
"has_more": false,
"next_page": null
}
Embeddings usage object
The aggregated embeddings usage details of the specific time bucket.

api_key_id
string

When group_by=api_key_id, this field provides the API key ID of the grouped usage result.

input_tokens
integer

The aggregated number of input tokens used.

model
string

When group_by=model, this field provides the model name of the grouped usage result.

num_model_requests
integer

The count of requests made to the model.

object
string

project_id
string

When group_by=project_id, this field provides the project ID of the grouped usage result.

user_id
string

When group_by=user_id, this field provides the user ID of the grouped usage result.

OBJECT Embeddings usage object
{
"object": "organization.usage.embeddings.result",
"input_tokens": 20,
"num_model_requests": 2,
"project_id": "proj_abc",
"user_id": "user-abc",
"api_key_id": "key_abc",
"model": "text-embedding-ada-002-v2"
}
Moderations
get

https://api.openai.com/v1/organization/usage/moderations
Get moderations usage details for the organization.

Query parameters
start_time
integer

Required
Start time (Unix seconds) of the query time range, inclusive.

api_key_ids
array

Optional
Return only usage for these API keys.

bucket_width
string

Optional
Defaults to 1d
Width of each time bucket in response. Currently 1m, 1h and 1d are supported, default to 1d.

end_time
integer

Optional
End time (Unix seconds) of the query time range, exclusive.

group_by
array

Optional
Group the usage data by the specified fields. Support fields include project_id, user_id, api_key_id, model or any combination of them.

limit
integer

Optional
Specifies the number of buckets to return.

bucket_width=1d: default: 7, max: 31
bucket_width=1h: default: 24, max: 168
bucket_width=1m: default: 60, max: 1440
models
array

Optional
Return only usage for these models.

page
string

Optional
A cursor for use in pagination. Corresponding to the next_page field from the previous response.

project_ids
array

Optional
Return only usage for these projects.

user_ids
array

Optional
Return only usage for these users.

Returns
A list of paginated, time bucketed Moderations usage objects.

Example request
curl "https://api.openai.com/v1/organization/usage/moderations?start_time=1730419200&limit=1" \
-H "Authorization: Bearer $OPENAI_ADMIN_KEY" \
-H "Content-Type: application/json"
Response
{
"object": "page",
"data": [
{
"object": "bucket",
"start_time": 1730419200,
"end_time": 1730505600,
"results": [
{
"object": "organization.usage.moderations.result",
"input_tokens": 16,
"num_model_requests": 2,
"project_id": null,
"user_id": null,
"api_key_id": null,
"model": null
}
]
}
],
"has_more": false,
"next_page": null
}
Moderations usage object
The aggregated moderations usage details of the specific time bucket.

api_key_id
string

When group_by=api_key_id, this field provides the API key ID of the grouped usage result.

input_tokens
integer

The aggregated number of input tokens used.

model
string

When group_by=model, this field provides the model name of the grouped usage result.

num_model_requests
integer

The count of requests made to the model.

object
string

project_id
string

When group_by=project_id, this field provides the project ID of the grouped usage result.

user_id
string

When group_by=user_id, this field provides the user ID of the grouped usage result.

OBJECT Moderations usage object
{
"object": "organization.usage.moderations.result",
"input_tokens": 20,
"num_model_requests": 2,
"project_id": "proj_abc",
"user_id": "user-abc",
"api_key_id": "key_abc",
"model": "text-moderation"
}
Images
get

https://api.openai.com/v1/organization/usage/images
Get images usage details for the organization.

Query parameters
start_time
integer

Required
Start time (Unix seconds) of the query time range, inclusive.

api_key_ids
array

Optional
Return only usage for these API keys.

bucket_width
string

Optional
Defaults to 1d
Width of each time bucket in response. Currently 1m, 1h and 1d are supported, default to 1d.

end_time
integer

Optional
End time (Unix seconds) of the query time range, exclusive.

group_by
array

Optional
Group the usage data by the specified fields. Support fields include project_id, user_id, api_key_id, model, size, source or any combination of them.

limit
integer

Optional
Specifies the number of buckets to return.

bucket_width=1d: default: 7, max: 31
bucket_width=1h: default: 24, max: 168
bucket_width=1m: default: 60, max: 1440
models
array

Optional
Return only usage for these models.

page
string

Optional
A cursor for use in pagination. Corresponding to the next_page field from the previous response.

project_ids
array

Optional
Return only usage for these projects.

sizes
array

Optional
Return only usages for these image sizes. Possible values are 256x256, 512x512, 1024x1024, 1792x1792, 1024x1792 or any combination of them.

sources
array

Optional
Return only usages for these sources. Possible values are image.generation, image.edit, image.variation or any combination of them.

user_ids
array

Optional
Return only usage for these users.

Returns
A list of paginated, time bucketed Images usage objects.

Example request
curl "https://api.openai.com/v1/organization/usage/images?start_time=1730419200&limit=1" \
-H "Authorization: Bearer $OPENAI_ADMIN_KEY" \
-H "Content-Type: application/json"
Response
{
"object": "page",
"data": [
{
"object": "bucket",
"start_time": 1730419200,
"end_time": 1730505600,
"results": [
{
"object": "organization.usage.images.result",
"images": 2,
"num_model_requests": 2,
"size": null,
"source": null,
"project_id": null,
"user_id": null,
"api_key_id": null,
"model": null
}
]
}
],
"has_more": false,
"next_page": null
}
Images usage object
The aggregated images usage details of the specific time bucket.

api_key_id
string

When group_by=api_key_id, this field provides the API key ID of the grouped usage result.

images
integer

The number of images processed.

model
string

When group_by=model, this field provides the model name of the grouped usage result.

num_model_requests
integer

The count of requests made to the model.

object
string

project_id
string

When group_by=project_id, this field provides the project ID of the grouped usage result.

size
string

When group_by=size, this field provides the image size of the grouped usage result.

source
string

When group_by=source, this field provides the source of the grouped usage result, possible values are image.generation, image.edit, image.variation.

user_id
string

When group_by=user_id, this field provides the user ID of the grouped usage result.

OBJECT Images usage object
{
"object": "organization.usage.images.result",
"images": 2,
"num_model_requests": 2,
"size": "1024x1024",
"source": "image.generation",
"project_id": "proj_abc",
"user_id": "user-abc",
"api_key_id": "key_abc",
"model": "dall-e-3"
}
Audio speeches
get

https://api.openai.com/v1/organization/usage/audio_speeches
Get audio speeches usage details for the organization.

Query parameters
start_time
integer

Required
Start time (Unix seconds) of the query time range, inclusive.

api_key_ids
array

Optional
Return only usage for these API keys.

bucket_width
string

Optional
Defaults to 1d
Width of each time bucket in response. Currently 1m, 1h and 1d are supported, default to 1d.

end_time
integer

Optional
End time (Unix seconds) of the query time range, exclusive.

group_by
array

Optional
Group the usage data by the specified fields. Support fields include project_id, user_id, api_key_id, model or any combination of them.

limit
integer

Optional
Specifies the number of buckets to return.

bucket_width=1d: default: 7, max: 31
bucket_width=1h: default: 24, max: 168
bucket_width=1m: default: 60, max: 1440
models
array

Optional
Return only usage for these models.

page
string

Optional
A cursor for use in pagination. Corresponding to the next_page field from the previous response.

project_ids
array

Optional
Return only usage for these projects.

user_ids
array

Optional
Return only usage for these users.

Returns
A list of paginated, time bucketed Audio speeches usage objects.

Example request
curl "https://api.openai.com/v1/organization/usage/audio_speeches?start_time=1730419200&limit=1" \
-H "Authorization: Bearer $OPENAI_ADMIN_KEY" \
-H "Content-Type: application/json"
Response
{
"object": "page",
"data": [
{
"object": "bucket",
"start_time": 1730419200,
"end_time": 1730505600,
"results": [
{
"object": "organization.usage.audio_speeches.result",
"characters": 45,
"num_model_requests": 1,
"project_id": null,
"user_id": null,
"api_key_id": null,
"model": null
}
]
}
],
"has_more": false,
"next_page": null
}
Audio speeches usage object
The aggregated audio speeches usage details of the specific time bucket.

api_key_id
string

When group_by=api_key_id, this field provides the API key ID of the grouped usage result.

characters
integer

The number of characters processed.

model
string

When group_by=model, this field provides the model name of the grouped usage result.

num_model_requests
integer

The count of requests made to the model.

object
string

project_id
string

When group_by=project_id, this field provides the project ID of the grouped usage result.

user_id
string

When group_by=user_id, this field provides the user ID of the grouped usage result.

OBJECT Audio speeches usage object
{
"object": "organization.usage.audio_speeches.result",
"characters": 45,
"num_model_requests": 1,
"project_id": "proj_abc",
"user_id": "user-abc",
"api_key_id": "key_abc",
"model": "tts-1"
}
Audio transcriptions
get

https://api.openai.com/v1/organization/usage/audio_transcriptions
Get audio transcriptions usage details for the organization.

Query parameters
start_time
integer

Required
Start time (Unix seconds) of the query time range, inclusive.

api_key_ids
array

Optional
Return only usage for these API keys.

bucket_width
string

Optional
Defaults to 1d
Width of each time bucket in response. Currently 1m, 1h and 1d are supported, default to 1d.

end_time
integer

Optional
End time (Unix seconds) of the query time range, exclusive.

group_by
array

Optional
Group the usage data by the specified fields. Support fields include project_id, user_id, api_key_id, model or any combination of them.

limit
integer

Optional
Specifies the number of buckets to return.

bucket_width=1d: default: 7, max: 31
bucket_width=1h: default: 24, max: 168
bucket_width=1m: default: 60, max: 1440
models
array

Optional
Return only usage for these models.

page
string

Optional
A cursor for use in pagination. Corresponding to the next_page field from the previous response.

project_ids
array

Optional
Return only usage for these projects.

user_ids
array

Optional
Return only usage for these users.

Returns
A list of paginated, time bucketed Audio transcriptions usage objects.

Example request
curl "https://api.openai.com/v1/organization/usage/audio_transcriptions?start_time=1730419200&limit=1" \
-H "Authorization: Bearer $OPENAI_ADMIN_KEY" \
-H "Content-Type: application/json"
Response
{
"object": "page",
"data": [
{
"object": "bucket",
"start_time": 1730419200,
"end_time": 1730505600,
"results": [
{
"object": "organization.usage.audio_transcriptions.result",
"seconds": 20,
"num_model_requests": 1,
"project_id": null,
"user_id": null,
"api_key_id": null,
"model": null
}
]
}
],
"has_more": false,
"next_page": null
}
Audio transcriptions usage object
The aggregated audio transcriptions usage details of the specific time bucket.

api_key_id
string

When group_by=api_key_id, this field provides the API key ID of the grouped usage result.

model
string

When group_by=model, this field provides the model name of the grouped usage result.

num_model_requests
integer

The count of requests made to the model.

object
string

project_id
string

When group_by=project_id, this field provides the project ID of the grouped usage result.

seconds
integer

The number of seconds processed.

user_id
string

When group_by=user_id, this field provides the user ID of the grouped usage result.

OBJECT Audio transcriptions usage object
{
"object": "organization.usage.audio_transcriptions.result",
"seconds": 10,
"num_model_requests": 1,
"project_id": "proj_abc",
"user_id": "user-abc",
"api_key_id": "key_abc",
"model": "tts-1"
}
Vector stores
get

https://api.openai.com/v1/organization/usage/vector_stores
Get vector stores usage details for the organization.

Query parameters
start_time
integer

Required
Start time (Unix seconds) of the query time range, inclusive.

bucket_width
string

Optional
Defaults to 1d
Width of each time bucket in response. Currently 1m, 1h and 1d are supported, default to 1d.

end_time
integer

Optional
End time (Unix seconds) of the query time range, exclusive.

group_by
array

Optional
Group the usage data by the specified fields. Support fields include project_id.

limit
integer

Optional
Specifies the number of buckets to return.

bucket_width=1d: default: 7, max: 31
bucket_width=1h: default: 24, max: 168
bucket_width=1m: default: 60, max: 1440
page
string

Optional
A cursor for use in pagination. Corresponding to the next_page field from the previous response.

project_ids
array

Optional
Return only usage for these projects.

Returns
A list of paginated, time bucketed Vector stores usage objects.

Example request
curl "https://api.openai.com/v1/organization/usage/vector_stores?start_time=1730419200&limit=1" \
-H "Authorization: Bearer $OPENAI_ADMIN_KEY" \
-H "Content-Type: application/json"
Response
{
"object": "page",
"data": [
{
"object": "bucket",
"start_time": 1730419200,
"end_time": 1730505600,
"results": [
{
"object": "organization.usage.vector_stores.result",
"usage_bytes": 1024,
"project_id": null
}
]
}
],
"has_more": false,
"next_page": null
}
Vector stores usage object
The aggregated vector stores usage details of the specific time bucket.

object
string

project_id
string

When group_by=project_id, this field provides the project ID of the grouped usage result.

usage_bytes
integer

The vector stores usage in bytes.

OBJECT Vector stores usage object
{
"object": "organization.usage.vector_stores.result",
"usage_bytes": 1024,
"project_id": "proj_abc"
}
Code interpreter sessions
get

https://api.openai.com/v1/organization/usage/code_interpreter_sessions
Get code interpreter sessions usage details for the organization.

Query parameters
start_time
integer

Required
Start time (Unix seconds) of the query time range, inclusive.

bucket_width
string

Optional
Defaults to 1d
Width of each time bucket in response. Currently 1m, 1h and 1d are supported, default to 1d.

end_time
integer

Optional
End time (Unix seconds) of the query time range, exclusive.

group_by
array

Optional
Group the usage data by the specified fields. Support fields include project_id.

limit
integer

Optional
Specifies the number of buckets to return.

bucket_width=1d: default: 7, max: 31
bucket_width=1h: default: 24, max: 168
bucket_width=1m: default: 60, max: 1440
page
string

Optional
A cursor for use in pagination. Corresponding to the next_page field from the previous response.

project_ids
array

Optional
Return only usage for these projects.

Returns
A list of paginated, time bucketed Code interpreter sessions usage objects.

Example request
curl "https://api.openai.com/v1/organization/usage/code_interpreter_sessions?start_time=1730419200&limit=1" \
-H "Authorization: Bearer $OPENAI_ADMIN_KEY" \
-H "Content-Type: application/json"
Response
{
"object": "page",
"data": [
{
"object": "bucket",
"start_time": 1730419200,
"end_time": 1730505600,
"results": [
{
"object": "organization.usage.code_interpreter_sessions.result",
"num_sessions": 1,
"project_id": null
}
]
}
],
"has_more": false,
"next_page": null
}
Code interpreter sessions usage object
The aggregated code interpreter sessions usage details of the specific time bucket.

num_sessions
integer

The number of code interpreter sessions.

object
string

project_id
string

When group_by=project_id, this field provides the project ID of the grouped usage result.

OBJECT Code interpreter sessions usage object
{
"object": "organization.usage.code_interpreter_sessions.result",
"num_sessions": 1,
"project_id": "proj_abc"
}
Costs
get

https://api.openai.com/v1/organization/costs
Get costs details for the organization.

Query parameters
start_time
integer

Required
Start time (Unix seconds) of the query time range, inclusive.

bucket_width
string

Optional
Defaults to 1d
Width of each time bucket in response. Currently only 1d is supported, default to 1d.

end_time
integer

Optional
End time (Unix seconds) of the query time range, exclusive.

group_by
array

Optional
Group the costs by the specified fields. Support fields include project_id, line_item and any combination of them.

limit
integer

Optional
Defaults to 7
A limit on the number of buckets to be returned. Limit can range between 1 and 180, and the default is 7.

page
string

Optional
A cursor for use in pagination. Corresponding to the next_page field from the previous response.

project_ids
array

Optional
Return only costs for these projects.

Returns
A list of paginated, time bucketed Costs objects.

Example request
curl "https://api.openai.com/v1/organization/costs?start_time=1730419200&limit=1" \
-H "Authorization: Bearer $OPENAI_ADMIN_KEY" \
-H "Content-Type: application/json"
Response
{
"object": "page",
"data": [
{
"object": "bucket",
"start_time": 1730419200,
"end_time": 1730505600,
"results": [
{
"object": "organization.costs.result",
"amount": {
"value": 0.06,
"currency": "usd"
},
"line_item": null,
"project_id": null
}
]
}
],
"has_more": false,
"next_page": null
}
Costs object
The aggregated costs details of the specific time bucket.

amount
object

The monetary value in its associated currency.

Show properties
line_item
string

When group_by=line_item, this field provides the line item of the grouped costs result.

object
string

project_id
string

When group_by=project_id, this field provides the project ID of the grouped costs result.

OBJECT Costs object
{
"object": "organization.costs.result",
"amount": {
"value": 0.06,
"currency": "usd"
},
"line_item": "Image models",
"project_id": "proj_abc"
}
Certificates
Beta
Manage Mutual TLS certificates across your organization and projects.

Learn more about Mutual TLS.

Upload certificate
post

https://api.openai.com/v1/organization/certificates
Upload a certificate to the organization. This does not automatically activate the certificate.

Organizations can upload up to 50 certificates.

Request body
content
string

Required
The certificate content in PEM format

name
string

Optional
An optional name for the certificate

Returns
A single Certificate object.

Example request
curl -X POST https://api.openai.com/v1/organization/certificates \
-H "Authorization: Bearer $OPENAI_ADMIN_KEY" \
-H "Content-Type: application/json" \
-d '{
"name": "My Example Certificate",
"certificate": "-----BEGIN CERTIFICATE-----\\nMIIDeT...\\n-----END CERTIFICATE-----"
}'
Response
{
"object": "certificate",
"id": "cert_abc",
"name": "My Example Certificate",
"created_at": 1234567,
"certificate_details": {
"valid_at": 12345667,
"expires_at": 12345678
}
}
