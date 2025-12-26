import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  type: 'confirmation' | 'cancellation';
  booking: {
    bookingReference: string;
    userEmail: string;
    airline: string;
    flightNumber: string;
    originCity: string;
    originCode: string;
    destinationCity: string;
    destinationCode: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    classType: string;
    totalAmount: number;
    passengers: Array<{
      firstName: string;
      lastName: string;
      seatId?: string;
    }>;
  };
  refundAmount?: number;
  cancellationReason?: string;
}

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const generateConfirmationEmail = (booking: BookingEmailRequest['booking']) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - AirMatrix</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✈️ AirMatrix</h1>
      <p style="color: #e0f2fe; margin: 10px 0 0 0;">Your Booking is Confirmed!</p>
    </div>
    
    <div style="background-color: #f0fdf4; padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">Booking Reference (PNR)</p>
      <h2 style="margin: 5px 0 0 0; color: #16a34a; font-size: 32px; letter-spacing: 2px;">${booking.bookingReference}</h2>
    </div>
    
    <div style="padding: 30px;">
      <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px;">Flight Details</h3>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Route</td>
            <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 500;">${booking.originCode} → ${booking.destinationCode}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Flight</td>
            <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 500;">${booking.airline} ${booking.flightNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Departure</td>
            <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 500;">${formatDateTime(booking.departureTime)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Arrival</td>
            <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 500;">${formatDateTime(booking.arrivalTime)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Class</td>
            <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 500;">${booking.classType.charAt(0).toUpperCase() + booking.classType.slice(1)}</td>
          </tr>
        </table>
      </div>
      
      <h3 style="margin: 20px 0 15px 0; color: #1f2937; font-size: 18px;">Passengers</h3>
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px;">
        ${booking.passengers.map((p, i) => `
          <div style="padding: 8px 0; ${i > 0 ? 'border-top: 1px solid #e5e7eb;' : ''}">
            <span style="color: #1f2937; font-weight: 500;">${p.firstName} ${p.lastName}</span>
            ${p.seatId ? `<span style="color: #6b7280; margin-left: 10px;">Seat: ${p.seatId}</span>` : ''}
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: 20px; padding: 20px; background-color: #0ea5e9; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #e0f2fe; font-size: 14px;">Total Amount Paid</p>
        <p style="margin: 5px 0 0 0; color: #ffffff; font-size: 28px; font-weight: bold;">₹${booking.totalAmount.toLocaleString('en-IN')}</p>
      </div>
    </div>
    
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Need help? Contact us at support@airmatrix.com</p>
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2025 AirMatrix. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const generateCancellationEmail = (booking: BookingEmailRequest['booking'], refundAmount: number, reason: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancelled - AirMatrix</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✈️ AirMatrix</h1>
      <p style="color: #fecaca; margin: 10px 0 0 0;">Booking Cancelled</p>
    </div>
    
    <div style="background-color: #fef2f2; padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">Booking Reference</p>
      <h2 style="margin: 5px 0 0 0; color: #dc2626; font-size: 32px; letter-spacing: 2px; text-decoration: line-through;">${booking.bookingReference}</h2>
    </div>
    
    <div style="padding: 30px;">
      <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px;">Cancelled Flight</h3>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Route</td>
            <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 500;">${booking.originCode} → ${booking.destinationCode}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Flight</td>
            <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 500;">${booking.airline} ${booking.flightNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Original Departure</td>
            <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 500;">${formatDateTime(booking.departureTime)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Cancellation Reason</td>
            <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 500;">${reason}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin-top: 20px; padding: 20px; background-color: #16a34a; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #dcfce7; font-size: 14px;">Refund Amount</p>
        <p style="margin: 5px 0 0 0; color: #ffffff; font-size: 28px; font-weight: bold;">₹${refundAmount.toLocaleString('en-IN')}</p>
        <p style="margin: 10px 0 0 0; color: #dcfce7; font-size: 12px;">Will be credited within 5-7 business days</p>
      </div>
    </div>
    
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Need help? Contact us at support@airmatrix.com</p>
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2025 AirMatrix. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - email not sent");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Email service not configured. Please add RESEND_API_KEY." 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { type, booking, refundAmount, cancellationReason }: BookingEmailRequest = await req.json();

    console.log(`Sending ${type} email to ${booking.userEmail} for booking ${booking.bookingReference}`);

    let html: string;
    let subject: string;

    if (type === 'confirmation') {
      html = generateConfirmationEmail(booking);
      subject = `Booking Confirmed! ${booking.bookingReference} - ${booking.originCode} to ${booking.destinationCode}`;
    } else {
      html = generateCancellationEmail(booking, refundAmount || 0, cancellationReason || 'Not specified');
      subject = `Booking Cancelled - ${booking.bookingReference}`;
    }

    // Dynamic import for Resend
    const { Resend } = await import("https://esm.sh/resend@2.0.0");
    const resend = new Resend(resendApiKey);

    const emailResponse = await resend.emails.send({
      from: "AirMatrix <onboarding@resend.dev>",
      to: [booking.userEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
