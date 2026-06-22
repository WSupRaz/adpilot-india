import { storageService } from "../StorageService";
import { prisma } from "../../config/database";

export class PDFGeneratorService {
  async generateAuditReport(auditId: string): Promise<string> {
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: { auditIssues: { orderBy: { sortOrder: "asc" } } },
    });

    if (!audit) throw new Error(`Audit ${auditId} not found`);

    // TODO: Use puppeteer or @react-pdf/renderer to generate PDF
    // For now, return a placeholder
    const pdfBuffer = Buffer.from(`AdPilot Audit Report — ${audit.url}\n\nOverall Score: ${audit.overallScore ?? "N/A"}`);

    const { publicUrl } = await storageService.upload(
      pdfBuffer,
      "application/pdf",
      `audits/${auditId}`
    );

    await prisma.audit.update({
      where: { id: auditId },
      data: { pdfUrl: publicUrl },
    });

    return publicUrl;
  }
}

export const pdfGeneratorService = new PDFGeneratorService();
