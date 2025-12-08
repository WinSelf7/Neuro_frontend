import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Default logo path - Update this or pass via component props
// For Electron, use "res://icons/dentylis-logo.png" or similar
// You can also use a base64 encoded image or absolute path
const DEFAULT_DENTYLIS_LOGO_PATH = "res://icons/dentylis-logo.png"; // Set your default logo path here
const DEFAULT_STAMP_PATH = "res://icons/centre-stamp.png"; // Set your stamp/image path here (replaces address text)
const DEFAULT_SIGNATURE_PATH = "res://icons/prescriber-signature.png"; // Set your signature image path here

// Utility function to convert image paths to base64 for PDF generation
// @react-pdf/renderer needs base64 data URIs, not res:// protocol URLs
async function convertImageToBase64(imagePath: string): Promise<string | null> {
  if (!imagePath) return null;
  
  // If already a base64 data URI, return as is
  if (imagePath.startsWith('data:image/')) {
    return imagePath;
  }
  
  try {
    // For Electron res:// protocol, try fetching with proper error handling
    let url = imagePath;
    
    // If it's a res:// protocol, ensure it's properly formatted
    if (imagePath.startsWith('res://')) {
      // Try to fetch the resource
      url = imagePath;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'default',
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch image: ${imagePath} (status: ${response.status})`);
      // Try alternative: create an img element and get its data
      return await loadImageViaCanvas(imagePath);
    }
    
    const blob = await response.blob();
    
    // Convert blob to base64 data URI
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (result && result.startsWith('data:')) {
          resolve(result);
        } else {
          console.warn(`Failed to convert image to base64: ${imagePath}`);
          // Fallback to canvas method
          loadImageViaCanvas(imagePath).then(resolve).catch(() => resolve(null));
        }
      };
      reader.onerror = () => {
        console.warn(`Error converting image to base64: ${imagePath}`, reader.error);
        // Fallback to canvas method
        loadImageViaCanvas(imagePath).then(resolve).catch(() => resolve(null));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(`Error loading image ${imagePath}:`, error);
    // Fallback to canvas method
    return await loadImageViaCanvas(imagePath);
  }
}

// Fallback method using canvas to convert image to base64
async function loadImageViaCanvas(imagePath: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = document.createElement('img') as HTMLImageElement;
    img.crossOrigin = 'anonymous';
    
    img.addEventListener('load', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } else {
          resolve(null);
        }
      } catch (error) {
        console.warn(`Error converting image via canvas: ${imagePath}`, error);
        resolve(null);
      }
    });
    
    img.addEventListener('error', () => {
      console.warn(`Failed to load image: ${imagePath}`);
      resolve(null);
    });
    
    img.src = imagePath;
  });
}

// Type definitions matching the extract data structure
export interface PrescriptionData {
  form_date?: string | null;
  patient?: {
    last_name?: string | null;
    first_name?: string | null;
    nir?: string | null;
    birth_date?: string | null;
  };
  doctor?: {
    full_name?: string | null;
    rpps?: string | null;
  };
  orthoptic_care?: {
    description?: string | null;
    acts_prescribed?: string[];
    acts_prescribed_details?: Array<{
      code: string;
      label?: string | null;
      price?: number | null;
      category?: string | null;
    }>;
  };
  ocr_raw_text?: string | null;
}

// Styles with elegant burgundy theme
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#2c2c2c",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 3,
    borderBottomColor: "#8B2635",
    borderBottomStyle: "solid",
  },
  headerLeft: {
    flex: 1,
    maxWidth: "60%",
  },
  organizationName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#8B2635",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  address: {
    fontSize: 9,
    color: "#555555",
    marginBottom: 2,
    lineHeight: 1.5,
  },
  contact: {
    fontSize: 9,
    color: "#555555",
    marginBottom: 2,
    lineHeight: 1.5,
  },
  finess: {
    fontSize: 9,
    color: "#8B2635",
    marginTop: 10,
    fontWeight: "bold",
  },
  logoContainer: {
    width: 130,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 0,
  },
  logoBox: {
    width: 110,
    height: 55,
    backgroundColor: "#8B2635",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  logoImage: {
    width: 110,
    height: 55,
    objectFit: "contain",
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  logoTagline: {
    color: "#FFFFFF",
    fontSize: 7,
    textAlign: "center",
    lineHeight: 1.2,
  },
  dateSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "baseline",
    marginBottom: 18,
    marginTop: 5,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: "#e8e8e8",
    borderBottomStyle: "solid",
  },
  dateLabel: {
    fontSize: 10,
    color: "#2c2c2c",
    marginRight: 6,
    fontWeight: "600",
  },
  dateField: {
    fontSize: 11,
    color: "#8B2635",
    paddingBottom: 3,
    minWidth: 140,
    textAlign: "left",
    marginLeft: 6,
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#8B2635",
    borderBottomStyle: "solid",
  },
  sectionHeader: {
    backgroundColor: "#8B2635",
    color: "#FFFFFF",
    padding: 7,
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderRadius: 4,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-end",
    minHeight: 20,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    borderBottomStyle: "solid",
  },
  fieldLabel: {
    fontSize: 10,
    color: "#8B2635",
    width: 240,
    fontWeight: "bold",
    paddingRight: 12,
    flexShrink: 0,
  },
  fieldValue: {
    fontSize: 10,
    color: "#2c2c2c",
    flex: 1,
    paddingBottom: 4,
    minHeight: 20,
    marginLeft: 0,
    lineHeight: 1.6,
  },
  fieldValueEmpty: {
    fontSize: 10,
    color: "#999999",
    paddingBottom: 3,
    minHeight: 18,
    marginLeft: 0,
    minWidth: 140,
    fontStyle: "italic",
  },
  longField: {
    fontSize: 10,
    color: "#2c2c2c",
    flex: 1,
    paddingBottom: 4,
    minHeight: 26,
    marginLeft: 0,
    lineHeight: 1.6,
  },
  orthopticSection: {
    marginTop: 12,
    marginBottom: 12,
    padding: 6,
    backgroundColor: "#fef5f7",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#f0e0e3",
    borderStyle: "solid",
  },
  actsSection: {
    marginTop: 12,
    minHeight: 140,
    borderWidth: 2,
    borderColor: "#e8e8e8",
    borderStyle: "solid",
    borderRadius: 5,
    padding: 8,
    backgroundColor: "#fafafa",
  },
  actsContent: {
    fontSize: 10,
    color: "#2c2c2c",
    marginTop: 8,
    paddingTop: 6,
    lineHeight: 1.7,
    minHeight: 120,
  },
  actItem: {
    marginBottom: 6,
    paddingLeft: 10,
    fontSize: 10,
    lineHeight: 1.5,
    paddingTop: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#8B2635",
    borderLeftStyle: "solid",
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 3,
    borderTopColor: "#e8e8e8",
    borderTopStyle: "solid",
  },
  footerLeft: {
    width: "48%",
  },
  footerRight: {
    width: "48%",
    alignItems: "flex-end",
  },
  footerLabel: {
    fontSize: 9,
    color: "#8B2635",
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  stampArea: {
    minHeight: 50,
    padding: 6,
    borderWidth: 2,
    borderColor: "#d4d4d4",
    borderStyle: "dashed",
    borderRadius: 5,
    backgroundColor: "#fafafa",
  },
  stampText: {
    fontSize: 7,
    color: "#777777",
    opacity: 0.9,
    lineHeight: 1.5,
    textAlign: "center",
  },
  signatureArea: {
    minHeight: 50,
    width: "100%",
    borderWidth: 2,
    borderColor: "#d4d4d4",
    borderStyle: "dashed",
    borderRadius: 5,
    padding: 6,
    backgroundColor: "#fafafa",
  },
  decorativeLTop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    zIndex: 1,
  },
  decorativeLBottom: {
    position: "absolute",
    bottom: 50,
    right: 40,
    width: 60,
    height: 60,
    zIndex: 1,
  },
  organizationNameLine1: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#8B2635",
    marginBottom: 0,
    letterSpacing: 0.5,
  },
  organizationNameLine2: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#8B2635",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  stampTextLine: {
    fontSize: 7,
    color: "#777777",
    opacity: 0.9,
    lineHeight: 1.5,
    textAlign: "center",
  },
  stampImage: {
    width: "100%",
    maxWidth: 200,
    height: "auto",
    minHeight: 60,
    objectFit: "contain",
  },
  signatureImage: {
    width: "100%",
    maxWidth: 200,
    height: "auto",
    minHeight: 60,
    objectFit: "contain",
  },
});

// Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  try {
    // Handle YYYY-MM-DD format
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    // Try parsing as Date object
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

// Main PDF Document Component
export const PrescriptionDocument: React.FC<{ 
  data: PrescriptionData;
  logoPath?: string;
  stampPath?: string;
  signaturePath?: string;
}> = ({
  data,
  logoPath = DEFAULT_DENTYLIS_LOGO_PATH,
  stampPath = DEFAULT_STAMP_PATH,
  signaturePath = DEFAULT_SIGNATURE_PATH,
}) => {
  const formDate = formatDate(data.form_date);
  const birthDate = formatDate(data.patient?.birth_date);

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page} wrap={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.organizationNameLine1}>
              ASSOCIATION CENTRE
            </Text>
            <Text style={styles.organizationNameLine2}>
              OPHTALMOLOGIE LA BOULE
            </Text>
            <Text style={styles.address}>16 avenue Maréchal Joffre</Text>
            <Text style={styles.address}>92000 NANTERRE</Text>
            <Text style={styles.contact}>Tél : 01 46 95 15 15</Text>
            <Text style={styles.contact}>Email : info-laboule@ophtalys.fr</Text>
            <Text style={styles.finess}>FINESS : 920036563</Text>
          </View>
          <View style={styles.logoContainer}>
            {logoPath ? (
              <Image
                src={logoPath}
                style={styles.logoImage}
              />
            ) : (
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>DENTYLIS</Text>
                <Text style={styles.logoTagline}>votre santé est précieuse</Text>
              </View>
            )}
          </View>
        </View>

        {/* Date Section */}
        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>Fait à Nanterre le</Text>
          <Text style={styles.dateLabel}>Date :</Text>
          <Text style={styles.dateField}>
            {formDate || "___ / ___ / ______"}
          </Text>
        </View>

        {/* Patient Section */}
        <View>
          <Text style={styles.sectionHeader}>PATIENT</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nom :</Text>
            <Text style={styles.fieldValue}>
              {data.patient?.last_name || ""}
            </Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Prénom :</Text>
            <Text style={styles.fieldValue}>
              {data.patient?.first_name || ""}
            </Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>N° Sécurité Sociale (NIR) :</Text>
            <Text style={styles.fieldValue}>{data.patient?.nir || ""}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Date de naissance :</Text>
            <Text style={styles.fieldValue}>{birthDate || ""}</Text>
          </View>
        </View>

        {/* Doctor Section */}
        <View style={{ marginTop: 18 }}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Je soussigné(e), Docteur :</Text>
            <Text style={styles.longField}>
              {data.doctor?.full_name || ""}
            </Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>RPPS :</Text>
            <Text style={styles.fieldValue}>{data.doctor?.rpps || ""}</Text>
          </View>
        </View>

        {/* Orthoptic Care Section */}
        <View style={styles.orthopticSection}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>
              Les soins orthoptiques suivants :
            </Text>
            <Text style={styles.longField}>
              {data.orthoptic_care?.description || ""}
            </Text>
          </View>
        </View>

        {/* Prescribed Acts Section */}
        <View style={styles.actsSection}>
          <Text style={styles.sectionHeader}>ACTES PRESCRITS :</Text>
          <View style={styles.actsContent}>
            {data.orthoptic_care?.acts_prescribed_details && data.orthoptic_care.acts_prescribed_details.length > 0 ? (
              data.orthoptic_care.acts_prescribed_details.map((act, index) => (
                <View key={index} style={styles.actItem}>
                  <Text>
                    - {act.code}
                    {act.label ? ` : ${act.label}` : ''}
                    {act.price ? ` - ${act.price.toFixed(2)} €` : ''}
                  </Text>
                </View>
              ))
            ) : data.orthoptic_care?.acts_prescribed && data.orthoptic_care.acts_prescribed.length > 0 ? (
              data.orthoptic_care.acts_prescribed.map((act, index) => (
                <Text key={index} style={styles.actItem}>
                  - {act}
                </Text>
              ))
            ) : (
              <Text> </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerLabel}>Cachet du centre</Text>
            <View style={styles.stampArea}>
              {stampPath ? (
                <Image
                  src={stampPath}
                  style={styles.stampImage}
                />
              ) : (
                <Text style={styles.stampTextLine}>
                  ASSOCIATION CENTRE OPHTALMOLOGIE{'\n'}
                  LA BOULE{'\n'}
                  16 avenue du Maréchal Joffre{'\n'}
                  92000 NANTERRE{'\n'}
                  SIRET : 804 538 465 00012{'\n'}
                  FINESS : 920036563
                </Text>
              )}
            </View>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerLabel}>Signature du prescripteur</Text>
            <View style={styles.signatureArea}>
              {signaturePath ? (
                <Image
                  src={signaturePath}
                  style={styles.signatureImage}
                />
              ) : null}
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
};

// PDF Preview Component (static preview for Electron compatibility)
const PrescriptionPreview: React.FC<{ 
  data: PrescriptionData;
  logoPath?: string;
  stampPath?: string;
  signaturePath?: string;
}> = ({ 
  data,
  logoPath = DEFAULT_DENTYLIS_LOGO_PATH,
  stampPath = DEFAULT_STAMP_PATH,
  signaturePath = DEFAULT_SIGNATURE_PATH,
}) => {
  const formDate = formatDate(data.form_date);
  const birthDate = formatDate(data.patient?.birth_date);

  // Debug logging
  React.useEffect(() => {
    console.log("PrescriptionPreview rendering with data:", data);
  }, [data]);

  if (!data) {
    return (
      <div className="bg-white p-8 text-center text-gray-500" style={{ backgroundColor: "#ffffff" }}>
        <p>No prescription data available</p>
      </div>
    );
  }

  return (
    <div 
      className="p-12 relative" 
      style={{ 
        fontFamily: "Helvetica, Arial, sans-serif", 
        minHeight: "100%", 
        backgroundColor: "#ffffff",
        color: "#2c2c2c"
      }}
    >

      {/* Header */}
      <div className="flex justify-between items-start mb-8" style={{ borderBottom: "3px solid #8B2635", paddingBottom: "20px" }}>
        <div className="flex-1 max-w-[60%]">
          <div className="text-sm font-bold mb-0" style={{ color: "#8B2635", fontSize: "13px", letterSpacing: "0.5px" }}>ASSOCIATION CENTRE</div>
          <div className="text-sm font-bold mb-1" style={{ color: "#8B2635", fontSize: "13px", letterSpacing: "0.5px" }}>OPHTALMOLOGIE LA BOULE</div>
          <div className="text-xs mb-0.5" style={{ color: "#555555" }}>16 avenue Maréchal Joffre</div>
          <div className="text-xs mb-0.5" style={{ color: "#555555" }}>92000 NANTERRE</div>
          <div className="text-xs mb-0.5" style={{ color: "#555555" }}>Tél : 01 46 95 15 15</div>
          <div className="text-xs mb-0.5" style={{ color: "#555555" }}>Email : info-laboule@ophtalys.fr</div>
          <div className="text-xs mt-2.5 font-bold" style={{ color: "#8B2635" }}>FINESS : 920036563</div>
        </div>
        <div className="w-[130px] flex justify-end">
          {logoPath ? (
            <img
              src={logoPath}
              alt="DENTYLIS Logo"
              className="w-[110px] h-[55px] object-contain"
            />
          ) : (
            <div className="text-white px-2 py-2 w-[110px] h-[55px] flex flex-col items-center justify-center" style={{ backgroundColor: "#8B2635", borderRadius: "6px" }}>
              <div className="text-sm font-bold mb-1">DENTYLIS</div>
              <div className="text-[7px] text-center leading-tight">votre santé est précieuse</div>
            </div>
          )}
        </div>
      </div>

      {/* Date Section */}
      <div className="flex justify-end items-baseline mb-8" style={{ paddingBottom: "10px", borderBottom: "2px solid #e8e8e8" }}>
        <span className="text-xs mr-1.5 font-semibold">Fait à Nanterre le</span>
        <span className="text-xs mr-1.5 font-semibold">Date :</span>
        <span className="text-xs px-2 min-w-[140px] inline-block font-bold" style={{ color: "#8B2635", fontSize: "11px", borderBottom: "2px solid #8B2635" }}>
          {formDate || "___ / ___ / ______"}
        </span>
      </div>

      {/* Patient Section */}
      <div className="mb-5">
        <div className="text-white px-2.5 py-2.5 text-xs font-bold mb-4 uppercase tracking-wide" style={{ backgroundColor: "#8B2635", borderRadius: "4px", fontSize: "12px", letterSpacing: "0.8px" }}>
          PATIENT
        </div>
        <div className="flex items-end mb-4 pb-1" style={{ borderBottom: "1px solid #f5f5f5" }}>
          <span className="text-xs font-bold w-[240px] pr-3" style={{ color: "#8B2635" }}>Nom :</span>
          <span className="text-xs flex-1 pb-1 min-h-[20px]">
            {data.patient?.last_name || ""}
          </span>
        </div>
        <div className="flex items-end mb-4 pb-1" style={{ borderBottom: "1px solid #f5f5f5" }}>
          <span className="text-xs font-bold w-[240px] pr-3" style={{ color: "#8B2635" }}>Prénom :</span>
          <span className="text-xs flex-1 pb-1 min-h-[20px]">
            {data.patient?.first_name || ""}
          </span>
        </div>
        <div className="flex items-end mb-4 pb-1" style={{ borderBottom: "1px solid #f5f5f5" }}>
          <span className="text-xs font-bold w-[240px] pr-3" style={{ color: "#8B2635" }}>N° Sécurité Sociale (NIR) :</span>
          <span className="text-xs flex-1 pb-1 min-h-[20px]">
            {data.patient?.nir || ""}
          </span>
        </div>
        <div className="flex items-end mb-4 pb-1" style={{ borderBottom: "1px solid #f5f5f5" }}>
          <span className="text-xs font-bold w-[240px] pr-3" style={{ color: "#8B2635" }}>Date de naissance :</span>
          <span className="text-xs flex-1 pb-1 min-h-[20px]">
            {birthDate || ""}
          </span>
        </div>
      </div>

      {/* Doctor Section */}
      <div className="mb-5">
        <div className="flex items-end mb-4 pb-1" style={{ borderBottom: "1px solid #f5f5f5" }}>
          <span className="text-xs font-bold w-[240px] pr-3" style={{ color: "#8B2635" }}>Je soussigné(e), Docteur :</span>
          <span className="text-xs flex-1 pb-1 min-h-[26px]">
            {data.doctor?.full_name || ""}
          </span>
        </div>
        <div className="flex items-end mb-4 pb-1" style={{ borderBottom: "1px solid #f5f5f5" }}>
          <span className="text-xs font-bold w-[240px] pr-3" style={{ color: "#8B2635" }}>RPPS :</span>
          <span className="text-xs flex-1 pb-1 min-h-[20px]">
            {data.doctor?.rpps || ""}
          </span>
        </div>
      </div>

      {/* Orthoptic Care Section */}
      <div className="mb-5 p-3" style={{ backgroundColor: "#fef5f7", borderRadius: "5px", border: "1px solid #f0e0e3" }}>
        <div className="flex items-end mb-3">
          <span className="text-xs font-bold w-[240px] pr-3" style={{ color: "#8B2635" }}>Les soins orthoptiques suivants :</span>
          <span className="text-xs flex-1 pb-0.5 min-h-[26px]">
            {data.orthoptic_care?.description || ""}
          </span>
        </div>
      </div>

      {/* Prescribed Acts Section */}
      <div className="mb-6 p-4" style={{ border: "2px solid #e8e8e8", borderRadius: "5px", backgroundColor: "#fafafa" }}>
        <div className="text-white px-2.5 py-2.5 text-xs font-bold mb-4 uppercase tracking-wide" style={{ backgroundColor: "#8B2635", borderRadius: "4px", fontSize: "12px", letterSpacing: "0.8px" }}>
          ACTES PRESCRITS :
        </div>
        <div className="text-xs min-h-[150px] pt-3">
          {data.orthoptic_care?.acts_prescribed_details && data.orthoptic_care.acts_prescribed_details.length > 0 ? (
            data.orthoptic_care.acts_prescribed_details.map((act, index) => (
              <div key={index} className="mb-3 pl-4 pt-1" style={{ borderLeft: "4px solid #8B2635", marginLeft: "5px" }}>
                - {act.code}
                {act.label ? ` : ${act.label}` : ''}
                {act.price ? ` - ${act.price.toFixed(2)} €` : ''}
              </div>
            ))
          ) : data.orthoptic_care?.acts_prescribed && data.orthoptic_care.acts_prescribed.length > 0 ? (
            data.orthoptic_care.acts_prescribed.map((act, index) => (
              <div key={index} className="mb-3 pl-4 pt-1" style={{ borderLeft: "4px solid #8B2635", marginLeft: "5px" }}>
                - {act}
              </div>
            ))
          ) : (
            <div className="h-4"></div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-16 relative" style={{ paddingTop: "20px", borderTop: "3px solid #e8e8e8" }}>
        <div className="w-[48%]">
          <div className="text-[9px] font-bold mb-3 uppercase tracking-wide" style={{ color: "#8B2635", letterSpacing: "0.6px" }}>Cachet du centre</div>
          <div className="min-h-[70px] pt-2.5 flex items-center justify-center p-2.5" style={{ border: "2px dashed #d4d4d4", borderRadius: "5px", backgroundColor: "#fafafa" }}>
            {stampPath ? (
              <img
                src={stampPath}
                alt="Centre Stamp"
                className="max-w-full max-h-[120px] object-contain"
              />
            ) : (
              <div className="text-[7px] text-center leading-tight" style={{ color: "#777777", opacity: 0.9 }}>
                ASSOCIATION CENTRE OPHTALMOLOGIE<br />
                LA BOULE<br />
                16 avenue du Maréchal Joffre<br />
                92000 NANTERRE<br />
                SIRET : 804 538 465 00012<br />
                FINESS : 920036563
              </div>
            )}
          </div>
        </div>
        <div className="w-[48%] flex flex-col items-end">
          <div className="text-[9px] font-bold mb-3 uppercase tracking-wide" style={{ color: "#8B2635", letterSpacing: "0.6px" }}>Signature du prescripteur</div>
          <div className="w-full min-h-[70px] flex items-center justify-end p-2.5" style={{ border: "2px dashed #d4d4d4", borderRadius: "5px", backgroundColor: "#fafafa" }}>
            {signaturePath ? (
              <img
                src={signaturePath}
                alt="Prescriber Signature"
                className="max-w-full max-h-[100px] object-contain"
              />
            ) : (
              <div className="w-full min-h-[70px]"></div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

// PDF Viewer Component (uses static preview for Electron compatibility)
export const PrescriptionPDFViewer: React.FC<{ 
  data: PrescriptionData;
  width?: string;
  height?: string;
  className?: string;
  showDownloadButton?: boolean;
  logoPath?: string;
  stampPath?: string;
  signaturePath?: string;
}> = ({
  data,
  width = "100%",
  height = "600px",
  className = "",
  showDownloadButton = true,
  logoPath = DEFAULT_DENTYLIS_LOGO_PATH,
  stampPath = DEFAULT_STAMP_PATH,
  signaturePath = DEFAULT_SIGNATURE_PATH,
}) => {
  // Debug logging
  React.useEffect(() => {
    console.log("PrescriptionPDFViewer rendering with data:", data);
    console.log("Component props:", { width, height, className, showDownloadButton });
  }, [data, width, height, className, showDownloadButton]);

  const handleDownload = async () => {
    try {
      await downloadPrescriptionPDF(data, "prescription.pdf", logoPath, stampPath, signaturePath);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  // Validate data
  if (!data) {
    console.warn("PrescriptionPDFViewer: No data provided");
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`} style={{ width, height }}>
        <p className="text-gray-500">No prescription data available</p>
      </div>
    );
  }

  // Use static preview for Electron compatibility (PDFViewer doesn't work well in Electron)
  return (
    <div 
      className={`${className} relative rounded-lg shadow-md overflow-auto`}
      style={{ 
        width, 
        height, 
        maxHeight: height,
        minHeight: "600px"
      }}
    >
      <style>{`
        .prescription-preview-wrapper {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
       
        .prescription-preview-wrapper .bg-white {
          background-color: #ffffff !important;
        }
      `}</style>
      <div className="prescription-preview-wrapper" style={{ backgroundColor: "#ffffff", color: "#000000", minHeight: "100%" }}>
        <PrescriptionPreview 
          data={data} 
          logoPath={logoPath}
          stampPath={stampPath}
          signaturePath={signaturePath}
        />
      </div>
      {showDownloadButton && (
        <div className="sticky bottom-4 right-4 float-right z-10 mt-4">
          <button
            onClick={handleDownload}
            className="text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2"
            style={{ fontFamily: "inherit", backgroundColor: "#8B2635" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#A03042"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8B2635"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Télécharger PDF
          </button>
        </div>
      )}
    </div>
  );
};

// Export function for generating PDF blob (for download)
export const generatePrescriptionPDF = async (
  data: PrescriptionData,
  logoPath?: string,
  stampPath?: string,
  signaturePath?: string
): Promise<Blob> => {
  const ReactPDF = await import("@react-pdf/renderer");
  
  // Convert image paths to base64 for PDF generation
  const [logoBase64, stampBase64, signatureBase64] = await Promise.all([
    logoPath ? convertImageToBase64(logoPath) : Promise.resolve(null),
    stampPath ? convertImageToBase64(stampPath) : Promise.resolve(null),
    signaturePath ? convertImageToBase64(signaturePath) : Promise.resolve(null),
  ]);
  
  const doc = (
    <PrescriptionDocument 
      data={data} 
      logoPath={logoBase64 || undefined}
      stampPath={stampBase64 || undefined}
      signaturePath={signatureBase64 || undefined}
    />
  );
  const asPdf = await ReactPDF.pdf(doc);
  const blob = await asPdf.toBlob();
  return blob;
};

// Helper function to download PDF
export const downloadPrescriptionPDF = async (
  data: PrescriptionData,
  filename: string = "prescription.pdf",
  logoPath?: string,
  stampPath?: string,
  signaturePath?: string
): Promise<void> => {
  try {
    // Convert image paths to base64 for PDF generation
    const [logoBase64, stampBase64, signatureBase64] = await Promise.all([
      logoPath ? convertImageToBase64(logoPath) : Promise.resolve(null),
      stampPath ? convertImageToBase64(stampPath) : Promise.resolve(null),
      signaturePath ? convertImageToBase64(signaturePath) : Promise.resolve(null),
    ]);
    
    const ReactPDF = await import("@react-pdf/renderer");
    const React = await import("react");
    const ReactDOM = await import("react-dom/client");
    const { BlobProvider } = ReactPDF;
    
    // Create a temporary container
    const container = document.createElement("div");
    container.style.display = "none";
    document.body.appendChild(container);
    
    return new Promise((resolve, reject) => {
      const doc = (
        <PrescriptionDocument 
          data={data} 
          logoPath={logoBase64 || undefined}
          stampPath={stampBase64 || undefined}
          signaturePath={signatureBase64 || undefined}
        />
      );
      
      const element = (
        <BlobProvider document={doc}>
          {({ blob, loading, error }: { blob: Blob | null; loading: boolean; error: Error | null }) => {
            if (error) {
              document.body.removeChild(container);
              reject(error);
              return null;
            }
            if (!loading && blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              document.body.removeChild(container);
              resolve();
            }
            return null;
          }}
        </BlobProvider>
      );
      
      // Use ReactDOM to render the BlobProvider
      const root = ReactDOM.createRoot(container);
      root.render(element);
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

