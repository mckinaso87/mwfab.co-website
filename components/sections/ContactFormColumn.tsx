"use client";

import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "./ContactForm";

export function ContactFormColumn() {
  return (
    <Reveal y={20} delay={0.1}>
      <ContactForm />
    </Reveal>
  );
}
