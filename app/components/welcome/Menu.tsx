// MenuPage.tsx
import React from "react";
import { Button } from "../../components/ui/button";
import { Slider } from "../../components/ui/slider";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/lib/theme-context";

type MenuItem = {
  id: "neurostat" | "neurobase" | "neuropacks" | "neurolab" | "neurotools" | "neurocontrol" | "neuroalerte";
  icon: string;
  label: string | [string, string];
  size: "large" | "medium";
  position: string; // e.g., "top-64 left-[396px]"
};

const menuItems: MenuItem[] = [
  { id: "neurostat",   icon: "res://icons/icon-1.svg",   label: "NEUROSTAT",        size: "medium", position: "top-[374px] left-[156px]" },
  { id: "neurobase",   icon: "res://icons/icon-3.svg",   label: "NEUROBASE",        size: "large",  position: "top-64 left-[396px]" },
  { id: "neuropacks",  icon: "res://icons/union.svg",    label: "NEUROPACKS",       size: "large",  position: "top-64 left-[747px]" },
  { id: "neurolab",    icon: "res://icons/icon-2.svg",   label: "NEUROLAB",         size: "medium", position: "top-[374px] left-[1087px]" },
  { id: "neurotools",  icon: "res://icons/icon-4.svg",   label: "NEUROTOOLS",       size: "medium", position: "top-[596px] left-[336px]" },
  { id: "neurocontrol",icon: "res://icons/icon-5.svg",   label: ["NEURO","CONTROL"],size: "medium", position: "top-[622px] left-[620px]" },
  { id: "neuroalerte", icon: "res://icons/icon.svg",     label: ["NEURO","ALERTE"], size: "medium", position: "top-[596px] left-[901px]" },
];

// id -> route path
const ROUTES: Record<MenuItem["id"], string> = {
  neurobase:   "/neurobase",
  neuropacks:  "/neuropacks",
  neurolab:    "/neurolab",
  neurostat:   "/neurostat",
  neurotools:  "/neurotools",
  neurocontrol:"/neurocontrol",
  neuroalerte: "/neuroalerte",
};

