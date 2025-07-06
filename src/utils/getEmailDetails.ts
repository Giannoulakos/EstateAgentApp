/**
 * Extracts email subject and body from a personalized pitch
 *
 * @param personalizedPitch - The personalized pitch text
 * @returns Object containing subject and body for email
 */
export interface EmailDetails {
  subject: string;
  body: string;
}

export function getEmailDetails(personalizedPitch: string): EmailDetails {
  if (!personalizedPitch) {
    return {
      subject: 'Real Estate Opportunity',
      body: 'Hello, I have a property that might interest you.',
    };
  }

  // Remove "Subject:" prefix if it exists (case-insensitive)
  let cleanedPitch = personalizedPitch.replace(/^Subject:\s*/i, '').trim();

  // Define sentence-ending punctuation
  const sentenceEnders = ['.', ';', '?', '!'];

  // Find the first sentence ending
  let firstSentenceEnd = -1;
  for (const punctuation of sentenceEnders) {
    const index = cleanedPitch.indexOf(punctuation);
    if (index !== -1) {
      if (firstSentenceEnd === -1 || index < firstSentenceEnd) {
        firstSentenceEnd = index;
      }
    }
  }

  // Extract subject (first sentence)
  let subject: string;
  if (firstSentenceEnd !== -1) {
    subject = cleanedPitch.substring(0, firstSentenceEnd).trim();
  } else {
    // If no sentence ending found, limit to first 60 characters
    subject = cleanedPitch.substring(0, 60).trim();
    // If it was truncated, add ellipsis
    if (cleanedPitch.length > 60) {
      subject += '...';
    }
  }

  // Fallback if subject is empty
  if (!subject) {
    subject = 'Real Estate Opportunity';
  }

  // Body is the entire cleaned pitch
  const body =
    cleanedPitch || 'Hello, I have a property that might interest you.';

  return {
    subject,
    body,
  };
}

/**
 * Creates a mailto URL with proper encoding
 *
 * @param email - Recipient email address
 * @param subject - Email subject
 * @param body - Email body
 * @returns Properly encoded mailto URL
 */
export function createMailtoUrl(
  email: string,
  subject: string,
  body: string
): string {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);

  return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
}
