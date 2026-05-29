export type OutputMode = "local-file" | "remote-base64";

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
      content: string;
    };
