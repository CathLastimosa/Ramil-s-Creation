"use client"

import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog-origin"

export default function Component( {
  trigger,
}: {
  trigger: React.ReactNode
}) {
  const [hasReadToBottom, setHasReadToBottom] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const content = contentRef.current
    if (!content) return

    const scrollPercentage =
      content.scrollTop / (content.scrollHeight - content.clientHeight)
    if (scrollPercentage >= 0.99 && !hasReadToBottom) {
      setHasReadToBottom(true)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            Terms & Conditions
          </DialogTitle>
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="overflow-y-auto"
          >
            <DialogDescription asChild>
              <div className="px-6 py-4">
                <div className="[&_strong]:text-foreground space-y-4 [&_strong]:font-semibold">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p>
                        <strong>Introduction and Acceptance</strong>
                      </p>
                      <p>
                        Welcome to Ramil’s Creation, a family-owned event planning and services business established with over 30 years of experience serving thousands of clients. We specialize in a range of services including catering, gown and suit rentals, sound and lighting, backdrops, and customized wedding or event packages. By accessing our website, making a booking, or using our services, you agree to be bound by these Terms and Conditions (&ldquo;Terms&rdquo;). If you do not agree with any part of these Terms, please do not proceed with booking or using our services.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Definitions</strong>
                      </p>
                      <ul className="list-disc pl-6">
                        <li><strong>Services:</strong> Refers to the event planning and related services provided by Ramil’s Creation, such as catering, gown and suit rentals, wedding packages, and customized packages based on client preferences.</li>
                        <li><strong>Client:</strong> Any individual or entity booking or using our Services.</li>
                        <li><strong>Booking:</strong> The process of reserving Services, which includes providing event details and making a down payment.</li>
                        <li><strong>We/Us/Our:</strong> Refers to Ramil’s Creation and its staff.</li>
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Services Offered</strong>
                      </p>
                      <p>
                        Ramil’s Creation offers a variety of event services tailored to your needs, including: Catering, decorations, sound and lighting, backdrops, and gown rentals. Customized packages that can be adjusted based on your preferences (e.g., excluding certain services and converting their value to others). Short-day events (e.g., 3-4 hour gatherings) and full events, with no limitations on coverage area as long as the Client covers any additional expenses such as transportation. All Services are subject to availability, and prices may vary based on factors like the number of guests, event date, location, and customizations. Detailed descriptions, photos, and prices for our packages will be displayed on our website or provided during consultations.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Booking Process</strong>
                      </p>
                      <p>
                        To book an event with Ramil’s Creation, Clients must follow these steps: Initial Contact: Contact us via phone, Facebook Messenger, or in-person visit to our store. We are available Monday to Sunday, from 8:00 AM to 7:00 PM, including holidays. Information Required: Provide details such as the event type, date, time, location, number of guests, preferred services, and your contact information (e.g., phone number, email, or social media). Advance Booking: We recommend booking at least 1 to 2 months in advance, though urgent bookings may be accepted depending on availability (e.g., for catering). Confirmation: After discussing your preferences and receiving a proposal, you must pay a 50% down payment to confirm the booking. Bookings are typically set by our team to avoid conflicts, but you may request changes. Capacity: We can accommodate up to 3-4 customers for appointments and up to 3 events per day, with meetings lasting 2-4 hours. We use a calendar system to track bookings and may send reminders for deadlines. In the event of scheduling conflicts or double bookings, we will notify you immediately and work to resolve the issue.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Payment Terms</strong>
                      </p>
                      <p>
                        Down Payment: A 50% down payment of the total package price is required at the time of booking to secure your reservation. This can be paid via cash, bank transfer, or online methods such as GCash. The down payment is non-refundable in case of cancellation but may be converted to another service or package. Full Payment: The remaining balance must be paid at least three weeks before the event date. Payment Methods: We accept payments via phone, in-store, or online platforms like GCash. All prices are in Philippine Pesos (₱) and are subject to change without notice. Additional Expenses: Clients are responsible for any extra costs, such as transportation for events outside our standard coverage area. By making a payment, you confirm that you are authorized to use the payment method and that all information provided is accurate.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Cancellations, Changes, and Rescheduling</strong>
                      </p>
                      <p>
                        Cancellations: We allow cancellations, but the 50% down payment is non-refundable. If cancelled, the down payment may be applied toward another service or package at our discretion. Changes and Rescheduling: Last-minute changes or requests will be accommodated as much as possible, depending on our capacity and team availability. For rescheduling due to issues like bad weather, we may offer alternatives (e.g., moving an outdoor event indoors). However, any changes must be communicated promptly via phone, Facebook Messenger, or email, and additional fees may apply. No Guarantees: We are not liable for events affected by unforeseen circumstances, such as weather, but we will make reasonable efforts to resolve issues.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Communication and Customer Information</strong>
                      </p>
                      <p>
                        We communicate with Clients primarily through phone calls, Facebook Messenger, and text messages. You agree to provide accurate contact details and event preferences during booking. We store this information in our records to ensure smooth organization and will only use it for purposes related to your booking (e.g., updates, reminders, or feedback). Your privacy is important to us. We handle customer information securely and in compliance with applicable data protection laws. We do not share your details with third parties without your consent, except as required for service delivery (e.g., coordinating with our team for catering or lighting).
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Liability and Disclaimers</strong>
                      </p>
                      <p>
                        Ramil’s Creation strives to provide high-quality services, but we are not liable for: Any losses or damages arising from scheduling conflicts, double bookings, or missed communications, though we take steps to minimize these risks. Changes in circumstances beyond our control, such as supplier issues or force majeure events. Personal injuries or property damage during events, unless directly caused by our negligence. Our Services are provided on an &ldquo;as-is&rdquo; basis, and we make no warranties regarding their suitability for your specific needs. Clients are responsible for reviewing and confirming all event details.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Feedback and Complaints</strong>
                      </p>
                      <p>
                        We value your feedback to improve our services. After an event, we may request reviews via phone or social media. If you have a complaint, please contact us immediately, and we will address it promptly by listening to your concerns and offering solutions.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>General Terms</strong>
                      </p>
                      <p>
                        Governing Law: These Terms are governed by the laws of the Republic of the Philippines. Any disputes will be resolved in the appropriate courts. Entire Agreement: These Terms constitute the full agreement between you and Ramil’s Creation and supersede any prior understandings. Severability: If any provision is found invalid, the remaining provisions will remain in effect. By booking with Ramil’s Creation, you confirm your acceptance of these Terms. Thank you for choosing us for your event needs! Ramil’s Creation, Geegee Mall Robinson, Ozamiz City, Philippines
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="border-t px-6 py-4 sm:items-center">
          {!hasReadToBottom && (
            <span className="text-muted-foreground grow text-xs max-sm:text-center">
              Read all terms before accepting.
            </span>
          )}
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
