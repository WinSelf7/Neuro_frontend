import React, { useMemo, useState } from "react";
import {
  ChevronLeftIcon,
  AlertCircleIcon,
  SettingsIcon,
  ZapIcon,
  Search,
  X,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { apiClient, ParseResponse, PrescriptionResponse } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { PrescriptionPDFViewer as PrescriptionPDFViewerDefault, PrescriptionData } from "./templates/PrescriptionPDF";
import { PrescriptionPDFViewer as PrescriptionPDFViewer1 } from "./templates/PrescriptionPDF1";
import { PrescriptionPDFViewer as PrescriptionPDFViewer2 } from "./templates/PrescriptionPDF2";

type Transmission =
  | string
  | {
      hasMail: boolean;
      confirmed: boolean;
    };

type TraceabilityRow = {
  date: string;
  fseNumber: string;
  dossierNumber: string;
  type: string;
  insertion: {
    status: string;
    icon: string;
    color: string;
  };
  transmission: Transmission;
  statut: {
    label: string;
    icon: string;
  };
  user: string;
  actions: string;
};

/* ---------- AMY dictionary and helpers ---------- */
type AmyEntry = { label: string; price: string };
const AMY_TABLE: Record<string, AmyEntry> = {
  'AMY 8': { label: 'Mesure de l\'acuité visuelle et de la réfraction – Renouvellement', price: '20,80 €' },
  'AMY 15': { label: 'Bilan des troubles oculomoteurs', price: '39,00 €' },
  'AMY 7,7': { label: 'Séance orthoptique (courte)', price: '15,40 €' },
  'AMY 7': { label: 'Traitement de l\'amblyopie par série de vingt séances', price: '18,20 €' },
  'AMY 4': { label: 'Traitement des hétérophories (20 séances)', price: '10,40 €' },
  'AMY 7.7': { label: 'Traitement du strabisme par série de vingt séances', price: '20,02 €' },
};

function normalizeAmyCode(raw: string): string | null {
  if (!raw) return null;
  const m = raw.replace(/\s+/g, ' ').trim().toUpperCase().match(/AMY\s*\(?\s*([\d]+(?:[,\.]\d)?)\s*\)?/);
  if (!m) return null;
  let num = m[1].replace('.', ',');
  return `AMY ${num}`;
}

function normalizePrice(raw: string): string | null {
  if (!raw) return null;
  const m = raw.replace(/[^\d,\.]/g, '').trim();
  if (!m) return null;
  const num = m.replace(',', '.');
  const val = Number(num);
  if (Number.isNaN(val)) return null;
  const fixed = val.toFixed(2).replace('.', ',');
  return `${fixed} €`;
}

function extractFseFromMarkdown(md?: string): { amy?: string; price?: string } {
  if (!md) return {};
  const text = md.replace(/\r/g, '');
  const amyMatch = text.match(/AMY[^\d]*([\d]+(?:[,\.]\d)?)/i);
  const priceMatch = text.match(/(\d{1,3}[,\.\s]\d{1,2})\s*€?/);
  const amy = amyMatch ? (normalizeAmyCode(`AMY ${amyMatch[1]}`) || undefined) : undefined;
  const price = priceMatch ? (normalizePrice(priceMatch[1]) || undefined) : undefined;
  return { amy, price };
}

/* ---------- Patient / Prescriber ---------- */
type PatientInfo = { lastName: string; firstName: string; ssn: string; ipp: string };
type Prescriber = { initials: string; name: string; rpps: string };
const PRESCRIBERS: Prescriber[] = [
  { initials: 'DM', name: 'Dr. Martin', rpps: 'RPPS-123456' },
  { initials: 'DL', name: 'Dr. Leroy', rpps: 'RPPS-987654' },
];

function computeEdmPath(base: string, ipp: string): string {
  const cleaned = ipp.replace(/\D/g, '');
  const parts: string[] = [];
  let i = cleaned.length;
  while (i > 0) {
    const start = Math.max(0, i - 2);
    parts.unshift(cleaned.slice(start, i) || '00');
    i -= 2;
  }
  while (parts.length < 6) parts.unshift('00');
  return `${base}\\${parts.join('\\')}`;
}

function buildPrescriptionFilename(finess: string, fse: string) {
  return `Prescription_${finess}_FSE ${fse}.pdf`;
}
/* ---------- Shared gradient wrappers ---------- */

const gradientOuter =
  "relative w-full rounded-xl p-[1px] bg-[radial-gradient(circle_at_top,rgba(250,236,210,0.7),rgba(124,95,72,1))]";
const gradientInner =
  "rounded-xl bg-[linear-gradient(196deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)]";

/* ---------- Top header ---------- */

const TreatmentCardSection = () => {

  const navigate = useNavigate();
  return (
    <section className={gradientOuter}>
      <div className={`${gradientInner} relative overflow-hidden rounded-xl py-12`}>
        {/* Decorative optics */}
        <img
          className="pointer-events-none absolute left-30 top-1/2 z-0 h-16 -translate-y-1/2 md:h-40"
          src="res://icons/2.png"
          alt="Décor gauche"
        />
        <img
            className="pointer-events-none absolute right-30 top-1/2 z-0 h-16 -translate-y-1/2 md:h-40"
            src="res://icons/1.png"
            alt="Décor droite"
        />

        {/* Header content */}
        <div className="relative z-10 flex items-center justify-between px-5">
          <Button
            onClick={() => navigate("/neuropack-sante")}
            aria-label="Retour"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20"
          >
            <span className="sr-only">Retour</span>
            <span className="sr-only">Retour</span>
            <ChevronLeftIcon className="h-5 w-5 text-[#faecd2]" />
          </Button>

          <div className="flex flex-col items-center text-center">
            <h1 className="font-h4 text-[length:var(--h4-font-size)] leading-[var(--h4-line-height)] tracking-[var(--h4-letter-spacing)] text-[#faecd2] drop-shadow">
              Centre Médical La Boule
            </h1>
            <p className="font-p3-regular text-[length:var(--p3-regular-font-size)] leading-[var(--p3-regular-line-height)] tracking-[var(--p3-regular-letter-spacing)] text-[#faecd2]/80">
              Ophtalmologie
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <p className="font-p3-regular text-[length:var(--p3-regular-font-size)] leading-[var(--p3-regular-line-height)] text-[#faecd2cc]">
              Système
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-black/25 px-2 py-1 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-[#beffad]" />
              <span className="font-p3-bold text-[length:var(--p3-bold-font-size)] leading-[var(--p3-bold-line-height)] text-[#faecd2]">
                Opérationnel
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------- “Fonctionnement du système” (top info cards) ---------- */

const TreatmentCardWrapperSection = () => {
  const infoCards = [
    {
      icon: "res://icons/icon-park-solid-check-one.svg",
      title: "Processus NORMAL",
      description:
        "La feuille de soins est lue automatiquement et l'ordonnance est insérée directement dans le dossier patient. Vous n'avez rien à faire !",
    },
    {
      icon: "res://icons/fluent-warning-12-filled.svg",
      title: "En cas d'ÉCHEC d'insertion",
      description:
        "Si le système ne peut pas insérer l'ordonnance dans le dossier patient (panne, problème technique), les boutons ci-dessous apparaîtront pour permettre l'envoi par mail en urgence.",
    },
  ];

  return (
    <section className={gradientOuter}>
      <div className={`${gradientInner} flex flex-col gap-6 p-5`}>
        <header className="flex w-full items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-[20px] border border-[#faecd28f] bg-[#faecd229]">
            <img
              className="h-6 w-6"
              alt="Mingcute warning"
              src="res://icons/mingcute-warning-fill.svg"
            />
          </div>
          <h2 className="flex-1 text-center font-h6 text-[length:var(--h6-font-size)] leading-[var(--h6-line-height)] tracking-[var(--h6-letter-spacing)] text-[#faecd2]">
            Fonctionnement du système
          </h2>
        </header>

        <div className="flex w-full flex-col gap-4 md:flex-row">
          {infoCards.map((card) => (
            <Card
              key={card.title}
              className="flex-1 border-none bg-[#faecd214] shadow-none"
            >
              <CardContent className="flex flex-col items-center gap-4 px-4 pb-6 pt-4">
                <div className="flex w-full items-center gap-2.5">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl border border-[#faecd28f] bg-[#faecd229]">
                    <img className="h-5 w-5" alt={card.title} src={card.icon} />
                  </div>
                  <h3 className="flex-1 text-center font-p3-bold text-[length:var(--p3-bold-font-size)] leading-[var(--p3-bold-line-height)] tracking-[var(--p3-bold-letter-spacing)] text-[#faecd2]">
                    {card.title}
                  </h3>
                </div>
                <p className="w-full pl-[42px] text-left font-caption-1-regular text-[length:var(--caption-1-regular-font-size)] leading-[var(--caption-1-regular-line-height)] tracking-[var(--caption-1-regular-letter-spacing)] text-[#faecd2]">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------- “Ordonnance en cours de traitement” (preview card) ---------- */

const TreatmentDetailsSection = ({ parseResult }: { parseResult: ParseResponse | null }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'default' | 'template1' | 'template2'>('default');

  // Convert parseResult.extract to PrescriptionData format
  // Memoize to ensure proper updates when parseResult changes
  const prescriptionData: PrescriptionData = useMemo(() => {
    if (!parseResult?.extract) {
      return {
        form_date: null,
        patient: {
          last_name: null,
          first_name: null,
          nir: null,
          birth_date: null,
        },
        doctor: {
          full_name: null,
          rpps: null,
        },
        orthoptic_care: {
          description: null,
          acts_prescribed: [],
        },
        ocr_raw_text: null,
      };
    }

    return {
      form_date: parseResult.extract.form_date || null,
      patient: {
        last_name: parseResult.extract.patient?.last_name || null,
        first_name: parseResult.extract.patient?.first_name || null,
        nir: parseResult.extract.patient?.nir || null,
        birth_date: parseResult.extract.patient?.birth_date || null,
      },
      doctor: {
        full_name: parseResult.extract.doctor?.full_name || null,
        rpps: parseResult.extract.doctor?.rpps || null,
      },
      orthoptic_care: {
        description: parseResult.extract.orthoptic_care?.description || null,
        acts_prescribed: parseResult.extract.orthoptic_care?.acts_prescribed || [],
      },
      ocr_raw_text: parseResult.extract.ocr_raw_text || null,
    };
  }, [parseResult]);

  return (
    <section className={gradientOuter}>
      <div className="rounded-xl bg-[rgba(250,236,210,0.8)] p-15">
        <header className="flex w-full items-center gap-4">
          <h2 className="flex-1 font-h6 text-[length:var(--h6-font-size)] leading-[var(--h6-line-height)] tracking-[var(--h6-letter-spacing)] text-[#4e3117]">
            Ordonnance en cours de traitement
          </h2>

          <div className="flex items-center gap-3">
            <Select value={selectedTemplate} onValueChange={(value: 'default' | 'template1' | 'template2') => setSelectedTemplate(value)}>
              <SelectTrigger className="w-[200px] border border-[#4e311780] bg-[#4e311714] text-[#4e3117] hover:bg-[#4e311728]">
                <SelectValue placeholder="Choisir un modèle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Modèle par défaut</SelectItem>
                <SelectItem value="template1">Modèle 1 (Thème bleu-vert)</SelectItem>
                <SelectItem value="template2">Modèle 2 (Thème bordeaux)</SelectItem>
              </SelectContent>
            </Select>

            <Badge className="inline-flex items-center gap-2 rounded-lg border border-[#4e311780] bg-[#4e311714] px-4 py-2">
              <div className="h-4 w-4 rounded-lg bg-[#4e3117]" />
              <span className="font-p3-bold text-[length:var(--p3-bold-font-size)] leading-[var(--p3-bold-line-height)] tracking-[var(--p3-bold-letter-spacing)] text-[#4e3117]">
                TRAITEMENT EN COURS
              </span>
            </Badge>
          </div>
        </header>

        <div className="mt-6 flex justify-center">
        {parseResult?.extract ? (
          selectedTemplate === 'default' ? (
            <PrescriptionPDFViewerDefault 
              key={`prescription-default-${parseResult.extract?.ocr_raw_text?.length || 0}-${parseResult.extract?.patient?.last_name || ''}-${parseResult.extract?.patient?.first_name || ''}`}
              data={prescriptionData}
              width="50%"
              height="100%"
              className="w-full h-full"
            />
          ) : selectedTemplate === 'template1' ? (
            <PrescriptionPDFViewer1 
              key={`prescription-template1-${parseResult.extract?.ocr_raw_text?.length || 0}-${parseResult.extract?.patient?.last_name || ''}-${parseResult.extract?.patient?.first_name || ''}`}
              data={prescriptionData}
              width="50%"
              height="100%"
              className="w-full h-full"
            />
          ) : (
            <PrescriptionPDFViewer2 
              key={`prescription-template2-${parseResult.extract?.ocr_raw_text?.length || 0}-${parseResult.extract?.patient?.last_name || ''}-${parseResult.extract?.patient?.first_name || ''}`}
              data={prescriptionData}
              width="50%"
              height="100%"
              className="w-full h-full"
            />
          )
      ) : (
        selectedTemplate === 'default' ? (
          <PrescriptionPDFViewerDefault 
            key={`prescription-empty-default`}
            data={prescriptionData}
            width="50%"
            height="100%"
            className="w-full h-full"
          />
        ) : selectedTemplate === 'template1' ? (
          <PrescriptionPDFViewer1 
            key={`prescription-empty-template1`}
            data={prescriptionData}
            width="50%"
            height="100%"
            className="w-full h-full"
          />
        ) : (
          <PrescriptionPDFViewer2 
            key={`prescription-empty-template2`}
            data={prescriptionData}
            width="50%"
            height="100%"
            className="w-full h-full"
          />
        )
      )}
        </div>
      </div>
    </section>
  );
};

/* ---------- Automatic Mode Modal ---------- */

const AutomaticModeModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {

  const [dossierNumber, setDossierNumber] = useState("");

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log("Searching for FSE:",  dossierNumber);
  };

  if (!isOpen) return null;

  return (
    <div
      className="automatic-mode-modal fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl h-[200px] !h-[200px] rounded-xl bg-[#d3c1ad] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#d3c1ad] hover:bg-[#c0a88f] transition-colors"
          aria-label="Fermer"
        >
          <X className="h-5 w-5 text-[#4e3117]" />
        </button>

        {/* Title */}
        <h2 className="mb-4 text-2xl font-bold text-[#4e3117]">
          MODE AUTOMATIQUE
        </h2>

        {/* Instruction */}
        <p className=" text-sm text-[#4e3117]">
          Saisir N° FSE ou N° Dossier pour récupérer les données patient
        </p>

        {/* Input fields */}
        <div className="py-4 h-[70px] !h-[70px]">
          {/* First input - longer
          <div className="w-full">
            <Input
              type="text"
              value={fseNumber}
              onChange={(e) => setFseNumber(e.target.value)}
              placeholder=""
              className="w-full border-b-2 border-blue-500 bg-transparent px-0 py-2 text-[#4e3117] focus:border-blue-600 focus:outline-none"
            />
          </div> */}

          {/* Second input with search button */}
          <div className="flex items-center gap-3 h-[50px] !h-[50px]">
            <Input
              type="text"
              value={dossierNumber}
              onChange={(e) => setDossierNumber(e.target.value)}
              placeholder="Ex: 553381"
              className="flex-1 border-b-2 border-blue-500 bg-transparent px-0 py-2 text-[#4e3117] placeholder:text-[#4e3117]/60 focus:border-blue-600 focus:outline-none"
            />
            <Button
              onClick={handleSearch}
              className="inline-flex items-center gap-2 rounded-full border-none bg-[linear-gradient(184deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] px-4 py-2 text-xs font-semibold text-[#4e3016] shadow-[0_6px_12px_rgba(0,0,0,0.25)] hover:bg-opacity-90"
            >
              <Search className="h-4 w-4" />
              <span>Rechercher</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Manual Mode Modal ---------- */

const ManualModeModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [ssn, setSsn] = useState("");
  const [identifierType, setIdentifierType] = useState<"dossier" | "fse">("dossier");
  const [identifierValue, setIdentifierValue] = useState("");
  const [prescriber, setPrescriber] = useState("");
  const [executor, setExecutor] = useState("");
  const [selectedActs, setSelectedActs] = useState<string[]>(["AMY 7"]);

  const availableActs = Object.keys(AMY_TABLE).filter(
    (code) => !selectedActs.includes(code)
  );

  const handleToggleAct = (code: string) => {
    if (selectedActs.includes(code)) {
      setSelectedActs(selectedActs.filter((c) => c !== code));
    } else {
      setSelectedActs([...selectedActs, code]);
    }
  };

  const handleSubmit = () => {
    // TODO: Implement submit functionality
    console.log("Manual mode submission:", {
      lastName,
      firstName,
      ssn,
      identifierType,
      identifierValue,
      prescriber,
      executor,
      selectedActs,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="manual-mode-modal fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-[90%] h-[80%] !h-[80%] my-8 rounded-xl bg-[#d3c1ad] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#d3c1ad] hover:bg-[#c0a88f] transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="h-4 w-4 text-[#4e3117]" />
        </button>

        {/* Title */}
        <div className="mb-3">
          <h2 className="text-xl font-bold text-[#4e3117]">
            MODE MANUEL / B2
          </h2>
          <p className="text-xs text-[#4e3117]/80 mt-0.5">Saisie complète</p>
        </div>

        <div className="space-y-3">
          {/* Patient Information Section */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-[#4e3117]">
              Informations patient
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-[#4e3117] mb-0.5">
                  Nom
                </label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="entrer nom..."
                  className="w-full h-8 text-sm bg-white/80 border border-[#4e3117]/30 text-[#4e3117]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4e3117] mb-0.5">
                  Prénom
                </label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="entrer Prénom..."
                  className="w-full h-8 text-sm bg-white/80 border border-[#4e3117]/30 text-[#4e3117]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4e3117] mb-0.5">
                  N° Sécu
                </label>
                <Input
                  type="text"
                  value={ssn}
                  onChange={(e) => setSsn(e.target.value)}
                  placeholder="entrer N° Sécu..."
                  className="w-full h-8 text-sm bg-white/80 border border-[#4e3117]/30 text-[#4e3117]"
                />
              </div>
            </div>

            {/* Identifier Type */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="identifierType"
                    checked={identifierType === "dossier"}
                    onChange={() => setIdentifierType("dossier")}
                    className="text-[#4e3117]"
                  />
                  <span className="text-xs text-[#4e3117]">N° Dossier</span>
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="identifierType"
                    checked={identifierType === "fse"}
                    onChange={() => setIdentifierType("fse")}
                    className="text-[#4e3117]"
                  />
                  <span className="text-xs text-[#4e3117]">N° FSE</span>
                </label>
              </div>
              <Input
                type="text"
                value={identifierValue}
                onChange={(e) => setIdentifierValue(e.target.value)}
                placeholder={`entrer N° ${identifierType === "dossier" ? "Dossier" : "FSE"}...`}
                className="w-full h-8 text-sm bg-white/80 border border-[#4e3117]/30 text-[#4e3117]"
              />
            </div>
          </div>

          {/* Prescriber and Executor Section */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#4e3117] mb-0.5">
                Prescripteur
              </label>
              <Select value={prescriber} onValueChange={setPrescriber}>
                <SelectTrigger className="w-full h-8 text-sm bg-white/80 border border-[#4e3117]/30 text-[#4e3117]">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {PRESCRIBERS.map((p) => (
                    <SelectItem key={p.initials} value={p.initials}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4e3117] mb-0.5">
                Exécuteur
              </label>
              <Select value={executor} onValueChange={setExecutor}>
                <SelectTrigger className="w-full h-8 text-sm bg-white/80 border border-[#4e3117]/30 text-[#4e3117]">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {PRESCRIBERS.map((p) => (
                    <SelectItem key={p.initials} value={p.initials}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ACTES À PRESCRIRE Section */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-[#4e3117]">
              ACTES À PRESCRIRE
            </h3>
            <div className="space-y-1.5">
              {/* Selected Acts */}
              {selectedActs.map((code) => {
                const act = AMY_TABLE[code];
                if (!act) return null;
                return (
                  <div
                    key={code}
                    className="flex items-center justify-between p-2 bg-white/60 rounded-lg border border-[#4e3117]/20"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-[#4e3117]">{code}</div>
                        <div className="text-xs text-[#4e3117]/80 line-clamp-1">{act.label}</div>
                      </div>
                      <div className="font-semibold text-sm text-[#4e3117] flex-shrink-0 ml-2">{act.price}</div>
                    </div>
                    <button
                      onClick={() => handleToggleAct(code)}
                      className="ml-2 p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                      aria-label="Retirer"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </button>
                  </div>
                );
              })}

              {/* Available Acts */}
              {availableActs.map((code) => {
                const act = AMY_TABLE[code];
                if (!act) return null;
                return (
                  <div
                    key={code}
                    className="flex items-center justify-between p-2 bg-white/40 rounded-lg border border-[#4e3117]/20"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => handleToggleAct(code)}
                        className="border-[#4e3117] h-3.5 w-3.5 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-[#4e3117]">{code}</div>
                        <div className="text-xs text-[#4e3117]/80 line-clamp-1">{act.label}</div>
                      </div>
                      <div className="font-semibold text-sm text-[#4e3117] flex-shrink-0 ml-2">{act.price}</div>
                    </div>
                    <button
                      onClick={() => handleToggleAct(code)}
                      className="ml-2 p-1 hover:bg-green-100 rounded transition-colors flex-shrink-0"
                      aria-label="Ajouter"
                    >
                      <Plus className="h-3.5 w-3.5 text-green-600" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-2 h-[50px] !h-[50px]">
            <Button
              onClick={onClose}
              variant="ghost"
              className="h-8 px-3 text-sm text-[#4e3117] hover:bg-white/60"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              className="h-8 px-3 text-sm bg-[linear-gradient(184deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] text-[#4e3016] shadow-[0_6px_12px_rgba(0,0,0,0.25)] hover:bg-opacity-90"
            >
              Valider
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Red alert info + mode buttons ---------- */

const TreatmentInfoWrapperSection = ({
  onAutomaticModeClick,
  onManualModeClick,
}: {
  onAutomaticModeClick: () => void;
  onManualModeClick: () => void;
}) => {
  const modeButtons = [
    { icon: ZapIcon, label: "Mode Automatique", onClick: onAutomaticModeClick },
    { icon: SettingsIcon, label: "Mode Manuel / B2", onClick: onManualModeClick },
  ];

  return (
    <Alert className="flex flex-col gap-4 rounded-xl border border-[#a00000] bg-[#ffdddd] p-5">
      <div className="flex w-full items-center gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[20px] border border-[#a000008f] bg-[#a0000029]">
          <AlertCircleIcon className="h-6 w-6 text-[#a00000]" />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <AlertTitle className="m-0 font-h6 text-[length:var(--h6-font-size)] leading-[var(--h6-line-height)] tracking-[var(--h6-letter-spacing)] text-[#a00000]">
            Fonctionnement du système
          </AlertTitle>
          <AlertDescription className="m-0 font-caption-1-regular text-[length:var(--caption-1-regular-font-size)] leading-[var(--caption-1-regular-line-height)] tracking-[var(--caption-1-regular-letter-spacing)] text-[#a00000]">
            L&apos;ordonnance n&apos;a pas pu être insérée automatiquement.
          </AlertDescription>
        </div>

        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
          {modeButtons.map((button) => {
            const Icon = button.icon;
            return (
              <Button
                key={button.label}
                onClick={button.onClick}
                variant="ghost"
                className="inline-flex items-center gap-2 rounded-full border border-black/40 bg-[linear-gradient(184deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] px-4 py-2 text-xs font-semibold text-[#4e3016] shadow-[0_6px_12px_rgba(0,0,0,0.25)] hover:bg-opacity-90"
              >
                <Icon className="h-3 w-3" />
                <span className="bg-gradient-to-t from-[#f3ca6a] to-[#fee69b] bg-clip-text text-transparent">
                  {button.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      <AlertDescription className="m-0 font-caption-2-regular text-[length:var(--caption-2-regular-font-size)] leading-[var(--caption-2-regular-line-height)] tracking-[var(--caption-2-regular-letter-spacing)] text-[#a00000]">
        Le système a détecté une erreur lors de l&apos;insertion. Veuillez
        utiliser un des modes ci-dessus pour envoyer l&apos;ordonnance par mail
        au centre.
      </AlertDescription>
    </Alert>
  );
};

/* ---------- Traceability table (bottom) ---------- */

const SystemFunctionalitySection = ({
  rows,
  onExportClick,
  exportDisabled,
}: {
  rows?: TraceabilityRow[];
  onExportClick?: () => void;
  exportDisabled?: boolean;
}) => {
  const defaultTableData: TraceabilityRow[] = [
    {
      date: "08/10/2025 14:30",
      fseNumber: "553381",
      dossierNumber: "15035",
      type: "Auto",
      insertion: {
        status: "INSÉRÉE",
        icon: "res://icons/check-1.svg",
        color: "#c7ff7d",
      },
      transmission: "-",
      statut: {
        label: "OK",
        icon: "res://icons/check-circle-1.svg",
      },
      user: "Dr. Martin",
      actions: "res://icons/action.png",
    },
    {
      date: "08/10/2025 10:15",
      fseNumber: "553382",
      dossierNumber: "15036",
      type: "Auto",
      insertion: {
        status: "ÉCHEC",
        icon: "res://icons/vector.svg",
        color: "#ffbcad",
      },
      transmission: {
        hasMail: true,
        confirmed: true,
      },
      statut: {
        label: "OK",
        icon: "res://icons/check-circle-1.svg",
      },
      user: "Dr. Martin",
      actions: "res://icons/action.png",
    },
    {
      date: "07/10/2025 10:03",
      fseNumber: "553383",
      dossierNumber: "15037",
      type: "Auto",
      insertion: {
        status: "INSÉRÉE",
        icon: "res://icons/check-1.svg",
        color: "#c7ff7d",
      },
      transmission: "-",
      statut: {
        label: "OK",
        icon: "res://icons/check-circle-1.svg",
      },
      user: "Dr. Martin",
      actions: "res://icons/action.png",
    },
  ];

  const tableData = rows && rows.length > 0 ? rows : defaultTableData;

  return (
    <section className={gradientOuter}>
      <div className={`${gradientInner} flex flex-col gap-6 p-5`}>
        <header className="flex w-full items-center justify-between gap-4">
          <h2 className="font-h6 text-[length:var(--h6-font-size)] leading-[var(--h6-line-height)] tracking-[var(--h6-letter-spacing)] text-[#faecd2]">
            Traçabilité des ordonnances
          </h2>

          <Button
            onClick={onExportClick}
            disabled={exportDisabled}
            className="inline-flex items-center gap-2 rounded-full border-none bg-[linear-gradient(184deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] px-4 py-2 text-xs font-semibold text-[#4e3016] shadow-[0_8px_16px_rgba(0,0,0,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <img
              src="res://icons/file-export.svg"
              alt="Exporter"
              className="h-4 w-4"
            />
            <span className="bg-gradient-to-t from-[#f3ca6a] to-[#fee69b] bg-clip-text text-transparent">
              Exporter par mail
            </span>
          </Button>
        </header>

        <div className="w-full overflow-hidden rounded-lg bg-[#faecd214] ring-1 ring-white/10">
          <Table>
            <TableHeader className="bg-[#faecd229]">
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                {[
                  "Date",
                  "N° FSE",
                  "N° Dossier",
                  "Type",
                  "Insertion",
                  "Transmission mail centre",
                  "Statut",
                  "Utilisateur",
                  "Actions",
                ].map((header, idx) => (
                  <TableHead
                    key={header}
                    className={`px-4 py-3 text-center text-[11px] font-medium text-[#faecd2cc] whitespace-nowrap ${
                      idx === 5 ? "w-40" : idx === 8 ? "w-24" : ""
                    }`}
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {tableData.map((row, index) => (
                <TableRow
                  key={index}
                  className="border-b border-white/5 bg-transparent hover:bg-[#faecd214]"
                >
                  <TableCell className="px-4 py-2 text-center text-[11px] text-[#faecd2] whitespace-nowrap">
                    {row.date}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center text-[11px] text-[#faecd2] whitespace-nowrap">
                    {row.fseNumber}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center text-[11px] text-[#faecd2] whitespace-nowrap">
                    {row.dossierNumber}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center text-[11px] text-[#faecd2] whitespace-nowrap">
                    {row.type}
                  </TableCell>

                  {/* insertion */}
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <img
                        className="h-3 w-3"
                        alt="Status icon"
                        src={row.insertion.icon}
                      />
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: row.insertion.color }}
                      >
                        {row.insertion.status}
                      </span>
                    </div>
                  </TableCell>

                  {/* transmission */}
                  <TableCell className="px-4 py-2">
                    {typeof row.transmission === "string" ? (
                      <div className="text-center text-[11px] text-[#faecd2]">
                        {row.transmission}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        {row.transmission.hasMail && (
                          <Badge className="inline-flex h-auto items-center justify-center gap-1 rounded-sm border-[0.6px] border-[#00b574] bg-[#01b57433] px-2 py-0.5">
                            <img
                              className="h-2.5 w-2.5"
                              alt="MailIcon icon"
                              src="res://icons/tabler-mail-filled.svg"
                            />
                            <span className="text-[10px] font-semibold text-[#faecd2]">
                              MAIL
                            </span>
                          </Badge>
                        )}
                        {row.transmission.confirmed && (
                          <>
                            <img
                              className="h-3 w-3"
                              alt="Check"
                              src="res://icons/check-1.svg"
                            />
                            <span className="text-[11px] text-[#c7ff7d]">
                              Confirmé
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* statut */}
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center justify-center">
                      <Badge className="flex h-auto w-[100px] items-center justify-center gap-1 rounded-sm border-[0.6px] border-[#00b574] bg-[#01b57433] px-1 py-0.5">
                        <img
                          className="h-2.5 w-2.5"
                          alt="CheckIcon circle"
                          src={row.statut.icon}
                        />
                        <span className="text-[10px] font-semibold text-[#faecd2]">
                          {row.statut.label}
                        </span>
                      </Badge>
                    </div>
                  </TableCell>

                  {/* user */}
                  <TableCell className="px-4 py-2 text-center text-[11px] text-[#faecd2] whitespace-nowrap">
                    {row.user}
                  </TableCell>

                  {/* actions */}
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center justify-center">
                      <img
                        className="h-3 w-20 object-contain"
                        alt="Actions"
                        src={row.actions}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

/* ---------- Page component ---------- */

export const GnrateurOrdonnances = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResponse | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [rows, setRows] = useState<TraceabilityRow[] | undefined>(undefined);
  // Template states
  const [patient, setPatient] = useState<PatientInfo>({ lastName: '', firstName: '', ssn: '', ipp: '' });
  const [prescriberInitials, setPrescriberInitials] = useState<string>('DM');
  const selectedPrescriber = useMemo(() => PRESCRIBERS.find(p => p.initials === prescriberInitials) || PRESCRIBERS[0], [prescriberInitials]);
  const [fseNumber, setFseNumber] = useState<string>('');
  const [finess, setFiness] = useState<string>('123456789');
  const [edmBase, setEdmBase] = useState<string>('D:\\Stimut\\Documents_Patients');
  const [amyCode, setAmyCode] = useState<string | undefined>(undefined);
  const [amyPrice, setAmyPrice] = useState<string | undefined>(undefined);
  const [generatingPrescription, setGeneratingPrescription] = useState(false);
  const [prescriptionResult, setPrescriptionResult] = useState<PrescriptionResponse | null>(null);
  // Modal states
  const [isAutomaticModeModalOpen, setIsAutomaticModeModalOpen] = useState(false);
  const [isManualModeModalOpen, setIsManualModeModalOpen] = useState(false);

  const handleFileUpload = (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (!e) {
      document.getElementById("ocr-upload")?.click();
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFileUrl(dataUrl);
    };
    reader.readAsDataURL(file);
    setParseResult(null);
    setParseError(null);
  };

  const formatDate = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  const handleParse = async () => {
    if (!uploadedFile || parsing) return;
    setParsing(true);
    setParseError(null);
    try {
      const res = await apiClient.parseDocument(uploadedFile);
      setParseResult(res);
      // Extract AMY/Price from OCR
      const ext = extractFseFromMarkdown(res.content || '');
      if (ext.amy) setAmyCode(ext.amy);
      if (ext.price) setAmyPrice(ext.price);

      const now = new Date();
      const newRow: TraceabilityRow = {
        date: formatDate(now),
        fseNumber: "—",
        dossierNumber: "—",
        type: "Auto",
        insertion: {
          status: res.success ? "INSÉRÉE" : "ÉCHEC",
          icon: res.success ? "res://icons/check-1.svg" : "res://icons/vector.svg",
          color: res.success ? "#c7ff7d" : "#ffbcad",
        },
        transmission:
          res.success && res.download_url
            ? { hasMail: true, confirmed: true }
            : "-",
        statut: {
          label: res.success ? "OK" : "ERREUR",
          icon: res.success ? "res://icons/check-circle-1.svg" : "res://icons/vector.svg",
        },
        user: "Opérateur",
        actions: "res://icons/action.png",
      };
      setRows((prev) => [newRow, ...(prev || [])].slice(0, 10));
    } catch (err) {
      setParseResult(null);
      setParseError(
        err instanceof Error ? err.message : "Échec du traitement"
      );
      const now = new Date();
      const errorRow: TraceabilityRow = {
        date: formatDate(now),
        fseNumber: "—",
        dossierNumber: "—",
        type: "Auto",
        insertion: {
          status: "ÉCHEC",
          icon: "res://icons/vector.svg",
          color: "#ffbcad",
        },
        transmission: "-",
        statut: {
          label: "ERREUR",
          icon: "res://icons/vector.svg",
        },
        user: "Opérateur",
        actions: "res://icons/action.png",
      };
      setRows((prev) => [errorRow, ...(prev || [])].slice(0, 10));
    } finally {
      setParsing(false);
    }
  };

  const canExport = useMemo(
    () => Boolean(parseResult?.download_url),
    [parseResult]
  );

  const handleExport = () => {
    if (!parseResult?.download_url) return;
    const url = apiClient.getDownloadUrl(parseResult.download_url);
    window.open(url, "_blank");
  };

  const fullEdmPath = useMemo(() => computeEdmPath(edmBase, patient.ipp || ''), [edmBase, patient.ipp]);
  const targetFilename = useMemo(() => buildPrescriptionFilename(finess || '000000000', fseNumber || '000000'), [finess, fseNumber]);

  const copyTargetPath = () => {
    const full = `${fullEdmPath}\\${targetFilename}`;
    void navigator.clipboard.writeText(full);
  };

  const handleGeneratePrescription = async () => {
    // Validate required fields
    if (!patient.lastName || !patient.firstName || !patient.ipp) {
      setParseError("Veuillez remplir les informations patient (Nom, Prénom, IPP)");
      return;
    }
    if (!amyCode) {
      setParseError("Code AMY requis. Veuillez d'abord analyser le document.");
      return;
    }
    if (!fseNumber) {
      setParseError("Numéro FSE requis");
      return;
    }
    if (!finess) {
      setParseError("FINESS centre requis");
      return;
    }

    setGeneratingPrescription(true);
    setPrescriptionResult(null);
    setParseError(null);

    try {
      const result = await apiClient.generatePrescription({
        patient: {
          lastName: patient.lastName,
          firstName: patient.firstName,
          ssn: patient.ssn,
          ipp: patient.ipp,
        },
        prescriber_initials: prescriberInitials,
        amy_code: amyCode,
        finess: finess,
        fse_number: fseNumber,
        edm_base_path: edmBase,
        template_path: undefined, // Can be configured later
      });

      setPrescriptionResult(result);

      if (result.success) {
        // Update traceability row
        const now = new Date();
        const newRow: TraceabilityRow = {
          date: formatDate(now),
          fseNumber: fseNumber,
          dossierNumber: patient.ipp,
          type: "Auto",
          insertion: {
            status: "INSÉRÉE",
            icon: "res://icons/check-1.svg",
            color: "#c7ff7d",
          },
          transmission: { hasMail: false, confirmed: false },
          statut: {
            label: "OK",
            icon: "res://icons/check-circle-1.svg",
          },
          user: "Opérateur",
          actions: "res://icons/action.png",
        };
        setRows((prev) => [newRow, ...(prev || [])].slice(0, 10));
      }
    } catch (err) {
      setPrescriptionResult({
        success: false,
        message: "Erreur lors de la génération",
        error: err instanceof Error ? err.message : "Erreur inconnue",
      });
      setParseError(err instanceof Error ? err.message : "Échec de la génération");
    } finally {
      setGeneratingPrescription(false);
    }
  };

  return (
    <div className="relative flex w-full flex-col gap-6 bg-[#f5e4cf] p-5 text-sm overflow-y-auto">
      {/* decorative images removed */}

      <div className="relative z-20 flex flex-col gap-6">
        <TreatmentCardSection />
        <TreatmentCardWrapperSection />
        <TreatmentDetailsSection parseResult={parseResult} />

        {/* Upload & Quick Preview */}
        <section className={gradientOuter}>
          <div className={`${gradientInner} rounded-xl p-5`}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="font-h6 text-[length:var(--h6-font-size)] leading-[var(--h6-line-height)] tracking-[var(--h6-letter-spacing)] text-[#faecd2]">
                Téléverser l’ordonnance
              </h3>
              <div className="flex items-center gap-2">
                <input
                  id="ocr-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="ocr-upload"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#faecd2] px-3 py-2 font-caption-4-bold text-[#faecd2] hover:bg-[#faecd214]"
                >
                  Choisir un fichier
                </label>
                <Button
                  onClick={handleParse}
                  disabled={!uploadedFile || parsing}
                  className="inline-flex items-center gap-1 rounded-full border-none bg-[linear-gradient(184deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] px-4 py-2 text-xs font-semibold text-[#4e3016] shadow-[0_8px_16px_rgba(0,0,0,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {parsing ? "Traitement..." : "Analyser"}
                </Button>
              </div>
            </div>

              {!uploadedFile ? (
               <div
                className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#faecd2] bg-[#faecd229] p-6 h-[150px] !h-[150px]"
                onClick={() => handleFileUpload()}
               >
                <img
                  className="h-12 w-12"
                  alt="Upload"
                  src="res://icons/tabler-drag-drop.svg"
                />
                <div className="text-center h-[50px] !h-[50px]">
                  <div className="font-caption-3-bold text-[#faecd2]">
                    Glissez-déposez une image ou un PDF ici
                  </div>
                  <div className="font-caption-4-regular text-[#faecd2] opacity-70">
                    Formats: PDF, JPG, JPEG, PNG
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="overflow-hidden rounded-lg border border-[#faecd2] bg-white">
                  <div className="border-b border-[#faecd2] bg-[#faecd214] p-3 font-caption-3-bold text-[#4e3117]">
                    {uploadedFile.name}
                  </div>
                  <div className="flex justify-center bg-gray-100 p-4">
                    {fileUrl && uploadedFile.type.startsWith("image/") ? (
                      <img
                        src={fileUrl}
                        alt="Preview"
                        className="max-h-[700px] max-w-full rounded shadow"
                      />
                    ) : (
                      <div className="font-caption-3-regular text-[#4e3117]">
                        Aperçu non disponible. Le fichier sera analysé côté
                        serveur.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-[#faecd2] bg-[#faecd214] p-4 text-[#faecd2]">
                  <div className="space-y-3">
                    {parseError && (
                      <div className="mb-2 text-[#ff4b4b]">{parseError}</div>
                    )}
                    {parseResult?.message && (
                      <div className="mb-2">{parseResult.message}</div>
                    )}
                    {/* AMY mapping */}
                    <div className="rounded-md border border-[#faecd2] p-3">
                      <div className="font-p3-bold mb-1">Procédure AMY</div>
                      <div className="text-sm">
                        <div><b>Code détecté:</b> {amyCode || '—'}</div>
                        <div><b>Prix détecté:</b> {amyPrice || '—'}</div>
                        <div className="mt-1">
                          <b>Dictionnaire:</b>{' '}
                          {amyCode && AMY_TABLE[amyCode] ? (
                            <span>{amyCode} – {AMY_TABLE[amyCode].label} – {AMY_TABLE[amyCode].price}</span>
                          ) : (
                            <span>Non trouvé</span>
                          )}
                        </div>
                        {amyCode && AMY_TABLE[amyCode] && (
                          <div className="mt-1">
                            <b>Prix final utilisé:</b> {AMY_TABLE[amyCode].price}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Patient / Prescriber form */}
                    <div className="rounded-md border border-[#faecd2] p-3">
                      <div className="font-p3-bold mb-2">Informations prescription</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <label className="flex flex-col">
                          <span>Nom</span>
                          <input className="bg-white text-black rounded px-2 py-1"
                            value={patient.lastName}
                            onChange={(e) => setPatient({ ...patient, lastName: e.target.value })} />
                        </label>
                        <label className="flex flex-col">
                          <span>Prénom</span>
                          <input className="bg-white text-black rounded px-2 py-1"
                            value={patient.firstName}
                            onChange={(e) => setPatient({ ...patient, firstName: e.target.value })} />
                        </label>
                        <label className="flex flex-col col-span-2">
                          <span>N° Sécurité Sociale</span>
                          <input className="bg-white text-black rounded px-2 py-1"
                            value={patient.ssn}
                            onChange={(e) => setPatient({ ...patient, ssn: e.target.value })} />
                        </label>
                        <label className="flex flex-col">
                          <span>IPP (n° dossier)</span>
                          <input className="bg-white text-black rounded px-2 py-1"
                            value={patient.ipp}
                            onChange={(e) => setPatient({ ...patient, ipp: e.target.value })} />
                        </label>
                        <label className="flex flex-col">
                          <span>N° FSE</span>
                          <input className="bg-white text-black rounded px-2 py-1"
                            value={fseNumber}
                            onChange={(e) => setFseNumber(e.target.value)} />
                        </label>
                        <label className="flex flex-col">
                          <span>FINESS centre</span>
                          <input className="bg-white text-black rounded px-2 py-1"
                            value={finess}
                            onChange={(e) => setFiness(e.target.value)} />
                        </label>
                        <label className="flex flex-col">
                          <span>Prescripteur (initiales)</span>
                          <select className="bg-white text-black rounded px-2 py-1"
                            value={prescriberInitials}
                            onChange={(e) => setPrescriberInitials(e.target.value)}>
                            {PRESCRIBERS.map(p => (
                              <option key={p.initials} value={p.initials}>{p.initials} – {p.name}</option>
                            ))}
                          </select>
                        </label>
                        <div className="col-span-2 text-xs opacity-80">
                          <b>Prescripteur sélectionné:</b> {selectedPrescriber.name} — {selectedPrescriber.rpps}
                        </div>
                        <label className="flex flex-col col-span-2">
                          <span>Base EDMS</span>
                          <input className="bg-white text-black rounded px-2 py-1"
                            value={edmBase}
                            onChange={(e) => setEdmBase(e.target.value)} />
                        </label>
                      </div>

                      <div className="mt-3 text-sm">
                        <div><b>Dossier EDMS:</b> {fullEdmPath || '—'}</div>
                        <div><b>Nom de fichier:</b> {targetFilename}</div>
                        <div className="mt-2 flex gap-2 flex-wrap">
                          <Button 
                            className="h-8 px-3" 
                            onClick={handleGeneratePrescription}
                            disabled={generatingPrescription || !amyCode || !patient.ipp || !fseNumber}
                          >
                            {generatingPrescription ? "Génération..." : "Générer prescription"}
                          </Button>
                          <Button className="h-8 px-3" onClick={copyTargetPath}>Copier chemin + nom</Button>
                          <a
                            className="h-8 px-3 inline-flex items-center rounded border border-[#faecd2]"
                            href={parseResult?.download_url ? apiClient.getDownloadUrl(parseResult.download_url) : '#'}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Télécharger ZIP OCR
                          </a>
                        </div>
                        {prescriptionResult && (
                          <div className={`mt-2 p-2 rounded text-xs ${prescriptionResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            <div><b>{prescriptionResult.success ? '✓ Succès:' : '✗ Erreur:'}</b> {prescriptionResult.message}</div>
                            {prescriptionResult.success && prescriptionResult.pdf_path && (
                              <div className="mt-1">
                                <div><b>PDF:</b> {prescriptionResult.pdf_path}</div>
                                {prescriptionResult.thumbnail_path && (
                                  <div><b>Thumbnail:</b> {prescriptionResult.thumbnail_path}</div>
                                )}
                              </div>
                            )}
                            {prescriptionResult.error && (
                              <div className="mt-1"><b>Détails:</b> {prescriptionResult.error}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Raw OCR content for reference */}
                    {parseResult?.content && (
                      <pre className="max-h-72 overflow-auto rounded border border-[#faecd2] bg-white p-3 text-xs text-black whitespace-pre-wrap">
                        {parseResult.content}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <TreatmentInfoWrapperSection
          onAutomaticModeClick={() => setIsAutomaticModeModalOpen(true)}
          onManualModeClick={() => setIsManualModeModalOpen(true)}
        />
        <SystemFunctionalitySection
          rows={rows}
          onExportClick={handleExport}
          exportDisabled={!canExport}
        />
      </div>

      {/* Automatic Mode Modal */}
      <AutomaticModeModal
        isOpen={isAutomaticModeModalOpen}
        onClose={() => setIsAutomaticModeModalOpen(false)}
      />

      {/* Manual Mode Modal */}
      <ManualModeModal
        isOpen={isManualModeModalOpen}
        onClose={() => setIsManualModeModalOpen(false)}
      />
    </div>
  );
};
