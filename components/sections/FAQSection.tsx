'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How can I book a bus ticket with Vijitha Travels?",
      answer: "You can book tickets online through our website, mobile app, or visit any of our booking counters. Online booking is available 24/7 and offers instant confirmation."
    },
    {
      question: "What is your cancellation and refund policy?",
      answer: "Cancellations made 24 hours before departure receive a full refund minus processing fee. Cancellations within 24 hours are subject to a 25% deduction. No refunds for no-shows."
    },
    {
      question: "Are your buses air-conditioned?",
      answer: "Yes, all our buses are equipped with modern air conditioning systems. We also have luxury buses with individual climate controls for premium comfort."
    },
    {
      question: "What safety measures do you have in place?",
      answer: "We maintain strict safety protocols including regular vehicle maintenance, GPS tracking, trained drivers, first aid kits, and 24/7 monitoring of all trips."
    },
    {
      question: "Can I choose my seat when booking?",
      answer: "Yes, our online booking system allows you to select your preferred seat from available options. Premium seats are available at a small additional cost."
    },
    {
      question: "Do you provide meals during long journeys?",
      answer: "On routes longer than 6 hours, we provide complimentary snacks and refreshments. Meal stops are scheduled for journeys over 8 hours."
    },
    {
      question: "What if my bus is delayed or cancelled?",
      answer: "In case of delays, we notify passengers via SMS/email. For cancellations, we arrange alternative transport or provide full refunds. Compensation may apply for significant delays."
    },
    {
      question: "Is there WiFi available on buses?",
      answer: "Yes, most of our buses offer complimentary WiFi. Entertainment systems with movies, music, and games are available on luxury routes."
    }
  ];

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-accent mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our services, booking process, 
            and travel policies.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="mb-4 bg-sidebar rounded-lg shadow-sm overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-gray-800 pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <button className="bg-primary  text-white px-8 py-3 rounded-full font-semibold transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;