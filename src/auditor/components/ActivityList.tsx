import type { Activity } from "../types";
import { dateLabel } from "../helpers";
import { Empty } from "./ui";
export default function ActivityList({
  items,
  limit
}: {
  items: Activity[];
  limit?: number;
}) {
  if (!items.length) return <Empty title="No activity yet" description="Client records, uploads, evidence and review decisions will appear here as you work." />;
  return <ol className="aw-activity">{items.slice(0, limit).map(item => <li key={item.id}><span className="aw-activity-dot" /><div><h3>{item.action}</h3><p>{item.detail}</p><small>{item.actor} · {dateLabel(item.created_at)} · {new Date(item.created_at).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit"
          })}</small>{item.before ? <details><summary>View recorded change</summary><pre>{JSON.stringify({
              before: item.before,
              after: item.after
            }, null, 2)}</pre></details> : null}</div></li>)}</ol>;
}
