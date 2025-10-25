Dispute Webhook Payload

Copy page

The payload sent to your webhook endpoint when a dispute is created or updated.

​
amount
stringrequired
The amount involved in the dispute, represented as a string to accommodate precision.

​
business_id
stringrequired
The unique identifier of the business involved in the dispute.

​
created_at
string<date-time>required
The timestamp of when the dispute was created, in UTC.

​
currency
stringrequired
The currency of the disputed amount, represented as an ISO 4217 currency code.

​
dispute_id
stringrequired
The unique identifier of the dispute.

​
dispute_stage
enum<string>required
The current stage of the dispute process.

Available options: pre_dispute, dispute, pre_arbitration
​
dispute_status
enum<string>required
The current status of the dispute.

Available options: dispute_opened, dispute_expired, dispute_accepted, dispute_cancelled, dispute_challenged, dispute_won, dispute_lost
​
payment_id
stringrequired
The unique identifier of the payment associated with the dispute.

​
remarks
string | null
