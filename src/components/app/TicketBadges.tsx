import { Badge } from "../ui/badge"
import { confidenceLabel } from "../../lib/utils"
import type { Sentiment, TicketPriority } from "../../types/domain"
import { priorityLabels, sentimentLabels } from "../../lib/labels"

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const tone = priority === "urgent" ? "rose" : priority === "high" ? "amber" : priority === "medium" ? "blue" : "gray"
  return <Badge tone={tone}>{priorityLabels[priority]}</Badge>
}

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const tone = sentiment === "angry" ? "rose" : sentiment === "negative" ? "amber" : sentiment === "positive" ? "emerald" : "gray"
  return <Badge tone={tone}>{sentimentLabels[sentiment]}</Badge>
}

export function ConfidenceBadge({ confidence }: { confidence?: number | null }) {
  const tone = confidence == null ? "gray" : confidence >= 0.85 ? "emerald" : confidence >= 0.6 ? "amber" : "rose"
  return <Badge tone={tone}>{confidenceLabel(confidence)}</Badge>
}
