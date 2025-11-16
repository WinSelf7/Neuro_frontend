import React from "react";
import { Button } from "../../components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useNavigate } from "react-router-dom";
import { useTheme, type ThemeMode } from "@/lib/theme-context";

const themeOptions = [
  { value: "light" as ThemeMode, label: "LIGHT" },
  { value: "balance" as ThemeMode, label: "BALANCE" },
  { value: "dark" as ThemeMode, label: "DARK" },
];

const animationOptions = [
  { value: "on", label: "ON" },
  { value: "off", label: "OFF" },
];

// --- Minimal auth check (customize keys to your app) ---
const isAuthenticated = (): boolean => {
  try {
    const token = localStorage.getItem("authToken");        // e.g., JWT
    const userStr = localStorage.getItem("user");           // e.g., {"id": "...", "email": "..."}
    if (token && token.trim() !== "") return true;
    if (userStr) {
      const user = JSON.parse(userStr);
      return Boolean(user && (user.id || user.email || user.sub));
    }
  } catch {
    /* ignore parse errors */
  }
  return false;
};

export const WelcomingPage = () => {
  const { theme, setTheme, colors } = useTheme();
  const [animation, setAnimation] = React.useState(() => {
    return localStorage.getItem("appAnimation") || "on";
  });
  const navigate = useNavigate();

  React.useEffect(() => {
    localStorage.setItem("appAnimation", animation);
  }, [animation]);

  const handleExplore = () => {
    if (isAuthenticated()) {
      navigate("/menu");
    } else {
      // Optionally remember where the user wanted to go
      sessionStorage.setItem("postLoginRedirect", "/menu");
      navigate("/login");
    }
  };

  return (
    <main 
      className="w-screen h-screen flex items-center justify-center overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: colors.background }}
    >
      {/* Fixed design canvas */}
      <div className="relative" style={{ width: 1440, height: 1024 }}>
        {/* LEFT COLUMN */}
        <section className="flex flex-col w-[515px] items-center gap-8 absolute top-[calc(50%_-_223px)] left-[137px]">
          <div className="relative w-[300px] h-[300px] bg-[url(res://icons/logo-light-1.png)] bg-no-repeat bg-contain bg-center" />
          <div className="flex flex-col items-center text-center gap-2 w-full">
            <h1 
              className="text-2xl font-bold transition-colors duration-500"
              style={{ color: colors.text }}
            >
              Votre gestion, notre intelligence
            </h1>
            <p 
              className="text-xl font-normal transition-colors duration-500"
              style={{ color: colors.textSecondary }}
            >
              Une intelligence discrete pour une experience digitale sobre,
              elegante et sans limites
            </p>
          </div>
        </section>

        {/* HERO IMAGE — absolute, not sticky, with left offset */}
        <img
          className="absolute top-32 left-[267px] -translate-x-[-200px] w-[1173px] h-[896px] object-cover"
          alt="Image"
          src="res://icons/image-49--1-.png"
        />

        {/* THEME */}
        <div className="inline-flex items-center gap-4 absolute bottom-[170px] left-[137px]">
          <span 
            className="relative flex items-center justify-center w-fit font-bold font-[number:var(--p3-bold-font-weight)] text-[length:var(--p3-bold-font-size)] text-center tracking-[var(--p3-bold-letter-spacing)] leading-[var(--p3-bold-line-height)] [font-style:var(--p3-bold-font-style)] transition-colors duration-500"
            style={{ color: colors.text }}
          >
            THEME:
          </span>

          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={(value) => value && setTheme(value as ThemeMode)}
            className="inline-flex items-center px-1.5 py-1 relative flex-[0_0_auto] rounded-[99px] transition-all duration-500"
            style={{ background: colors.gradient }}
          >
            {themeOptions.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="inline-flex items-center justify-center gap-2.5 px-4 py-2 relative flex-[0_0_auto] rounded-full transition-all duration-300 data-[state=off]:bg-transparent"
                style={{
                  background: theme === option.value ? colors.buttonBg : 'transparent'
                }}
              >
                <span 
                  className="mt-[-1.00px] text-[length:var(--p3-bold-font-size)] leading-[var(--p3-bold-line-height)] relative flex items-center justify-center w-fit font-p3-bold font-[number:var(--p3-bold-font-weight)] tracking-[var(--p3-bold-letter-spacing)] [font-style:var(--p3-bold-font-style)]"
                  style={{ color: colors.buttonText }}
                >
                  {option.label}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* ANIMATION */}
        <div className="inline-flex items-center gap-4 absolute bottom-[100px] left-[100px]">
          <span 
            className="relative flex items-center justify-center w-fit font-bold font-[number:var(--p3-bold-font-weight)] text-[length:var(--p3-bold-font-size)] text-center tracking-[var(--p3-bold-letter-spacing)] leading-[var(--p3-bold-line-height)] [font-style:var(--p3-bold-font-style)] transition-colors duration-500"
            style={{ color: colors.text }}
          >
            ANIMATION:
          </span>

          <ToggleGroup
            type="single"
            value={animation}
            onValueChange={(value) => value && setAnimation(value)}
            className="inline-flex items-center px-1.5 py-1 relative flex-[0_0_auto] rounded-[99px] transition-all duration-500"
            style={{ background: colors.gradient }}
          >
            {animationOptions.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="inline-flex items-center justify-center gap-2.5 px-4 py-2 relative flex-[0_0_auto] rounded-full transition-all duration-300 data-[state=off]:bg-transparent"
                style={{
                  background: animation === option.value ? colors.buttonBg : 'transparent'
                }}
              >
                <span 
                  className="mt-[-1.00px] text-[length:var(--p3-bold-font-size)] leading-[var(--p3-bold-line-height)] relative flex items-center justify-center w-fit font-p3-bold font-[number:var(--p3-bold-font-weight)] tracking-[var(--p3-bold-letter-spacing)] [font-style:var(--p3-bold-font-style)]"
                  style={{ color: colors.buttonText }}
                >
                  {option.label}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* EXPLORE */}
        <Button
          onClick={handleExplore}
          className="inline-flex items-center justify-center gap-2.5 px-12 py-5 absolute bottom-[100px] left-[970px] rounded-[99px] border-0 h-auto hover:opacity-90 transition-all duration-300"
          style={{ background: colors.buttonBg }}
        >
          <span 
            className="mt-[-2px] text-[length:var(--h6-font-size)] text-center leading-[var(--h6-line-height)] whitespace-nowrap flex items-center justify-center font-h6"
            style={{ color: colors.buttonText }}
          >
            EXPLORER
          </span>
        </Button>
      </div>
    </main>
  );
};
