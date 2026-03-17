import assert from "node:assert/strict";
import test from "node:test";

import { formatFileSize, isPdfAttachment } from "@/lib/source-files/utils";

test("formats file sizes into readable labels", () => {
  assert.equal(formatFileSize(900), "900 B");
  assert.equal(formatFileSize(1024), "1.0 KB");
  assert.equal(formatFileSize(2_621_440), "2.5 MB");
  assert.equal(formatFileSize(null), "Unknown size");
});

test("detects pdf attachments by mime type or file extension", () => {
  assert.equal(
    isPdfAttachment({ fileName: "reading.pdf", fileType: null }),
    true,
  );
  assert.equal(
    isPdfAttachment({ fileName: "reading.docx", fileType: "application/pdf" }),
    true,
  );
  assert.equal(
    isPdfAttachment({
      fileName: "reading.docx",
      fileType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
    false,
  );
});
