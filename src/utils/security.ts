import DOMPurify from "dompurify";

/**
 * XSS தாக்குதலைத் தடுக்க HTML-ஐச் சுத்தம் செய்யும் ஃபங்ஷன்.
 * இதை 'dangerouslySetInnerHTML' பயன்படுத்தும் போது மட்டும் கூப்பிடவும்.
 */
export const sanitizeHTML = (dirtyContent: string) => {
  return {
    __html: DOMPurify.sanitize(dirtyContent, {
      USE_PROFILES: { html: true }, // HTML மட்டும் அனுமதி
    }),
  };
};

/**
 * சாதாரண டெக்ஸ்ட் இன்புட்களைச் சுத்தம் செய்ய.
 * (React தானாகவே XSS-ஐத் தடுக்கும், இருந்தாலும் இது கூடுதல் பாதுகாப்பு)
 */
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input);
};

/**
 * File Upload Validation (Security)
 * ஃபைல் உண்மையான படமா மற்றும் அளவு சரியானதா எனச் சோதிக்கும்.
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Only JPG, PNG, and WEBP files are allowed." };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: "File size must be less than 5MB." };
  }

  return { valid: true };
};
