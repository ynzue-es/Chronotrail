export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 px-4 py-6 md:flex-row md:items-start md:justify-between md:px-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="mt-3 md:mt-0">{action}</div>}
    </div>
  )
}
