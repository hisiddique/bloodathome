import { useState } from "react";
import { Head } from "@inertiajs/react";
import { Menu } from "lucide-react";
import { PublicSidebar } from "@/components/public-sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "How do I know the phlebotomist on your website is legally registered?",
    answer:
      "We verify each phlebotomist's CQC registration before approving them on our platform.",
  },
  {
    question: "Do all phlebotomists need to be registered with the CQC?",
    answer:
      "Yes. Anyone performing independent diagnostic or screening procedures — including mobile and private phlebotomists — must legally be registered with the CQC.",
  },
  {
    question: "What checks do you perform before listing a phlebotomist?",
    answer:
      "We confirm their CQC registration, validate their professional details, and ensure they comply with current legal requirements.",
  },
  {
    question: "Why is CQC registration important?",
    answer:
      "CQC registration ensures the phlebotomist meets safety, quality, and regulatory standards for diagnostic and screening services.",
  },
  {
    question: "What happens if a phlebotomist is not CQC-registered?",
    answer:
      "They cannot be listed on our website or provide independent diagnostic/screening services legally.",
  },
  {
    question: "Can I check the CQC registration myself?",
    answer:
      "Yes. You can search for any provider on the official CQC website using their name or registration number.",
  },
  {
    question: "Do you list NHS phlebotomists who also work privately?",
    answer:
      "Yes — but only if they are individually registered with the CQC for private diagnostic/screening procedures.",
  },
  {
    question:
      "Are mobile home-visit phlebotomists also required to be CQC-registered?",
    answer:
      "Yes. CQC registration is required even for mobile and home-visit phlebotomists.",
  },
  {
    question:
      "Are finger-prick blood test providers also required to register with CQC?",
    answer:
      "Yes. Even finger-prick blood draw services fall under the same regulated activity.",
  },
  {
    question: "Do you monitor ongoing compliance?",
    answer:
      "Yes. We periodically re-check CQC registration status to ensure continued compliance.",
  },
];

export default function FAQ() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Head title="FAQ - CQC Registration & Phlebotomists" />

      <div className="min-h-screen bg-background pb-8">
        <PublicSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        <header className="flex items-center gap-4 py-4 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground flex-1 text-center pr-8">
            FAQ
          </h1>
        </header>

        <div className="px-6 py-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-primary mb-2">
              CQC Registration & Phlebotomists
            </h2>
            <p className="text-muted-foreground text-sm">
              Common questions about our verification process and legal requirements.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-4"
              >
                <AccordionTrigger className="text-left text-foreground font-medium py-4 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </>
  );
}
