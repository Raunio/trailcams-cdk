import { aws_ses_actions, Stack } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { ReceiptRule, ReceiptRuleSet } from "aws-cdk-lib/aws-ses";
import { Constants } from "../constants";

export class TrailcamsCdkSESReceiptRules {
  private s3ReceiptRule: ReceiptRule;

  constructor(stack: Stack, ruleSetName: string, bucket: Bucket) {
    const receiptRules: ReceiptRuleSet = new ReceiptRuleSet(stack, ruleSetName, {
      receiptRuleSetName: ruleSetName,
      dropSpam: true,
    });

    this.s3ReceiptRule = new ReceiptRule(stack, `trailcams-receipt-rule-s3`, {
      ruleSet: receiptRules,
      scanEnabled: true,
      actions: [new aws_ses_actions.S3({ bucket: bucket })],
      recipients: [Constants.SES_DOMAIN, `.${Constants.SES_DOMAIN}`],
    });
  }

  public getS3ReceiptRule(): ReceiptRule {
    return this.s3ReceiptRule;
  }
}
