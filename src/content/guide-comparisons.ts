import type { Guide } from './guides';
export const comparisons: Guide[] = [
  {
    slug: 'fluid-pay-vs-stripe', kind: 'comparison', topic: 'payments', title: 'KCG / Fluid Pay vs Stripe: what to compare',
    description: 'Compare the KCG Fluid Pay plan with Stripe’s public pricing, integration scope and recurring-billing migration requirements.',
    answer: 'Compare KCG’s Fluid Pay proposal and Stripe using your actual payment channels and billing requirements. KCG’s Fluid Pay plan is $30/month with no contract. Stripe publishes standard US online domestic-card pricing of 2.9% plus 30¢. These are different pricing components, so neither figure alone establishes your complete cost or the better fit.',
    sources: ['stripe', 'migration'],
    table: { headings: ['Decision', 'KCG / Fluid Pay', 'Stripe'], rows: [
      ['Public starting point', '$30/month Fluid Pay plan, no contract. Request full processing terms.', 'Standard online domestic cards: 2.9% + 30¢ per successful transaction. See current pricing.'],
      ['Recurring billing', 'Ask for a demo and written support for your schedules and migration.', 'Review separate Billing pricing and your existing subscription configuration.'],
      ['Leaving the current system', 'Receiving-provider transfer eligibility must be confirmed.', 'Secure card export is documented; Link credentials and subscription objects are excluded.'],
    ] },
    sections: [
      { heading: 'Compare the complete proposal', body: 'Stripe’s standard Payments pricing is pay-as-you-go, while other products and payment methods have their own pricing. Ask KCG to identify processing, gateway, equipment, and optional software charges. Use the same transaction mix and billing workflow in both proposals without assuming the monthly gateway price replaces transaction costs.', sources: ['stripe'] },
      { heading: 'Make migration a separate decision', body: 'Stripe documents secure card-data exports, but not subscription objects or payment history within that transfer. Ask the receiving provider to confirm support and map recurring schedules before moving. If your current integration meets your needs, compare the expected benefit with the implementation and operating work a change would require.', sources: ['migration'] },
    ],
    faq: [{ question: 'Is Fluid Pay always cheaper?', answer: 'No such claim is made. Compare all applicable charges using your actual workflow and written proposals.' }, { question: 'Can I compare $30/month directly with a transaction rate?', answer: 'Not as an all-in cost comparison. They describe different pricing components, so you need the full terms for each option.' }],
    related: ['switch-from-stripe', 'stripe-recurring-alternatives', 'no-contract-processing'],
  },
  {
    slug: 'fluid-pay-vs-square', kind: 'comparison', topic: 'payments', title: 'KCG / Fluid Pay vs Square: compare the workflow',
    description: 'Compare Square’s published plans with a KCG Fluid Pay proposal across software, hardware, payments and recurring costs.',
    answer: 'Compare Square and a KCG Fluid Pay proposal by listing the checkout, software, hardware, and billing workflow you need. Square’s public pricing includes Free, Plus, and Premium plans, with processing charges varying by plan and channel. KCG’s Fluid Pay plan is $30/month with no contract; ask for its complete processing and integration proposal.',
    sources: ['square'],
    table: { headings: ['Decision', 'KCG / Fluid Pay', 'Square'], rows: [
      ['Monthly plan', 'Owner-confirmed Fluid Pay plan: $30/month with no contract.', 'Square Free has no monthly subscription cost; paid plans also available.'],
      ['Processing', 'Request the full applicable charges in writing.', 'Published charges vary by plan and payment channel.'],
      ['Operational fit', 'Verify proposed hardware, integrations, and recurring workflow.', 'Check the features and per-location terms of the selected plan.'],
    ] },
    sections: [
      { heading: 'Start with the tools you use every day', body: 'Square’s pricing page separates plan features and payment channels and states that Plus and Premium monthly fees apply per location. Inventory the registers, appointment tools, invoices, and staff workflows you need before comparing a replacement. Ask for a live demonstration of each required task.', sources: ['square'] },
      { heading: 'Avoid an incomplete price comparison', body: 'A plan without a monthly subscription can still carry processing charges, and a gateway subscription does not establish the full cost of acceptance. Ask both providers to identify all relevant components. Include implementation, equipment, support, and cancellation responsibilities as questions in your comparison.' },
    ],
    faq: [{ question: 'Does Square Free mean free processing?', answer: 'No. Square’s pricing page says there are no monthly subscription costs on Free, but processing fees apply when payments are taken.' }, { question: 'Should I replace working hardware first?', answer: 'Confirm compatibility and the proposed workflow before deciding. This guide does not claim existing Square hardware can be reused with Fluid Pay.' }],
    related: ['payment-processing', 'no-contract-processing', 'recurring-billing-checklist'],
  },
  {
    slug: 'fluid-pay-vs-clover', kind: 'comparison', topic: 'payments', title: 'KCG / Fluid Pay vs Clover: separate hardware from processing',
    description: 'Review Clover’s public pricing and hardware subscription terms alongside a complete KCG Fluid Pay proposal.',
    answer: 'Compare Clover and a KCG Fluid Pay proposal by separating hardware, software, and payment processing. Clover’s public pricing organizes packages by business type and distinguishes equipment subscriptions from processing charges. KCG’s Fluid Pay plan is $30/month with no contract. That statement does not establish terms for separate hardware or other agreements.',
    sources: ['clover'],
    table: { headings: ['Decision', 'KCG / Fluid Pay', 'Clover'], rows: [
      ['Published plan scope', '$30/month no-contract Fluid Pay plan; request complete terms.', 'Business-type packages with software and processing components.'],
      ['Equipment', 'Confirm proposed hardware and any separate terms.', 'Review purchase versus subscription and the applicable agreement.'],
      ['Provider change', 'Confirm supported devices before planning reuse.', 'Clover’s pricing FAQ says its POS devices cannot be used with other payment processors.'],
    ] },
    sections: [
      { heading: 'Read the equipment terms separately', body: 'Clover’s pricing FAQ says equipment subscriptions are non-cancelable and describes buyout, upgrade, and end-of-term options. This applies to the subscription described there, not a claim that every Clover purchase has the same terms. Review the exact agreement and seller before deciding.', sources: ['clover'] },
      { heading: 'Verify compatibility before switching', body: 'The same FAQ states that Clover POS devices cannot be used with other payment processors. Ask KCG to identify the hardware proposed for your setup instead of assuming an existing device can be moved. Include any equipment replacement and staff training in the decision.', sources: ['clover'] },
    ],
    faq: [{ question: 'Does every Clover arrangement use the same contract?', answer: 'Do not assume that. Review the purchase or subscription terms and the actual provider agreement for your selected package.' }, { question: 'Does the Fluid Pay no-contract plan cover new equipment?', answer: 'This guide does not make that claim. Ask for the separate equipment terms, if any, in the complete proposal.' }],
    related: ['no-contract-processing', 'payment-processing', 'fluid-pay-vs-square'],
  },
  {
    slug: 'stripe-recurring-alternatives', kind: 'comparison', topic: 'payments', title: 'Stripe alternatives for recurring billing: a buyer’s checklist',
    description: 'Evaluate recurring-billing alternatives using lifecycle tests, migration limits and current Stripe, Square and Clover pricing sources.',
    answer: 'Evaluate a Stripe recurring-billing alternative by testing subscriptions, failed payments, changes, cancellation, reporting, and portability before comparing cost. Ask KCG to demonstrate the proposed Fluid Pay workflow. Square and Clover publish their own plans, but a pricing page alone does not prove feature parity or a seamless migration from your current setup.',
    sources: ['stripe', 'square', 'clover', 'migration'],
    table: { headings: ['Option', 'Public pricing reference', 'What to verify'], rows: [
      ['KCG / Fluid Pay', '$30/month Fluid Pay plan with no contract; full proposal required.', 'Receiving-provider eligibility, scheduling, retries, reporting, and total costs.'],
      ['Keep Stripe', 'Stripe Payments and separate Billing pricing.', 'Current feature fit, product charges, and improvement options.'],
      ['Evaluate Square', 'Square Free, Plus, and Premium pricing.', 'Required recurring workflow and import support for this account.'],
      ['Evaluate Clover', 'Clover business-type packages.', 'The specific app, billing workflow, hardware, and agreement.'],
    ] },
    sections: [
      { heading: 'Use a lifecycle demonstration', body: 'Bring scenarios for a trial converting, a declined renewal, a plan change, a refund, and cancellation. Ask every vendor to show the staff actions and resulting accounting records. Do not infer that a general invoicing or card-on-file feature supports every subscription requirement.' },
      { heading: 'Keep portability and price separate', body: 'Stripe excludes Link credentials from its secure export and does not include subscriptions or payment history in that transfer. Build the migration inventory before estimating the work. Then compare the complete written proposal against the relevant public pricing pages, including optional products.', sources: ['migration', 'stripe', 'square', 'clover'] },
    ],
    faq: [{ question: 'Which alternative is best?', answer: 'The best fit depends on the workflow, verified feature support, migration constraints, and full proposal. This guide does not rank providers without that information.' }, { question: 'Should I close Stripe immediately after a transfer?', answer: 'Plan access to historical records and outstanding work first. Stripe says data remains accessible after processing stops if the account is not closed or deleted.' }],
    related: ['switch-from-stripe', 'recurring-billing-checklist', 'fluid-pay-vs-stripe'],
  },
];
