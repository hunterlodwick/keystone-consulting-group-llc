const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE = /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/;
const STREET =
  /\b\d{1,6}\s+(?:[NSEW]\.?\s+)?[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,3}\s+(?:st|street|ave|avenue|rd|road|dr|drive|ln|lane|blvd|boulevard|ct|court|way|hwy|highway|pl|place|pkwy|parkway|cir|circle|ter|terrace)\b\.?/i;
const NAME_INTRO = /\b(?:my name is|my name's|this is|i am|i'm)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/;
const CARD = /\b(?:\d[ -]?){13,19}\b/;

export type PrivacyHit = "email" | "phone" | "street address" | "full name" | "card number";

export function findPrivateDetails(text: string): PrivacyHit[] {
  const hits: PrivacyHit[] = [];
  if (EMAIL.test(text)) hits.push("email");
  if (CARD.test(text.replace(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g, ""))) hits.push("card number");
  else if (PHONE.test(text)) hits.push("phone");
  if (STREET.test(text)) hits.push("street address");
  if (NAME_INTRO.test(text)) hits.push("full name");
  return hits;
}

export function privacyMessage(hits: PrivacyHit[]): string {
  const list = hits.join(" and ");
  const article = /^[aeiou]/i.test(list) ? "an" : "a";
  return `It looks like your message includes ${article} ${list}. Keep contact details out of this chat. Ask the public question here, and use the contact links on this site if you want to reach KCG.`;
}
