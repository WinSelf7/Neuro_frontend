/**
 * Enhanced SignUp component with backend integration
 */

import { ChevronDownIcon, GlobeIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../../components/ui/input";
import { useNavigate } from "react-router-dom";
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

const themeOptions = [
  { value: "light", label: "Neuro-Clair" },
  { value: "balance", label: "Neuro-Équilibre" },
  { value: "dark", label: "Neuro-Sombre" },
];

export const SignUpLightMode = () => {
  const navigate = useNavigate();
  const { theme, setTheme, colors } = useTheme();
  
  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agreeToPolicy, setAgreeToPolicy] = useState(true);
  const [language, setLanguage] = useState("english");
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Field-specific errors for real-time validation
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  
  // Track touched fields
  const [touched, setTouched] = useState({
    username: false,
    password: false,
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
  });

  // Validation functions
  const validateUsername = (value: string) => {
    if (!value.trim()) return "Username is required";
    if (value.length < 3) return "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Username can only contain letters, numbers, and underscores";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    if (!/(?=.*[a-z])/.test(value)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(value)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(value)) return "Password must contain at least one number";
    return "";
  };

  const validateEmail = (value: string) => {
    if (!value) return ""; // Email is optional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
    return "";
  };

  const validatePhone = (value: string) => {
    if (!value) return ""; // Phone is optional
    if (!/^\+?[\d\s-()]+$/.test(value)) return "Invalid phone number format";
    return "";
  };

  const validateName = (value: string, fieldName: string) => {
    if (!value.trim()) return `${fieldName} is required`;
    if (value.length < 2) return `${fieldName} must be at least 2 characters`;
    if (!/^[a-zA-Z\s'-]+$/.test(value)) return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    return "";
  };

  // Handle field blur
  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });
  };

  // Handle username change with validation
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (touched.username) {
      setFieldErrors({ ...fieldErrors, username: validateUsername(value) });
    }
  };

  // Handle password change with validation
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      setFieldErrors({ ...fieldErrors, password: validatePassword(value) });
    }
  };

  // Handle first name change with validation
  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    if (touched.firstName) {
      setFieldErrors({ ...fieldErrors, firstName: validateName(value, "First name") });
    }
  };

  // Handle last name change with validation
  const handleLastNameChange = (value: string) => {
    setLastName(value);
    if (touched.lastName) {
      setFieldErrors({ ...fieldErrors, lastName: validateName(value, "Last name") });
    }
  };

  // Handle email change with validation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      setFieldErrors({ ...fieldErrors, email: validateEmail(value) });
    }
  };

  // Handle phone change with validation
  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (touched.phone) {
      setFieldErrors({ ...fieldErrors, phone: validatePhone(value) });
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    // Check required fields are not empty
    if (!username.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
      return false;
    }

    // Check if there are any validation errors
    const hasErrors = 
      validateUsername(username) !== "" ||
      validatePassword(password) !== "" ||
      validateName(firstName, "First name") !== "" ||
      validateName(lastName, "Last name") !== "" ||
      validateEmail(email) !== "" ||
      validatePhone(phone) !== "";

    return !hasErrors && agreeToPolicy;
  };

  const handleSignup = async () => {
    setError(null);
    setSuccess(null);

    console.log("handleSignup------------>");

    // Mark all fields as touched
    setTouched({
      username: true,
      password: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    });

    // Validate all fields
    const errors = {
      username: validateUsername(username),
      password: validatePassword(password),
      firstName: validateName(firstName, "First name"),
      lastName: validateName(lastName, "Last name"),
      email: validateEmail(email),
      phone: validatePhone(phone),
    };

    setFieldErrors(errors);

    // Check if there are any errors
    if (Object.values(errors).some(err => err !== "")) {
      setError("Please fix all errors before submitting");
      return;
    }

    if (!agreeToPolicy) {
      setError("You must agree to the Privacy Policy");
      return;
    }

    setLoading(true);

    try {
      const signupData = {
        username: username.trim(),
        password: password,
        email: email.trim() || `${username}@temp.com`, // Use temporary email if not provided
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        department: department.trim(),
        phone: phone.trim(),
      };
      
      console.log("=== SIGNUP DATA ===");
      console.log("Password length:", password.length);
      console.log("Password value:", password);
      console.log("Full signup data:", { ...signupData, password: '***' });
      
      const response = await authClient.signup(signupData);

      console.log("response------------>", response);

      if (response.success) {
        setSuccess("Account created successfully! Redirecting to menu...");
        
        // Save user to local storage
        authClient.saveUser(response.user);
        
        // Clear form
        setUsername("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setDepartment("");
        setRole("");
        setEmail("");
        setPhone("");
        
        // Redirect to menu page after 2 seconds
        setTimeout(() => {
          console.log("Redirecting to menu...");
          navigate("/menu");
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[621px] flex">
      <div className="w-[621px] h-[763px] relative">
      <img
        className="absolute top-0 left-px w-[621px] h-[763px] object-cover pointer-events-none"
        alt={`${theme} background`}
        src={`res://icons/${theme}-background.png`}
      />
        {/* Error/Success Messages */}
        {error && (
          <div className="absolute top-[210px] left-[60px] w-[500px] p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="absolute top-[210px] left-[60px] w-[500px] p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <ToggleGroup
          type="single"
          value={theme}
          onValueChange={(value) => value && setTheme(value as ThemeMode)}
          className="inline-flex h-6 items-center gap-[3px] px-[5px] py-[3px] absolute top-[685px] left-[calc(50.00%_-_250px)] rounded-xl border-[0.59px] border-solid z-10 transition-all duration-500"
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

        <div className="absolute top-[628px] left-[60px] w-[169px] z-10">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger 
              className="flex w-full h-10 items-center gap-2 pl-3.5 pr-5 py-3 rounded-[28px] border-2 border-solid shadow-[4.69px_4.69px_7.03px_#00000026] bg-transparent [&>svg]:hidden transition-all duration-500"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.cardBg 
              }}
            >
              <GlobeIcon 
                className="w-5 h-5 transition-colors duration-500"
                style={{ color: colors.textSecondary }}
              />
              <span 
                className="flex-1 text-left [font-family:'Open_Sans',Helvetica] font-semibold text-xs tracking-[0] leading-[normal] transition-colors duration-500"
                style={{ color: colors.text }}
              >
                <SelectValue />
              </span>
              <ChevronDownIcon 
                className="w-3 h-3 transition-colors duration-500"
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

        <div 
          className="absolute top-[726px] left-[calc(50.00%_-_186px)] [font-family:'Open_Sans',Helvetica] font-normal text-[11.7px] tracking-[0] leading-[normal] transition-colors duration-500"
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
        </div>

        <div 
          className="absolute top-[188px] left-[calc(50.00%_-_104px)] h-[19px] flex items-center justify-center [font-family:'Open_Sans',Helvetica] font-normal text-sm text-center tracking-[0] leading-[normal] transition-colors duration-500"
          style={{ color: colors.textSecondary }}
        >
          Votre gestion, notre intelligence
        </div>

        <div className="flex flex-col w-[506px] items-start gap-6 absolute top-[248px] left-[58px]">
          <div className="grid grid-cols-2 grid-rows-3 gap-x-3.5 gap-y-8 w-[506px]">
            {/* Username */}
            <div className="relative w-[246px]">
              <div 
                className={`relative w-[246px] h-10 flex items-center gap-2 pl-3.5 pr-5 py-3 rounded-[28px] border-2 border-solid shadow-[4.69px_4.69px_7.03px_#00000026] transition-all duration-500 ${
                  fieldErrors.username && touched.username ? 'border-red-500' : ''
                }`}
                style={{ 
                  borderColor: fieldErrors.username && touched.username ? '#ef4444' : colors.border,
                  backgroundColor: colors.cardBg 
                }}
              >
                <img className="relative w-5 h-5 mt-[-2.00px] mb-[-2.00px]" alt="User" src="res://icons/user-circle.svg" />
                <Input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  onBlur={() => handleBlur('username')}
                  className="relative flex-1 mt-[-2.00px] border-0 bg-transparent p-0 h-auto [font-family:'Open_Sans',Helvetica] font-semibold text-xs tracking-[0] leading-[normal] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-500"
                  style={{ 
                    color: colors.text,
                    '--placeholder-color': colors.textSecondary 
                  } as React.CSSProperties}
                />
              </div>
              {fieldErrors.username && touched.username && (
                <p className="absolute -bottom-5 left-2 text-red-500 text-[9px] [font-family:'Open_Sans',Helvetica] font-normal">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative w-[246px]">
              <div 
                className={`relative w-[246px] h-10 flex items-center gap-2 pl-3.5 pr-5 py-3 rounded-[28px] border-2 border-solid shadow-[4.69px_4.69px_7.03px_#00000026] transition-all duration-500 ${
                  fieldErrors.password && touched.password ? 'border-red-500' : ''
                }`}
                style={{ 
                  borderColor: fieldErrors.password && touched.password ? '#ef4444' : colors.border,
                  backgroundColor: colors.cardBg 
                }}
              >
                <img className="relative w-5 h-5 mt-[-2.00px] mb-[-2.00px]" alt="Lock" src="res://icons/lock-01.svg" />
                <Input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className="relative flex-1 mt-[-2.00px] border-0 bg-transparent p-0 h-auto [font-family:'Open_Sans',Helvetica] font-semibold text-xs tracking-[0] leading-[normal] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-500"
                  style={{ 
                    color: colors.text,
                    '--placeholder-color': colors.textSecondary 
                  } as React.CSSProperties}
                />
              </div>
              {fieldErrors.password && touched.password && (
                <p className="absolute -bottom-5 left-2 text-red-500 text-[9px] [font-family:'Open_Sans',Helvetica] font-normal">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* First Name */}
            <div className="relative w-[246px]">
              <div 
                className={`relative w-[246px] h-10 flex items-center gap-2 pl-3.5 pr-5 py-3 rounded-[28px] border-2 border-solid shadow-[4.69px_4.69px_7.03px_#00000026] transition-all duration-500 ${
                  fieldErrors.firstName && touched.firstName ? 'border-red-500' : ''
                }`}
                style={{ 
                  borderColor: fieldErrors.firstName && touched.firstName ? '#ef4444' : colors.border,
                  backgroundColor: colors.cardBg 
                }}
              >
                <img className="relative w-5 h-5 mt-[-2.00px] mb-[-2.00px]" alt="User" src="res://icons/user-left-01.svg" />
                <Input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => handleFirstNameChange(e.target.value)}
                  onBlur={() => handleBlur('firstName')}
                  className="relative flex-1 mt-[-2.00px] border-0 bg-transparent p-0 h-auto [font-family:'Open_Sans',Helvetica] font-semibold text-xs tracking-[0] leading-[normal] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-500"
                  style={{ 
                    color: colors.text,
                    '--placeholder-color': colors.textSecondary 
                  } as React.CSSProperties}
                />
              </div>
              {fieldErrors.firstName && touched.firstName && (
                <p className="absolute -bottom-5 left-2 text-red-500 text-[9px] [font-family:'Open_Sans',Helvetica] font-normal">
                  {fieldErrors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="relative w-[246px]">
              <div 
                className={`relative w-[246px] h-10 flex items-center gap-2 pl-3.5 pr-5 py-3 rounded-[28px] border-2 border-solid shadow-[4.69px_4.69px_7.03px_#00000026] transition-all duration-500 ${
                  fieldErrors.lastName && touched.lastName ? 'border-red-500' : ''
                }`}
                style={{ 
                  borderColor: fieldErrors.lastName && touched.lastName ? '#ef4444' : colors.border,
                  backgroundColor: colors.cardBg 
                }}
              >
                <img className="relative w-5 h-5 mt-[-2.00px] mb-[-2.00px]" alt="User" src="res://icons/user-right-01.svg" />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => handleLastNameChange(e.target.value)}
                  onBlur={() => handleBlur('lastName')}
                  className="relative flex-1 mt-[-2.00px] border-0 bg-transparent p-0 h-auto [font-family:'Open_Sans',Helvetica] font-semibold text-xs tracking-[0] leading-[normal] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-500"
                  style={{ 
                    color: colors.text,
                    '--placeholder-color': colors.textSecondary 
                  } as React.CSSProperties}
                />
              </div>
              {fieldErrors.lastName && touched.lastName && (
                <p className="absolute -bottom-5 left-2 text-red-500 text-[9px] [font-family:'Open_Sans',Helvetica] font-normal">
                  {fieldErrors.lastName}
                </p>
              )}
            </div>

            {/* Department */}
            <div 
              className="relative w-[246px] h-10 flex items-center gap-2 pl-3.5 pr-5 py-3 rounded-[28px] border-2 border-solid shadow-[4.69px_4.69px_7.03px_#00000026] transition-all duration-500"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.cardBg 
              }}
            >
              <img className="relative w-5 h-5 mt-[-2.00px] mb-[-2.00px]" alt="Department" src="res://icons/frame-3.svg" />
              <Input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="relative flex-1 mt-[-2.00px] border-0 bg-transparent p-0 h-auto [font-family:'Open_Sans',Helvetica] font-semibold text-xs tracking-[0] leading-[normal] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-500"
                style={{ 
                  color: colors.text,
                  '--placeholder-color': colors.textSecondary 
                } as React.CSSProperties}
              />
            </div>

            {/* Role Selection */}
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger 
                className="relative w-[246px] h-10 flex items-center gap-2 pl-3.5 pr-5 py-3 rounded-[28px] border-2 border-solid shadow-[4.69px_4.69px_7.03px_#00000026] bg-transparent [&>svg]:hidden transition-all duration-500"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.cardBg 
                }}
              >
                <img className="relative w-5 h-5 mt-[-2.00px] mb-[-2.00px]" alt="Role" src="res://icons/frame-5.svg" />
                <span 
                  className="relative flex-1 mt-[-2.00px] [font-family:'Open_Sans',Helvetica] font-semibold text-xs tracking-[0] leading-[normal] text-left transition-colors duration-500"
                  style={{ color: colors.text }}
                >
                  <SelectValue placeholder="Select Role" />
                </span>
                <ChevronDownIcon 
                  className="relative w-[10.94px] h-[6.05px] mr-[-0.59px] transition-colors duration-500"
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
                  value="employee" 
                  className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs transition-colors duration-300"
                  style={{ 
                    color: colors.text,
                    '--hover-bg': colors.buttonHover 
                  } as React.CSSProperties}
                >
                  Employee
                </SelectItem>
                <SelectItem 
                  value="manager" 
                  className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs transition-colors duration-300"
                  style={{ 
                    color: colors.text,
                    '--hover-bg': colors.buttonHover 
                  } as React.CSSProperties}
                >
                  Manager
                </SelectItem>
                <SelectItem 
                  value="supervisor" 
                  className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs transition-colors duration-300"
                  style={{ 
                    color: colors.text,
                    '--hover-bg': colors.buttonHover 
                  } as React.CSSProperties}
                >
                  Supervisor
                </SelectItem>
                <SelectItem 
                  value="team-lead" 
                  className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs transition-colors duration-300"
                  style={{ 
                    color: colors.text,
                    '--hover-bg': colors.buttonHover 
                  } as React.CSSProperties}
                >
                  Team Lead
                </SelectItem>
                <SelectItem 
                  value="developer" 
                  className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs transition-colors duration-300"
                  style={{ 
                    color: colors.text,
                    '--hover-bg': colors.buttonHover 
                  } as React.CSSProperties}
                >
                  Developer
                </SelectItem>
                <SelectItem 
                  value="designer" 
                  className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs transition-colors duration-300"
                  style={{ 
                    color: colors.text,
                    '--hover-bg': colors.buttonHover 
                  } as React.CSSProperties}
                >
                  Designer
                </SelectItem>
                <SelectItem 
                  value="analyst" 
                  className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs transition-colors duration-300"
                  style={{ 
                    color: colors.text,
                    '--hover-bg': colors.buttonHover 
                  } as React.CSSProperties}
                >
                  Analyst
                </SelectItem>
                <SelectItem 
                  value="admin" 
                  className="[font-family:'Open_Sans',Helvetica] font-semibold text-xs transition-colors duration-300"
                  style={{ 
                    color: colors.text,
                    '--hover-bg': colors.buttonHover 
                  } as React.CSSProperties}
                >
                  Administrator
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative self-stretch w-full h-[67px]">
            <div className="grid grid-cols-2 grid-rows-[minmax(0,1fr)] w-[506px] gap-x-3.5 gap-y-8 absolute top-[27px] left-[calc(50.00%_-_253px)]">
              {/* Email */}
              <div className="relative w-full">
                <div 
                  className={`relative w-full h-10 flex items-center gap-2 pl-3.5 pr-5 py-3 rounded-[28px] border-2 border-solid shadow-[4.69px_4.69px_7.03px_#00000026] transition-all duration-500 ${
                    fieldErrors.email && touched.email ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    borderColor: fieldErrors.email && touched.email ? '#ef4444' : colors.border,
                    backgroundColor: colors.cardBg 
                  }}
                >
                  <img className="relative w-5 h-5 mt-[-2.00px] mb-[-2.00px]" alt="Mail" src="res://icons/mail-01.svg" />
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className="relative flex-1 mt-[-2.00px] border-0 bg-transparent p-0 h-auto [font-family:'Open_Sans',Helvetica] font-semibold text-xs tracking-[0] leading-[normal] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-500"
                    style={{ 
                      color: colors.text,
                      '--placeholder-color': colors.textSecondary 
                    } as React.CSSProperties}
                  />
                </div>
                {fieldErrors.email && touched.email && (
                  <p className="absolute -bottom-5 left-2 text-red-500 text-[9px] [font-family:'Open_Sans',Helvetica] font-normal">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="relative w-full">
                <div 
                  className={`relative w-full h-10 flex items-center gap-2 pl-3.5 pr-5 py-3 rounded-[28px] border-2 border-solid shadow-[4.69px_4.69px_7.03px_#00000026] transition-all duration-500 ${
                    fieldErrors.phone && touched.phone ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    borderColor: fieldErrors.phone && touched.phone ? '#ef4444' : colors.border,
                    backgroundColor: colors.cardBg 
                  }}
                >
                  <img className="relative w-5 h-5 mt-[-2.00px] mb-[-2.00px]" alt="Phone" src="res://icons/frame-6.svg" />
                  <Input
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    className="relative flex-1 mt-[-2.00px] border-0 bg-transparent p-0 h-auto [font-family:'Open_Sans',Helvetica] font-semibold text-xs tracking-[0] leading-[normal] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-500"
                    style={{ 
                      color: colors.text,
                      '--placeholder-color': colors.textSecondary 
                    } as React.CSSProperties}
                  />
                </div>
                {fieldErrors.phone && touched.phone && (
                  <p className="absolute -bottom-5 left-2 text-red-500 text-[9px] [font-family:'Open_Sans',Helvetica] font-normal">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>
            </div>

            <div 
              className="absolute top-0 left-[calc(50.00%_-_253px)] h-[19px] flex items-center justify-center [font-family:'Open_Sans',Helvetica] font-normal text-sm tracking-[0] leading-[normal] transition-colors duration-500"
              style={{ color: colors.textSecondary }}
            >
              Optional information can be filled later
            </div>
          </div>
        </div>

        <img
          className="absolute top-[21px] left-[calc(50.00%_-_86px)] w-[175px] h-[115px] object-cover pointer-events-none"
          alt="Logo light"
          src="res://icons/logo-light.png"
        />

        <img
          className="absolute top-[151px] left-[calc(50.00%_-_100px)] w-[202px] h-[27px] object-cover pointer-events-none"
          alt="Name light"
          src="res://icons/name-light.png"
        />

        <div 
          onClick={() => {
            console.log("=== SIGNUP BUTTON DEBUG ===");
            console.log("Form valid:", isFormValid());
            console.log("Loading:", loading);
            console.log("Button disabled:", loading || !isFormValid());
            console.log("Username:", username, "- Valid:", validateUsername(username) === "");
            console.log("Password:", password.replace(/./g, '*'), "- Valid:", validatePassword(password) === "");
            console.log("First Name:", firstName, "- Valid:", validateName(firstName, "First name") === "");
            console.log("Last Name:", lastName, "- Valid:", validateName(lastName, "Last name") === "");
            console.log("Email:", email, "- Valid:", validateEmail(email) === "");
            console.log("Phone:", phone, "- Valid:", validatePhone(phone) === "");
            console.log("Agree to policy:", agreeToPolicy);
            console.log("=========================");
          }}
          className="absolute top-[620px] left-[calc(50.00%_-_14px)] w-[264px] h-12 z-10"
        >
          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSignup();
            }}
            disabled={loading || !isFormValid()}
            className="w-full h-full flex justify-center rounded-[28px] border-2 border-solid shadow-[4.69px_4.69px_7.03px_#00000026] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-500"
            style={{ 
              borderColor: colors.border,
              background: colors.buttonBg,
              color: colors.buttonText 
            }}
          >
            <div 
              className="flex items-center justify-center w-[119.53px] h-[30.47px] relative [text-shadow:0px_4px_4px_#00000040] [font-family:'Open_Sans',Helvetica] font-normal text-[17.6px] text-center tracking-[0] leading-[normal] transition-colors duration-500"
              style={{ color: colors.buttonText }}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </div>
          </Button>
        </div>

        <div className="inline-flex items-center gap-[7px] absolute top-[685px] left-[calc(50.00%_-_14px)]">
          <div 
            className="relative w-fit [font-family:'Open_Sans',Helvetica] font-semibold text-[11.7px] tracking-[0] leading-[normal] transition-colors duration-500"
            style={{ color: colors.textSecondary }}
          >
            Already have an account?
          </div>

          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // console.log("Login button clicked!");
              navigate("/login");
            }}
            className="flex w-[115px] h-6 items-center justify-center relative rounded-xl border-2 border-solid hover:opacity-90 cursor-pointer z-10 transition-all duration-500"
            style={{ 
              borderColor: colors.border,
              background: colors.buttonBg,
              color: colors.buttonText 
            }}
          >
            Login
          </Button>
          
        </div>

        <div className="inline-flex items-end gap-3 absolute top-[578px] left-[60px]">
          <Checkbox
            checked={agreeToPolicy}
            onCheckedChange={(checked) => setAgreeToPolicy(checked as boolean)}
            className="w-5 h-5 transition-all duration-500"
            style={{ 
              borderColor: colors.border,
              '--checkbox-bg': colors.buttonBg,
              '--checkbox-text': colors.buttonText 
            } as React.CSSProperties}
          />

          <div className="relative w-[490px] h-[18px]">
            <div 
              className="absolute top-0 left-0 [font-family:'Montserrat',Helvetica] font-normal text-xs tracking-[0] leading-[normal] flex items-center gap-2 transition-colors duration-500"
              style={{ color: colors.textSecondary }}
            >
            <Checkbox
              checked={agreeToPolicy}
              onCheckedChange={(checked) => setAgreeToPolicy(checked as boolean)}
              className="w-5 h-5 transition-all duration-500"
              style={{ 
                borderColor: colors.border,
                '--checkbox-bg': colors.buttonBg,
                '--checkbox-text': colors.buttonText 
              } as React.CSSProperties}
            />
              <span 
                className="font-medium transition-colors duration-500"
                style={{ color: colors.textSecondary }}
              >
                I agree with NeuroX-TMAX Z use my data in{" "}
              </span>
              <span 
                className="[font-family:'Open_Sans',Helvetica] font-semibold transition-colors duration-500"
                style={{ color: colors.textSecondary }}
              >
                Privacy and Policy.
              </span>
            </div>

            <img
              className="absolute top-[17px] left-[268px] w-[105px] h-px object-cover"
              alt="Line"
              src="res://icons/line-612.svg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpLightMode;

