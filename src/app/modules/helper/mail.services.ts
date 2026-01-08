import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export function generateTempPassword(length = 10) {
    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

const sesClient = new SESClient({
    region: "ap-south-1",
});

export async function sendTempPasswordEmail(
    toEmail: string,
    tempPassword: string
) {
    const params = {
        Source: "vishnu@codevisionaryservices.com",
        Destination: {
            ToAddresses: [toEmail],
        },
        Message: {
            Subject: {
                Data: "Your Temporary Password",
            },
            Body: {
                Html: {
                    Data: `
                        <p>Hello,</p>
                        <p>Your temporary password is:</p>
                        <h3>${tempPassword}</h3>
                        <p>Please login and change your password immediately.</p>
                        <p>This password is valid until you change it.</p>
                    `,
                },
            },
        },
    };

    await sesClient.send(new SendEmailCommand(params));
}
