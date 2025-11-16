// NeuropacksLight.tsx
import React from "react";
import { Button } from "../../components/ui/button";
import { Slider } from "../../components/ui/slider";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/lib/theme-context";

type SectorItem = {
  icon: string;
  label: string;               // use "\n" for the line break
  position: string;            // absolute class (e.g., "top-[45px] left-[246px]")
  route: string;               // navigation route
  iconClass?: string;
};

const sectors: SectorItem[] = [
  { icon: "res://icons/icon-4.svg",  label: "SANTÉ ET\nBIEN-ÊTRE",           position: "top-[45px] left-[246px]",   route: "/neuropack-sante" },
  
  { icon: "res://icons/icon-5.svg",  label: "FINANCE\nET GESTION",           position: "top-[45px] left-[339px]",   route: "/neuropack-sante",      iconClass: "w-[32.01px] h-8" },
  { icon: "res://icons/icon-14.svg", label: "TECHNOLOGIE\nET INNOVATION",    position: "top-[79px] left-[414px]",   route: "/neuropack-sante",  iconClass: "w-8 h-[32.11px]" },
  { icon: "res://icons/icon-9.svg",  label: "SECTEUR SOCIAL\nET HUMANITAIRE", position: "top-[79px] left-[145px]", route: "/neuropack-sante" },
  { icon: "res://icons/icon-6.svg",  label: "RESSOURCES\nHUMAINES",          position: "top-[151px] left-[87px]",   route: "/neuropack-sante" },
  { icon: "res://icons/icon-12.svg", label: "COMMERCE ET\nDISTRIBUTION",     position: "top-[151px] left-[495px]",  route: "/neuropack-sante" },
  { icon: "res://icons/icon-11.svg", label: "CULTURE ET\nDIVERTISSEMENT",    position: "top-[241px] left-[35px]",   route: "/neuropack-sante" },
  { icon: "res://icons/icon-15.svg", label: "INDUSTRIE\nET PRODUCTION",      position: "top-[241px] left-[537px]",  route: "/neuropack-sante" },
  { icon: "res://icons/icon-3.svg",  label: "CONSTRUCTION\nET ENVIRONNEMENT", position: "top-[335px] left-[518px]", route: "/neuropack-sante" },
  { icon: "res://icons/icon-8.svg",  label: "AGRICULTURE\nET TERRITOIRE",    position: "top-[342px] left-8",        route: "/neuropack-sante",  iconClass: "w-[32.7px] h-[33.36px] mt-[-1.36px]" },
  { icon: "res://icons/icon-10.svg", label: "SÉCURITÉ\nET DÉFENSE",          position: "top-[432px] left-[70px]",   route: "/neuropack-sante" },
  { icon: "res://icons/icon-1.svg",  label: "COMMUNICATION\nET MÉDIAS",      position: "top-[432px] left-[499px]",  route: "/neuropack-sante" },
  { icon: "res://icons/icon-7.svg",  label: "TOURISME ET\nRESTAURATION",     position: "top-[501px] left-[132px]",  route: "/neuropack-sante",     iconClass: "w-[32.5px] h-[32.14px] mt-[-0.14px]" },
  { icon: "res://icons/icon-13.svg", label: "DROIT ET\nADMINISTRATION",      position: "top-[501px] left-[433px]",  route: "/neuropack-sante",        iconClass: "w-[32.51px] h-[32.36px] mt-[-0.36px]" },
  { icon: "res://icons/icon.svg",    label: "ÉDUCATION\nET FORMATION",       position: "top-[541px] left-[338px]",  route: "/neuropack-sante" },
  { icon: "res://icons/icon-2.svg",  label: "TRANSPORT\nET LOGISTIQUE",      position: "top-[547px] left-[228px]",  route: "/neuropack-sante" },
];

