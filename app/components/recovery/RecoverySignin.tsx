/**
 * Recovery-based Signin Component
 * Allows users to sign in using their recovery phrase or QR code
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { QrCode, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { validateRecoveryPhrase, stringToPhrase } from '@/lib/recovery-utils';
import { parseQRCodeData } from '@/lib/qr-code-utils';
import { useTheme } from '@/lib/theme-context';

interface RecoverySigninProps {
  onSuccess: (recoveryData: { phrase: string[]; hash: string }) => void;
  onBack: () => void;
}

export const RecoverySignin: React.FC<RecoverySigninProps> = ({
  onSuccess,
  onBack
}) => {
  const { colors } = useTheme();
  const [recoveryInput, setRecoveryInput] = useState('');
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [showQRInput, setShowQRInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecoverySubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const phrase = stringToPhrase(recoveryInput);
      
      if (!validateRecoveryPhrase(phrase)) {
        setError('Invalid recovery phrase. Please check your words and try again.');
        return;
      }

      // In a real app, you would validate against the stored hash
      // For demo purposes, we'll simulate success
      const recoveryData = {
        phrase,
        hash: 'demo-hash' // This would be the actual stored hash
      };

      onSuccess(recoveryData);
    } catch (err) {
      setError('Failed to process recovery phrase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRCodeSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const { phrase, valid } = parseQRCodeData(qrCodeInput);
      
      if (!valid || !validateRecoveryPhrase(phrase)) {
        setError('Invalid QR code data. Please scan a valid recovery phrase QR code.');
        return;
      }

      const recoveryData = {
        phrase,
        hash: 'demo-hash' // This would be the actual stored hash
      };

      onSuccess(recoveryData);
    } catch (err) {
      setError('Failed to process QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setRecoveryInput(content.trim());
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Card 
        className="transition-all duration-500"
        style={{ 
          backgroundColor: colors.cardBg,
          borderColor: colors.border 
        }}
      >
        <CardHeader className="text-center">
          <CardTitle 
            className="text-2xl font-bold transition-colors duration-500"
            style={{ color: colors.text }}
          >
            🔐 Recovery Sign In
          </CardTitle>
          <p 
            className="text-sm mt-2 transition-colors duration-500"
            style={{ color: colors.textSecondary }}
          >
            Use your recovery phrase or QR code to sign in
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Display */}
          {error && (
            <div 
              className="p-4 rounded-lg border-2 flex items-center gap-3 transition-all duration-500"
              style={{ 
                backgroundColor: '#fef2f2',
                borderColor: '#fecaca',
                color: '#dc2626'
              }}
            >
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Recovery Phrase Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 
                className="text-lg font-semibold transition-colors duration-500"
                style={{ color: colors.text }}
              >
                Recovery Phrase
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQRInput(!showQRInput)}
                className="transition-all duration-500"
                style={{ 
                  borderColor: colors.border,
                  color: colors.text 
                }}
              >
                <QrCode className="w-4 h-4" />
                {showQRInput ? 'Text Input' : 'QR Code'}
              </Button>
            </div>

            {!showQRInput ? (
              <div className="space-y-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2 transition-colors duration-500"
                    style={{ color: colors.text }}
                  >
                    Enter your 12-word recovery phrase
                  </label>
                  <textarea
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    placeholder="abandon ability able about above absent absorb abstract absurd abuse access accident"
                    className="w-full p-3 rounded-lg border-2 transition-all duration-500 resize-none"
                    style={{ 
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text 
                    }}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex-1"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full transition-all duration-500"
                      style={{ 
                        borderColor: colors.border,
                        color: colors.text 
                      }}
                    >
                      Upload from File
                    </Button>
                  </label>
                  <Button
                    onClick={handleRecoverySubmit}
                    disabled={loading || !recoveryInput.trim()}
                    className="flex-1 transition-all duration-500"
                    style={{ 
                      backgroundColor: colors.buttonBg,
                      color: colors.buttonText,
                      borderColor: colors.border 
                    }}
                  >
                    {loading ? 'Verifying...' : 'Sign In'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2 transition-colors duration-500"
                    style={{ color: colors.text }}
                  >
                    Scan or paste QR code data
                  </label>
                  <textarea
                    value={qrCodeInput}
                    onChange={(e) => setQrCodeInput(e.target.value)}
                    placeholder="Paste QR code data here..."
                    className="w-full p-3 rounded-lg border-2 transition-all duration-500 resize-none"
                    style={{ 
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text 
                    }}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleQRCodeSubmit}
                  disabled={loading || !qrCodeInput.trim()}
                  className="w-full transition-all duration-500"
                  style={{ 
                    backgroundColor: colors.buttonBg,
                    color: colors.buttonText,
                    borderColor: colors.border 
                  }}
                >
                  {loading ? 'Verifying...' : 'Sign In with QR Code'}
                </Button>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full transition-all duration-500"
              style={{ 
                borderColor: colors.border,
                color: colors.text 
              }}
            >
              Back to Regular Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
