export type OutputMode = "local-file" | "remote-download";

export type ApplicationDocumentMcpResponse =
  | {
      mode: "local";
      filename: string;
      pdfPath: string;
    }
  | {
      mode: "remote";
      type: "application/pdf";
      filename: string;
      downloadUrl: string;
      expiresAt: string;
    };
