import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, type, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Configure your transporter
    // For Gmail, you would use an "App Password"
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "catskillarchitecturalsalvage@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: "catskillarchitecturalsalvage@gmail.com",
      subject: `[${type.toUpperCase()}] New Inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nType: ${type}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 40px;">
          <h2 style="text-transform: uppercase; letter-spacing: 0.1em; font-style: italic;">New Inquiry</h2>
          <p><strong>Source:</strong> ${name} (${email})</p>
          <p><strong>Classification:</strong> ${type}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Transmission Successful" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