const radialLines = [
  { position: "top-0 left-[325px]",       height: "h-[145px]", rotation: "" },
  { position: "top-[505px] left-[325px]", height: "h-[145px]", rotation: "" },
  { position: "top-[252px] left-[577px]", height: "h-[146px]", rotation: "rotate-90" },
  { position: "top-[253px] left-[72px]",  height: "h-36",      rotation: "rotate-90" },
  { position: "top-5 left-[423px]",       height: "h-[145px]", rotation: "rotate-[23deg]" },
  { position: "top-[485px] left-[225px]", height: "h-[145px]", rotation: "rotate-[23deg]" },
  { position: "top-[485px] left-[423px]", height: "h-[145px]", rotation: "rotate-[157deg]" },
  { position: "top-5 left-[225px]",       height: "h-[145px]", rotation: "rotate-[157deg]" },
  { position: "top-[431px] left-[503px]", height: "h-[145px]", rotation: "rotate-[135deg]" },
  { position: "top-[74px] left-[145px]",  height: "h-[145px]", rotation: "rotate-[135deg]" },
  { position: "top-[351px] left-[556px]", height: "h-[145px]", rotation: "rotate-[113deg]" },
  { position: "top-[154px] left-[92px]",  height: "h-[145px]", rotation: "rotate-[113deg]" },
  { position: "top-[154px] left-[556px]", height: "h-[145px]", rotation: "rotate-[-113deg]" },
  { position: "top-[351px] left-[92px]",  height: "h-[145px]", rotation: "rotate-[-113deg]" },
  { position: "top-[74px] left-[503px]",  height: "h-[145px]", rotation: "rotate-45" },
  { position: "top-[431px] left-[145px]", height: "h-[145px]", rotation: "rotate-45" },
];

const WHEEL = { size: 650, center: 325 }; // 650x650 container

// === Figma-exact ring geometry ===
const R_INNER = 180;
const R_OUTER = 325;
const R_MID   = (R_INNER + R_OUTER) / 2; // 252.5px
const R_THICK = R_OUTER - R_INNER;       // 145px
const SECTOR_DEG = 22.5;                 // 16 slices

