export type NoteMarkdownAction =
  | "heading"
  | "bold"
  | "italic"
  | "bulletList"
  | "numberedList"
  | "blockquote"
  | "codeBlock";

export type NoteEditorSelection = {
  start: number;
  end: number;
};

export type NoteEditorTransformResult = {
  value: string;
  selection: NoteEditorSelection;
};

function getSelectedText(
  value: string,
  selection: NoteEditorSelection,
  fallback: string,
) {
  return value.slice(selection.start, selection.end) || fallback;
}

function wrapSelection(
  value: string,
  selection: NoteEditorSelection,
  prefix: string,
  suffix: string,
  fallback: string,
) {
  const selectedText = getSelectedText(value, selection, fallback);
  const nextValue =
    value.slice(0, selection.start) +
    prefix +
    selectedText +
    suffix +
    value.slice(selection.end);
  const nextStart = selection.start + prefix.length;
  const nextEnd = nextStart + selectedText.length;

  return {
    value: nextValue,
    selection: {
      start: nextStart,
      end: nextEnd,
    },
  } satisfies NoteEditorTransformResult;
}

function prefixLines(
  value: string,
  selection: NoteEditorSelection,
  getPrefix: (lineIndex: number) => string,
  fallback: string,
) {
  const lineStart = value.lastIndexOf("\n", Math.max(selection.start - 1, 0)) + 1;
  const lineEndCandidate = value.indexOf("\n", selection.end);
  const lineEnd = lineEndCandidate === -1 ? value.length : lineEndCandidate;
  const selectedBlock = value.slice(lineStart, lineEnd) || fallback;
  const prefixedBlock = selectedBlock
    .split("\n")
    .map((line, index) => `${getPrefix(index)}${line || fallback}`)
    .join("\n");
  const nextValue =
    value.slice(0, lineStart) + prefixedBlock + value.slice(lineEnd);

  return {
    value: nextValue,
    selection: {
      start: lineStart,
      end: lineStart + prefixedBlock.length,
    },
  } satisfies NoteEditorTransformResult;
}

export function applyNoteMarkdownAction(
  value: string,
  selection: NoteEditorSelection,
  action: NoteMarkdownAction,
): NoteEditorTransformResult {
  switch (action) {
    case "heading":
      return prefixLines(value, selection, () => "## ", "Heading");
    case "bold":
      return wrapSelection(value, selection, "**", "**", "bold text");
    case "italic":
      return wrapSelection(value, selection, "_", "_", "italic text");
    case "bulletList":
      return prefixLines(value, selection, () => "- ", "List item");
    case "numberedList":
      return prefixLines(value, selection, (index) => `${index + 1}. `, "List item");
    case "blockquote":
      return prefixLines(value, selection, () => "> ", "Quoted idea");
    case "codeBlock":
      return wrapSelection(value, selection, "```\n", "\n```", "code");
    default:
      return { value, selection };
  }
}
