"use client";

import { useMemo, useState } from "react";

import { SourceReminderList } from "@/components/app/source-reminder-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SourceReminder } from "@/lib/reminders/source-reminders";

type ReminderFilter = "all" | "citation" | "abstract" | "links";

type NeedsAttentionBoardProps = {
  reminders: SourceReminder[];
};

export function NeedsAttentionBoard({
  reminders,
}: NeedsAttentionBoardProps) {
  const [filter, setFilter] = useState<ReminderFilter>("all");

  const filteredReminders = useMemo(() => {
    switch (filter) {
      case "abstract":
        return reminders.filter((reminder) => reminder.key === "missing_abstract");
      case "links":
        return reminders.filter(
          (reminder) =>
            reminder.key === "missing_link" ||
            reminder.key === "missing_website_url",
        );
      case "citation":
        return reminders.filter((reminder) =>
          [
            "missing_author",
            "missing_year",
            "missing_title",
            "missing_publisher",
          ].includes(reminder.key),
        );
      default:
        return reminders;
    }
  }, [filter, reminders]);

  const filterOptions: Array<{ key: ReminderFilter; label: string }> = [
    { key: "all", label: "All" },
    { key: "citation", label: "Citation core" },
    { key: "abstract", label: "Abstracts" },
    { key: "links", label: "Links" },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option.key}
            type="button"
            size="sm"
            variant={filter === option.key ? "default" : "outline"}
            onClick={() => setFilter(option.key)}
          >
            {option.label}
          </Button>
        ))}
        <Badge variant="secondary" className="rounded-full">
          {filteredReminders.length} shown
        </Badge>
      </div>
      <SourceReminderList reminders={filteredReminders} />
    </section>
  );
}
