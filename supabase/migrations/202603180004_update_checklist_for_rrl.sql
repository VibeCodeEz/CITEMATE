update public.checklist_items
set
  label = 'Core literature has been gathered',
  description = 'Confirm the project includes the main studies, theories, or references needed for your topic before drafting the final review section.',
  position = 1
where slug = 'quoted-text-quotation-marks';

update public.checklist_items
set
  label = 'Each paraphrase or claim is tied to a source',
  description = 'Make sure every paraphrased idea, summarized finding, or borrowed claim is traceable to the original source.',
  position = 2
where slug = 'paraphrased-ideas-cited';

update public.checklist_items
set
  label = 'Reference list or bibliography is complete',
  description = 'Confirm the paper includes a complete references, works cited, or bibliography section that matches the sources actually used.',
  position = 3
where slug = 'bibliography-included';

update public.checklist_items
set
  label = 'In-text citations and source details are checked',
  description = 'Review author names, years, page numbers, punctuation, and source details so the citation record matches the original publication.',
  position = 4
where slug = 'in-text-citations-checked';

update public.checklist_items
set
  label = 'Themes, comparisons, or synthesis are clear',
  description = 'Check that the literature review is organized by themes, variables, methods, theories, or debates instead of only listing one source after another.',
  position = 5
where slug = 'source-urls-dois-verified';

update public.checklist_items
set
  label = 'Research gap or contribution is supported',
  description = 'Make sure the claimed research gap, limitation, contradiction, or underexplored area is grounded in the sources you actually reviewed.',
  position = 6
where slug = 'no-unattributed-copying';

update public.checklist_items
set
  label = 'Final RRL and originality review completed',
  description = 'Read the paper one more time to catch citation gaps, weak synthesis, accidental borrowing, patchwriting, or unsupported gap claims before submission.',
  position = 7
where slug = 'final-originality-review';
