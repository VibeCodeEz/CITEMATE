import { deleteSubjectAction } from "@/actions/subjects";
import { SubjectsAssistantWorkspace } from "@/components/ai/subjects-assistant-workspace";
import { DeleteButton } from "@/components/app/delete-button";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { SubjectAnalyticsSection } from "@/components/app/subject-analytics-section";
import { SubjectFormDialog } from "@/components/app/subject-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getSubjectsData } from "@/lib/data/citemate";

export default async function SubjectsPage() {
  const { subjects, sources, analytics } = await getSubjectsData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Organization"
        title="Subjects"
        description="Create categories for courses, seminars, or themes, then assign each source to one or more subjects and track how your research is distributed."
        actions={<SubjectFormDialog />}
      />
      {subjects.length > 0 ? (
        <SubjectsAssistantWorkspace subjects={subjects} sources={sources} />
      ) : null}
      <SubjectAnalyticsSection analytics={analytics} />
      {subjects.length === 0 ? (
        <EmptyState
          title="No subjects created yet"
          description="Set up your first subject to organize references by class, topic, or project."
          action={<SubjectFormDialog />}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="border-border/70 bg-card/90">
              <CardContent className="space-y-5 py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div
                      className="h-3 w-16 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <div>
                      <h2 className="font-serif text-3xl tracking-tight">
                        {subject.name}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {subject.description || "No description added yet."}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {subject.sourceCount} source{subject.sourceCount === 1 ? "" : "s"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SubjectFormDialog subject={subject} />
                  <DeleteButton
                    id={subject.id}
                    itemLabel={subject.name}
                    onDelete={deleteSubjectAction}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
