import type { Guide } from './guides';
import type { SourceId } from './guide-sources';
type StateDetail = {
  name: string; slug: string; summary: string;
  /** Short table labels plus the primary law each rests on. */
  cashDiscount: string; surcharge: string; law: string;
  /** One-sentence explanations that open the state guide. */
  cashDetail: string; surchargeDetail: string;
  answer: string; sources: SourceId[]; sections: Guide['sections']; faq: Guide['faq'];
};
export const STATE_REVIEWED = '2026-11-16';
export const stateVerdict = (s: Pick<StateDetail, 'cashDiscount' | 'surcharge'>) => `Cash discount / dual pricing: ${s.cashDiscount}. Credit-card surcharge: ${s.surcharge}.`;
export const stateDetails: StateDetail[] = [
  {
    name: 'California', slug: 'california', summary: 'Civil Code §1748.1 allows cash discounts offered to all buyers; its surcharge ban is limited by a 2018 ruling, and SB 478 governs advertised prices.',
    cashDiscount: 'allowed', surcharge: 'restricted', law: 'Cal. Civ. Code §1748.1; SB 478',
    cashDetail: 'Civil Code §1748.1(a) lets a retailer offer a discount for paying by cash, check, or other non-credit means if the discount is offered to all prospective buyers.',
    surchargeDetail: 'The same subsection bars credit-card surcharges, but the Attorney General applies Italian Colors v. Becerra (9th Cir. 2018) to merchants similarly situated to that case’s plaintiffs.',
    answer: 'Separately, SB 478 (effective July 1, 2024) requires advertised prices to include mandatory fees: an avoidable card fee generally is not mandatory, but a business that accepts only credit cards must include it.',
    sources: ['caCivil', 'caSurcharge', 'ca', 'visa'],
    sections: [
      { heading: 'The statute allows cash discounts', body: 'Civil Code §1748.1(a) prohibits a retailer from imposing a surcharge on a consumer who pays by credit card and, in the same subsection, permits discounts for cash, check, or other means not involving a credit card when the discount is offered to all prospective buyers. The California DOJ says that in January 2018 a federal court held the surcharge ban could not be enforced against the businesses that brought Italian Colors v. Becerra, and that it will generally apply that decision to similarly situated merchants. Merchants still may not hide differences between credit, debit, and cash prices.', sources: ['caCivil', 'caSurcharge'] },
      { heading: 'SB 478 changes the advertised price', body: 'SB 478 took effect July 1, 2024. The DOJ FAQ says a card processing fee generally is not mandatory when the customer can avoid it by paying another way, such as cash. If credit cards are the only accepted payment method, the fee is mandatory and must be included in the advertised price. For a mandatory fee, listing one price and separately stating that a percentage fee will apply does not comply.', sources: ['ca'] },
      { heading: 'Check scope and the food-service exception', body: 'The DOJ FAQ says SB 478 does not apply to goods or services bought for commercial use or to certain transactions governed by other pricing laws. SB 1524 exempts mandatory fees charged by restaurants, bars, and certain other food vendors when the fee is clearly and conspicuously displayed wherever prices appear.', sources: ['ca'] },
    ],
    faq: [
      { question: 'Can I offer a cash discount in California?', answer: 'Yes. Civil Code §1748.1(a) permits a discount for cash, check, or other non-credit payment if it is offered to all prospective buyers.' },
      { question: 'Does SB 478 prohibit every credit-card fee?', answer: 'No. The DOJ FAQ distinguishes fees that customers can avoid with another payment method from mandatory fees when only credit cards are accepted.' },
    ],
  },
  {
    name: 'Connecticut', slug: 'connecticut', summary: 'C.G.S. §42-133ff prohibits payment-method surcharges; the consumer agency names a posted cash discount or dual cash and card prices as ways to comply.',
    cashDiscount: 'allowed', surcharge: 'prohibited', law: 'Conn. Gen. Stat. §42-133ff',
    cashDetail: 'The Department of Consumer Protection names a posted cash discount from listed prices, or listing both a cash price and a card price, as ways to comply.',
    surchargeDetail: 'Section 42-133ff, as amended by Public Act 24-142, prohibits a surcharge for using one payment type over another, with exceptions for municipalities, government agencies, and courts.',
    answer: 'A “processing fee”, “transaction fee”, or “non-cash adjustment” added to the listed price is a surcharge, whatever it is called.',
    sources: ['ct', 'ctLaw', 'visa'],
    sections: [
      { heading: 'A different name does not change an added fee', body: 'Connecticut DCP cites §42-133ff and its amendment by Public Act 24-142. It explains that adding a processing fee, transaction fee, or non-cash adjustment to the listed price is a surcharge. Start the review with the displayed price, not the terminal vendor’s program label.', sources: ['ct', 'ctLaw'] },
      { heading: 'Build the discount into the price presentation', body: 'DCP gives two compliant examples: a sign stating that all listed prices are discounted by a stated percentage for cash, or dual pricing that lists a cash price and a credit-card price. Check that shelves, menus, estimates, and web pages show the card price as the listed price.', sources: ['ct'] },
      { heading: 'Government exceptions do not cover private merchants', body: 'DCP identifies exceptions for municipalities, government agencies, courts, and certain tax collection. A private business cannot rely on those exceptions.', sources: ['ct'] },
    ],
    faq: [
      { question: 'Can I call the surcharge a non-cash adjustment?', answer: 'No. DCP says a fee added to the listed price is a surcharge even when it appears on the receipt as a non-cash adjustment.' },
      { question: 'Does Connecticut recognize dual pricing?', answer: 'Yes. DCP says listing a cash price and a credit-card price is one way a business can comply.' },
    ],
  },
  {
    name: 'Massachusetts', slug: 'massachusetts', summary: 'M.G.L. c.140D §28A bars seller credit-card surcharges and treats a clearly disclosed cash discount offered to all buyers as not a finance charge.',
    cashDiscount: 'allowed', surcharge: 'prohibited', law: 'M.G.L. c.140D §28A',
    cashDetail: 'Section 28A(a)(1) bars card issuers from prohibiting cash discounts, and §28A(b) says a discount from the regular price for paying by cash or check is not a finance charge if it is offered to all prospective buyers and clearly and conspicuously disclosed.',
    surchargeDetail: 'Section 28A(a)(2) says no seller may impose a surcharge on a cardholder who pays by credit card.',
    answer: 'The statute frames the cash discount as a discount from the regular price, so the card price should be the price customers see.',
    sources: ['ma', 'visa'],
    sections: [
      { heading: 'The surcharge prohibition is in the statute', body: 'Section 28A(a)(2): “No seller in any sales transaction may impose a surcharge on a cardholder who elects to use a credit card in lieu of payment by cash, check or similar means.” A national provider’s statement that surcharging is available does not change that for Massachusetts locations.', sources: ['ma'] },
      { heading: 'How the statute treats a discount', body: 'Section 28A(b) covers a discount from the regular price offered to induce payment by cash, check, or other means not involving a credit card. It is not a finance charge if offered to all prospective buyers and its availability is disclosed clearly and conspicuously. Visa’s rules separately require the card price alone, or card and cash prices side by side, to be displayed.', sources: ['ma', 'visa'] },
      { heading: 'Test every payment path', body: 'Run a card purchase at the posted price, a discounted cash payment, a refund, and an online order. Menus, invoices, terminal screens, and receipts should show the same prices.' },
    ],
    faq: [
      { question: 'Can I add a credit-card surcharge in Massachusetts?', answer: 'No. Section 28A(a)(2) prohibits a seller from imposing a surcharge on a customer who pays by credit card.' },
      { question: 'What does the statute say about discounts?', answer: 'A discount from the regular price for paying by cash, check, or similar means is not a finance charge if it is offered to all prospective buyers and clearly and conspicuously disclosed.' },
    ],
  },
  {
    name: 'Maine', slug: 'maine', summary: '9-A M.R.S. §8-509 prohibits seller surcharges on credit and debit cards and says a reduction from the regular price is not a surcharge.',
    cashDiscount: 'allowed', surcharge: 'prohibited (credit and debit)', law: '9-A M.R.S. §8-509',
    cashDetail: 'Section 8-509(1) says a discount or reduction from the regular price is not a surcharge.',
    surchargeDetail: 'The same subsection prohibits a seller from surcharging a customer who pays by credit or debit card; only governmental entities have a disclosed, cost-limited exception.',
    answer: 'A surcharge is any increase in the regular price for a cardholder that is not imposed on a customer paying by cash or check.',
    sources: ['me', 'visa'],
    sections: [
      { heading: 'Credit and debit are both covered', body: 'Maine defines a surcharge as any means of increasing the regular price to a cardholder that is not imposed on a customer paying by cash, check, or similar means. The prohibition names both credit and debit cards.', sources: ['me'] },
      { heading: 'A reduction is different from an added charge', body: 'The statute says a discount or reduction from the regular price is not a surcharge. The regular price customers see should be the card price, with the cash price shown as the reduction.', sources: ['me'] },
      { heading: 'The government exception is narrow', body: 'Section 8-509(2) lets governmental entities add a disclosed, cost-limited card fee for specified payments such as taxes, fines, and license fees. It does not apply to private businesses.', sources: ['me'] },
    ],
    faq: [
      { question: 'Does Maine’s prohibition include debit cards?', answer: 'Yes. Section 8-509 expressly names credit cards and debit cards.' },
      { question: 'Is a cash discount treated as a surcharge?', answer: 'No. The statute says a discount or reduction from the regular price is not a surcharge.' },
    ],
  },
  {
    name: 'Colorado', slug: 'colorado', summary: 'C.R.S. §5-2-212 caps credit-card surcharges at 2% or the actual merchant discount fee and treats a disclosed cash discount offered to all buyers as not a finance charge.',
    cashDiscount: 'not a finance charge if offered to all buyers and disclosed (the statute does not name dual pricing)', surcharge: 'allowed, capped at 2% or the actual merchant discount fee', law: 'C.R.S. §5-2-212',
    cashDetail: 'C.R.S. §5-2-212(2) says a discount for paying by cash, check, or other non-credit-card means is not a finance charge if it is offered to all prospective buyers and clearly and conspicuously disclosed; the statute does not use the terms “dual pricing” or “cash discount program”.',
    surchargeDetail: 'Since July 1, 2022, §5-2-212(1) allows a credit-card surcharge of up to 2% of the transaction or up to the merchant discount fee actually paid, with statutory signage, a separate receipt line, and no surcharge on cash, check, debit, or gift-card payments.',
    answer: 'Visa separately caps credit surcharges at the lower of the merchant discount rate or 3%.',
    sources: ['coLaw', 'co', 'visa'],
    sections: [
      { heading: 'Choose one of two surcharge caps', body: 'Section 5-2-212(1)(c) lets a seller charge either up to 2% of the total cost of the transaction or up to the merchant discount fee, defined as the actual fee the seller pays its processor or service provider to process the transaction. The statute prescribes different sign wording for each option.', sources: ['coLaw'] },
      { heading: 'Notice, receipts, and excluded payments', body: 'The statutory notice must be posted at the premises where customers can see it or, online, displayed before the customer completes the purchase. The receipt must show the surcharge as a separate line item, and only one surcharge is allowed per transaction. No surcharge may apply to cash, check, debit (with or without a PIN, or any payment processed as debit), or gift-card redemption. SB21-091 made these changes effective July 1, 2022.', sources: ['coLaw', 'co'] },
      { heading: 'What the statute says about cash discounts', body: 'Section 5-2-212(2), which SB21-091 left unchanged, covers a discount offered to induce payment by cash, check, or other means not involving a credit card: it is not a finance charge if offered to all prospective buyers and its availability is disclosed clearly and conspicuously under the administrator’s regulations. It does not set rules for displaying dual prices; Visa’s display rules for discount offers still apply.', sources: ['coLaw', 'visa'] },
    ],
    faq: [
      { question: 'Does Colorado permit debit surcharges?', answer: 'No. Section 5-2-212(1)(f) bars a surcharge on debit card payments, whether or not a PIN is used, and on any payment processed as debit.' },
      { question: 'Does Colorado law address dual pricing?', answer: 'Not by that name. Section 5-2-212(2) treats a cash or check discount offered to all buyers and clearly disclosed as not a finance charge. Have counsel review how your card and cash prices are displayed.' },
    ],
  },
  {
    name: 'New York', slug: 'new-york', summary: 'GBL §518 expressly permits two-tier cash and card pricing and requires the total credit-card price to be posted when a surcharge applies.',
    cashDiscount: 'allowed (two-tier pricing)', surcharge: 'allowed with the total card price posted, capped at card cost', law: 'N.Y. Gen. Bus. Law §518',
    cashDetail: 'General Business Law §518 expressly permits a “two-tier pricing system”: the credit-card price, including any surcharge, posted alongside the cash price.',
    surchargeDetail: 'A seller that surcharges must clearly and conspicuously post the total credit-card price, may not surcharge more than the card company charges the business, and may not charge more than the posted price.',
    answer: 'The current rule took effect February 11, 2024; the state says it does not apply to debit cards.',
    sources: ['ny', 'nyGuide', 'visa'],
    sections: [
      { heading: 'Post the total card price', body: 'Section 518 requires the total price for paying by credit card, including any surcharge, to be clearly and conspicuously posted, and the final price cannot exceed the posted price. Each violation carries a civil penalty of up to $500.', sources: ['ny'] },
      { heading: 'What the state lists as compliant', body: 'The Governor’s announcement of the law, which points businesses to the Department of State’s guidance, lists these as compliant: list the higher card price next to a lower cash price; list the card price and tell customers they receive a discount for cash; or change all prices to the card price.', sources: ['nyGuide'] },
      { heading: 'What the state lists as non-compliant', body: 'The same announcement lists these as non-compliant: a sign announcing an extra 3.9 percent for credit cards; a price tag reading “$10.00, + 4 percent if paying with a credit card”; a notice that a 4 percent cash discount is built into all pricing with an adjustment shown on card receipts; and a convenience, processing, or non-cash adjustment fee added as a separate receipt line for card users.', sources: ['nyGuide'] },
    ],
    faq: [
      { question: 'Is a percentage-only sign enough?', answer: 'No. The state lists a sign announcing an added percentage for credit cards as non-compliant; the total card price must be posted.' },
      { question: 'Can I display cash and card prices together?', answer: 'Yes. Section 518 expressly permits a two-tier pricing system with the credit-card price posted alongside the cash price.' },
    ],
  },
  {
    name: 'New Jersey', slug: 'new-jersey', summary: 'N.J.S.A. 56:8-156.1 and -156.2 cap credit-card surcharges at actual processing cost with set disclosure rules; they do not address cash discounts.',
    cashDiscount: 'not addressed by the surcharge statute', surcharge: 'allowed up to actual processing cost, amount disclosed', law: 'N.J.S.A. 56:8-156.1 to -156.2',
    cashDetail: 'N.J.S.A. 56:8-156.1 and -156.2 regulate only credit-card surcharges and do not mention cash discounts or dual pricing; the Division of Consumer Affairs says any other fee must still be clearly and conspicuously disclosed at or near the point of sale before the transaction.',
    surchargeDetail: 'Section 56:8-156.2(a) caps a credit-card surcharge at the seller’s actual cost to process the payment, and the amount must be disclosed before the customer incurs any charge.',
    answer: 'The law took effect August 18, 2023 and does not apply to debit or gift cards.',
    sources: ['njLaw', 'nj', 'visa'],
    sections: [
      { heading: 'Tie the fee to actual processing cost', body: 'P.L. 2023, c.146, codified at N.J.S.A. 56:8-156.1 and -156.2, bars a surcharge greater than the seller’s actual cost to process the credit-card payment and requires sellers to make records available to the Division of Consumer Affairs. The Division’s FAQ says a flat rate is allowed only if it does not exceed the actual cost of processing that transaction.', sources: ['njLaw', 'nj'] },
      { heading: 'Put the amount where the customer decides', body: 'Sellers other than restaurants must post the amount on a sign at the point of entry and the point of sale. Restaurants need it on a sign in the customer service area and on the menu; the FAQ includes menus posted online or reached by QR code. Websites, apps, and kiosks need clear electronic notice on the checkout page, and telephone sales need verbal notice before processing. A percentage is acceptable; a sign saying only that a surcharge applies is not.', sources: ['njLaw', 'nj'] },
      { heading: 'Debit is outside this law, not open to surcharges', body: 'The FAQ says the cap applies only to credit-card transactions, not debit or gift cards, and that other laws may limit other fees. Visa separately prohibits surcharging debit and prepaid cards.', sources: ['nj', 'visa'] },
    ],
    faq: [
      { question: 'Can I disclose a percentage in New Jersey?', answer: 'Yes. The state FAQ permits a percentage, but the amount must be disclosed before the customer incurs any charge and cannot exceed actual processing cost.' },
      { question: 'Does New Jersey law address dual pricing?', answer: 'No. The surcharge statute covers only credit-card surcharges. The Division says any other fee must still be clearly and conspicuously disclosed at or near the point of sale before the transaction.' },
    ],
  },
];
export const stateGuides: Guide[] = stateDetails.map(s => ({
  slug: `${s.slug}-dual-pricing`, topic: 'payments', kind: 'state', legal: true, reviewed: STATE_REVIEWED,
  title: `${s.name}: dual pricing and credit-card surcharge rules`, description: s.summary,
  answer: `Short answer: ${stateVerdict(s)} ${s.cashDetail} ${s.surchargeDetail} ${s.answer}`, sections: s.sections, sources: s.sources, faq: s.faq,
  related: ['dual-pricing-laws', 'surcharge-vs-cash-discount', 'surcharge-debit-cards', 'surcharge-notice'],
}));
export const stateNames = 'Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming|District of Columbia'.split('|');
