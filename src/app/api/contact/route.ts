import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, type, message } = body;

    // Log for server-side debugging
    console.log("Transmission Attempt:", {
      hasPassword: !!process.env.GMAIL_APP_PASSWORD,
      sender: email
    });

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const transporter: Transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: {
        user: "catskillarchitecturalsalvage@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const adminMailOptions = {
      from: `"CAS Portal" <catskillarchitecturalsalvage@gmail.com>`,
      to: "catskillarchitecturalsalvage@gmail.com",
      replyTo: email,
      subject: `[${type.toUpperCase()}] New Inquiry from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 40px; color: #18181b;">
          <h2 style="text-transform: uppercase; letter-spacing: 0.2em; font-style: italic; font-weight: 900; border-bottom: 2px solid #f4f4f5; padding-bottom: 10px;">
            Acquisition Inquiry
          </h2>
          <p><strong>Sender:</strong> ${name} (${email})</p>
          <p><strong>Classification:</strong> ${type}</p>
          <div style="margin-top: 30px; padding: 20px; background-color: #fafafa; border-radius: 4px; font-style: italic;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
        </div>
      `,
    };

    const customerMailOptions = {
      from: `"Catskill Architectural Salvage" <catskillarchitecturalsalvage@gmail.com>`,
      to: email,
      subject: `Got your request — Catskill Architectural Salvage`,
      html: `
        <div style="font-family: serif; max-width: 600px; padding: 40px; color: #1c1c1c; line-height: 1.8;">
          <h2 style="font-style: italic; font-weight: normal; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; text-transform: uppercase; letter-spacing: 0.05em;">
            Checking the yard...
          </h2>
          <p style="margin-top: 24px;">Hi ${name},</p>
          <p>Thanks for reaching out. I'll personally take a look at what we have in stock and see if I can track down a match for you.</p>
          <p style="margin-top: 30px; font-weight: bold;">Best,<br />The Team @ Catskill Architectural Salvage</p>
        </div>
      `,
    };

    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions)
    ]);

    return NextResponse.json({ message: "Transmission Successful" }, { status: 200 });
    
  } catch (error: unknown) {
    // Narrowing the error type for ESLint compliance
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    console.error("CONTACT_API_FAILURE:", errorMessage);
    
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}