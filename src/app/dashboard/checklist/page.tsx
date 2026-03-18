import { ChecklistBoard } from "@/components/app/checklist-board";
import { PageHeader } from "@/components/app/page-header";
import { getChecklistData } from "@/lib/data/citemate";

export default async function ChecklistPage() {
  const items = await getChecklistData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Final review"
        title="RRL and Submission Checklist"
        description="Use this final pass to confirm literature coverage, synthesis quality, citations, references, and originality before you submit."
      />
      <ChecklistBoard items={items} />
    </div>
  );
}
