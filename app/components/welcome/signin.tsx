/**
 * Enhanced SignIn component with backend integration
 */

import { ChevronDownIcon } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";
import { authClient } from "@/lib/api/auth";
import { useTheme, ThemeMode } from "@/lib/theme-context";
import { RecoverySignin } from "../recovery/RecoverySignin";
import { truncatePassword } from "@/lib/password-utils";

const themeOptions = [
  { value: "light", label: "Neuro-Clair" },
  { value: "balance", label: "Neuro-Équilibre" },
  { value: "dark", label: "Neuro-Sombre" },
];

export const SignInLightMode = () => {
  const navigate = useNavigate();
  const { theme, setTheme, colors } = useTheme();
  
  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("english");
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRecoverySignin, setShowRecoverySignin] = useState(false);

  const handleSignin = async () => {
    setError(null);
    setSuccess(null);

    // Validation
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    if (password.length > 72) {
      setError("Password is too long (maximum 72 characters)");
      return;
    }

    setLoading(true);

    try {
      // Truncate password to 72 bytes to match backend requirement
      const truncatedPassword = truncatePassword(password);
      
      const response = await authClient.signin({
        username: username.trim(),
        password: truncatedPassword,
      });

      if (response.success) {
        setSuccess("Login successful! Redirecting...");
        
        // Save user to local storage
        authClient.saveUser(response.user);
        
        // Redirect to menu page after 1.5 seconds
        setTimeout(() => {
          console.log("Redirecting to menu...", response.user);
          navigate("/menu");
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignin();
    }
  };

  // Handle recovery signin success
  const handleRecoverySuccess = (_recoveryData: { phrase: string[]; hash: string }) => {
    setSuccess("Recovery signin successful! Redirecting...");
    
    // In a real app, you would validate the recovery hash against stored data
    // For demo purposes, we'll simulate success
    const mockUser = {
      id: 1,
      username: 'recovery-user',
      email: 'recovery@example.com',
      first_name: 'Recovery',
      last_name: 'User'
    };
    
    authClient.saveUser(mockUser);
    
    setTimeout(() => {
      console.log("Redirecting to menu...", mockUser);
      navigate("/menu");
    }, 1500);
  };

  // Show recovery signin if needed
  if (showRecoverySignin) {
    return (
      <RecoverySignin
        onSuccess={handleRecoverySuccess}
        onBack={() => setShowRecoverySignin(false)}
      />
    );
  }

  return (
    <div className="relative w-[400px] h-[600px]">
      <img
        className="absolute top-0 left-px w-[399px] h-[600px] object-cover"
        alt={`${theme} background`}
        src={`res://icons/${theme}-background.png`}
      />

      <div className="absolute top-[520px] left-[calc(50.00%_-_159px)] w-[318px] h-4 bg-[#131212b2] blur-[9.35px]" />

      {/* Error/Success Messages */}
      {error && (
        <div className="absolute top-[200px] left-[calc(50.00%_-_150px)] w-[300px] p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm z-10">
          {error}
        </div>
      )}
      
      {success && (
        <div className="absolute top-[200px] left-[calc(50.00%_-_150px)] w-[300px] p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm z-10">
          {success}
        </div>
      )}

      <ToggleGroup
          type="single"
          value={theme}
          onValueChange={(value) => value && setTheme(value as ThemeMode)}
          className="inline-flex h-6 items-center gap-[3px] px-[5px] py-[3px] absolute top-[442px] left-[calc(50.00%_-_18px)] w-[177px] h-8 flex rounded-[11.89px] border border-solid p-0 z-10 transition-all duration-500"
          style={{ borderColor: colors.border }}
        >
          {themeOptions.map((themeOption) => (
            <ToggleGroupItem
              key={themeOption.value}
              value={themeOption.value}
              className="flex w-[51px] h-4 items-center justify-center gap-1 px-2 py-[3px] rounded-xl border-[0.5px] border-solid transition-all duration-300 data-[state=off]:bg-transparent"
              style={{ 
                borderColor: colors.border,
                background: theme === themeOption.value ? colors.buttonBg : 'transparent'
              }}
            >
              <div 
                className="relative w-fit [font-family:'Open_Sans',Helvetica] font-normal text-[7px] text-center tracking-[0] leading-[10.5px] whitespace-nowrap transition-colors duration-300"
                style={{ 
                  color: theme === themeOption.value ? colors.buttonText : colors.textSecondary 
                }}
              >
                {themeOption.label}
              </div>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

      <div className="flex flex-col w-80 items-start gap-[14.65px] absolute top-[252px] left-[calc(50.00%_-_160px)]">
        {/* Username Input */}
        <div 
          className="flex h-10 items-center gap-[5.86px] pl-[14.65px] pr-[8.79px] py-[11.72px] relative self-stretch w-full rounded-[28.12px] border-2 border-solid shadow-[4.69px_4.69px_7.03px_#00000026] transition-all duration-500"
          style={{ 
            borderColor: colors.border,
            backgroundColor: colors.cardBg 
          }}
        >
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            className="border-0 shadow-none p-0 h-auto bg-transparent [font-family:'Open_Sans',Helvetica] font-semibold text-xs tracking-[0] leading-[normal] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-500"
            style={{ 
              color: colors.text,
              '--placeholder-color': colors.textSecondary 
            } as React.CSSProperties}
          />
        </div>

        <div className="flex flex-col items-end gap-[4.69px] relative self-stretch w-full flex-[0_0_auto]">
          {/* Password Input */}
          <div 
            className="flex h-10 items-center gap-[5.86px] pl-[14.65px] pr-[8.79px] py-[11.72px] relative self-stretch w-full rounded-[28.12px] border-2 border-solid shadow-[4.69px_4.69px_7.03px_#00000026] transition-all duration-500"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.cardBg 
            }}
          >
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-0 shadow-none p-0 h-auto bg-transparent [font-family:'Open_Sans',Helvetica] font-semibold text-[11.7px] tracking-[0] leading-[normal] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-500"
              style={{ 
                color: colors.text,
                '--placeholder-color': colors.textSecondary 
              } as React.CSSProperties}
            />
          </div>

          <button 
            className="relative w-80 [font-family:'Open_Sans',Helvetica] font-normal text-[9.4px] text-right tracking-[0] leading-[normal] bg-transparent border-0 cursor-pointer hover:underline transition-colors duration-500"
            style={{ color: colors.textSecondary }}
          >
            Forgot password?
          </button>
        </div>

        {/* Language Selector */}
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger 
            className="flex h-10 items-center justify-between pl-[14.65px] pr-[8.79px] py-[11.72px] relative self-stretch w-full rounded-[28.12px] border-2 border-solid shadow-[4.69px_4.69px_7.03px_#00000026] bg-transparent [&>svg]:hidden transition-all duration-500"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.cardBg 
            }}
          >
            <span 
              className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs tracking-[0] leading-[normal] transition-colors duration-500"
              style={{ color: colors.text }}
            >
              <SelectValue />
            </span>
            <ChevronDownIcon 
              className="w-[10.94px] h-[6.05px] transition-colors duration-500"
              style={{ color: colors.textSecondary }}
            />
          </SelectTrigger>
          <SelectContent 
            className="border-2 rounded-xl transition-all duration-500"
            style={{ 
              backgroundColor: colors.cardBg,
              borderColor: colors.border 
            }}
          >
            <SelectItem 
              value="english" 
              className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs transition-colors duration-300"
              style={{ 
                color: colors.text,
                '--hover-bg': colors.buttonHover 
              } as React.CSSProperties}
            >
              English
            </SelectItem>
            <SelectItem 
              value="french" 
              className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs transition-colors duration-300"
              style={{ 
                color: colors.text,
                '--hover-bg': colors.buttonHover 
              } as React.CSSProperties}
            >
              Français
            </SelectItem>
            <SelectItem 
              value="spanish" 
              className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs transition-colors duration-300"
              style={{ 
                color: colors.text,
                '--hover-bg': colors.buttonHover 
              } as React.CSSProperties}
            >
              Español
            </SelectItem>
            <SelectItem 
              value="german" 
              className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs transition-colors duration-300"
              style={{ 
                color: colors.text,
                '--hover-bg': colors.buttonHover 
              } as React.CSSProperties}
            >
              Deutsch
            </SelectItem>
            <SelectItem 
              value="chinese" 
              className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs transition-colors duration-300"
              style={{ 
                color: colors.text,
                '--hover-bg': colors.buttonHover 
              } as React.CSSProperties}
            >
              中文
            </SelectItem>
            <SelectItem 
              value="japanese" 
              className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs transition-colors duration-300"
              style={{ 
                color: colors.text,
                '--hover-bg': colors.buttonHover 
              } as React.CSSProperties}
            >
              日本語
            </SelectItem>
            <SelectItem 
              value="arabic" 
              className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs transition-colors duration-300"
              style={{ 
                color: colors.text,
                '--hover-bg': colors.buttonHover 
              } as React.CSSProperties}
            >
              العربية
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <footer 
        className="absolute top-[570px] left-[calc(50.00%_-_187px)] [font-family:'Open_Sans',Helvetica] font-normal text-[11.7px] tracking-[0] leading-[normal] transition-colors duration-500"
        style={{ color: colors.textSecondary }}
      >
        <span 
          className="font-semibold transition-colors duration-500"
          style={{ color: colors.textSecondary }}
        >
          NeuroX-TMAX 
        </span>
        <span 
          className="[font-family:'Montserrat',Helvetica] font-medium transition-colors duration-500"
          style={{ color: colors.textSecondary }}
        >
          - Design{" "}
        </span>
        <span 
          className="transition-colors duration-500"
          style={{ color: colors.textSecondary }}
        >
          exclusif
        </span>
        <span 
          className="[font-family:'Montserrat',Helvetica] font-medium transition-colors duration-500"
          style={{ color: colors.textSecondary }}
        >
          , Toute reproduction est interdite.
        </span>
      </footer>

      <p 
        className="absolute top-[188px] left-[calc(50.00%_-_104px)] h-[19px] flex items-center justify-center [font-family:'Open_Sans',Helvetica] font-normal text-sm text-center tracking-[0] leading-[normal] transition-colors duration-500"
        style={{ color: colors.textSecondary }}
      >
        Votre gestion, notre intelligence
      </p>

      <img
        className="absolute top-[21px] left-[calc(50.00%_-_87px)] w-[175px] h-[115px] object-cover"
        alt="Logo light"
        src="res://icons/logo-light.png"
      />

      <img
        className="absolute top-[151px] left-[calc(50.00%_-_101px)] w-[202px] h-[27px] object-cover"
        alt="Name light"
        src="res://icons/name-light.png"
      />

      {/* Sign In Button */}
      <Button 
        onClick={handleSignin}
        disabled={loading}
        className="absolute top-[498px] left-[calc(50.00%_-_160px)] w-80 h-12 rounded-[28.12px] border-2 border-solid shadow-[4.69px_4.69px_7.03px_#00000026] hover:opacity-90 disabled:opacity-50 [text-shadow:0px_4px_4px_#00000040] [font-family:'Open_Sans',Helvetica] font-normal text-[17.6px] text-center tracking-[0] leading-[normal] transition-all duration-500"
        style={{ 
          borderColor: colors.border,
          background: colors.buttonBg,
          color: colors.buttonText 
        }}
      >
        {loading ? "Connexion..." : "Connexion"}
      </Button>

     <Button 
       className="absolute top-[442px] left-[calc(50.00%_-_159px)] w-[115px] h-6 rounded-[28.12px] border border-solid hover:opacity-90 [font-family:'Open_Sans',Helvetica] font-normal text-[10.5px] text-center tracking-[0] leading-[normal] h-auto transition-all duration-500"
       style={{ 
         borderColor: colors.border,
         background: colors.buttonBg,
         color: colors.buttonText 
       }}
       onClick={() => navigate("/register")}
     >
       Inscription
     </Button>

     <Button 
       className="absolute top-[470px] left-[calc(50.00%_-_159px)] w-[115px] h-6 rounded-[28.12px] border border-solid hover:opacity-90 [font-family:'Open_Sans',Helvetica] font-normal text-[10.5px] text-center tracking-[0] leading-[normal] h-auto transition-all duration-500"
       style={{ 
         borderColor: colors.border,
         background: colors.buttonBg,
         color: colors.buttonText 
       }}
       onClick={() => setShowRecoverySignin(true)}
     >
       Recovery Sign In
     </Button>
    </div>
  );
};

export default SignInLightMode;

