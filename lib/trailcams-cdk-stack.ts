import { Permission } from "@aws-sdk/client-s3";
import * as cdk from "aws-cdk-lib";
import {
  AccountRootPrincipal,
  ArnPrincipal,
  Effect,
  Policy,
  PolicyStatement,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Construct } from "constructs";
import { Constants } from "./constants";
import { TrailcamsCdkLambdaHandler } from "./lambda/trailcams-cdk-lambda-handler";
import { TrailcamsCdkLambdaStack } from "./lambda/trailcams-cdk-lambda-stack";
import { TrailcamsCdkRekognition } from "./rekognition/trailcams-cdk-rekognition";
import { TrailcamsCdkRekognitionPolicyStatements } from "./rekognition/trailcams-cdk-rekognition-policy-statements";
import { TrailcamsCdkS3Bucket } from "./s3/trailcams-cdk-s3-bucket";
import { TrailcamsCdkS3EmailBucket } from "./s3/trailcams-cdk-s3-email-bucket";
import { TrailcamsCdkS3RekognitionDatasetBucket } from "./s3/trailcams-cdk-s3-rekognition-dataset-bucket";
import { TrailcamsCdkSESReceiptRules } from "./ses/trailcams-cd-ses-receipt-rules";

export class TrailcamsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaStack = new TrailcamsCdkLambdaStack(this);
    const emailBucket = new TrailcamsCdkS3EmailBucket(this, lambdaStack.getEmailAttachmentsHandler());
    const SESReceiptRules = new TrailcamsCdkSESReceiptRules(this, {
      ruleSetName: "trailcams-receipt-rules",
      bucket: emailBucket.getBucket(),
      emailGuardFunction: lambdaStack.getEmailGuardHandler().getHandler(),
    });

    const rekognitionDatasetBucket = new TrailcamsCdkS3RekognitionDatasetBucket(this);

    const rekognition = new TrailcamsCdkRekognition(this, "trailcams-custom-labels-project");
  }
}
