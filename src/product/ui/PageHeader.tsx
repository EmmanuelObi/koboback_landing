import { eyebrowClass, pageDescClass, pageTitleClass, cn } from "./tokens";

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <p className={cn(eyebrowClass, "mb-2")}>{eyebrow}</p>}
        <h1 className={pageTitleClass}>{title}</h1>
        {description && (
          <p className={cn(pageDescClass, "mt-2 max-w-2xl")}>{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
