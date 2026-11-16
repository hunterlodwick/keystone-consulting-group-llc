export const providerChecklist = [
  'Will my POS and terminals support the proposed setup across every sales channel?',
  'How will the card price and cash price appear before payment?',
  'How are debit and prepaid cards handled without a prohibited surcharge?',
  'Which monthly, gateway, equipment, and software fees remain?',
  'What are the contract, cancellation, and equipment-return terms?',
  'Who reviews signage, menus, checkout screens, and receipts for compliance?',
];
export const paymentServices = {
  'edge-program': {
    title: 'The Edge Program: zero-fee processing with dual pricing',
    answer: 'KCG’s Edge Program is a cash discount or dual-pricing option with $0 processing volume fees for the merchant and no contracts. Customers see a card price and a lower cash price. KCG serves merchants nationwide and offers a free statement audit to review the costs and payment setup for your business.',
    faq: [
      { question: 'What does zero-fee processing cover?', answer: 'The Edge Program eliminates processing volume fees for the merchant. Ask for a written proposal identifying any remaining gateway, equipment, software, or other charges. Zero-fee does not mean every payment-related expense disappears.' },
      { question: 'Is the Edge Program a cash discount or a surcharge?', answer: 'A genuine cash discount reduces the displayed card price; dual pricing shows cash and card prices before payment. Adding a fee to a posted price may be a surcharge. Review the actual checkout rather than relying on a program name.' },
      { question: 'Can debit cards be surcharged?', answer: 'Visa prohibits surcharging debit and prepaid cards, even when debit is run as credit. Have the acquirer review debit handling separately from the cash discount and credit-card setup.' },
      { question: 'Does KCG require a processing contract?', answer: 'KCG offers the Edge Program with no contracts. Confirm the complete written proposal and any separate equipment or optional-service terms before switching.' },
      { question: 'Can businesses outside Utah request an audit?', answer: 'Yes. KCG serves merchants nationwide and offers a free statement audit. Bring your locations, payment channels, and current statement so the proposed setup can be reviewed.' },
    ],
  },
  'payment-processing': {
    title: 'Low-rate payment processing',
    answer: 'KCG offers low-rate payment processing through interchange-plus at wholesale or the zero-fee Edge Program, with no contracts and nationwide service. Start with a free statement audit to compare your costs. Discuss the $30/month Fluid Pay plan, next-day funding availability, and Flexxbuy consumer financing alongside your checkout and billing needs.',
    faq: [
      { question: 'Which processing options does KCG offer?', answer: 'KCG offers interchange-plus at wholesale and the Edge Program with $0 processing volume fees for the merchant. A free statement audit helps compare the proposal with your current payment costs.' },
      { question: 'Can I sign up for Fluid Pay directly?', answer: 'Fluid Pay is partner-only. Merchants get the Fluid Pay plan by applying through KCG. The plan is $30/month with no contract; request full processing and optional-service terms separately.' },
      { question: 'Is next-day funding available?', answer: 'Next-day funding is available through KCG. Confirm account eligibility, cutoff times, bank timing, and any conditions before planning around a deposit date.' },
      { question: 'Can I offer customer financing?', answer: 'Flexxbuy is an option for buy-now-pay-later and customer financing. Discuss your industry, checkout flow, merchant costs, and funding conditions. Customer approval is not guaranteed.' },
    ],
  },
};
export type PaymentServiceId = keyof typeof paymentServices;
