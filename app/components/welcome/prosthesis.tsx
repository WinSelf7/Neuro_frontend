import { ChevronLeftIcon } from "lucide-react";
import React, { useState } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { useNavigate } from "react-router-dom";
import { WorkerMessageHandler } from "pdfjs-dist/build/pdf.worker.min.mjs";

// Import react-pdf CSS for text layer and annotation layer
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  WorkerMessageHandler,
  import.meta.url
).toString();

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { Slider } from "../ui/slider";
import { apiClient, ParseResponse } from '@/lib/api';

const topMetrics = [
  {
    icon: "res://icons/mingcute-repeat-fill.svg",
    label: "RISQUE DE RÉCURRENCE",
    value: "87%",
  },
  {
    icon: "res://icons/ph-trend-down-bold.svg",
    label: "PERTE PRÉVISIBLE 30J",
    value: "15.2K€",
  },
  {
    icon: "res://icons/mingcute-target-line.svg",
    label: "PRÉCISION MODÈLE",
    value: "92%",
  },
  {
    icon: "res://icons/mingcute-stopwatch-fill.svg",
    label: "TEMPS D'ANALYSE",
    value: "3.2s",
  },
];

const aiSuggestions = [
  { icon: "res://icons/typcn-warning.svg", label: "Factures à risque élevé" },
  { icon: "res://icons/iconamoon-search-bold.svg", label: "Anomalies de pattern" },
  { icon: "res://icons/solar-user-bold.svg", label: "Utilisateurs récurrents" },
  {
    icon: "res://icons/material-symbols-money-bag-rounded.svg",
    label: "Impact financier majeur",
  },
  {
    icon: "res://icons/streamline-flex-time-lapse-remix.svg",
    label: "Clustering temporel",
  },
  { icon: "res://icons/solar-document-bold.svg", label: "Jamais facturées" },
];

const metricsData = [
  { icon: "res://icons/mdi-erase.svg", label: "SUPPRESSIONS", value: "23" },
  { icon: "res://icons/typcn-warning.svg", label: "JAMAIS FACTURÉES", value: "3" },
  { icon: "res://icons/solar-document-bold.svg", label: "JUSTIFIÉES", value: "87%" },
  {
    icon: "res://icons/ph-trend-down-bold.svg",
    label: "PERTE POTENTIELLE",
    value: "5.74K€",
  },
];

const detectionData = [
  {
    type: "alert",
    bgColor: "bg-[#a000003d]",
    icon: "res://icons/ant-design-alert-filled.svg",
    title: "Pattern Suspect",
    titleColor: "text-[#ffadad]",
    content: "Dr. Martin • 5 suppressions/24h",
  },
  {
    type: "warning",
    bgColor: "bg-[#a062003d]",
    icon: "res://icons/typcn-warning.svg",
    title: "Anomalie Temporelle",
    titleColor: "text-[#ffeaad]",
    content: "Pic à 14h-15h inhabituel",
  },
  {
    type: "success",
    bgColor: "bg-[#2da0003d]",
    icon: "res://icons/material-symbols-check-box.svg",
    title: "Conformité Globale",
    titleColor: "text-[#beffad]",
    content: "92% des actions justifiées",
  },
];

const practitionerRiskData = [
  {
    bgColor: "bg-[#a000003d]",
    icon: "res://icons/ant-design-alert-filled.svg",
    name: "Dr. Martin",
    nameColor: "text-[#ffadad]",
    score: "89",
    scoreColor: "text-[#ffadad]",
    details:
      "3 factures jamais créées (30j)\n5 suppressions récentes\nPerte estimée: 5.2K€",
    badges: [
      {
        label: "CRITIQUE",
        bgColor: "bg-[#ff000033]",
        borderColor: "border-[#ff0000]",
      },
      {
        label: "FORMATION REQUISE",
        bgColor: "bg-[#faecd233]",
        borderColor: "",
      },
    ],
  },
  {
    bgColor: "bg-[#a062003d]",
    icon: "res://icons/typcn-warning.svg",
    name: "Dr. Leroy",
    nameColor: "text-[#ffeaad]",
    score: "74",
    scoreColor: "text-[#ffeaad]",
    details:
      "2 factures jamais créées (15j)\nPattern récurrent détecté\nPerte estimée: 3.1K€",
    badges: [
      {
        label: "SURVEILLÉ",
        bgColor: "bg-[#ffdd0033]",
        borderColor: "border-[#ffdd00]",
      },
      { label: "RAPPEL PROCESS", bgColor: "bg-[#faecd233]", borderColor: "" },
    ],
  },
  {
    bgColor: "bg-[#2da0003d]",
    icon: "res://icons/material-symbols-check-box.svg",
    name: "Conformité Globale",
    nameColor: "text-[#beffad]",
    score: "23",
    scoreColor: "text-[#beffad]",
    details:
      "0 factures jamais créées (90j)\nProcess exemplaire\nRéférent qualité",
    badges: [
      {
        label: "EXEMPLAIRE",
        bgColor: "bg-[#01b57433]",
        borderColor: "border-[#00b574]",
      },
      { label: "MENTOR", bgColor: "bg-[#faecd233]", borderColor: "" },
    ],
  },
];

const timelineData = [
  { time: "11:20", event: "Alerte IA déclenchée" },
  { time: "13:55", event: "Justification validée (Coord. Sophie)" },
  { time: "14:32", event: "Suppression FAC-001234 (Dr. Martin)" },
];

