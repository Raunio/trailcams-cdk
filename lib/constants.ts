// TODO: Move to parameter store
export const Constants = {
  AWS_REGION: "eu-west-1",
  S3: {
    EMAIL_BUCKET_NAME: "trailcams-emails",
    USER_BUCKET_ARN_TEMPLATE: "arn:aws:s3:::trailcams-user-bucket*",
    USER_BUCKET_OBJECTS_ARN_TEMPLATE: "arn:aws:s3:::trailcams-user-bucket*/*",
    USER_THUMBNAIL_BUCKET_OBJECTS_ARN_TEMPLATE: "arn:aws:s3:::trailcams-user-bucket*--thumbnails/*",
  },
  SES: {
    SES_DOMAIN: "trailcams.click",
    RECEIPT_RULESET_NAME: "trailcams-receipt-rules",
    RECEIPT_RULE_NAME: "trailcams-receipt-rule",
    USER_BUCKET_PARAM_NAME: "trailcams/users/bucket-prefix",
  },
  REKOGNITION: {
    MAX_LABELS: 4,
    MIN_CONFIDENCE: 50,
  },
};
