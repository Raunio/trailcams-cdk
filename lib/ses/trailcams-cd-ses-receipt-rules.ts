import { aws_ses_actions, Stack } from "aws-cdk-lib";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { ReceiptRule, ReceiptRuleSet } from "aws-cdk-lib/aws-ses";
import { LambdaInvocationType } from "aws-cdk-lib/aws-ses-actions";
import { Constants } from "../constants";

export class TrailcamsCdkSESReceiptRules {
  private s3ReceiptRule: ReceiptRule;

  constructor(stack: Stack, props: ReceiptRuleProps) {
    const receiptRules: ReceiptRuleSet = new ReceiptRuleSet(stack, props.ruleSetName, {
      receiptRuleSetName: props.ruleSetName,
      dropSpam: true,
    });

    this.s3ReceiptRule = new ReceiptRule(stack, `trailcams-receipt-rule-filter-and-store`, {
      ruleSet: receiptRules,
      scanEnabled: true,
      actions: [
        new aws_ses_actions.Lambda({
          function: props.emailGuardFunction,
          invocationType: LambdaInvocationType.REQUEST_RESPONSE,
        }),
        new aws_ses_actions.S3({ bucket: props.bucket }),
      ],
      recipients: [Constants.SES.SES_DOMAIN, `.${Constants.SES.SES_DOMAIN}`],
    });
  }

  public getS3ReceiptRule(): ReceiptRule {
    return this.s3ReceiptRule;
  }
}

export interface ReceiptRuleProps {
  readonly ruleSetName: string;
  readonly bucket: Bucket;
  readonly emailGuardFunction: IFunction;
}
