import { useMemo, useState } from "react";

import type { QuoteWithRelations } from "../use-quotes-storage";
import {
  canSharePdfFile,
  createQuotePdfBlob,
  downloadQuotePdf,
  shareQuotePdfFile,
} from "./quote-pdf";

export function useQuotePdfActions(quote?: QuoteWithRelations) {
  const [isPreparingPdf, setIsPreparingPdf] = useState(false);

  const canSharePdf = useMemo(() => {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      return false;
    }

    const testFile = new File([""], "presupuesto.pdf", { type: "application/pdf" });
    return canSharePdfFile(testFile);
  }, []);

  async function buildPdfFile() {
    if (!quote) {
      return undefined;
    }

    const { blob, fileName } = await createQuotePdfBlob(quote);
    return new File([blob], fileName, { type: "application/pdf" });
  }

  async function handleDownloadPdf() {
    if (!quote) {
      return;
    }

    setIsPreparingPdf(true);

    try {
      const { blob, fileName } = await createQuotePdfBlob(quote);
      downloadQuotePdf(fileName, blob);
    } finally {
      setIsPreparingPdf(false);
    }
  }

  async function handleSharePdf() {
    if (!quote) {
      return;
    }

    setIsPreparingPdf(true);

    try {
      const file = await buildPdfFile();

      if (!file) {
        return;
      }

      if (canSharePdfFile(file)) {
        await shareQuotePdfFile(file);
        return;
      }

      downloadQuotePdf(file.name, file);
    } finally {
      setIsPreparingPdf(false);
    }
  }

  return {
    canSharePdf,
    isPreparingPdf,
    handleDownloadPdf,
    handleSharePdf,
  };
}
