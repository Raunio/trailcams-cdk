import { mockClient } from "aws-sdk-client-mock";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { handler } from "../../../lib/lambda/handler/email-attachment-handler";
import { mockContext, mockEvent } from "./mocks";
import { createReadStream } from "fs";
import { sdkStreamMixin } from "@aws-sdk/util-stream-node";

describe("Email handler tests", () => {
  const s3Mock = mockClient(S3Client);
  beforeAll(() => {
    const stream = createReadStream("test/resources/email.eml");

    s3Mock.on(GetObjectCommand).resolves({ Body: sdkStreamMixin(stream) });
    s3Mock.on(PutObjectCommand).resolves({});
  });

  it("Verify successful response", async () => {
    const result = await handler(mockEvent, mockContext, () => {
      console.log("Yes baby");
    });

    expect(result).toBeDefined();
  });
});