const tableData = [
  {
    patient: "Roussel A.",
    statutFacture: {
      label: "JAMAIS FACTURÉE",
      bgColor: "bg-[#ffdd0033]",
      borderColor: "border-[#ffdd00]",
      subtext: "Aucune facture créée",
    },
    dateSuppression: {
      main: "Pose: 15/08/2025",
      mainColor: "text-[#ffeaad]",
      sub: "Non facturée depuis 13j",
    },
    statutDevis: {
      label: "PRÉSENT",
      bgColor: "bg-[#01b57433]",
      borderColor: "border-[#00b574]",
    },
    ficheLabo: {
      label: "SCANÉE",
      bgColor: "bg-[#0161b533]",
      borderColor: "border-[#0061b5]",
    },
    impactFinancier: { main: "1.890 €", sub: "Perte potentielle" },
    utilisateur: { main: "Dr. Martin", sub: "ID: DRM001" },
    scoreIA: {
      icon: "res://icons/light-emergency-1.svg",
      score: "89",
      scoreColor: "text-[#ffd2d2]",
      label: "Récurrent",
      labelColor: "text-[#ffd2d2]",
    },
    actions: ["/group-7.png", "/group-3.png"],
  },
  {
    patient: "Rousseau T.",
    statutFacture: {
      label: "SUPRIMÉE",
      bgColor: "bg-[#ff000033]",
      borderColor: "border-[#ff0000]",
      subtext: "FAC-2025-001234",
    },
    dateSuppression: {
      main: "28/08/2025",
      mainColor: "text-[#ade2ff]",
      sub: "14:32:15",
    },
    statutDevis: {
      label: "SUPRIMÉE",
      bgColor: "bg-[#ff000033]",
      borderColor: "border-[#ff0000]",
    },
    ficheLabo: {
      label: "SCANÉE",
      bgColor: "bg-[#0161b533]",
      borderColor: "border-[#0061b5]",
    },
    impactFinancier: { main: "1.250 €", sub: "Impact: Éleve" },
    utilisateur: { main: "Dr. Martin", sub: "ID: DRM001" },
    scoreIA: {
      icon: "res://icons/typcn-warning.svg",
      score: "85",
      scoreColor: "text-[#ffeaad]",
      label: "Risque élevé",
      labelColor: "text-[#ffeaad]",
    },
    actions: ["/group-6.png", "/group-8.png"],
  },
  {
    patient: "Martin P.",
    statutFacture: {
      label: "SUPRIMÉE",
      bgColor: "bg-[#ff000033]",
      borderColor: "border-[#ff0000]",
      subtext: "FAC-2025-001189",
    },
    dateSuppression: {
      main: "27/08/2025",
      mainColor: "text-[#ade2ff]",
      sub: "09:15:42",
    },
    statutDevis: {
      label: "PRÉSENT",
      bgColor: "bg-[#01b57433]",
      borderColor: "border-[#00b574]",
    },
    ficheLabo: {
      label: "SCANÉE",
      bgColor: "bg-[#0161b533]",
      borderColor: "border-[#0061b5]",
    },
    impactFinancier: { main: "890 €", sub: "Impact: Moyen" },
    utilisateur: { main: "Coord. Sophie", sub: "ID: CSO002" },
    scoreIA: {
      icon: "res://icons/typcn-warning.svg",
      score: "72",
      scoreColor: "text-[#ffeaad]",
      label: "Risque modére",
      labelColor: "text-[#ffeaad]",
    },
    actions: ["/group-6-1.png", "/group-8-1.png"],
  },
  {
    patient: "Dubois P.",
    statutFacture: {
      label: "SUPRIMÉE",
      bgColor: "bg-[#ff000033]",
      borderColor: "border-[#ff0000]",
      subtext: "FAC-2025-001098",
    },
    dateSuppression: {
      main: "27/08/2025",
      mainColor: "text-[#ade2ff]",
      sub: "16:45:12",
    },
    statutDevis: {
      label: "PRÉSENT",
      bgColor: "bg-[#01b57433]",
      borderColor: "border-[#00b574]",
    },
    ficheLabo: {
      label: "ABSENTE",
      bgColor: "bg-[#ffdd0033]",
      borderColor: "border-[#ffdd00]",
    },
    impactFinancier: { main: "1.650 €", sub: "Impact: Critique" },
    utilisateur: { main: "Dr. Dubois", sub: "ID: DDB003" },
    scoreIA: {
      icon: "res://icons/light-emergency-1.svg",
      score: "92",
      scoreColor: "text-[#ffd2d2]",
      label: "Critique",
      labelColor: "text-[#ffd2d2]",
    },
    actions: ["/group-6-2.png", "/group-8-2.png"],
  },
];

