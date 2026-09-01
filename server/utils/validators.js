/**
 * Basic phone number format validator for the customer contact-phone field
 * captured on service requests. Intentionally permissive (digits, spaces,
 * hyphens, parentheses, optional leading +) so it accepts common formats
 * (e.g. "9990001111", "+91 99900 01111", "(999) 000-1111") without being a
 * full international phone-numbering-plan validator.
 */
const isValidPhone = (value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length < 7 || trimmed.length > 20) return false;
  return /^[+]?[0-9\s\-()]{7,20}$/.test(trimmed);
};

module.exports = { isValidPhone };
