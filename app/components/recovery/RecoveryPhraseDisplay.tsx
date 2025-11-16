/**
 * Recovery Phrase Display Component
 * Shows the 12-word recovery phrase with QR code option
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Copy, Eye, EyeOff, Download, QrCode } from 'lucide-react';
import { generateRecoveryQRCode } from '@/lib/qr-code-utils';
import { useTheme } from '@/lib/theme-context';

interface RecoveryPhraseDisplayProps {
  phrase: string[];
  onConfirm: () => void;
  onBack?: () => void;
}

export const RecoveryPhraseDisplay: React.FC<RecoveryPhraseDisplayProps> = ({
  phrase,
  onConfirm,
  onBack
}) => {
  const { colors } = useTheme();
  const [showPhrase, setShowPhrase] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const phraseString = phrase.join(' ');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phraseString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([phraseString], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'recovery-phrase.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const qrCodeDataURL = generateRecoveryQRCode(phrase);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div 
        className="rounded-lg border-2 transition-all duration-500"
        style={{ 
          backgroundColor: colors.cardBg,
          borderColor: colors.border 
        }}
      >
        <div className="p-6 text-center">
          <h2 
            className="text-2xl font-bold transition-colors duration-500"
            style={{ color: colors.text }}
          >
            🔐 Recovery Phrase Generated
          </h2>
          <p 
            className="text-sm mt-2 transition-colors duration-500"
            style={{ color: colors.textSecondary }}
          >
            Save this 12-word recovery phrase in a secure place. You'll need it to recover your account.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Security Warning */}
          <div 
            className="p-4 rounded-lg border-2 transition-all duration-500"
            style={{ 
              backgroundColor: `${colors.accentGold}20`,
              borderColor: colors.accentGold 
            }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h4 
                  className="font-semibold mb-2 transition-colors duration-500"
                  style={{ color: colors.text }}
                >
                  Important Security Notice
                </h4>
                <ul 
                  className="text-sm space-y-1 transition-colors duration-500"
                  style={{ color: colors.textSecondary }}
                >
                  <li>• Never share your recovery phrase with anyone</li>
                  <li>• Store it in a secure, offline location</li>
                  <li>• This phrase will not be shown again</li>
                  <li>• If lost, you cannot recover your account</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recovery Phrase */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 
                className="text-lg font-semibold transition-colors duration-500"
                style={{ color: colors.text }}
              >
                Your Recovery Phrase
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPhrase(!showPhrase)}
                  className="transition-all duration-500"
                  style={{ 
                    borderColor: colors.border,
                    color: colors.text 
                  }}
                >
                  {showPhrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPhrase ? 'Hide' : 'Show'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="transition-all duration-500"
                  style={{ 
                    borderColor: colors.border,
                    color: colors.text 
                  }}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="transition-all duration-500"
                  style={{ 
                    borderColor: colors.border,
                    color: colors.text 
                  }}
                >
                  <Download className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </div>

            {showPhrase ? (
              <div 
                className="p-4 rounded-lg border-2 transition-all duration-500"
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.border 
                }}
              >
                <div className="grid grid-cols-3 gap-2 text-sm font-mono">
                  {phrase.map((word, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-2 rounded transition-colors duration-500"
                      style={{ 
                        backgroundColor: colors.cardBg,
                        color: colors.text 
                      }}
                    >
                      <span 
                        className="text-xs font-semibold transition-colors duration-500"
                        style={{ color: colors.textSecondary }}
                      >
                        {index + 1}.
                      </span>
                      <span>{word}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div 
                className="p-4 rounded-lg border-2 transition-all duration-500"
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.border 
                }}
              >
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }, (_, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-2 rounded transition-colors duration-500"
                      style={{ 
                        backgroundColor: colors.cardBg,
                        color: colors.text 
                      }}
                    >
                      <span 
                        className="text-xs font-semibold transition-colors duration-500"
                        style={{ color: colors.textSecondary }}
                      >
                        {index + 1}.
                      </span>
                      <div 
                        className="h-4 w-16 rounded transition-colors duration-500"
                        style={{ backgroundColor: colors.textSecondary }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* QR Code Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 
                className="text-lg font-semibold transition-colors duration-500"
                style={{ color: colors.text }}
              >
                QR Code (Alternative)
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQR(!showQR)}
                className="transition-all duration-500"
                style={{ 
                  borderColor: colors.border,
                  color: colors.text 
                }}
              >
                <QrCode className="w-4 h-4" />
                {showQR ? 'Hide QR' : 'Show QR'}
              </Button>
            </div>

            {showQR && (
              <div className="flex justify-center">
                <div 
                  className="p-4 rounded-lg border-2 transition-all duration-500"
                  style={{ 
                    backgroundColor: colors.background,
                    borderColor: colors.border 
                  }}
                >
                  <img 
                    src={qrCodeDataURL} 
                    alt="Recovery Phrase QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1 transition-all duration-500"
                style={{ 
                  borderColor: colors.border,
                  color: colors.text 
                }}
              >
                Back
              </Button>
            )}
            <Button
              onClick={onConfirm}
              className="flex-1 transition-all duration-500"
              style={{ 
                backgroundColor: colors.buttonBg,
                color: colors.buttonText,
                borderColor: colors.border 
              }}
            >
              I've Saved My Recovery Phrase
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
