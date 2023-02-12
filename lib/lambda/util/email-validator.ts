import { ParsedMail } from "mailparser";

export const emailValidator = {
    validateStringBody: (body: string | undefined): string => {
        if (!body) {
            throw new Error("Body is empty.");
        }

        return body as string;
    },
    validateParsedMail: (parsedMail: ParsedMail | undefined): ParsedMail => {
        if (!parsedMail) {
            throw new Error("Parsed mail is undefined");
        }
        if (!parsedMail.attachments) {
            throw new Error("Parsed mail has no attachments");
        }
        if (!parsedMail.to || !parsedMail.from) {
            throw new Error("Parsed mail has invalid 'to' or 'from' attributes");
        }

        return parsedMail as ParsedMail;
    }
}