import { Effect, PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
export class TrailcamsCdkRekognitionPolicyStatements {
  private bucket: Bucket;

  constructor(bucket: Bucket) {
    this.bucket = bucket;
  }

  public getPolicies() {
    return {
      S3BucketAccess: new PolicyStatement({
        sid: "AllowRekognitionAccess",
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal("rekognition.amazonaws.com")],
        actions: ["s3:GetBucketAcl", "s3:GetBucketLocation"],
        resources: [this.bucket.bucketArn],
      }),
      S3ObjectAccess: new PolicyStatement({
        sid: "AllowRekognitionObjectAccess",
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal("rekognition.amazonaws.com")],
        actions: ["s3:GetObject", "s3:GetObjectAcl", "s3:GetObjectVersion", "s3:GetObjectTagging"],
        resources: [this.bucket.arnForObjects("*")],
      }),
      S3PutObject: new PolicyStatement({
        sid: "AllowRekognitionACLBucketWrite",
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal("rekognition.amazonaws.com")],
        actions: ["s3:PutObject"],
        resources: [this.bucket.arnForObjects("*")],
      }),
    };
  }
}
