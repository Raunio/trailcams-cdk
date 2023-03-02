// TODO: Move to parameter store
export const Constants = {
  AWS_REGION: "eu-west-1",
  S3: {
    EMAIL_BUCKET_NAME: "trailcams-emails",
  },
  SES: {
    SES_DOMAIN: "trailcams.click",
    RECEIPT_RULESET_NAME: "trailcams-receipt-rules",
    RECEIPT_RULE_NAME: "trailcams-receipt-rule",
  },
  REKOGNITION: {
    MAX_LABELS: 4,
    MIN_CONFIDENCE: 50,
  },
};
