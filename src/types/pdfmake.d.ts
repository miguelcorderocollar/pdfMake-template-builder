declare module 'pdfmake/build/pdfmake' {
  import type { DocDefinition } from './index';

  export interface CreatedPdf {
    getBlob(callback: (blob: Blob) => void): void;
    download(filename?: string): void;
    getDataUrl(callback: (dataUrl: string) => void): void;
  }

  export interface PdfMake {
    createPdf(docDefinition: DocDefinition): CreatedPdf;
  }

  const pdfMake: PdfMake;
  export default pdfMake;
}

