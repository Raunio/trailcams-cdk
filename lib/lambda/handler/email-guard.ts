import { Handler } from "aws-cdk-lib/aws-lambda";
import { Callback, Context, SESEvent } from "aws-lambda";
import { Constants } from "../../constants";

/* eslint-disable  @typescript-eslint/no-unused-vars */
export const handler: Handler = async (event: SESEvent, context: Context, callback: Callback) => {
  const mail = event.Records[0].ses.mail;
  const domain = Constants.SES.SES_DOMAIN;

  mail.headers.forEach((header) => {
    console.log(header);
    if (["to", "from"].includes(header.name.toLowerCase()) && header.value.split("@")[1] !== domain) {
      console.log("Dropping email because it's sent from a domain that is not accepted: " + header.value);

      callback(null, { disposition: "STOP_RULE_SET" });
    }
  });

  callback(null, null);
};