export const CircularButton: React.FC<{ item: MenuItem; onClick: (id: MenuItem["id"]) => void }> = ({ item, onClick }) => {
  const { colors } = useTheme();
  const isLarge = item.size === "large";

  const OUTER_W = isLarge ? 300 : 200;
  const MID_W   = isLarge ? 276 : 184;

  const iconSize  = isLarge ? "w-[102px] h-[102px]" : "w-[62px] h-[62px]";
  const fontSize  = isLarge ? "text-[length:var(--h6-font-size)]" : "text-[length:var(--p3-bold-font-size)]";
  const lineH     = isLarge ? "leading-[var(--h6-line-height)]"   : "leading-[var(--p3-bold-line-height)]";
  const fontFam   = isLarge ? "font-h6" : "font-p3-bold";

  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      className={`group cursor-pointer absolute ${item.position} flex items-center justify-center
                  w-[${OUTER_W}px] h-[${OUTER_W}px] rounded-full isolate select-none
                  bg-[radial-gradient(120%_120%_at_30%_20%,#e9d6b0_0%,#caa964_22%,#9b6c2e_60%,#5a3c1c_100%)]
                  shadow-[inset_0_0_${isLarge ? "82.5px" : "55px"}_#f2f2f280,
                           inset_8px_8px_4px_-8px_#b3b3b3,
                           inset_-48px_-48px_24px_-56px_#b3b3b3,
                           inset_64px_64px_36px_-72px_#ffffff]
                  transition-transform duration-200 active:scale-[0.985]`}
      aria-label={typeof item.label === "string" ? item.label : item.label.join(" ")}
    >
      {/* decorative layers must not block clicks */}
      <span className="pointer-events-none absolute inset-[-6px] rounded-full
                       bg-[radial-gradient(80%_80%_at_30%_20%,#ffd88a_0%,#f5e7ba_15%,transparent_55%)]
                       opacity-70 blur-[2px]" />
      <span className="pointer-events-none absolute inset-0 rounded-full
                       [mask:conic-gradient(from_230deg,transparent_0,transparent_82%,white_85%,transparent_88%,transparent_100%)]
                       bg-[radial-gradient(85%_85%_at_25%_20%,#fff8d0_0%,#ffffffa8_12%,transparent_45%)]
                       opacity-90" />

      <span
        className="relative rounded-full overflow-hidden"
        style={{
          width: MID_W,
          height: MID_W,
          background:
            "conic-gradient(from 210deg at 50% 50%, rgba(249,235,203,0.35), rgba(176,132,73,0.45), rgba(110,77,36,0.55), rgba(249,235,203,0.35))",
          boxShadow:
            "inset 0 1px 2px rgba(255,255,255,0.35), inset 0 -10px 16px rgba(89,60,28,0.5)"
        }}
      >
        <span
          className="absolute inset-[13px] rounded-full overflow-hidden shadow-[inset_0_14px_21px_#ffffff99]"
          style={{
            background:
              "radial-gradient(120% 120% at 30% 20%, #f1e6d6 0%, #cdb196 22%, #a98567 60%, #7a593f 100%)"
          }}
        >
          <span className="pointer-events-none absolute inset-0 rounded-full
                           [mask:radial-gradient(circle_at_50%_50%,transparent_0,transparent_calc(50%-2px),white_calc(50%-2px),white_calc(50%+2px),transparent_calc(50%+2px))]
                           bg-[radial-gradient(120%_120%_at_25%_20%,#ffffff,transparent_60%)]
                           opacity-70" />

          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%]
                           flex flex-col items-center gap-3 w-[168px] pointer-events-none">
            <img className={`block ${iconSize}`} src={item.icon} alt="" />
            {Array.isArray(item.label) ? (
              <span 
                className="text-center font-p3-bold leading-[var(--p3-bold-line-height)] transition-colors duration-500"
                style={{ color: colors.text }}
              >
                <span className="block">{item.label[0]}</span>
                <span className="block">{item.label[1]}</span>
              </span>
            ) : (
              <span
                className={`text-center ${fontFam} ${fontSize} ${lineH}
                            tracking-[var(--h6-letter-spacing)] [font-style:var(--h6-font-style)]
                            [-webkit-text-stroke:1px_transparent]
                            bg-[linear-gradient(360deg,rgba(254,230,155,1)_0%,rgba(254,230,155,0)_100%)_1]
                            [-webkit-background-clip:text] transition-opacity duration-500`}
                style={{ color: colors.text }}
              >
                {item.label}
              </span>
            )}
          </span>
        </span>
      </span>
      <span className="pointer-events-none absolute inset-[18px] rounded-full opacity-0
                       group-hover:opacity-60 transition-opacity
                       bg-[radial-gradient(70%_70%_at_30%_25%,#fff7d0_0%,transparent_70%)]" />
    </button>
  );
};

export const MenuPage: React.FC = () => {
  const { theme, setTheme, colors } = useTheme();
  const navigate = useNavigate();
  const [brightness, setBrightness] = React.useState([100]);

  // Apply brightness effect
  React.useEffect(() => {
    const brightnessValue = brightness[0] / 100; // Convert to 0-1 range
    document.documentElement.style.setProperty('filter', `brightness(${brightnessValue})`);
    
    // Cleanup on unmount
    return () => {
      document.documentElement.style.setProperty('filter', 'brightness(1)');
    };
  }, [brightness]);

  const handleClick = (id: MenuItem["id"]) => {
    const path = ROUTES[id] || "/";
    navigate(path);
  };

  // Cycle through themes: light → balance → dark → light
  const cycleTheme = () => {
    const themeOrder: Array<typeof theme> = ['light', 'balance', 'dark'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  return (
    <main 
      className="relative w-[1440px] h-[1024px] transition-colors duration-500"
      style={{ backgroundColor: colors.background }}
    >
      <img
        className="absolute top-[calc(50%-512px)] left-[calc(50%-720px)] w-[1440px] h-[1024px] object-cover transition-all duration-500"
        alt="bg"
        src="res://icons/image-65.png"
        style={{
          filter: theme === 'light' 
            ? 'brightness(1.2) saturate(1.1) hue-rotate(0deg)' 
            : theme === 'balance' 
              ? 'brightness(0.9) saturate(0.8) hue-rotate(10deg) sepia(0.1)' 
              : 'brightness(0.6) saturate(0.6) hue-rotate(20deg) sepia(0.3) contrast(1.2)'
        }}
      />

      {menuItems.map((it) => (
        <CircularButton key={it.id} item={it} onClick={handleClick} />
      ))}

      <h1 
        className="absolute w-[65.97%] h-[6.25%] top-[6.93%] left-[17.01%] flex items-center justify-center
                   [-webkit-text-stroke:1px_transparent]
                   bg-[linear-gradient(180deg,rgba(252,246,209,1)_0%,rgba(189,148,87,1)_10%,rgba(227,202,137,1)_25%,rgba(254,232,200,1)_78%,rgba(77,58,26,1)_100%)_1]
                   [-webkit-background-clip:text] font-h1 text-[length:var(--h1-font-size)] tracking-[var(--h1-letter-spacing)] leading-[var(--h1-line-height)] whitespace-nowrap transition-colors duration-500"
        style={{ color: colors.text }}
      >
        BIENVENUE DANS L&apos;UNIVERS NEUROCORE
      </h1>

      <div className="absolute top-11 left-11 w-[120px] h-[120px] bg-[url(/logo-light-1.png)] bg-no-repeat bg-contain" />

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-16 left-[1306px] w-20 h-20 p-0"
        onClick={() => navigate("/")}
      >
        <img className="w-20 h-20" alt="Back" src="res://icons/button-1.svg" />
      </Button>

      {/* Bottom controls */}
      <div className="inline-flex items-center gap-4 absolute top-[350px] right-16 z-10">
        <div className="inline-flex flex-col items-start gap-2">
          <div 
            className="font-p3-bold text-[length:var(--p3-bold-font-size)] leading-[var(--p3-bold-line-height)] transition-colors duration-500"
            style={{ color: colors.text }}
          >
            Luminosité de la page
          </div>
          <div 
            className="w-[241px] h-10 flex items-center px-3 py-2 rounded-[20px] border-2 transition-all duration-500"
            style={{ 
              borderColor: colors.border,
              backgroundColor: `${colors.cardBg}80` 
            }}
          >
            <Slider
              value={brightness}
              onValueChange={setBrightness}
              min={20}
              max={150}
              step={1}
              className="w-full"
            />
            <div 
              className="ml-2 min-w-[32px] text-right font-semibold text-xs transition-colors duration-500"
              style={{ color: colors.text }}
            >
              {brightness[0]}%
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={cycleTheme}
          className="w-20 h-20 p-0 hover:bg-transparent
                     transition-all duration-300 hover:scale-110 active:scale-105
                     hover:drop-shadow-[0_0_20px_rgba(255,220,150,0.5)]"
          title={`Current: ${theme.toUpperCase()} - Click to change theme`}
        >
          <img 
            className="w-20 h-20 transition-all duration-300" 
            alt="Change Theme" 
            src={`res://icons/theme_${theme}.svg`}
            key={theme}
          />
        </Button>
      </div>
    </main>
  );
};
