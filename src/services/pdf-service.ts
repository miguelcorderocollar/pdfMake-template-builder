import { DocDefinition } from "@/types";

// pdfmake fonts need to be loaded for client-side usage
import type { PdfMake } from 'pdfmake/build/pdfmake';

let pdfMake: PdfMake | null = null;

let isInitialized = false;

async function initializePdfMake() {
  if (isInitialized || typeof window === 'undefined') return;

  try {
    console.log('Initializing pdfMake...');

    // Prefer global pdfMake when loaded via CDN
    const globalPdfMake = (window as unknown as { pdfMake?: PdfMake }).pdfMake;
    if (globalPdfMake) {
      pdfMake = globalPdfMake;
      // if fonts are bundled via CDN, vfs will typically be present
      isInitialized = true;
      console.log('pdfMake initialized from global window.pdfMake');
      return;
    }

    // Fallback to dynamic import of the library only (no vfs/fonts wiring)
    const pdfmakeModule = await import('pdfmake/build/pdfmake');
    const pdfmake = (pdfmakeModule as unknown as { default: PdfMake }).default || (pdfmakeModule as unknown as PdfMake);

    if (pdfmake) {
      pdfMake = pdfmake;
      // If fonts are not available, attempt to load official CDN builds that include fonts
      const hasFonts = Boolean((pdfMake as unknown as { vfs?: unknown }).vfs);
      if (!hasFonts) {
        console.warn('pdfMake fonts not detected; loading CDN scripts to provide default fonts');
        await loadPdfMakeFromCdn();
      }
      isInitialized = true;
      console.log('pdfMake initialized');
    } else {
      console.error('pdfmake library not loaded properly');
    }
  } catch (error) {
    console.error('Failed to load pdfMake:', error);
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function loadPdfMakeFromCdn() {
  // Load official builds. Order matters: core, then fonts.
  const version = '0.2.12';
  const base = `https://cdn.jsdelivr.net/npm/pdfmake@${version}/build`;
  await loadScript(`${base}/pdfmake.min.js`);
  await loadScript(`${base}/vfs_fonts.js`);
  const globalPdfMake = (window as unknown as { pdfMake?: PdfMake }).pdfMake;
  if (globalPdfMake) {
    pdfMake = globalPdfMake;
    console.log('pdfMake initialized from CDN (with fonts)');
  } else {
    console.error('CDN pdfMake did not expose window.pdfMake');
  }
}

// Initialize on first use
if (typeof window !== 'undefined') {
  // Use setTimeout to ensure DOM is ready
  setTimeout(initializePdfMake, 0);
}

// Phase 0: docDefinition is edited directly via state; generation from positioned elements is removed.

export async function generatePDF(docDefinition: DocDefinition): Promise<Blob> {
  // Ensure pdfMake is initialized
  if (!isInitialized) {
    await initializePdfMake();
  }

  return new Promise((resolve, reject) => {
    if (!pdfMake) {
      reject(new Error('pdfMake not available'));
      return;
    }

    try {
      // Clone docDefinition to avoid in-place mutations by pdfmake
      const cloned: DocDefinition = JSON.parse(JSON.stringify(docDefinition));
      const doc = pdfMake.createPdf(cloned);
      doc.getBlob((blob: Blob) => {
        resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function downloadPDF(docDefinition: DocDefinition, filename: string = 'template.pdf') {
  // Ensure pdfMake is initialized
  if (!isInitialized) {
    await initializePdfMake();
  }

  if (!pdfMake) {
    console.error('pdfMake not available');
    console.log('Current pdfMake value:', pdfMake);
    return;
  }

  try {
    const cloned: DocDefinition = JSON.parse(JSON.stringify(docDefinition));
    const doc = pdfMake.createPdf(cloned);
    doc.download(filename);
  } catch (error) {
    console.error('Error creating PDF:', error);
  }
}

export async function getPDFDataUrl(docDefinition: DocDefinition): Promise<string> {
  // Ensure pdfMake is initialized
  if (!isInitialized) {
    await initializePdfMake();
  }

  return new Promise((resolve, reject) => {
    if (!pdfMake) {
      reject(new Error('pdfMake not available'));
      return;
    }

    try {
      const cloned: DocDefinition = JSON.parse(JSON.stringify(docDefinition));
      const doc = pdfMake.createPdf(cloned);
      doc.getDataUrl((dataUrl: string) => {
        resolve(dataUrl);
      });
    } catch (error) {
      reject(error);
    }
  });
}
