import React, { useMemo, useState } from "react";
import {
  ChevronLeftIcon,
  AlertCircleIcon,
  SettingsIcon,
  ZapIcon,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
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
import { apiClient, ParseResponse } from "@/lib/api";
import { useNavigate } from "react-router-dom";

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
  'AMY 8': { label: 'Mesure de l’acuité visuelle et de la réfraction – Renouvellement', price: '20,80 €' },
  'AMY 15': { label: 'Orthoptie – Bilan orthoptique', price: '35,00 €' },
  'AMY 7,7': { label: 'Séance orthoptique (courte)', price: '15,40 €' },
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

const TreatmentDetailsSection = () => {
  return (
    <section className={gradientOuter}>
      <div className="rounded-xl bg-[rgba(250,236,210,0.8)] p-15">
        <header className="flex w-full items-center gap-4">
          <h2 className="flex-1 font-h6 text-[length:var(--h6-font-size)] leading-[var(--h6-line-height)] tracking-[var(--h6-letter-spacing)] text-[#4e3117]">
            Ordonnance en cours de traitement
          </h2>

          <Badge className="inline-flex items-center gap-2 rounded-lg border border-[#4e311780] bg-[#4e311714] px-4 py-2">
            <div className="h-4 w-4 rounded-lg bg-[#4e3117]" />
            <span className="font-p3-bold text-[length:var(--p3-bold-font-size)] leading-[var(--p3-bold-line-height)] tracking-[var(--p3-bold-letter-spacing)] text-[#4e3117]">
              TRAITEMENT EN COURS
            </span>
          </Badge>
        </header>

        <div className="mt-6 flex justify-center">
          <img
            className="h-auto w-full max-w-[668px] rounded-lg shadow-md"
            alt="Prescription document"
            src="res://icons/image-97.png"
          />
        </div>
      </div>
    </section>
  );
};

/* ---------- Red alert info + mode buttons ---------- */

const TreatmentInfoWrapperSection = () => {
  const modeButtons = [
    { icon: ZapIcon, label: "Mode Automatique" },
    { icon: SettingsIcon, label: "Mode Manuel / B2" },
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
      actions: "/frame-1618869710-2.svg",
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
      actions: "/frame-1618869710.svg",
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
      actions: "/frame-1618869710-1.svg",
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
                        className="h-6 w-20 object-contain"
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        actions: "/frame-1618869710-2.svg",
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
        actions: "/frame-1618869710.svg",
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

  return (
    <div className="relative flex w-full flex-col gap-6 bg-[#f5e4cf] p-5 text-sm overflow-y-auto">
      {/* decorative images removed */}

      <div className="relative z-20 flex flex-col gap-6">
        <TreatmentCardSection />
        <TreatmentCardWrapperSection />
        <TreatmentDetailsSection />

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
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#faecd2] bg-[#faecd229] p-6">
                <img
                  className="h-12 w-12"
                  alt="Upload"
                  src="res://icons/tabler-drag-drop.svg"
                />
                <div className="text-center">
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
                        <div className="mt-2 flex gap-2">
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

        <TreatmentInfoWrapperSection />
        <SystemFunctionalitySection
          rows={rows}
          onExportClick={handleExport}
          exportDisabled={!canExport}
        />
      </div>
    </div>
  );
};
