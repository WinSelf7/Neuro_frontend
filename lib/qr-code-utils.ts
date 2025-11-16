/**
 * QR Code generation utilities
 * For demo purposes, we'll use a simple QR code generation approach
 * In production, use a proper QR code library like 'qrcode' or 'react-qr-code'
 */

/**
 * Generate QR code data URL for recovery phrase
 */
export function generateQRCodeDataURL(data: string): string {
  // For demo purposes, we'll create a simple data URL
  // In production, use a proper QR code library
  const qrData = {
    type: 'recovery_phrase',
    data: data,
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
  
  // Create a simple base64 encoded data URL
  const jsonString = JSON.stringify(qrData);
  const base64Data = btoa(jsonString);
  
  // Return a data URL with a simple placeholder
  // In production, this would be a proper QR code image
  return `data:image/svg+xml;base64,${base64Data}`;
}

/**
 * Generate QR code for recovery phrase
 */
export function generateRecoveryQRCode(phrase: string[]): string {
  const phraseString = phrase.join(' ');
  return generateQRCodeDataURL(phraseString);
}

/**
 * Parse QR code data
 */
export function parseQRCodeData(dataUrl: string): { phrase: string[]; valid: boolean } {
  try {
    // Extract base64 data from data URL
    const base64Data = dataUrl.split(',')[1];
    const jsonString = atob(base64Data);
    const qrData = JSON.parse(jsonString);
    
    if (qrData.type === 'recovery_phrase' && qrData.data) {
      const phrase = qrData.data.split(' ');
      return { phrase, valid: true };
    }
    
    return { phrase: [], valid: false };
  } catch (error) {
    console.error('Error parsing QR code:', error);
    return { phrase: [], valid: false };
  }
}
