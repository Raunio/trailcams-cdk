import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { Handler } from "aws-lambda";
import { AddressObject, simpleParser } from "mailparser";
import { Constants } from "../../constants";
import { emailValidator } from "../util/email-validator";
import { errorHandler } from "../util/error-handler";

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
const s3 = new S3Client({});
const ssm = new SSMClient({});

/* eslint-disable  @typescript-eslint/no-unused-vars */
export const handler: Handler = async (event, context) => {
  console.log(JSON.stringify(event));

  const record = event.Records[0];
  const objectKey = record.s3.object.key as string;
  const bucket = record.s3.bucket.name as string;

  const request = new GetObjectCommand({
    Bucket: bucket,
    Key: objectKey,
  });

  console.log(`Getting object from S3 with key ${objectKey}`);
  let data;
  try {
    data = await s3.send(request);
  } catch (error) {
    errorHandler.handleError(error);
  }

  if (!data) {
    throw new Error(`Could not find object with key ${objectKey} in bucket ${bucket}`);
  }

  console.log("Parsing email...");
  let email;
  try {
    const bodyAsString = await data.Body?.transformToString("UTF-8");
    email = await simpleParser(emailValidator.validateStringBody(bodyAsString));
  } catch (error) {
    errorHandler.handleError(error);
  }

  email = emailValidator.validateParsedMail(email);

  const attachments = email.attachments;
  if (!attachments) {
    errorHandler.handleError(new Error("Email has no attachments."));
  }

  const toAddress = (email.to as AddressObject).value[0].address as string;
  const username = toAddress.split("@")[0];

  const fromAddress = (email.from as AddressObject).value[0].address as string;
  const cameraName = fromAddress.split("@")[0];

  let userBucketPrefix = "trailcams-user-bucket-";

  /*try {
    const getParam = await ssm.send(new GetParameterCommand({ Name: Constants.SES.USER_BUCKET_PARAM_NAME }));
    userBucketPrefix = getParam.Parameter?.Value as string;
    if (!userBucketPrefix) {
      throw new Error(`Parameter ${Constants.SES.USER_BUCKET_PARAM_NAME} is not defined!`);
    }
  } catch (error) {
    errorHandler.handleError(error);
  }*/

  const putKey = `${cameraName}/` + attachments[0].filename;
  const putBucket = `${userBucketPrefix}${username}`;

  const putRequest = new PutObjectCommand({
    Bucket: putBucket,
    Key: putKey,
    Body: attachments[0].content,
    ContentType: attachments[0].contentType,
    ContentDisposition: "inline",
    Metadata: {
      timestamp: new Date().toISOString(),
    },
  });

  console.log(
    `Email from ${fromAddress} to ${toAddress} is being processed. Putting attachment to bucket ${putBucket} with key ${putKey}`
  );

  try {
    await s3.send(putRequest);
  } catch (error) {
    errorHandler.handleError(error);
  }

  return { statusCode: 200, body: { putKey } };
};
