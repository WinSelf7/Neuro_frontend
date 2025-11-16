import React, { useState, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/lib/theme-context";

const sidebarCategories = [
  "Métiers Médicaux (Docteur/Spécialistes)",
  "Santé Visuelle et Auditive",
  "Appareillage et Prothèses",
  "Nutrition et Diététique",
  "Médecines Alternatives",
  "Administration et Gestion Sanitaire",
  "Direction et Gestion",
  "Laboratoire & Recherche",
  "Technologies et Systèmes d'Information",
  "Soins à Domicile et Communautaires",
  "Services de Soutien et Environnement",
  "Métiers Transversaux et Spécialisés",
  "Métiers Spécifiques par Régions",
];

// Comprehensive list of health professions organized by categories
const healthProfessions = {
  "Métiers Médicaux (Docteur/Spécialistes)": [
    "Médecin généraliste", "Cardiologue", "Dermatologue", "Endocrinologue", "Gastro-entérologue",
    "Gynécologue", "Hématologue"
  ],
  "Santé Visuelle et Auditive": [
    "Orthoptiste", "Optométriste", "Opticien", "Audioprothésiste", "Orthophoniste",
    "Audiologiste", "Technicien en optique", "Monteur en optique", "Vendeur en optique"
  ],
  "Appareillage et Prothèses": [
    "Prothésiste dentaire", "Orthésiste", "Podologue", "Pédicure", "Prothésiste ongulaire",
    "Technicien en prothèse", "Monteur en prothèse", "Réparateur de prothèse"
  ],
  "Nutrition et Diététique": [
    "Diététicien", "Nutritionniste", "Ingénieur en nutrition", "Technicien en nutrition",
    "Conseiller en nutrition", "Éducateur nutritionnel"
  ],
  "Médecines Alternatives": [
    "Ostéopathe", "Chiropracteur", "Acupuncteur", "Naturopathe", "Homéopathe",
    "Sophrologue", "Hypnothérapeute", "Réflexologue", "Magnétiseur", "Phytothérapeute"
  ],
  "Administration et Gestion Sanitaire": [
    "Directeur d'établissement", "Cadre de santé", "Chef de service", "Responsable qualité",
    "Responsable RH", "Gestionnaire de budget", "Coordinateur de soins", "Responsable logistique",
    "Responsable informatique", "Responsable formation", "Responsable communication",
    "Responsable marketing", "Responsable commercial", "Responsable juridique"
  ],
  "Direction et Gestion": [
    "Directeur général", "Directeur médical", "Directeur des soins", "Directeur administratif",
    "Directeur financier", "Directeur des ressources humaines", "Directeur technique",
    "Directeur de la qualité", "Directeur de la recherche", "Directeur de l'innovation"
  ],
  "Laboratoire & Recherche": [
    "Biologiste médical", "Technicien de laboratoire", "Technicien en analyses biomédicales",
    "Préparateur en pharmacie", "Pharmacien biologiste", "Chercheur en biologie",
    "Chercheur en pharmacologie", "Chercheur en génétique", "Chercheur en immunologie",
    "Chercheur en oncologie", "Chercheur en neurosciences", "Chercheur en épidémiologie",
    "Statisticien médical", "Data scientist santé", "Bioinformaticien"
  ],
  "Technologies et Systèmes d'Information": [
    "Ingénieur biomédical", "Technicien biomédical", "Informaticien médical", "Développeur santé",
    "Analyste système", "Administrateur réseau", "Responsable cybersécurité", "Data analyst",
    "Responsable IT", "Chef de projet IT", "Consultant IT", "Formateur informatique"
  ],
  "Soins à Domicile et Communautaires": [
    "Infirmier libéral", "Aide-soignant", "Auxiliaire de vie", "Accompagnant éducatif",
    "Éducateur spécialisé", "Moniteur éducateur", "Assistant de service social",
    "Conseiller en économie sociale", "Travailleur social", "Médiateur social",
    "Coordinateur de parcours", "Responsable de secteur", "Chef de service social"
  ],
  "Services de Soutien et Environnement": [
    "Agent d'entretien", "Agent de sécurité", "Agent d'accueil", "Secrétaire médicale",
    "Secrétaire de direction", "Assistant administratif", "Comptable", "Responsable achats",
    "Responsable maintenance", "Responsable sécurité", "Responsable environnement",
    "Responsable développement durable", "Responsable RSE", "Responsable qualité environnementale"
  ],
  "Métiers Transversaux et Spécialisés": [
    "Formateur", "Consultant", "Auditeur", "Évaluateur", "Coordinateur", "Chef de projet",
    "Responsable formation", "Responsable communication", "Responsable événementiel",
    "Responsable partenariat", "Responsable innovation", "Responsable digital",
    "Responsable transformation", "Responsable stratégie", "Responsable développement"
  ],
  "Métiers Spécifiques par Régions": [
    "Médecin de campagne", "Infirmier de campagne", "Sage-femme de campagne", "Pharmacien rural",
    "Médecin de montagne", "Médecin de mer", "Médecin tropical", "Médecin humanitaire",
    "Médecin expatrié", "Médecin militaire", "Médecin de prison", "Médecin de bord",
    "Médecin de plongée", "Médecin d'expédition", "Médecin de mission"
  ]
};

export const NeuropackSante = () => {
  const { theme, setTheme, colors } = useTheme();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [brightness, setBrightness] = React.useState([100]);

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

  // Get all professions for the selected category or all if none selected
  const displayedProfessions = useMemo(() => {
    if (selectedCategory) {
      return healthProfessions[selectedCategory] || [];
    }
    // If no category selected, show all professions
    return Object.values(healthProfessions).flat();
  }, [selectedCategory]);

  // Filter professions based on search term
  const filteredProfessions = useMemo(() => {
    if (!searchTerm) return displayedProfessions;
    return displayedProfessions.filter(profession =>
      profession.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [displayedProfessions, searchTerm]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  return (
    <div 
      className="w-full min-h-screen flex flex-col relative transition-all duration-500"
      style={{ backgroundColor: colors.background }}
    >
      <header 
        className="flex items-center justify-between px-7 py-5 z-20 relative transition-all duration-500"
        style={{ backgroundColor: colors.accentGold }}
      >
        <div className="inline-flex items-center gap-6">
          <div className="w-20 h-20 bg-[url(res://icons/logo-light-1.png)] bg-[100%_100%]" />
          <h1 
            className="text-3xl font-bold transition-colors duration-500"
            style={{ color: colors.text }}
          >
            NEUROPACK
          </h1>
        </div>
        <div className="inline-flex items-center gap-4 absolute top-4 right-4 z-20">
            
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
      </header>

      <div className="flex flex-1 relative">
        {/* Background Image - positioned with sticky */}
        <div className="fixed top-0 right-0 w-full h-full pointer-events-none z-0">
          <img
            className="sticky top-[348px] w-[452px] h-[676px] object-cover ml-auto"
            alt="Robotic Doctor"
            src="res://icons/image-88.png"
          />
        </div>

        <aside 
          className="flex flex-col w-[426px] z-10 relative transition-all duration-500"
          style={{ backgroundColor: colors.accentGold }}
        >
          <header 
            className="flex items-center gap-4 px-11 py-6 flex-shrink-0 transition-all duration-500"
            style={{ 
              backgroundColor: colors.cardBg,
              borderBottom: `2px solid ${colors.border}`
            }}
          >
            <img className="w-8 h-8" alt="Hospital" src="res://icons/hospital-1.svg" />
            <h2 
              className="flex items-center justify-center font-p2-bold font-[number:var(--p2-bold-font-weight)] text-[length:var(--p2-bold-font-size)] tracking-[var(--p2-bold-letter-spacing)] leading-[var(--p2-bold-line-height)] [font-style:var(--p2-bold-font-style)] transition-colors duration-500"
              style={{ color: colors.text }}
            >
              MÉTIERS DE LA SANTÉ (343)
            </h2>
          </header>

          <div className="overflow-y-auto" style={{ height: '75vh' }}>
            <nav className="flex flex-col">
              {sidebarCategories.map((category, index) => (
                <div key={index}>
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className="flex items-center justify-between px-11 py-3 w-full text-left transition-all duration-200 relative group"
                    style={{
                      backgroundColor: selectedCategory === category ? colors.cardBg : 'transparent'
                    }}
                    aria-label={`${selectedCategory === category ? 'Désélectionner' : 'Sélectionner'} la catégorie ${category}`}
                    aria-expanded={selectedCategory === category}
                  >
                    <span 
                      className="flex-1 text-base font-semibold transition-colors duration-200"
                      style={{ 
                        color: selectedCategory === category ? colors.text : colors.textSecondary 
                      }}
                    >
                      {category}
                    </span>
                    <div className={`transition-transform duration-200 ${selectedCategory === category ? 'rotate-90' : ''
                      }`}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        style={{ 
                          color: selectedCategory === category ? colors.text : colors.textSecondary 
                        }}
                      >
                        <path
                          d="M4 2L8 6L4 10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>
                  
                  {/* Professions list for selected category */}
                  {selectedCategory === category && (
                    <div 
                      className="px-11 py-2 transition-all duration-200"
                      style={{ backgroundColor: `${colors.cardBg}80` }}
                    >
                      {healthProfessions[category]?.map((profession, professionIndex) => (
                        <div
                          key={professionIndex}
                          className="py-2 text-sm cursor-pointer transition-colors duration-200"
                          style={{ 
                            color: colors.textSecondary 
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = colors.text;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = colors.textSecondary;
                          }}
                          onClick={() => setSearchTerm(profession)}
                        >
                          {profession}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="absolute bottom-[-750px] left-20 flex-shrink-0">
            <Button
              variant="ghost"
              className="relative w-[185px] h-[76px] p-0 hover:bg-transparent 
                         transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,220,150,0.4)]
                         active:scale-100"
              onClick={() => navigate("/neuropacks")}
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
                <div 
                  className="font-p2-bold text-[length:var(--p2-bold-font-size)] leading-[var(--p2-bold-line-height)] flex items-center justify-center transition-colors duration-500"
                  style={{ color: colors.text }}
                >
                  RETOUR
                </div>
              </div>
            </Button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative z-10">

          {/* Theme Controls */}
         

          <div className="flex-1 flex flex-col items-center pt-16 px-11">
            {/* Main Title Section */}
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-[url(res://icons/logo-light-1.png)] bg-[100%_100%]" />
            </div>

            <div className="flex flex-col items-center gap-6 mb-12">
            <div className="flex items-center justify-center mb-3">
            <div className="w-[90px] h-[90px] flex items-center justify-center rounded-3xl border border-solid border-[#3a9fef] shadow-[inset_0px_0px_55px_#f2f2f280,inset_5px_5px_2.5px_-5px_#b3b3b3,inset_-30px_-30px_15px_-35px_#b3b3b3,inset_40px_40px_22.5px_-45px_#ffffff] backdrop-blur-[50px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(50px)_brightness(100%)] bg-[linear-gradient(180deg,rgba(102,102,102,0.2)_0%,rgba(102,102,102,0)_33%),linear-gradient(180deg,rgba(102,102,102,0)_50%,rgba(102,102,102,0.4)_100%),linear-gradient(0deg,rgba(29,29,29,0.2)_0%,rgba(29,29,29,0.2)_100%),linear-gradient(0deg,rgba(29,29,29,1)_0%,rgba(29,29,29,1)_100%)]">
              <img
                className="w-16 h-[52px]"
                alt="File"
                src="res://icons/file-00000000311062469e05e2d917474dfe-1.png"
              />
            </div>
          </div>
              <h2 
                className="text-5xl font-bold text-center transition-colors duration-500"
                style={{ color: colors.text }}
              >
                NEUROPACK SANTÉ
              </h2>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                <Button 
                  onClick={() => navigate("/ocr")}
                  className="px-8 py-4 rounded-2xl inset-0 flex items-center gap-3 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 25%, #8b6914 75%, #654321 100%)',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
                  }}
                  aria-label="Accéder aux modules communs"
                >
                  <svg className="w-6 h-6 text-[#4e3016]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z" />
                  </svg>
                  <span className="font-bold text-[#4e3016] text-lg">Modules Communs</span>
                </Button>

                <Button 
                  onClick={() => navigate("/bibliotheque-reference")}
                  className="px-8 py-4 rounded-2xl inset-0 flex items-center gap-3 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 25%, #8b6914 75%, #654321 100%)',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
                  }}
                  aria-label="Accéder à la bibliothèque de référence santé"
                >
                  <svg className="w-6 h-6 text-[#4e3016]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V5H19V19M17 12H7V10H17V12M15 16H7V14H15V16M17 8H7V6H17V8Z" />
                  </svg>
                  <span className="font-bold text-[#4e3016] text-lg">Bibliothèque de Référence Santé</span>
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col w-full max-w-[721px] items-center gap-6">
              <div className="relative w-full h-16">
                <div 
                  className="absolute inset-0 rounded-2xl shadow-lg border-2 transition-all duration-500"
                  style={{ 
                    backgroundColor: `${colors.cardBg}80`,
                    borderColor: colors.border
                  }}
                />
                <Input
                  placeholder="Rechercher parmi 343+ métiers de la santé"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="relative w-full h-full bg-transparent border-none pl-6 pr-20 text-lg transition-colors duration-500"
                  style={{
                    color: colors.text
                  } as React.CSSProperties}
                  aria-label="Rechercher parmi les métiers de la santé"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 25%, #8b6914 75%, #654321 100%)',
                      boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <svg className="w-6 h-6 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Professions List */}
              <div className="w-full max-w-[721px] neuropack-professions-container" style={{ height: 'auto' }}>

                  <div className="p-6">
                    {filteredProfessions.length > 0 ? (
                      <div className="flex flex-wrap gap-3 w-full mb-8 profession-tags-container">
                        {filteredProfessions.map((profession, index) => (
                          <div
                            key={index}
                            className="px-6 py-3 h-12 flex items-center justify-center rounded-full transition-all duration-200 shadow-md font-medium whitespace-nowrap profession-tag cursor-pointer hover:scale-105"
                            role="button"
                            tabIndex={0}
                            aria-label={`Voir les détails pour ${profession}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                // Add functionality here if needed
                              }
                            }}
                            style={{ 
                              height: '48px',
                              background: `linear-gradient(135deg, ${colors.accentGold} 0%, ${colors.border} 100%)`,
                              color: colors.text,
                              boxShadow: `0 2px 8px ${colors.accentGold}40`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = `linear-gradient(135deg, ${colors.border} 0%, ${colors.accentGold} 100%)`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = `linear-gradient(135deg, ${colors.accentGold} 0%, ${colors.border} 100%)`;
                            }}
                          >
                            <span className="text-sm font-semibold">
                              {profession}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p 
                          className="text-xl font-medium transition-colors duration-500"
                          style={{ color: colors.textSecondary }}
                        >
                          {searchTerm ? 'Aucun métier trouvé pour votre recherche' : 'Sélectionnez une catégorie pour voir les métiers'}
                        </p>
                      </div>
                    )}
                  </div>
            
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
