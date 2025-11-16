import React from "react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/lib/theme-context";

const menuItems = [
  {
    id: "colis",
    position: "top-[11.90%] left-[64.29%]",
    icon: "res://icons/icon-3.svg",
    title: "COLIS",
    subtitle: "& COURRIERS",
    backgroundImage: "res://icons/button-background.png",
  },
  {
    id: "agenda",
    position: "top-[64.29%] left-[64.29%]",
    icon: "res://icons/union.svg",
    title: "AGENDA",
    subtitle: "& RENDEZ-VOUS",
    backgroundImage: "res://icons/button-background-1.png",
    subtitleMultiline: true,
  },
  {
    id: "emails",
    position: "top-[11.90%] left-[11.90%]",
    icon: "res://icons/icon-2.svg",
    title: "EMAILS",
    subtitle: "& MESSAGERIE",
    backgroundImage: "res://icons/button-background-2.png",
  },
  {
    id: "commandes",
    position: "top-[64.29%] left-[11.90%]",
    icon: "res://icons/icon-1.svg",
    title: "COMMANDES",
    subtitle: "& STOCKS",
    backgroundImage: "res://icons/button-background-3.png",
  },
  {
    id: "accueil",
    position: "top-[38.10%] left-0",
    icon: "res://icons/icon.svg",
    title: "ACCUEIL",
    subtitle: "VISITEURS",
    backgroundImage: "res://icons/button-background-4.png",
  },
  {
    id: "reunions",
    position: "top-[38.10%] left-[76.19%]",
    icon: "res://icons/icon-5.svg",
    title: "REUNIONS",
    subtitle: "& SALLES",
    backgroundImage: "res://icons/button-background-5.png",
  },
  {
    id: "telephone",
    position: "top-[calc(50.00%_-_420px)] left-[calc(50.00%_-_100px)]",
    icon: "res://icons/icon-4.svg",
    title: "TÉLÉPHONE",
    subtitle: "& STANDARD",
    backgroundImage: "res://icons/button-background-6.png",
  },
  {
    id: "archives",
    position: "top-[calc(50.00%_+_220px)] left-[calc(50.00%_-_100px)]",
    icon: "res://icons/union-1.svg",
    title: "ARCHIVES",
    subtitle: null,
    backgroundImage: "res://icons/button-background-7.png",
  },
];

