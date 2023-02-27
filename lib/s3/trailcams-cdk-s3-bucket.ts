import { Stack } from "aws-cdk-lib";
import { AccountRootPrincipal, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { BlockPublicAccess, Bucket, BucketEncryption, ObjectOwnership } from "aws-cdk-lib/aws-s3";

export class TrailcamsCdkS3Bucket {
  private bucket: Bucket;

  constructor(stack: Stack, bucketName: string) {
    const s3Bucket = new Bucket(stack, bucketName, {
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
    });

    s3Bucket.grantRead(new AccountRootPrincipal());

    this.bucket = s3Bucket;
  }

  public getBucket(): Bucket {
    return this.bucket;
  }
}
