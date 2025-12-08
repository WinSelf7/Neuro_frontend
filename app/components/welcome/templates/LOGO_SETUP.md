# Prescription Template Images Setup Instructions

## How to Add Images to the Prescription Template

The template supports three types of images:
1. **DENTYLIS Logo** - Top right corner
2. **Centre Stamp** - Footer left (replaces address text)
3. **Prescriber Signature** - Footer right

### Step 1: Add Image Files
1. Place your image files (PNG, JPG, or SVG) in the `frontend/resources/icons/` directory
2. Recommended filenames:
   - `dentylis-logo.png` - Logo
   - `centre-stamp.png` - Stamp/center mark
   - `prescriber-signature.png` - Signature

### Step 2: Update Default Paths
Open `PrescriptionPDF.tsx` and update these constants (around line 14):

```typescript
const DEFAULT_DENTYLIS_LOGO_PATH = "res://icons/dentylis-logo.png";
const DEFAULT_STAMP_PATH = "res://icons/centre-stamp.png";
const DEFAULT_SIGNATURE_PATH = "res://icons/prescriber-signature.png";
```

### Step 3: Pass Images via Props (Optional)
You can also pass the image paths as props when using the component:

```typescript
<PrescriptionPDFViewer 
  data={prescriptionData}
  logoPath="res://icons/dentylis-logo.png"
  stampPath="res://icons/centre-stamp.png"
  signaturePath="res://icons/prescriber-signature.png"
/>
```

### Step 4: Update the Download Functions (if needed)
If you're calling the download functions directly, make sure to pass all image paths:

```typescript
await downloadPrescriptionPDF(
  data, 
  "prescription.pdf", 
  logoPath, 
  stampPath, 
  signaturePath
);
```

## Supported Image Formats
- PNG (recommended for logos/signatures with transparency)
- JPG/JPEG
- SVG
- Base64 encoded images

## Image Dimensions & Usage

### Logo
- Container: 110px width × 55px height
- Position: Top right corner
- Will be automatically scaled to fit while maintaining aspect ratio

### Centre Stamp
- Container: ~200px max width, ~120px max height
- Position: Footer left (replaces address text)
- Should contain company stamp/mark with address information

### Prescriber Signature
- Container: ~200px max width, ~100px max height  
- Position: Footer right (in signature area)
- Should contain the prescriber's signature image

## Notes
- If image paths are not provided, the template will fall back to:
  - Logo: Text "DENTYLIS" in a blue box
  - Stamp: Text address information
  - Signature: Empty box with border
- All images use `object-fit: contain` to maintain aspect ratio