export const Neurobase = () => {
  const { theme, setTheme, colors } = useTheme();
  const [brightness, setBrightness] = React.useState([100]);
  const navigate = useNavigate();

  // Apply brightness effect
  React.useEffect(() => {
    const brightnessValue = brightness[0] / 100;
    document.documentElement.style.setProperty('filter', `brightness(${brightnessValue})`);
    
    return () => {
      document.documentElement.style.setProperty('filter', 'brightness(1)');
    };
  }, [brightness]);

  // Cycle through themes
  const cycleTheme = () => {
    const themeOrder: Array<typeof theme> = ['light', 'balance', 'dark'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  return (
    <main 
      className="relative w-full min-h-screen transition-colors duration-500"
      style={{ backgroundColor: colors.background }}
    >
      <img
        className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
        alt="Background"
        src="res://icons/background.png"
        style={{
          filter: theme === 'light' 
            ? 'brightness(1.2) saturate(1.1) hue-rotate(0deg)' 
            : theme === 'balance' 
              ? 'brightness(0.9) saturate(0.8) hue-rotate(10deg) sepia(0.1)' 
              : 'brightness(0.6) saturate(0.6) hue-rotate(20deg) sepia(0.3) contrast(1.2)'
        }}
      />

      <header className="relative flex items-center justify-between p-11">
       <div className="absolute top-11 left-11 w-[120px] h-[120px] bg-[url(res://icons/logo-light-1.png)] bg-no-repeat bg-contain" />

        <h1 
          className="absolute left-1/2 top-[71px] -translate-x-1/2 [-webkit-text-stroke:1px_transparent] bg-[linear-gradient(180deg,rgba(252,246,209,1)_0%,rgba(189,148,87,1)_10%,rgba(227,202,137,1)_25%,rgba(254,232,200,1)_78%,rgba(77,58,26,1)_100%)_1] [-webkit-background-clip:text] font-h1 font-[number:var(--h1-font-weight)] text-[length:var(--h1-font-size)] text-center tracking-[var(--h1-letter-spacing)] leading-[var(--h1-line-height)] whitespace-nowrap [font-style:var(--h1-font-style)] transition-colors duration-500"
          style={{ color: colors.text }}
        >
          NEUROBASE
        </h1>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-10 w-20 h-20 p-0 right-16 hover:bg-transparent transition-all duration-300 hover:scale-110 active:scale-105"
          aria-label="User settings"
          onClick={() => navigate("/")}
        >
          <img className="w-20 h-20" alt="Button" src="res://icons/button-1.svg" />
        </Button>
      </header>

      <nav className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[840px] h-[840px]">
        {menuItems.map((item) => (
         
            <Button
              type="button"
              // onClick={onClick}
              variant="ghost"
              aria-label={`${item.title}${item.subtitle ? " " + item.subtitle : ""}`}
              className={`absolute ${item.position} p-0 hover:bg-transparent group
                          w-[232px] h-[232px] rounded-full isolate`}
            >
          {/* Optional decorative bg (paper color) */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {item.backgroundImage && (
              <img
                src={item.backgroundImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            )}
          </div>

      {/* GOLD RIM (outer medal) */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background:
            "radial-gradient(120% 120% at 30% 20%, #e9d6b0 0%, #caa964 22%, #9b6c2e 60%, #5a3c1c 100%)",
          boxShadow:
            "inset 0 0 55px rgba(242,242,242,0.5), inset 5px 5px 2.5px -5px #b3b3b3, inset -30px -30px 15px -35px #b3b3b3, inset 40px 40px 22.5px -45px #ffffff",
          filter: "saturate(1.02)"
        }}
      />

      {/* soft outside glow & hot arc highlight (won't block clicks) */}
      <span className="pointer-events-none absolute inset-[-5px] rounded-full opacity-70 blur-[1.5px]
                       bg-[radial-gradient(80%_80%_at_30%_20%,#ffd88a_0%,#f5e7ba_15%,transparent_55%)]" />
      <span className="pointer-events-none absolute inset-0 rounded-full opacity-90
                       [mask:conic-gradient(from_230deg,transparent_0,transparent_82%,white_85%,transparent_88%,transparent_100%)]
                       bg-[radial-gradient(85%_85%_at_25%_20%,#fff8d0_0%,#ffffffa8_12%,transparent_45%)]" />

      {/* METAL BAND (inner ring) */}
      <div
        className="absolute inset-[8px] rounded-full overflow-hidden"
        style={{
          background:
            "conic-gradient(from 210deg at 50% 50%, rgba(249,235,203,0.35), rgba(176,132,73,0.45), rgba(110,77,36,0.55), rgba(249,235,203,0.35))",
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.35), inset 0 -10px 16px rgba(89,60,28,0.5)"
        }}
      />

      {/* INNER DISC (bevel + specular ring) */}
      <div
        className="absolute inset-[22px] rounded-full overflow-hidden shadow-[inset_0_9px_14px_#ffffff99]"
        style={{
          background:
            "radial-gradient(120% 120% at 30% 20%, #f1e6d6 0%, #cdb196 22%, #a98567 60%, #7a593f 100%)"
        }}
      >
        {/* thin specular ring */}
        <span className="pointer-events-none absolute inset-0 rounded-full opacity-70
                         [mask:radial-gradient(circle_at_50%_50%,transparent_0,transparent_calc(50%-2px),white_calc(50%-2px),white_calc(50%+2px),transparent_calc(50%+2px))]
                         bg-[radial-gradient(120%_120%_at_25%_20%,#ffffff,transparent_60%)]" />
      </div>

      {/* CONTENT (icon + texts) */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%] w-[168px] flex flex-col items-center gap-2">
        {/* icon */}
        <div className="w-[62px] h-[62px] flex items-center justify-center">
          <img src={item.icon} alt="" className="max-w-full max-h-full" />
        </div>

        {/* title - with theme-aware color */}
        <div 
          className="w-fit [-webkit-text-stroke:0.74px_transparent]
                      bg-[linear-gradient(360deg,rgba(254,230,155,1)_0%,rgba(254,230,155,0)_100%)_1]
                      [-webkit-background-clip:text]
                      text-[length:var(--p1-bold-font-size)] leading-[var(--p1-bold-line-height)]
                      font-p1-bold text-center tracking-[var(--p1-bold-letter-spacing)] transition-colors duration-500"
          style={{ color: colors.text }}
        >
          {item.title}
        </div>

        {/* subtitle - with theme-aware color */}
        {item.subtitle && (
          item.subtitleMultiline ? (
            <div className="flex flex-col items-center -mt-0.5">
              {/* example split; adjust as needed */}
              <div 
                className="w-fit [-webkit-text-stroke:0.74px_transparent]
                            bg-[linear-gradient(360deg,rgba(254,230,155,1)_0%,rgba(254,230,155,0)_100%)_1]
                            [-webkit-background-clip:text]
                            text-[length:var(--caption-1-bold-font-size)] leading-[var(--caption-1-bold-line-height)]
                            font-caption-1-bold tracking-[var(--caption-1-bold-letter-spacing)] transition-colors duration-500"
                style={{ color: colors.textSecondary }}
              >
                {item.subtitle.split(" ")[0]}
              </div>
              <div 
                className="w-fit [-webkit-text-stroke:0.74px_transparent]
                            bg-[linear-gradient(360deg,rgba(254,230,155,1)_0%,rgba(254,230,155,0)_100%)_1]
                            [-webkit-background-clip:text]
                            text-[length:var(--caption-1-bold-font-size)] leading-[var(--caption-1-bold-line-height)]
                            font-caption-1-bold tracking-[var(--caption-1-bold-letter-spacing)] transition-colors duration-500"
                style={{ color: colors.textSecondary }}
              >
                {item.subtitle.split(" ").slice(1).join(" ")}
              </div>
            </div>
          ) : (
            <div 
              className="w-fit -mt-0.5 [-webkit-text-stroke:0.74px_transparent]
                          bg-[linear-gradient(360deg,rgba(254,230,155,1)_0%,rgba(254,230,155,0)_100%)_1]
                          [-webkit-background-clip:text]
                          text-[length:var(--caption-1-bold-font-size)] leading-[var(--caption-1-bold-line-height)]
                          font-caption-1-bold text-center tracking-[var(--caption-1-bold-letter-spacing)] transition-colors duration-500"
              style={{ color: colors.textSecondary }}
            >
              {item.subtitle}
            </div>
          )
        )}
      </div>

      {/* hover micro-glow */}
      <span className="pointer-events-none absolute inset-[26px] rounded-full opacity-0
                       group-hover:opacity-60 transition-opacity
                       bg-[radial-gradient(70%_70%_at_30%_25%,#fff7d0_0%,transparent_70%)]" />
    </Button>
        ))}
      </nav>

      <Button
        variant="ghost"
        className="absolute top-[calc(50%_-_38px)] left-9 w-[185px] h-[76px] p-0 hover:bg-transparent 
                   transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,220,150,0.4)]
                   active:scale-100"
        onClick={() => navigate("/menu")}
      >
        {/* Outer gradient border */}
        <div className="absolute inset-0 rounded-[120px]
                        shadow-[inset_0_0_55px_#f2f2f280,inset_5px_5px_2.5px_-5px_#b3b3b3,inset_-30px_-30px_15px_-35px_#b3b3b3,inset_40px_40px_22.5px_-45px_#ffffff]
                        bg-[linear-gradient(180deg,rgba(102,102,102,0.2)_0%,rgba(102,102,102,0)_33%),linear-gradient(180deg,rgba(102,102,102,0)_50%,rgba(102,102,102,0.4)_100%),linear-gradient(0deg,rgba(29,29,29,0.2)_0%,rgba(29,29,29,0.2)_100%),linear-gradient(0deg,rgba(29,29,29,1)_0%,rgba(29,29,29,1)_100%)]" />
        
        {/* Golden gradient middle layer */}
        <div className="absolute inset-[4px] rounded-full overflow-hidden
                        bg-[linear-gradient(335deg,rgba(199,183,165,1)_0%,rgba(171,142,111,1)_22%,rgba(130,79,60,1)_82%,rgba(60,36,27,1)_100%)]
                        before:content-[''] before:absolute before:inset-0 before:p-[2.3px] before:rounded-full
                        before:[background:linear-gradient(180deg,rgba(255,255,255,0.53)_0%,rgba(255,255,255,0)_100%)]
                        before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]
                        before:[-webkit-mask-composite:xor] before:[mask-composite:exclude]" />
        
        {/* Inner golden surface */}
        <div className="absolute inset-[10px] rounded-full
                        shadow-[inset_0_9.17px_13.75px_#ffffff99]
                        bg-[linear-gradient(184deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)]" />
        
        {/* Content container - centered using flexbox */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 z-10">
          {/* Icon */}
          <img 
            className="w-3 h-3 object-contain transition-transform duration-300 group-hover:scale-110" 
            alt="Back" 
            src="res://icons/vector.png" 
          />
          
          {/* Text */}
          <div className="[-webkit-text-stroke:1px_transparent]
                          bg-[linear-gradient(360deg,rgba(254,230,155,1)_0%,rgba(254,230,155,0)_100%)_1]
                          [-webkit-background-clip:text]
                          font-p2-bold text-[#4e3016] text-[length:var(--p2-bold-font-size)] leading-[var(--p2-bold-line-height)] flex items-center justify-center">
            RETOUR
          </div>
        </div>
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