export const NeuropacksLight: React.FC = () => {
  const { theme, setTheme, colors } = useTheme();
  const navigate = useNavigate();

  // ref to the 650x650 wheel container
  const wheelRef = React.useRef<HTMLDivElement | null>(null);

  // hover overlay state (position in wheel coords + angle)
  const [hoverPos, setHoverPos] = React.useState<{ x: number; y: number; angle: number } | null>(null);
  
  // brightness state (20-150)
  const [brightness, setBrightness] = React.useState<number[]>([100]);
  
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

  // compute sector-snap placement on the ring midline, with design-accurate rotation
  const setFromTarget = (target: HTMLElement) => {
    const wheelRect = wheelRef.current!.getBoundingClientRect();
    const r = target.getBoundingClientRect();

    // target center in wheel coords
    const tx = r.left + r.width / 2 - wheelRect.left;
    const ty = r.top + r.height / 2 - wheelRect.top;

    // vector from wheel center
    const dx = tx - WHEEL.center;
    const dy = ty - WHEEL.center;

    // math angle (deg): 0 = +X (right), CCW positive
    const baseDeg = Math.atan2(dy, dx) * (180 / Math.PI) ;

    // convert to "clockwise from UP" frame used by Figma radial slices
    const cwFromUp = (450 - baseDeg) % 360; // 450 = 360 + 90 so UP is 0°
    // snap to nearest sector center
    const sectorIdx = Math.round(cwFromUp / SECTOR_DEG) % 16;
    const angleCW = sectorIdx * SECTOR_DEG;

    // convert back to math angle for x/y placement
    const angleMath = (90 - angleCW) * (Math.PI / 180);

    // place on the mid-ring radius
    const x = WHEEL.center + Math.cos(angleMath) * R_MID;
    const y = WHEEL.center + Math.sin(angleMath) * R_MID;

    setHoverPos({ x, y, angle: angleCW });
  };

  const clearHover = () => setHoverPos(null);

  return (
    <div 
      className="relative w-[1440px] h-[1024px] overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: colors.background }}
    >
        {/* Backgrounds */}
        <img 
          className="absolute top-0 left-1 w-[1440px] h-[900px] object-cover transition-all duration-500" 
          alt="" 
          src="res://icons/background.png"
          style={{
            filter: theme === 'light' 
              ? 'brightness(1.2) saturate(1.1) hue-rotate(0deg)' 
              : theme === 'balance' 
                ? 'brightness(0.9) saturate(0.8) hue-rotate(10deg) sepia(0.1)' 
                : 'brightness(0.6) saturate(0.6) hue-rotate(20deg) sepia(0.3) contrast(1.2)'
          }}
        />
        {/* <img className="absolute top-[167px] left-[calc(50%_-_332px)]" alt="" src="res://icons/Exclude.svg" /> */}
        <img 
          className="absolute top-[277px] left-[calc(50%_-_230px)] transition-all duration-500" 
          alt="" 
          src="res://icons/background1.png"
          style={{
            filter: theme === 'light' 
              ? 'brightness(1.1) saturate(1.0) hue-rotate(0deg)' 
              : theme === 'balance' 
                ? 'brightness(0.8) saturate(0.7) hue-rotate(15deg) sepia(0.15)' 
                : 'brightness(0.5) saturate(0.5) hue-rotate(25deg) sepia(0.4) contrast(1.3)'
          }}
        />

      {/* Logo */}
      <div className="absolute top-11 left-11 w-[120px] h-[120px] bg-[url(res://icons/logo-light-1.png)] bg-no-repeat bg-contain" />

      {/* Profile button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate("/menu")}
        className="absolute top-16 right-16 w-20 h-20 p-0 hover:bg-transparent 
                   transition-all duration-300 hover:scale-110 active:scale-105
                   hover:drop-shadow-[0_0_20px_rgba(255,220,150,0.5)]"
      >
        <img className="w-20 h-20 transition-transform duration-300" alt="Profile" src="res://icons/button-1.svg" />
      </Button>

      {/* Wheel container (650x650) */}
      <div
        ref={wheelRef}
        className="absolute top-[calc(50%_-_325px)] left-[calc(50%_-_325px)] w-[650px] h-[650px] z-10"
      >
        {/* ambient hover glow behind center (optional) */}
        <img
          className="absolute top-[189px] left-[calc(50%_-_138px)] w-[275px] h-[271px] pointer-events-none z-0"
          alt=""
          src="res://icons/hover-1.svg"
        />

        {/* outer ring art (bottom) */}
        <img className="absolute inset-0 w-[650px] h-[650px] object-cover z-0" alt="" src="res://icons/exclude-1.svg" />

        {/* radial spokes (above ring) */}
        {radialLines.map((line, idx) => (
          <div
            key={`line-${idx}`}
            className={`absolute w-0.5 bg-[#c7b6a3] rounded-[99px] ${line.position} ${line.height} ${line.rotation} z-10`}
          />
        ))}

        {/* HOVER OVERLAY — sits between spokes and buttons, aligned to ring band */}
        <div
          className={`absolute pointer-events-none transition-all duration-300 z-[15] ${
            hoverPos ? "opacity-60" : "opacity-0"
          }`}
          style={{
            width: 140,
            height: R_THICK,
            left: hoverPos ? hoverPos.x : WHEEL.center,
            top:  hoverPos ? hoverPos.y : WHEEL.center,
            transform: hoverPos
              ? `translate(-50%,-50%) rotate(${hoverPos.angle}deg)`
              : "translate(-50%,-50%)",
            transformOrigin: "center center",
            background: "radial-gradient(ellipse at center, rgba(255, 220, 150, 0.5) 0%, rgba(200, 160, 100, 0.3) 50%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />

         {/* sector buttons (top) */}
         {sectors.map((sector, index) => (
           <button
             key={`sector-${index}`}
             className={`inline-flex flex-col items-center gap-2.5 absolute ${sector.position} 
                        px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer z-20
                        hover:bg-[rgba(255,220,150,0.2)] hover:scale-110 hover:shadow-lg
                        active:scale-105`}
             onMouseEnter={(e) => setFromTarget(e.currentTarget)}
             onMouseLeave={clearHover}
             onClick={() => navigate(sector.route)}
           >
             <img className={`${sector.iconClass || "w-8 h-8"} transition-transform duration-200`} alt="" src={sector.icon} />
             <div 
               className="font-bold text-[12px] text-center whitespace-pre-line transition-colors duration-500"
               style={{ color: colors.text }}
             >
               {sector.label}
             </div>
           </button>
         ))}

        {/* CENTER GOLD BUTTON */}
        <div className="absolute top-[calc(50%_-_100px)] left-[calc(50%_-_100px)] w-[200px] h-[200px]">
          <img className="absolute top-0 left-0 w-[200px] h-[200px] transition-transform duration-300 hover:scale-105" alt="" src="res://icons/button-background.png" />
          <Button
            variant="ghost"
            className="absolute top-2 left-2 w-[184px] h-[184px] rounded-full p-0 transition-all duration-300
                       hover:shadow-[0_0_40px_rgba(255,220,150,0.6)] hover:scale-105 active:scale-100
                       bg-[linear-gradient(335deg,rgba(199,183,165,1)_0%,rgba(171,142,111,1)_22%,rgba(130,79,60,1)_82%,rgba(60,36,27,1)_100%)]
                       hover:bg-[linear-gradient(335deg,rgba(219,203,185,1)_0%,rgba(191,162,131,1)_22%,rgba(150,99,80,1)_82%,rgba(80,56,47,1)_100%)]
                       before:content-[''] before:absolute before:inset-0 before:p-[2.3px] before:rounded-full
                       before:[background:linear-gradient(180deg,rgba(255,255,255,0.53)_0%,rgba(255,255,255,0)_100%)]
                       before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]
                       before:[-webkit-mask-composite:xor] before:[mask-composite:exclude]"
          >
            <div
              className="absolute top-[9px] left-[9px] w-[165px] h-[165px] rounded-full
                         shadow-[inset_0_9.17px_13.75px_#ffffff99]
                         bg-[linear-gradient(184deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)]
                         before:content-[''] before:absolute before:inset-0 before:p-[2.29px] before:rounded-full
                         before:[background:linear-gradient(174deg,rgba(255,255,255,0.53)_0%,rgba(155,123,95,1)_100%)]
                         before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]
                         before:[-webkit-mask-composite:xor] before:[mask-composite:exclude]"
            />
            <div className="absolute top-[calc(50%_-_49px)] left-[calc(50%_-_56px)] w-28 flex flex-col items-center gap-2">
              <div className="w-[62px] h-[62px] relative">
                <img className="absolute top-0 left-[calc(50%_-_24px)] w-12 h-[62px]" alt="" src="res://icons/union.svg" />
              </div>
              <div className="[-webkit-text-stroke:0.74px_transparent]
                              bg-[linear-gradient(360deg,rgba(254,230,155,1)_0%,rgba(254,230,155,0)_100%)_1]
                              [-webkit-background-clip:text] mt-3
                              font-p2-bold text-[#4e3016] text-[length:var(--p2-bold-font-size)] leading-[var(--p2-bold-line-height)] text-center">
                NEUROPACKS
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="inline-flex items-center gap-4 absolute top-[880px] right-16 z-10">
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

      {/* Back button */}
      <Button
        variant="ghost"
        className="absolute bottom-16 left-16 w-[185px] h-[76px] p-0 hover:bg-transparent 
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
    </div>
  );
};
