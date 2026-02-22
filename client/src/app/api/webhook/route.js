import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { plans } from "@/components/plans";

// Vergeet niet je User model te importeren!
// import User from "@/models/User"; 


// als je wil dat de user zijn subscriptions kan afzeggen of creditnummer wilt veranderen zie video 13,42 minuten



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
    const body = await req.text();
    const headerList = await headers(); // await toegevoegd
    const signature = headerList.get('stripe-signature');

    let event;

    try {
        // Let op de spelling: constructEvent
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
        console.error(`❌ Webhook verification failed: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const eventType = event.type;
    const data = event.data.object; // Het object zit direct in data.object

    try {
        switch (eventType) {
            case 'checkout.session.completed': {
                // Haal de volledige sessie op inclusief line_items
                const session = await stripe.checkout.sessions.retrieve(
                    data.id,
                    { expand: ['line_items'] }
                );

                const customerId = session?.customer; // Spelling: customer
                const customerDetails = await stripe.customers.retrieve(customerId);

                const priceId = session?.line_items?.data[0]?.price.id;
                const plan = plans.find((p) => p.priceId === priceId);

                if (!plan) {
                    console.error("Plan niet gevonden voor priceId:", priceId);
                    break;
                }

                // Database logica
                if (customerDetails.email) {
                    let user = await User.findOne({ email: customerDetails.email });

                    if (!user) {
                        user = await User.create({
                            email: customerDetails.email,
                            name: customerDetails.name,
                            customerId: customerId,
                        });
                    }

                    // Update toegang
                    user.priceId = priceId;
                    user.hasAccess = true; // Let op spelling access
                    await user.save();
                    
                    console.log(`✅ Gebruiker ${user.email} heeft nu toegang.`);
                }
                break;
            }
            
            // Goed om ook deze toe te voegen voor abonnementen:
            case 'invoice.payment_failed':
                // Hier kun je toegang weer intrekken als de betaling mislukt
                break;

            case 'customer.subscription.deleted': {
                const subscription = data; 
                
                const user = await User.findOne({
                    customerId: subscription.customer
                })

                // revoke axxes to your product
                if (user) {
                    user.hasAccess = false;
                    await user.save()
                }

                break
            }
            // nog een paar cases dat je kunt maken is bijvoorbeeld als de user in de checkout page zit maar niet betaalt heeft kun je via de 
            // stripe email de user een email sturen die zegt 20% korting

            
        }

        // Altijd een 200 status terugsturen naar Stripe
        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error) {
        console.error("Internal Error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
