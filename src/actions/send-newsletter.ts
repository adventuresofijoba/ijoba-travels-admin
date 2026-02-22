"use server";

import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface StoryData {
  title: string;
  slug: string;
  author_name: string;
  cover_image?: string;
  content: string; // Plain text or HTML? RichTextEditor usually outputs HTML.
}

export async function sendNewsletter(story: StoryData) {
  try {
    // 1. Fetch all newsletter subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from("inquiries")
      .select("email")
      .eq("inquiry_type", "newsletter");

    if (fetchError) {
      console.error("Error fetching subscribers:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!subscribers || subscribers.length === 0) {
      return { success: true, message: "No subscribers found." };
    }

    // Extract emails
    const emails = subscribers.map((sub) => sub.email);

    // Filter out invalid emails and duplicates
    const uniqueEmails = [...new Set(emails)].filter(
      (email) => email && email.includes("@")
    );

    if (uniqueEmails.length === 0) {
      return { success: true, message: "No valid subscriber emails found." };
    }

    // 2. Send email via Resend (using BCC for privacy)
    // Note: Resend Free tier might have limits on BCC count per email.
    // Ideally we'd loop or use a broadcast feature, but for now BCC is simplest.
    // If list > 50, might need to split.

    // Create a snippet of the content (strip HTML tags for plain text preview if needed, but we'll send HTML)
    // The content from RichTextEditor is HTML.

    const { data: emailData, error: sendError } = await resend.emails.send({
      from: "Ijoba Travels <onboarding@resend.dev>",
      to: [process.env.RECEIVING_EMAIL || "newsletter@ijobatravels.com"], // Using env var or dummy TO address
      bcc: uniqueEmails,
      subject: `New Story: ${story.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #F4A261;">${story.title}</h1>
          <p><strong>By ${story.author_name}</strong></p>
          ${
            story.cover_image
              ? `<img src="${story.cover_image}" alt="${story.title}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px;" />`
              : ""
          }
          <br />
          <p>We've just published a new story! Click the link below to read more.</p>
          <a href="https://ijoba-travels.vercel.app/stories-and-tips/${
            story.slug
          }" style="display: inline-block; background-color: #F4A261; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Read Full Story</a>
          <br /><br />
          <p>Warm regards,</p>
          <p><strong>The Ijoba Travels Team</strong></p>
        </div>
      `,
    });

    if (sendError) {
      console.error("Error sending newsletter:", sendError);
      return { success: false, error: sendError.message };
    }

    return { success: true, data: emailData };
  } catch (error: any) {
    console.error("Unexpected error sending newsletter:", error);
    return { success: false, error: error.message };
  }
}
