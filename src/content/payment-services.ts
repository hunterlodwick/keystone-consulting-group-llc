export const providerChecklist = [
  'Will my POS, terminals, invoices, and online checkout all show the card price and the cash price before payment?',
  'Is the card total built from displayed prices, or is a fee added at checkout?',
  'How are debit and prepaid cards handled, given Visa’s ban on surcharging them?',
  'Which fixed fees remain each month and each year, and what equipment costs are separate?',
  'What are the contract length, cancellation terms, and equipment-return terms?',
  'Who checks signs, menus, receipts, and checkout wording against the law in each state where I sell?',
];
/** Payments Hub fixed fees that still apply on the Edge Program. */
export const edgeFixedFees = ['$79 annual service fee', '$20/month PCI compliance', '$10/month basic service'];
export const paymentServices = {
  'edge-program': {
    title: 'The Edge Program: 5% dual pricing with $0 processing fees',
    description: 'KCG’s Edge Program: 5% dual pricing on Payments Hub. $0 processing volume fees; $79/yr, $20/mo PCI and $10/mo service fees remain. No contract.',
    answer: 'The Edge Program is KCG’s dual pricing on Payments Hub. Every price shows a card price and a cash price, with the card price 5% above the cash price, and you pay $0 in processing volume fees. Payments Hub’s fixed fees still apply: $79 per year, $20/month PCI compliance, and $10/month basic service. No contract.',
    faq: [
      { question: 'What do I still pay on the Edge Program?', answer: 'No processing volume fees. The fixed Payments Hub fees remain: a $79 annual service fee, $20 per month for PCI compliance, and $10 per month for basic service. Equipment terms are quoted separately.' },
      { question: 'How do customers see the prices?', answer: 'Each item shows a card price and a lower cash price before payment; the card price is 5% above the cash price. Visa’s rules for a cash discount require the card price alone or both prices side by side, with the card total built from those displayed prices rather than a fee added at checkout.' },
      { question: 'Is dual pricing the same as a surcharge?', answer: 'No. A surcharge is a fee added for paying by card. With dual pricing, both prices are shown up front and the cash price is the discount. Connecticut, Massachusetts, and Maine prohibit card surcharges but allow cash discounts; the state guides cite each statute.' },
      { question: 'Is there a contract?', answer: 'No. The Edge Program has no processing contract.' },
      { question: 'Can businesses outside Utah sign up?', answer: 'Yes. KCG works with merchants nationwide. Start with a free statement audit of your current processing costs.' },
    ],
  },
  'payment-processing': {
    title: 'Low-rate payment processing',
    description: 'KCG offers interchange-plus at wholesale or the Edge Program (5% dual pricing, $0 processing volume fees), no contracts. Start with a free statement audit.',
    answer: 'KCG offers two ways to lower card processing costs: interchange-plus at wholesale, where you keep one price and pay interchange plus a disclosed markup, or the Edge Program, 5% dual pricing on Payments Hub with $0 processing volume fees. Neither requires a contract. A free statement audit compares your current costs with each option.',
    faq: [
      { question: 'Should I choose interchange-plus or the Edge Program?', answer: 'Interchange-plus keeps a single price for every customer, and you pay the processing cost. The Edge Program shows a card price 5% above the cash price; you pay $0 in processing volume fees plus Payments Hub’s fixed fees ($79 per year, $20 per month PCI compliance, $10 per month basic service). The statement audit compares both against your current costs.' },
      { question: 'Can I sign up for Fluid Pay directly?', answer: 'No. Fluid Pay is partner-only, so merchants apply through a partner such as KCG. KCG’s Fluid Pay plan is $30/month with no contract; processing terms are quoted separately.' },
      { question: 'Is next-day funding available?', answer: 'Yes, through KCG. Eligibility, cutoff times, and bank timing are confirmed when the account is set up.' },
      { question: 'Can I offer customer financing?', answer: 'Yes. Flexxbuy lets customers pay over time. Funding timing, merchant fees, and customer approval follow the financing provider’s terms.' },
    ],
  },
};
export type PaymentServiceId = keyof typeof paymentServices;
