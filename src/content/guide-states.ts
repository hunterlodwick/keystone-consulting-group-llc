import type { Guide } from './guides';
import type { SourceId } from './guide-sources';
type StateDetail = { name: string; slug: string; summary: string; answer: string; sources: SourceId[]; sections: Guide['sections']; faq: Guide['faq'] };
export const stateDetails: StateDetail[] = [
  {
    name: 'California', slug: 'california', summary: 'SB 478 distinguishes unavoidable fees from optional card fees; credit-only payment makes the fee mandatory.',
    answer: 'California’s SB 478 generally requires advertised consumer prices to include mandatory fees. The Attorney General says an avoidable credit-card fee generally is not mandatory, but a fee is mandatory when a business only accepts credit cards. Dual pricing and surcharging still need separate review under applicable laws and card-network rules.',
    sources: ['ca', 'visa'],
    sections: [
      { heading: 'The payment options change the advertised-price analysis', body: 'SB 478 took effect July 1, 2024. California’s DOJ FAQ says a card processing fee generally is not mandatory when the customer can avoid it by paying another way, such as cash. If credit cards are the only accepted payment method, the fee must be included in the advertised price. Do not describe SB 478 as a blanket ban on all surcharges.', sources: ['ca'] },
      { heading: 'Check scope and the food-service exception', body: 'The FAQ addresses most goods and services for personal use and identifies exclusions, including commercial-use transactions. SB 1524 provides a specific exception for certain food and beverage sellers when mandatory fees are conspicuously displayed wherever prices appear. A restaurant should review that exception directly rather than applying a general retail checklist.', sources: ['ca'] },
      { heading: 'Review the complete checkout', body: 'Ask counsel to review the applicable pricing laws and proposed payment options. Separately ask the acquirer to review network restrictions, debit exclusions, disclosures, and rate limits. Test product pages, menus, invoices, and receipts against the approved approach. An optional payment fee is not automatic permission to ignore other requirements.', sources: ['visa', 'ca'] },
    ],
    faq: [{ question: 'Does SB 478 prohibit every credit-card fee?', answer: 'No. The DOJ FAQ distinguishes fees that customers can avoid with another payment method from mandatory fees when only credit cards are accepted.' }, { question: 'Can I disclose a mandatory fee only at checkout?', answer: 'For transactions covered by the general rule, the advertised price must include mandatory fees. Review any specific statutory exception separately.' }],
  },
  {
    name: 'Connecticut', slug: 'connecticut', summary: 'DCP prohibits payment-method surcharges while describing genuine cash discounts and dual posted prices.',
    answer: 'Connecticut prohibits businesses from adding a surcharge for one payment method over another, while allowing genuine cash discounts. Its consumer agency identifies posting both cash and card prices as a compliant approach. An added transaction fee or non-cash adjustment can still be a prohibited surcharge. Review the actual prices and receipts before launch.',
    sources: ['ct', 'ctLaw', 'visa'],
    sections: [
      { heading: 'A different name does not change an added fee', body: 'Connecticut DCP cites §42-133ff and its amendment by Public Act 24-142. It explains that adding a processing fee, transaction fee, or non-cash adjustment to the listed price is a surcharge. Start the review with the displayed price, not the terminal vendor’s program label.', sources: ['ct', 'ctLaw'] },
      { heading: 'Build the discount into the price presentation', body: 'DCP describes a disclosed discount from listed prices or showing both cash and credit prices as ways to comply. Review how the regular price appears on shelves, menus, estimates, and web pages. Ask the provider to demonstrate that a card-paying customer is not surprised by an added fee.', sources: ['ct'] },
      { heading: 'Do not borrow government exceptions', body: 'DCP identifies exceptions for municipalities, government agencies, courts, and certain tax collection. A private merchant should not assume those exceptions apply to its sales. Ask for review of any industry-specific situation before using a fee-based configuration.', sources: ['ct'] },
    ],
    faq: [{ question: 'Can I call the surcharge a non-cash adjustment?', answer: 'DCP specifically says that label can describe a surcharge when the fee is added to the listed price.' }, { question: 'Does Connecticut recognize dual pricing?', answer: 'DCP says displaying both a cash price and a credit-card price is one way a business can comply. The actual implementation still needs review.' }],
  },
  {
    name: 'Massachusetts', slug: 'massachusetts', summary: 'Chapter 140D §28A prohibits seller credit-card surcharges and addresses disclosed cash discounts.',
    answer: 'Massachusetts General Laws chapter 140D, section 28A prohibits a seller from imposing a surcharge when a cardholder chooses a credit card instead of cash, check, or similar means. The statute separately addresses cash discounts. Review a proposed dual-pricing program as an actual discount arrangement, rather than assuming its label avoids the prohibition.',
    sources: ['ma', 'visa'],
    sections: [
      { heading: 'Start with the statutory prohibition', body: 'Section 28A(a)(2) states the seller surcharge prohibition. Do not rely on a national provider’s general statement that surcharging is available. Ask the provider to explain how its proposed Massachusetts configuration reflects the statute before considering activation.', sources: ['ma'] },
      { heading: 'Review the regular price and discount disclosure', body: 'The statute protects offering a cash or similar discount and addresses discounts offered to all prospective buyers with clear and conspicuous disclosure. Have counsel review the regular price and the exact signs and checkout wording. Do not convert a hidden fee into a claimed discount by changing its name.', sources: ['ma'] },
      { heading: 'Use a transaction acceptance checklist', body: 'Review a card purchase at the posted price, a qualifying discounted payment, a refund, and an online transaction. Ask for consistent treatment across menus, invoices, and terminal screens. Keep the legal review and acquirer approval with the configuration record.' },
    ],
    faq: [{ question: 'Can I simply enable a credit-card surcharge in Massachusetts?', answer: 'The cited statute prohibits a seller from imposing that surcharge. Obtain legal review of your specific circumstances and proposed pricing.' }, { question: 'What does the statute say about discounts?', answer: 'It separately addresses discounts for cash, check, or similar means and calls for clear, conspicuous disclosure and availability to all prospective buyers for the stated treatment.' }],
  },
  {
    name: 'Maine', slug: 'maine', summary: 'Title 9-A §8-509 prohibits seller credit/debit surcharges and excludes reductions from the regular price.',
    answer: 'Maine’s Title 9-A, section 8-509 prohibits seller surcharges for credit or debit cards and defines a discount from the regular price as outside that surcharge definition. The statute includes a specific governmental-entity exception. Private businesses should review displayed prices and payment logic rather than treating that exception as general permission.',
    sources: ['me', 'visa'],
    sections: [
      { heading: 'Both credit and debit are named in the statute', body: 'Maine defines a surcharge as increasing the regular price for a cardholder when the same increase is not imposed on someone paying cash, check, or similar means. The prohibition explicitly names both credit and debit. Review what your regular price is and when a customer learns it.', sources: ['me'] },
      { heading: 'A reduction is different from an added charge', body: 'The statute says a discount or reduction from the regular price is not a surcharge. Ask counsel to review the proposed prices and disclosures, then ask the acquirer to validate the terminal configuration. Make the shelf, menu, invoice, and website presentation part of that review.', sources: ['me'] },
      { heading: 'Keep the government exception in its own context', body: 'Section 8-509 allows governmental entities to impose certain disclosed, cost-limited card fees for specified payments. That statutory exception is not a general permission for a private shop or service business, and network requirements remain a separate consideration.', sources: ['me'] },
    ],
    faq: [{ question: 'Does Maine’s prohibition include debit cards?', answer: 'Yes. Section 8-509 expressly names credit cards and debit cards.' }, { question: 'Is a real discount treated as a surcharge?', answer: 'The statute says a discount or reduction from the regular price is not a surcharge. Review whether the proposed implementation actually meets that description.' }],
  },
  {
    name: 'Colorado', slug: 'colorado', summary: 'Enacted SB21-091 sets a 2% or actual merchant-discount-fee framework with disclosures and payment exclusions.',
    answer: 'Colorado’s enacted SB21-091 permits a credit-card surcharge within a framework of 2% of the transaction or the actual merchant discount fee. It requires notice and excludes debit, cash, check, and gift-card payments. Card-network limits still apply. Have the acquirer document the permitted calculation and presentation for your proposed setup.',
    sources: ['co', 'visa'],
    sections: [
      { heading: 'Do not flatten the rule into one universal cap', body: 'The enacted summary describes a limit of 2% of the transaction or the merchant discount fee, defined as the actual fee paid to process it. It does not support describing Colorado as an unconditional permission to pass through any amount. Ask for review of the chosen calculation and supporting records.', sources: ['co'] },
      { heading: 'Include the notice and exclusions', body: 'The act requires notice on the premises or, for online purchases, before the transaction is completed. It excludes debit cards, gift-card redemption, cash, and checks. Include these payment types in the provider’s configuration review and request sample receipts.', sources: ['co'] },
      { heading: 'Apply the network rule too', body: 'Visa limits its surcharge to the lower of the applicable merchant discount rate or 3%. A state-law framework does not remove that network requirement. Confirm the final approved rate and disclosures for the card brands and channels you accept.', sources: ['visa'] },
    ],
    faq: [{ question: 'Does Colorado permit debit surcharges?', answer: 'No. The enacted summary expressly excludes debit-card payments.' }, { question: 'Is actual cost the only rule to consider?', answer: 'No. Review Colorado’s calculation framework, required disclosures, excluded payment types, and the separate network restrictions.' }],
  },
  {
    name: 'New York', slug: 'new-york', summary: 'GBL §518 requires the complete credit-card price to be posted and limits the surcharge to acceptance cost.',
    answer: 'New York requires a seller imposing a credit-card surcharge to clearly post the total credit-card price, including that surcharge. The fee cannot exceed the business’s applicable acceptance cost under section 518. Posting cash and card totals together is permitted. A sign saying only that a percentage will be added is insufficient.',
    sources: ['ny', 'nyGuide', 'visa'],
    sections: [
      { heading: 'Show the total, not just the formula', body: 'General Business Law §518 requires a clearly and conspicuously posted credit-card total. The state’s implementation guidance, effective February 11, 2024, contrasts permissible total-price displays with a percentage-only fee notice. Review menus, labels, estimates, and web prices, not only a sign beside the terminal.', sources: ['ny', 'nyGuide'] },
      { heading: 'Use dual prices as complete prices', body: 'The statute explicitly allows the credit price, inclusive of any surcharge, next to the cash price. Ask your provider to show a customer-facing total before payment and a matching receipt. A dual-price display is not a reason to skip the statutory cost limit or network restrictions.', sources: ['ny', 'visa'] },
      { heading: 'Keep the amount within the applicable limit', body: 'Section 518 limits the surcharge by the amount charged to the business for the card use. Have the acquirer document the calculation and any lower network restriction. Review how the approved configuration handles debit, discounts, and refunds before rollout.', sources: ['ny', 'visa'] },
    ],
    faq: [{ question: 'Is a percentage-only sign enough?', answer: 'No. New York’s guidance requires the complete credit-card price, not only notice of an added percentage.' }, { question: 'Can I display cash and card prices together?', answer: 'Yes. Section 518 expressly permits two prices when the credit-card price includes the surcharge.' }],
  },
  {
    name: 'New Jersey', slug: 'new-jersey', summary: 'Actual-cost cap plus specific entry, checkout, restaurant-menu, online, and telephone disclosures.',
    answer: 'New Jersey limits a credit-card surcharge to the seller’s actual processing cost and requires disclosure before the customer incurs a charge. Its guidance specifies different disclosure locations for stores, restaurants, websites, and telephone sales. A percentage can be disclosed, but a vague notice that a fee applies is not enough.',
    sources: ['nj', 'visa'],
    sections: [
      { heading: 'Tie the fee to actual processing cost', body: 'The Division of Consumer Affairs explains P.L. 2023, c.146, codified at N.J.S.A. 56:8-156.1 and -156.2. A flat rate is possible only if it does not exceed the actual cost of processing the transaction. Request the cost evidence and an approved calculation from your acquirer.', sources: ['nj'] },
      { heading: 'Put the amount where the customer decides', body: 'The FAQ calls for entry and point-of-sale signs for sellers other than restaurants. Restaurants need disclosure in the customer service area and on menus, including online and QR-code menus. Online checkout needs conspicuous electronic notice; telephone transactions need verbal notice before processing.', sources: ['nj'] },
      { heading: 'Keep debit treatment separate', body: 'The New Jersey FAQ says this specific surcharge cap addresses credit cards, not debit or gift cards. That does not authorize a network-prohibited debit surcharge. Visa’s debit and prepaid restrictions still need to be enforced by the payment setup.', sources: ['nj', 'visa'] },
    ],
    faq: [{ question: 'Can I disclose a percentage in New Jersey?', answer: 'The state FAQ permits a percentage disclosure, but the amount must be clear before charges are incurred and within actual processing cost.' }, { question: 'Do restaurants need notice on digital menus?', answer: 'Yes. The FAQ includes menus posted online or accessed through QR codes.' }],
  },
];
export const stateGuides: Guide[] = stateDetails.map(s => ({
  slug: `${s.slug}-dual-pricing`, topic: 'payments', kind: 'state', legal: true,
  title: `${s.name}: dual pricing and credit-card surcharge rules`, description: s.summary,
  answer: s.answer, sections: s.sections, sources: s.sources, faq: s.faq,
  related: ['dual-pricing-laws', 'surcharge-vs-cash-discount', 'surcharge-debit-cards', 'surcharge-notice'],
}));
export const stateNames = 'Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming|District of Columbia'.split('|');
