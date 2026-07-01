export function PageHeader({ eyebrow, title, description, actions }: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gradient-brand mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1 max-w-xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}