export const FacturesSuppr = () => {
    const navigate = useNavigate();
    const [sliderValue, setSliderValue] = useState([7000]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResponse | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Convert file to data URL to avoid CSP blob URL issues
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileUrl(dataUrl);
      };
      reader.readAsDataURL(file);
      setPageNumber(1);
      setNumPages(null);
      setParseResult(null);
      setParseError(null);
    }
  };

  const handleRemoveFile = () => {
    // No need to revoke data URLs
    setUploadedFile(null);
    setFileUrl(null);
    setPageNumber(1);
    setNumPages(null);
    setParseResult(null);
    setParseError(null);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  
  const handleParse = async () => {
    if (!uploadedFile || parsing) return;
    setParsing(true);
    setParseError(null);
    try {
      const res = await apiClient.parseDocument(uploadedFile);
      setParseResult(res);
    } catch (err) {
      setParseResult(null);
      setParseError(err instanceof Error ? err.message : 'Failed to parse document');
    } finally {
      setParsing(false);
    }
  };
  
  return (
    <>
      <style>
        {`
          .react-pdf__Page {
            max-width: 100%;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .react-pdf__Page__canvas {
            max-width: 100%;
            height: auto;
          }
          .react-pdf__Page__textContent {
            color: transparent;
          }
          .react-pdf__Page__annotations {
            color: transparent;
          }
        `}
      </style>
      <div className="min-h-screen bg-[#e4dac2] p-8 overflow-auto">
      <div className="max-w-[1440px] mx-auto space-y-6">
        <header className="space-y-4">
          <div className="flex items-center gap-2" onClick={() => navigate("/neuropack-sante")}>
            <ChevronLeftIcon className="w-6 h-6 text-[#4e3117]" />
            <h1 
              className="font-bold text-[#4e3117] tracking-[var(--h6-letter-spacing)] leading-[var(--h6-line-height)] [-webkit-text-stroke:1px_transparent] bg-[linear-gradient(180deg,#7C5F48,rgba(189,148,87,1)_10%,rgba(227,202,137,1)_25%,rgb(245, 150, 7)_78%,rgba(185,148,79,1)_100%)] [-webkit-background-clip:text]"
              style={{ fontSize: '26px' }}
            >
              FACTURES SUPPRIMÉES
            </h1>
          </div>

          <div className="flex items-center gap-2.5 pl-8">
            <span className="font-p3-regular font-[number:var(--p3-regular-font-weight)] text-[#4e3117] text-[length:var(--p3-regular-font-size)] tracking-[var(--p3-regular-letter-spacing)] leading-[var(--p3-regular-line-height)]">
              ProtoCheck
            </span>
            <Separator orientation="vertical" className="h-4 bg-[#4e3117]" />
            <span className="font-p3-regular font-[number:var(--p3-regular-font-weight)] text-[#4e3117] text-[length:var(--p3-regular-font-size)] tracking-[var(--p3-regular-letter-spacing)] leading-[var(--p3-regular-line-height)]">
              Pilotage Central
            </span>
            <Separator orientation="vertical" className="h-4 bg-[#4e3117]" />
            <span className="font-p3-regular font-[number:var(--p3-regular-font-weight)] text-[#4e3117] text-[length:var(--p3-regular-font-size)] tracking-[var(--p3-regular-letter-spacing)] leading-[var(--p3-regular-line-height)]">
              Interface Quantique de Gestion
            </span>
          </div>
        </header>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-p3-bold font-[number:var(--p3-bold-font-weight)] text-[#4e3117] text-[length:var(--p3-bold-font-size)] tracking-[var(--p3-bold-letter-spacing)] leading-[var(--p3-bold-line-height)]">
              INTELLIGENCE ARTIFICIELLE PRÉDICTIVE
            </h2>
            <p className="font-caption-1-regular font-[number:var(--caption-1-regular-font-weight)] text-[#4e3117] text-[length:var(--caption-1-regular-font-size)] tracking-[var(--caption-1-regular-letter-spacing)] leading-[var(--caption-1-regular-line-height)]">
              Analyse comportementale et détection d&apos;anomalies
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Card className="relative isolate inline-flex items-start gap-2.5 p-5 rounded-lg border-[none] bg-[linear-gradient(184deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-[0.6px] before:rounded-lg before:[background:linear-gradient(156deg,#7C5F48,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-0 before:pointer-events-none">
              <CardContent className="relative z-10 p-0 flex items-start gap-2.5">
                <img
                  src="res://icons/frame-1618869698.svg"
                  alt="Frame"
                  className="w-[52px] h-[52px]"
                />
                <div className="flex flex-col gap-2">
                  <span className="font-p2-bold font-[number:var(--p2-bold-font-weight)] text-[#faecd2] text-[length:var(--p2-bold-font-size)] tracking-[var(--p2-bold-letter-spacing)] leading-[var(--p2-bold-line-height)]">
                    IA PRÉDICTIVE
                  </span>
                  <span className="font-caption-1-regular font-[number:var(--caption-1-regular-font-weight)] text-[#faecd2] text-[length:var(--caption-1-regular-font-size)] tracking-[var(--caption-1-regular-letter-spacing)] leading-[var(--caption-1-regular-line-height)]">
                    Analyse en temps réel
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative isolate inline-flex items-start gap-2.5 p-5 rounded-lg border-[none] bg-[linear-gradient(184deg,rgba(160,0,0,1)_0%,rgba(108,0,0,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-[0.6px] before:rounded-lg before:[background:linear-gradient(156deg,#7C5F48,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-0 before:pointer-events-none">
              <CardContent className="relative z-10 p-0 flex items-start gap-2.5">
                <div className="w-12 h-12 bg-[#faecd229] rounded-full border border-solid border-[#faecd23d] flex items-center justify-center">
                  <img
                    src="res://icons/typcn-warning.svg"
                    alt="Warning"
                    className="w-6 h-6"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-p2-bold font-[number:var(--p2-bold-font-weight)] text-[#faecd2] text-[length:var(--p2-bold-font-size)] tracking-[var(--p2-bold-letter-spacing)] leading-[var(--p2-bold-line-height)]">
                    23
                  </span>
                  <span className="font-caption-1-regular font-[number:var(--caption-1-regular-font-weight)] text-[#faecd2] text-[length:var(--caption-1-regular-font-size)] tracking-[var(--caption-1-regular-letter-spacing)] leading-[var(--caption-1-regular-line-height)]">
                    Niveau Critique
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {topMetrics.map((metric, index) => (
            <Card
              key={index}
              className="relative isolate flex flex-col gap-1 p-5 rounded-lg border-[none] bg-[linear-gradient(192deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-lg before:[background:linear-gradient(98deg,#7C5F48,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-0 before:pointer-events-none"
            >
              <CardContent className="relative z-10 p-0 space-y-1">
                <div className="flex items-start gap-2">
                  <img
                    src={metric.icon}
                    alt={metric.label}
                    className="w-3 h-3"
                  />
                  <span className="flex-1 font-caption-3-bold font-[number:var(--caption-3-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-3-bold-font-size)] tracking-[var(--caption-3-bold-letter-spacing)] leading-[var(--caption-3-bold-line-height)]">
                    {metric.label}
                  </span>
                </div>
                <div className="font-h6 font-[number:var(--h6-font-weight)] text-[#faecd2] text-[length:var(--h6-font-size)] tracking-[var(--h6-letter-spacing)] leading-[var(--h6-line-height)]">
                  {metric.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card className="relative isolate flex flex-col gap-6 p-5 rounded-lg border-[none] bg-[linear-gradient(196deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-lg before:[background:linear-gradient(98deg,#7C5F48,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-0 before:pointer-events-none">
              <CardContent className="relative z-10 p-0 space-y-6">
                <h3 className="font-p3-bold font-[number:var(--p3-bold-font-weight)] text-[#faecd2] text-[length:var(--p3-bold-font-size)] tracking-[var(--p3-bold-letter-spacing)] leading-[var(--p3-bold-line-height)]">
                  TERMINAL DE CONTRÔLE PRINCIPAL
                </h3>

                <div className="space-y-4 p-4 bg-[#faecd214] rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-caption-1-bold font-[number:var(--caption-1-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-1-bold-font-size)] tracking-[var(--caption-1-bold-letter-spacing)] leading-[var(--caption-1-bold-line-height)]">
                      FILTRES QUANTIQUES INTELLIGENTS
                    </span>
                    <Badge className="inline-flex items-center gap-1 pt-2.5 pb-3 px-4 rounded-[99px] border-[0.6px] border-solid border-[#faecd2] bg-[linear-gradient(335deg,rgba(199,183,165,1)_0%,rgba(171,142,111,1)_22%,rgba(130,79,60,1)_82%,rgba(60,36,27,1)_100%)] h-auto">
                      <img
                        src="res://icons/artificial-intelligence.svg"
                        alt="AI"
                        className="w-3 h-3"
                      />
                      <span className="font-caption-4-bold font-[number:var(--caption-4-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-4-bold-font-size)] tracking-[var(--caption-4-bold-letter-spacing)] leading-[var(--caption-4-bold-line-height)]">
                        MODE IA
                      </span>
                    </Badge>
                  </div>

                  <div className="space-y-4 p-2 bg-[#faecd229] rounded-sm border-[0.6px] border-solid border-[#faecd23d]">
                    <span className="font-caption-4-bold font-[number:var(--caption-4-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-4-bold-font-size)] tracking-[var(--caption-4-bold-letter-spacing)] leading-[var(--caption-4-bold-line-height)]">
                      Suggestions IA basées sur vos patterns
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <Badge
                          key={index}
                          className="inline-flex items-center gap-1.5 pt-1.5 pb-2 px-3 bg-[#faecd229] rounded-[999px] border border-solid border-[#faecd2] h-auto"
                        >
                          <img
                            src={suggestion.icon}
                            alt={suggestion.label}
                            className="w-3 h-3"
                          />
                          <span className="font-caption-3-regular font-[number:var(--caption-3-regular-font-weight)] text-[#faecd2] text-[length:var(--caption-3-regular-font-size)] tracking-[var(--caption-3-regular-letter-spacing)] leading-[var(--caption-3-regular-line-height)]">
                            {suggestion.label}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="font-caption-2-bold font-[number:var(--caption-2-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-2-bold-font-size)] tracking-[var(--caption-2-bold-letter-spacing)] leading-[var(--caption-2-bold-line-height)]">
                        Reserche Sémantique
                      </label>
                      <Input
                        placeholder="Recherche intelligente par IA..."
                        className="bg-[#4e311752] border-[#faecd2] text-white placeholder:text-[#ffffff99] font-caption-2-regular font-[number:var(--caption-2-regular-font-weight)] text-[length:var(--caption-2-regular-font-size)] tracking-[var(--caption-2-regular-letter-spacing)] leading-[var(--caption-2-regular-line-height)]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-caption-2-bold font-[number:var(--caption-2-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-2-bold-font-size)] tracking-[var(--caption-2-bold-letter-spacing)] leading-[var(--caption-2-bold-line-height)]">
                        Statut Facture
                      </label>
                      <Select>
                        <SelectTrigger className="bg-[#4e311752] border-[#faecd2] text-white">
                          <SelectValue placeholder="Tous les status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les status</SelectItem>
                          <SelectItem value="deleted">Supprimées</SelectItem>
                          <SelectItem value="never-created">Jamais facturées</SelectItem>
                          <SelectItem value="active">Actives</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="font-caption-2-bold font-[number:var(--caption-2-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-2-bold-font-size)] tracking-[var(--caption-2-bold-letter-spacing)] leading-[var(--caption-2-bold-line-height)]">
                        Statut Devis
                      </label>
                      <Select>
                        <SelectTrigger className="bg-[#4e311752] border-[#faecd2] text-white">
                          <SelectValue placeholder="Tous les status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les status</SelectItem>
                          <SelectItem value="present">Présent</SelectItem>
                          <SelectItem value="deleted">Supprimé</SelectItem>
                          <SelectItem value="missing">Absent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="font-caption-2-bold font-[number:var(--caption-2-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-2-bold-font-size)] tracking-[var(--caption-2-bold-letter-spacing)] leading-[var(--caption-2-bold-line-height)]">
                        Fiche LABO
                      </label>
                      <Select>
                        <SelectTrigger className="bg-[#4e311752] border-[#faecd2] text-white">
                          <SelectValue placeholder="Tous les status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les status</SelectItem>
                          <SelectItem value="scanned">Scannée</SelectItem>
                          <SelectItem value="missing">Absente</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="font-caption-2-bold font-[number:var(--caption-2-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-2-bold-font-size)] tracking-[var(--caption-2-bold-letter-spacing)] leading-[var(--caption-2-bold-line-height)]">
                        Seuil Financier
                      </label>
                      <div className="space-y-2">
                        <div className="relative">
                          <Slider
                            value={sliderValue}
                            onValueChange={setSliderValue}
                            max={10000}
                            min={0}
                            step={100}
                            className="w-full"
                          />
                          {/* Value display marker */}
                          <div 
                            className="absolute top-[-35px] transform -translate-x-1/2 flex flex-col items-center"
                            style={{ left: `${(sliderValue[0] / 10000) * 100}%` }}
                          >
                            <Badge className="bg-[#8a6e52] rounded-[999px] px-1.5 py-1 h-auto">
                              <span className="font-caption-4-regular font-[number:var(--caption-4-regular-font-weight)] text-white text-[length:var(--caption-4-regular-font-size)] tracking-[var(--caption-4-regular-letter-spacing)] leading-[var(--caption-4-regular-line-height)]">
                                {sliderValue[0].toLocaleString('fr-FR')}€
                              </span>
                            </Badge>
                            <img
                              src="res://icons/polygon-1.svg"
                              alt="Polygon"
                              className="w-[7.2px] h-[6.5px] -mt-1"
                            />
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-caption-2-regular font-[number:var(--caption-2-regular-font-weight)] text-white text-[length:var(--caption-2-regular-font-size)] tracking-[var(--caption-2-regular-letter-spacing)] leading-[var(--caption-2-regular-line-height)]">
                            0€
                          </span>
                          <span className="font-caption-2-regular font-[number:var(--caption-2-regular-font-weight)] text-white text-[length:var(--caption-2-regular-font-size)] tracking-[var(--caption-2-regular-letter-spacing)] leading-[var(--caption-2-regular-line-height)]">
                            10.000€
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-caption-2-bold font-[number:var(--caption-2-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-2-bold-font-size)] tracking-[var(--caption-2-bold-letter-spacing)] leading-[var(--caption-2-bold-line-height)]">
                        Action Rapides
                      </label>
                      <Select>
                        <SelectTrigger className="bg-[#4e311752] border-[#faecd2] text-white">
                          <SelectValue placeholder="Aujourd'hui" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Aujourd'hui</SelectItem>
                          <SelectItem value="yesterday">Hier</SelectItem>
                          <SelectItem value="week">Cette semaine</SelectItem>
                          <SelectItem value="month">Ce mois</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button className="relative isolate inline-flex items-center gap-1 pt-2.5 pb-3 px-4 rounded-[99px] border-[0.6px] border-solid border-[#faecd2] bg-transparent hover:bg-[#faecd214] h-auto before:content-[''] before:absolute before:inset-0 before:z-0">
                      <img
                        src="res://icons/bx-reset.svg"
                        alt="Reset"
                        className="w-3 h-3"
                      />
                      <span className="font-caption-4-bold font-[number:var(--caption-4-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-4-bold-font-size)] tracking-[var(--caption-4-bold-letter-spacing)] leading-[var(--caption-4-bold-line-height)]">
                        Reset Complet
                      </span>
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button className="relative isolate inline-flex items-center gap-1 pt-2.5 pb-3 px-4 rounded-[99px] border-[0.6px] border-solid border-[#faecd2] bg-transparent hover:bg-[#faecd214] h-auto before:content-[''] before:absolute before:inset-0 before:z-0">
                        <img
                          src="res://icons/majesticons-filter.svg"
                          alt="Filter"
                          className="w-3 h-3"
                        />
                        <span className="font-caption-4-bold font-[number:var(--caption-4-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-4-bold-font-size)] tracking-[var(--caption-4-bold-letter-spacing)] leading-[var(--caption-4-bold-line-height)]">
                          Appliquer Filtres Quantiques
                        </span>
                      </Button>

                      <Button className="relative isolate inline-flex items-center gap-1 pt-2.5 pb-3 px-4 rounded-[99px] border-[none] shadow-[inset_0px_4.34px_6.51px_#ffffff99] bg-[linear-gradient(184deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-[1.09px] before:rounded-[99px] before:[background:linear-gradient(174deg,rgba(255,255,255,0.53)_0%,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-0 before:pointer-events-none h-auto">
                        <img
                          src="res://icons/solar-document-bold.svg"
                          alt="Document"
                          className="w-3 h-3"
                        />
                        <span className="font-caption-3-bold font-[number:var(--caption-3-bold-font-weight)] text-[#4e3016] text-[length:var(--caption-3-bold-font-size)] tracking-[var(--caption-3-bold-letter-spacing)] leading-[var(--caption-3-bold-line-height)] [-webkit-text-stroke:0.47px_transparent] bg-[linear-gradient(360deg,rgba(254,230,155,1)_0%,rgba(254,230,155,0)_100%)] [-webkit-background-clip:text]">
                          Justifier Sélection
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-[#faecd214] rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-caption-1-bold font-[number:var(--caption-1-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-1-bold-font-size)] tracking-[var(--caption-1-bold-letter-spacing)] leading-[var(--caption-1-bold-line-height)]">
                      ANALYSE TEMPORELLE DES SUPPRESSIONS
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge className="inline-flex items-center gap-1 pt-2.5 pb-3 px-4 rounded-[99px] border-[0.6px] border-solid border-[#faecd2] bg-[linear-gradient(335deg,rgba(199,183,165,1)_0%,rgba(171,142,111,1)_22%,rgba(130,79,60,1)_82%,rgba(60,36,27,1)_100%)] h-auto">
                        <img
                          src="res://icons/solar-graph-bold.svg"
                          alt="Graph"
                          className="w-3 h-3"
                        />
                        <span className="font-caption-4-bold font-[number:var(--caption-4-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-4-bold-font-size)] tracking-[var(--caption-4-bold-letter-spacing)] leading-[var(--caption-4-bold-line-height)]">
                          GRAPHIQUE
                        </span>
                      </Badge>
                      <Badge
                        onClick={() => { if (!uploadedFile || parsing) return; handleParse(); }}
                        className="inline-flex items-center gap-1 pt-2.5 pb-3 px-4 rounded-[99px] border-[0.6px] border-solid border-[#faecd2] bg-[linear-gradient(335deg,rgba(199,183,165,1)_0%,rgba(171,142,111,1)_22%,rgba(130,79,60,1)_82%,rgba(60,36,27,1)_100%)] h-auto cursor-pointer"
                      >
                        <img
                          src="res://icons/bxs-data.svg"
                          alt="Data"
                          className="w-3 h-3"
                        />
                        <span className="font-caption-4-bold font-[number:var(--caption-4-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-4-bold-font-size)] tracking-[var(--caption-4-bold-letter-spacing)] leading-[var(--caption-4-bold-line-height)]">
                          {parsing ? 'ANALYSE…' : 'DONNÉES'}
                        </span>
                      </Badge>
                      <Badge className="inline-flex items-center gap-1 pt-2.5 pb-3 px-4 rounded-[99px] border-[0.6px] border-solid border-[#faecd2] bg-[linear-gradient(335deg,rgba(199,183,165,1)_0%,rgba(171,142,111,1)_22%,rgba(130,79,60,1)_82%,rgba(60,36,27,1)_100%)] h-auto">
                        <img
                          src="res://icons/tabler-zoom-in-filled.svg"
                          alt="Zoom"
                          className="w-3 h-3"
                        />
                        <span className="font-caption-4-bold font-[number:var(--caption-4-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-4-bold-font-size)] tracking-[var(--caption-4-bold-letter-spacing)] leading-[var(--caption-4-bold-line-height)]">
                          ZOOM
                        </span>
                      </Badge>
                    </div>
                  </div>

                  {uploadedFile && fileUrl ? (
                    <div className="flex flex-col gap-4 p-4 bg-[#faecd214] rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src="res://icons/solar-document-bold.svg"
                            alt="Document"
                            className="w-5 h-5"
                          />
                          <span className="font-caption-2-bold font-[number:var(--caption-2-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-2-bold-font-size)] tracking-[var(--caption-2-bold-letter-spacing)] leading-[var(--caption-2-bold-line-height)]">
                            {uploadedFile.name}
                          </span>
                        </div>
                        <Button
                          onClick={handleRemoveFile}
                          className="inline-flex items-center gap-1 pt-1.5 pb-2 px-3 rounded-[99px] border-[0.6px] border-solid border-[#faecd2] bg-transparent hover:bg-[#faecd214] h-auto"
                        >
                          <img
                            src="res://icons/bx-reset.svg"
                            alt="Remove"
                            className="w-3 h-3"
                          />
                          <span className="font-caption-4-bold font-[number:var(--caption-4-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-4-bold-font-size)] tracking-[var(--caption-4-bold-letter-spacing)] leading-[var(--caption-4-bold-line-height)]">
                            Supprimer
                          </span>
                        </Button>
                      </div>
                      
                      {uploadedFile.type === 'application/pdf' ? (
                        <div className="w-full bg-white rounded-lg overflow-hidden border border-[#faecd2]">
                          <div className="flex items-center justify-between p-3 bg-[#faecd214] border-b border-[#faecd2]">
                            <div className="flex items-center gap-2">
                              <img
                                src="res://icons/solar-document-bold.svg"
                                alt="PDF"
                                className="w-4 h-4"
                              />
                              <span className="font-caption-3-bold font-[number:var(--caption-3-bold-font-weight)] text-[#4e3117] text-[length:var(--caption-3-bold-font-size)] tracking-[var(--caption-3-bold-letter-spacing)] leading-[var(--caption-3-bold-line-height)]">
                                {uploadedFile.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                                disabled={pageNumber <= 1}
                                className="inline-flex items-center gap-1 pt-1.5 pb-2 px-3 rounded-[99px] border-[0.6px] border-solid border-[#4e3117] bg-transparent hover:bg-[#4e311714] disabled:opacity-50 disabled:cursor-not-allowed h-auto"
                              >
                                <span className="font-caption-4-bold font-[number:var(--caption-4-bold-font-weight)] text-[#4e3117] text-[length:var(--caption-4-bold-font-size)] tracking-[var(--caption-4-bold-letter-spacing)] leading-[var(--caption-4-bold-line-height)]">
                                  ←
                                </span>
                              </Button>
                              <span className="font-caption-3-regular font-[number:var(--caption-3-regular-font-weight)] text-[#4e3117] text-[length:var(--caption-3-regular-font-size)] tracking-[var(--caption-3-regular-letter-spacing)] leading-[var(--caption-3-regular-line-height)]">
                                {pageNumber} / {numPages || '...'}
                              </span>
                              <Button
                                onClick={() => setPageNumber(Math.min(numPages || 1, pageNumber + 1))}
                                disabled={pageNumber >= (numPages || 1)}
                                className="inline-flex items-center gap-1 pt-1.5 pb-2 px-3 rounded-[99px] border-[0.6px] border-solid border-[#4e3117] bg-transparent hover:bg-[#4e311714] disabled:opacity-50 disabled:cursor-not-allowed h-auto"
                              >
                                <span className="font-caption-4-bold font-[number:var(--caption-4-bold-font-weight)] text-[#4e3117] text-[length:var(--caption-4-bold-font-size)] tracking-[var(--caption-4-bold-letter-spacing)] leading-[var(--caption-4-bold-line-height)]">
                                  →
                                </span>
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-center bg-gray-100 p-4">
                            <Document
                              file={fileUrl}
                              onLoadSuccess={onDocumentLoadSuccess}
                              className="max-w-full"
                            >
                              <Page
                                pageNumber={pageNumber}
                                width={800}
                                className="shadow-lg"
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                              />
                            </Document>
                          </div>
                          {/* Parsed data output */}
                          <div className="p-4 bg-[#faecd214] border-t border-[#faecd2]">
                            {parseError && (
                              <div className="mb-2 text-[#ffadad] text-sm">{parseError}</div>
                            )}
                            {parseResult?.message && (
                              <div className="mb-2 text-[#4e3117] text-sm">{parseResult.message}</div>
                            )}
                            {parseResult?.content && (
                              <pre className="whitespace-pre-wrap text-xs bg-white p-3 rounded border border-[#faecd2] max-h-60 overflow-auto text-[#4e3117]">
                                {parseResult.content}
                              </pre>
                            )}
                            {parseResult?.download_url && (
                              <a
                                href={apiClient.getDownloadUrl(parseResult.download_url)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mt-2 text-xs text-[#4e3117] underline"
                              >
                                Télécharger les résultats
                              </a>
                            )}
                          </div>
                        </div>
                      ) : uploadedFile.type.startsWith('image/') ? (
                        <div className="w-full bg-white rounded-lg overflow-hidden border border-[#faecd2]">
                          <div className="flex items-center justify-between p-3 bg-[#faecd214] border-b border-[#faecd2]">
                            <div className="flex items-center gap-2">
                              <img
                                src="res://icons/solar-document-bold.svg"
                                alt="Image"
                                className="w-4 h-4"
                              />
                              <span className="font-caption-3-bold font-[number:var(--caption-3-bold-font-weight)] text-[#4e3117] text-[length:var(--caption-3-bold-font-size)] tracking-[var(--caption-3-bold-letter-spacing)] leading-[var(--caption-3-bold-line-height)]">
                                {uploadedFile.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-center bg-gray-100 p-4">
                            {fileUrl && (
                              <img src={fileUrl} alt="Preview" className="max-w-full max-h-[700px] rounded shadow" />
                            )}
                          </div>
                          {/* Parsed data output */}
                          <div className="p-4 bg-[#faecd214] border-t border-[#faecd2]">
                            {parseError && (
                              <div className="mb-2 text-[#ffadad] text-sm">{parseError}</div>
                            )}
                            {parseResult?.message && (
                              <div className="mb-2 text-[#4e3117] text-sm">{parseResult.message}</div>
                            )}
                            {parseResult?.content && (
                              <pre className="whitespace-pre-wrap text-xs bg-white p-3 rounded border border-[#faecd2] max-h-60 overflow-auto text-[#4e3117]">
                                {parseResult.content}
                              </pre>
                            )}
                            {parseResult?.download_url && (
                              <a
                                href={apiClient.getDownloadUrl(parseResult.download_url)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mt-2 text-xs text-[#4e3117] underline"
                              >
                                Télécharger les résultats
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-4 p-8 bg-[#faecd229] rounded-lg border border-dashed border-[#faecd2] min-h-[200px]">
                          <img
                            src="res://icons/solar-document-bold.svg"
                            alt="Document"
                            className="w-16 h-16"
                          />
                          <div className="flex flex-col items-center gap-2">
                            <span className="font-caption-3-bold font-[number:var(--caption-3-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-3-bold-font-size)] tracking-[var(--caption-3-bold-letter-spacing)] leading-[var(--caption-3-bold-line-height)]">
                              Fichier téléchargé: {uploadedFile.name}
                            </span>
                            <span className="font-caption-4-regular font-[number:var(--caption-4-regular-font-weight)] text-[#faecd2] text-[length:var(--caption-4-regular-font-size)] tracking-[var(--caption-4-regular-letter-spacing)] leading-[var(--caption-4-regular-line-height)]">
                              Type: {uploadedFile.type} | Taille: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 p-2 bg-[#faecd229] rounded-sm border border-dashed border-[#faecd2] min-h-[200px]">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.xlsx,.xls"
                        className="hidden"
                        id="document-upload"
                        onChange={handleFileUpload}
                      />
                      <label
                        htmlFor="document-upload"
                        className="flex flex-col items-center gap-4 cursor-pointer"
                      >
                        <img
                          src="res://icons/tabler-drag-drop.svg"
                          alt="Upload Document"
                          className="w-12 h-12"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <span className="font-caption-4-bold font-[number:var(--caption-4-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-4-bold-font-size)] tracking-[var(--caption-4-bold-letter-spacing)] leading-[var(--caption-4-bold-line-height)]">
                            Cliquez pour télécharger un document
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-caption-4-regular font-[number:var(--caption-4-regular-font-weight)] text-[#faecd2] text-[length:var(--caption-4-regular-font-size)] tracking-[var(--caption-4-regular-letter-spacing)] leading-[var(--caption-4-regular-line-height)]">
                              Formats supportés: PDF, JPG, JPEG, PNG, DOC, DOCX, TXT, XLSX
                            </span>
                          </div>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-4 bg-[#faecd214] rounded-lg">
                  <div className="space-y-2">
                    <label className="font-caption-2-bold font-[number:var(--caption-2-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-2-bold-font-size)] tracking-[var(--caption-2-bold-letter-spacing)] leading-[var(--caption-2-bold-line-height)]">
                      Impact Financier Calculé
                    </label>
                    <img
                      src="res://icons/frame-1618869730.svg"
                      alt="Frame"
                      className="w-full h-8"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-caption-2-bold font-[number:var(--caption-2-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-2-bold-font-size)] tracking-[var(--caption-2-bold-letter-spacing)] leading-[var(--caption-2-bold-line-height)]">
                      Score De Risque IA
                    </label>
                    <img
                      src="res://icons/frame-1618869730.svg"
                      alt="Frame"
                      className="w-full h-8"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-caption-2-bold font-[number:var(--caption-2-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-2-bold-font-size)] tracking-[var(--caption-2-bold-letter-spacing)] leading-[var(--caption-2-bold-line-height)]">
                      Justification Détaillée et contexte
                    </label>
                    <textarea
                      placeholder="Décrivez en détail les raisons, le contexte, les actions prises..."
                      className="w-full px-2 py-3 bg-[#4e311752] rounded-lg border border-solid border-[#faecd2] font-caption-2-regular font-[number:var(--caption-2-regular-font-weight)] text-[#ffffff99] text-[length:var(--caption-2-regular-font-size)] tracking-[var(--caption-2-regular-letter-spacing)] leading-[var(--caption-2-regular-line-height)] resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="relative isolate flex flex-col gap-6 p-5 rounded-lg border-[none] bg-[linear-gradient(192deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-lg before:[background:linear-gradient(98deg,#7C5F48,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-0 before:pointer-events-none">
              <CardContent className="relative z-10 p-0 space-y-6">
                <h3 className="font-p3-bold font-[number:var(--p3-bold-font-weight)] text-[#faecd2] text-[length:var(--p3-bold-font-size)] tracking-[var(--p3-bold-letter-spacing)] leading-[var(--p3-bold-line-height)]">
                  MÉTRIQUES TEMPS RÉEL
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {metricsData.map((metric, index) => (
                    <Card
                      key={index}
                      className="relative isolate flex flex-col gap-1 p-5 rounded-lg border-[none] bg-[linear-gradient(192deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-lg before:[background:linear-gradient(98deg,#7C5F48,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-0 before:pointer-events-none"
                    >
                      <CardContent className="relative z-10 p-0 space-y-1">
                        <div className="flex items-start gap-2">
                          <img
                            src={metric.icon}
                            alt={metric.label}
                            className="w-3 h-3"
                          />
                          <span className="font-caption-3-bold font-[number:var(--caption-3-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-3-bold-font-size)] tracking-[var(--caption-3-bold-letter-spacing)] leading-[var(--caption-3-bold-line-height)]">
                            {metric.label}
                          </span>
                        </div>
                        <div className="font-h6 font-[number:var(--h6-font-weight)] text-[#faecd2] text-[length:var(--h6-font-size)] tracking-[var(--h6-letter-spacing)] leading-[var(--h6-line-height)]">
                          {metric.value}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="relative isolate flex flex-col gap-6 p-5 rounded-lg border-[none] bg-[linear-gradient(192deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-lg before:[background:linear-gradient(98deg,#7C5F48,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-0 before:pointer-events-none">
              <CardContent className="relative z-10 p-0 space-y-6">
                <h3 className="font-p3-bold font-[number:var(--p3-bold-font-weight)] text-[#faecd2] text-[length:var(--p3-bold-font-size)] tracking-[var(--p3-bold-letter-spacing)] leading-[var(--p3-bold-line-height)]">
                  DÉTECTION IA
                </h3>

                <div className="space-y-2">
                  {detectionData.map((detection, index) => (
                    <div
                      key={index}
                      className={`flex flex-col gap-2 p-4 rounded-lg ${detection.bgColor}`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={detection.icon}
                          alt={detection.title}
                          className="w-4 h-4"
                        />
                        <span
                          className={`font-caption-2-bold font-[number:var(--caption-2-bold-font-weight)] text-[length:var(--caption-2-bold-font-size)] tracking-[var(--caption-2-bold-letter-spacing)] leading-[var(--caption-2-bold-line-height)] ${detection.titleColor}`}
                        >
                          {detection.title}
                        </span>
                      </div>
                      <span className="font-caption-2-regular font-[number:var(--caption-2-regular-font-weight)] text-[#faecd2] text-[length:var(--caption-2-regular-font-size)] tracking-[var(--caption-2-regular-letter-spacing)] leading-[var(--caption-2-regular-line-height)]">
                        {detection.content}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="relative isolate flex flex-col gap-6 p-5 rounded-lg border-[none] bg-[linear-gradient(192deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-lg before:[background:linear-gradient(98deg,#7C5F48,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-0 before:pointer-events-none">
              <CardContent className="relative z-10 p-0 space-y-6">
                <h3 className="font-p3-bold font-[number:var(--p3-bold-font-weight)] text-[#faecd2] text-[length:var(--p3-bold-font-size)] tracking-[var(--p3-bold-letter-spacing)] leading-[var(--p3-bold-line-height)]">
                  PRACTICIEN À RISQUE
                </h3>

                <div className="space-y-2">
                  {practitionerRiskData.map((practitioner, index) => (
                    <div
                      key={index}
                      className={`flex flex-col gap-2 p-4 rounded-lg ${practitioner.bgColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={practitioner.icon}
                            alt={practitioner.name}
                            className="w-4 h-4"
                          />
                          <span
                            className={`font-caption-2-bold font-[number:var(--caption-2-bold-font-weight)] text-[length:var(--caption-2-bold-font-size)] tracking-[var(--caption-2-bold-letter-spacing)] leading-[var(--caption-2-bold-line-height)] ${practitioner.nameColor}`}
                          >
                            {practitioner.name}
                          </span>
                        </div>
                        <span
                          className={`font-caption-2-bold font-[number:var(--caption-2-bold-font-weight)] text-[length:var(--caption-2-bold-font-size)] tracking-[var(--caption-2-bold-letter-spacing)] leading-[var(--caption-2-bold-line-height)] ${practitioner.scoreColor}`}
                        >
                          Score: {practitioner.score}
                        </span>
                      </div>
                      <p className="font-normal text-[#faecd2] text-sm leading-[16.8px] whitespace-pre-line [font-family:'Open_Sans',Helvetica]">
                        {practitioner.details}
                      </p>
                      <div className="flex items-center gap-2">
                        {practitioner.badges.map((badge, badgeIndex) => (
                          <Badge
                            key={badgeIndex}
                            className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-sm ${badge.bgColor} ${badge.borderColor ? `border-[0.6px] border-solid ${badge.borderColor}` : ""} h-auto`}
                          >
                            <span className="font-caption-4-bold font-[number:var(--caption-4-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-4-bold-font-size)] tracking-[var(--caption-4-bold-letter-spacing)] leading-[var(--caption-4-bold-line-height)]">
                              {badge.label}
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="relative isolate flex flex-col gap-3 p-5 rounded-lg border-[none] bg-[linear-gradient(192deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-lg before:[background:linear-gradient(98deg,#7C5F48,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-0 before:pointer-events-none">
              <CardContent className="relative z-10 p-0 space-y-3">
                <h3 className="font-p3-bold font-[number:var(--p3-bold-font-weight)] text-[#faecd2] text-[length:var(--p3-bold-font-size)] tracking-[var(--p3-bold-letter-spacing)] leading-[var(--p3-bold-line-height)]">
                  TIMELINE RÉCENTE
                </h3>

                <div className="space-y-4 p-4 bg-[#faecd214] rounded-lg">
                  {timelineData.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex flex-col items-center gap-0.5">
                        <div
                          className={`w-2 h-2 bg-[#faecd2] ${index === 0 ? "rounded-full" : index === timelineData.length - 1 ? "rounded-[0px_0px_99px_99px]" : "rounded-[0px_0px_99px_99px]"}`}
                        />
                        <div className="w-0.5 bg-[#faecd2]" />
                        {index < timelineData.length - 1 && (
                          <div className="flex-1 w-0.5 bg-[#faecd2] rounded-[99px_99px_0px_0px]" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2 pt-3.5">
                        <span className="font-caption-2-bold font-[number:var(--caption-2-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-2-bold-font-size)] tracking-[var(--caption-2-bold-letter-spacing)] leading-[var(--caption-2-bold-line-height)]">
                          {item.time}
                        </span>
                        <span className="font-caption-2-regular font-[number:var(--caption-2-regular-font-weight)] text-[#faecd2] text-[length:var(--caption-2-regular-font-size)] tracking-[var(--caption-2-regular-letter-spacing)] leading-[var(--caption-2-regular-line-height)]">
                          {item.event}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="relative isolate flex flex-col gap-6 p-5 rounded-lg border-[none] bg-[linear-gradient(196deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-lg before:[background:linear-gradient(98deg,#7C5F48,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-0 before:pointer-events-none">
          <CardContent className="relative z-10 p-0 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-p3-bold font-[number:var(--p3-bold-font-weight)] text-[#faecd2] text-[length:var(--p3-bold-font-size)] tracking-[var(--p3-bold-letter-spacing)] leading-[var(--p3-bold-line-height)]">
                BASE DE DONNÉES DES SUPPRESSIONS
              </h3>

              <div className="flex items-center gap-2">
                <Button
                  className="relative isolate inline-flex items-center gap-1 pt-2.5 pb-3 px-4 rounded-[99px] border-[none] shadow-[inset_0px_4.34px_6.51px_#ffffff99] bg-[linear-gradient(184deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-[1.09px] before:rounded-[99px] before:[background:linear-gradient(174deg,rgba(255,255,255,0.53)_0%,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-0 before:pointer-events-none h-auto"
                >
                  <img
                    src="res://icons/mingcute-flash-fill.svg"
                    alt="Flash"
                    className="w-3 h-3"
                  />
                  <span className="font-caption-3-bold font-[number:var(--caption-3-bold-font-weight)] text-[#4e3016] text-[length:var(--caption-3-bold-font-size)] tracking-[var(--caption-3-bold-letter-spacing)] leading-[var(--caption-3-bold-line-height)] [-webkit-text-stroke:0.47px_transparent] bg-[linear-gradient(360deg,rgba(254,230,155,1)_0%,rgba(254,230,155,0)_100%)] [-webkit-background-clip:text]">
                    Actions
                  </span>
                </Button>

                <Button className="relative isolate inline-flex items-center gap-1 pt-2.5 pb-3 px-4 rounded-[99px] border-[none] shadow-[inset_0px_4.34px_6.51px_#ffffff99] bg-[linear-gradient(184deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-[1.09px] before:rounded-[99px] before:[background:linear-gradient(174deg,rgba(255,255,255,0.53)_0%,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-0 before:pointer-events-none h-auto">
                  <img
                    src="res://icons/artificial-intelligence.svg"
                    alt="AI"
                    className="w-3 h-3"
                  />
                  <span className="font-caption-3-bold font-[number:var(--caption-3-bold-font-weight)] text-[#4e3016] text-[length:var(--caption-3-bold-font-size)] tracking-[var(--caption-3-bold-letter-spacing)] leading-[var(--caption-3-bold-line-height)] [-webkit-text-stroke:0.47px_transparent] bg-[linear-gradient(360deg,rgba(254,230,155,1)_0%,rgba(254,230,155,0)_100%)] [-webkit-background-clip:text]">
                    Analyse IA
                  </span>
                </Button>
              </div>
            </div>

            <div className="bg-[#faecd214] rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 p-2 bg-[#faecd229] rounded-lg">
                <div className="w-4 h-4 rounded-sm border border-solid border-[#faecd2]" />
                <span className="flex-1 font-caption-3-regular font-[number:var(--caption-3-regular-font-weight)] text-[#faecd2cc] text-[length:var(--caption-3-regular-font-size)] tracking-[var(--caption-3-regular-letter-spacing)] leading-[var(--caption-3-regular-line-height)]">
                  Patient
                </span>
                <span className="flex-1 font-caption-3-regular font-[number:var(--caption-3-regular-font-weight)] text-[#faecd2cc] text-[length:var(--caption-3-regular-font-size)] tracking-[var(--caption-3-regular-letter-spacing)] leading-[var(--caption-3-regular-line-height)]">
                  Statut Facture
                </span>
                <span className="flex-1 font-caption-3-regular font-[number:var(--caption-3-regular-font-weight)] text-[#faecd2cc] text-[length:var(--caption-3-regular-font-size)] tracking-[var(--caption-3-regular-letter-spacing)] leading-[var(--caption-3-regular-line-height)]">
                  Date Suppression
                </span>
                <span className="flex-1 font-caption-3-regular font-[number:var(--caption-3-regular-font-weight)] text-[#faecd2cc] text-[length:var(--caption-3-regular-font-size)] tracking-[var(--caption-3-regular-letter-spacing)] leading-[var(--caption-3-regular-line-height)]">
                  Statut Devis
                </span>
                <span className="flex-1 font-caption-3-regular font-[number:var(--caption-3-regular-font-weight)] text-[#faecd2cc] text-[length:var(--caption-3-regular-font-size)] tracking-[var(--caption-3-regular-letter-spacing)] leading-[var(--caption-3-regular-line-height)]">
                  Fiche LABO
                </span>
                <span className="flex-1 font-caption-3-regular font-[number:var(--caption-3-regular-font-weight)] text-[#faecd2cc] text-[length:var(--caption-3-regular-font-size)] tracking-[var(--caption-3-regular-letter-spacing)] leading-[var(--caption-3-regular-line-height)]">
                  Impact Financier
                </span>
                <span className="flex-1 font-caption-3-regular font-[number:var(--caption-3-regular-font-weight)] text-[#faecd2cc] text-[length:var(--caption-3-regular-font-size)] tracking-[var(--caption-3-regular-letter-spacing)] leading-[var(--caption-3-regular-line-height)]">
                  Utilisateur
                </span>
                <span className="flex-1 font-caption-3-regular font-[number:var(--caption-3-regular-font-weight)] text-[#faecd2cc] text-[length:var(--caption-3-regular-font-size)] tracking-[var(--caption-3-regular-letter-spacing)] leading-[var(--caption-3-regular-line-height)]">
                  Score IA
                </span>
                <span className="w-32 font-caption-3-regular font-[number:var(--caption-3-regular-font-weight)] text-[#faecd2cc] text-[length:var(--caption-3-regular-font-size)] tracking-[var(--caption-3-regular-letter-spacing)] leading-[var(--caption-3-regular-line-height)]">
                  Actions
                </span>
              </div>

              {tableData.map((row, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg"
                >
                  <Checkbox className="w-4 h-4 rounded-sm border border-solid border-[#faecd2]" />

                  <div className="flex-1 font-caption-3-regular font-[number:var(--caption-3-regular-font-weight)] text-[#faecd2] text-[length:var(--caption-3-regular-font-size)] tracking-[var(--caption-3-regular-letter-spacing)] leading-[var(--caption-3-regular-line-height)]">
                    {row.patient}
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <Badge
                      className={`inline-flex items-center justify-center gap-1 px-1 py-0.5 rounded-sm ${row.statutFacture.bgColor} ${row.statutFacture.borderColor ? `border-[0.6px] border-solid ${row.statutFacture.borderColor}` : ""} h-auto w-fit`}
                    >
                      <span className="font-caption-4-bold font-[number:var(--caption-4-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-4-bold-font-size)] tracking-[var(--caption-4-bold-letter-spacing)] leading-[var(--caption-4-bold-line-height)]">
                        {row.statutFacture.label}
                      </span>
                    </Badge>
                    <span className="font-caption-4-regular font-[number:var(--caption-4-regular-font-weight)] text-[#faecd2cc] text-[length:var(--caption-4-regular-font-size)] tracking-[var(--caption-4-regular-letter-spacing)] leading-[var(--caption-4-regular-line-height)]">
                      {row.statutFacture.subtext}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <span
                      className={`font-caption-3-regular font-[number:var(--caption-3-regular-font-weight)] text-[length:var(--caption-3-regular-font-size)] tracking-[var(--caption-3-regular-letter-spacing)] leading-[var(--caption-3-regular-line-height)] ${row.dateSuppression.mainColor}`}
                    >
                      {row.dateSuppression.main}
                    </span>
                    <span className="font-caption-4-regular font-[number:var(--caption-4-regular-font-weight)] text-[#faecd2cc] text-[length:var(--caption-4-regular-font-size)] tracking-[var(--caption-4-regular-letter-spacing)] leading-[var(--caption-4-regular-line-height)]">
                      {row.dateSuppression.sub}
                    </span>
                  </div>

                  <div className="flex-1">
                    <Badge
                      className={`inline-flex items-center justify-center gap-1 px-1 py-0.5 rounded-sm ${row.statutDevis.bgColor} ${row.statutDevis.borderColor ? `border-[0.6px] border-solid ${row.statutDevis.borderColor}` : ""} h-auto w-fit`}
                    >
                      <span className="font-caption-4-bold font-[number:var(--caption-4-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-4-bold-font-size)] tracking-[var(--caption-4-bold-letter-spacing)] leading-[var(--caption-4-bold-line-height)]">
                        {row.statutDevis.label}
                      </span>
                    </Badge>
                  </div>

                  <div className="flex-1">
                    <Badge
                      className={`inline-flex items-center justify-center gap-1 px-1 py-0.5 rounded-sm ${row.ficheLabo.bgColor} ${row.ficheLabo.borderColor ? `border-[0.6px] border-solid ${row.ficheLabo.borderColor}` : ""} h-auto w-fit`}
                    >
                      <span className="font-caption-4-bold font-[number:var(--caption-4-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-4-bold-font-size)] tracking-[var(--caption-4-bold-letter-spacing)] leading-[var(--caption-4-bold-line-height)]">
                        {row.ficheLabo.label}
                      </span>
                    </Badge>
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <span className="font-caption-3-bold font-[number:var(--caption-3-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-3-bold-font-size)] tracking-[var(--caption-3-bold-letter-spacing)] leading-[var(--caption-3-bold-line-height)]">
                      {row.impactFinancier.main}
                    </span>
                    <span className="font-caption-4-regular font-[number:var(--caption-4-regular-font-weight)] text-[#faecd2cc] text-[length:var(--caption-4-regular-font-size)] tracking-[var(--caption-4-regular-letter-spacing)] leading-[var(--caption-4-regular-line-height)]">
                      {row.impactFinancier.sub}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <span className="font-caption-3-bold font-[number:var(--caption-3-bold-font-weight)] text-[#faecd2] text-[length:var(--caption-3-bold-font-size)] tracking-[var(--caption-3-bold-letter-spacing)] leading-[var(--caption-3-bold-line-height)]">
                      {row.utilisateur.main}
                    </span>
                    <span className="font-caption-4-regular font-[number:var(--caption-4-regular-font-weight)] text-[#faecd2cc] text-[length:var(--caption-4-regular-font-size)] tracking-[var(--caption-4-regular-letter-spacing)] leading-[var(--caption-4-regular-line-height)]">
                      {row.utilisateur.sub}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <img
                        src={row.scoreIA.icon}
                        alt="Score"
                        className="w-2.5 h-2.5"
                      />
                      <span
                        className={`font-caption-3-bold font-[number:var(--caption-3-bold-font-weight)] text-[length:var(--caption-3-bold-font-size)] tracking-[var(--caption-3-bold-letter-spacing)] leading-[var(--caption-3-bold-line-height)] ${row.scoreIA.scoreColor}`}
                      >
                        {row.scoreIA.score}
                      </span>
                    </div>
                    <span
                      className={`font-caption-4-regular font-[number:var(--caption-4-regular-font-weight)] text-[length:var(--caption-4-regular-font-size)] tracking-[var(--caption-4-regular-letter-spacing)] leading-[var(--caption-4-regular-line-height)] ${row.scoreIA.labelColor}`}
                    >
                      {row.scoreIA.label}
                    </span>
                  </div>

                  <div className="w-32 flex items-center gap-2">
                    <Button className="relative isolate w-9 h-9 p-0 rounded-[56.84px] shadow-[inset_0px_0px_26.05px_#f2f2f280,inset_2.37px_2.37px_1.18px_-2.37px_#b3b3b3,inset_-14.21px_-14.21px_7.11px_-16.58px_#b3b3b3,inset_18.95px_18.95px_10.66px_-21.32px_#ffffff] backdrop-blur-[23.68px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(23.68px)_brightness(100%)] bg-[linear-gradient(180deg,rgba(102,102,102,0.2)_0%,rgba(102,102,102,0)_33%),linear-gradient(180deg,rgba(102,102,102,0)_50%,rgba(102,102,102,0.4)_100%),linear-gradient(0deg,rgba(29,29,29,0.2)_0%,rgba(29,29,29,0.2)_100%),linear-gradient(0deg,rgba(29,29,29,1)_0%,rgba(29,29,29,1)_100%)] border-[none] before:content-[''] before:absolute before:inset-0 before:p-[1.09px] before:rounded-[87.16px] before:[background:linear-gradient(180deg,rgba(255,255,255,0.53)_0%,rgba(255,255,255,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-0 before:pointer-events-none">
                      <img
                        src="res://icons/solar-eye-bold.svg"
                        alt="View"
                        className="w-3 h-3"
                      />
                    </Button>
                    <img
                      src={row.actions[0]}
                      alt="Action 1"
                      className="w-[41.63px] h-9"
                    />
                    <img
                      src={row.actions[1]}
                      alt="Action 2"
                      className="w-[41.63px] h-9"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
