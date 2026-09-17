export function NoteField({
  value,
  onChange,
  placeholder = 'Add a note (optional)',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <section className="mt-3 px-4">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--tertiary)]">
        Note
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="min-h-[88px] w-full resize-none rounded-[12px] bg-[var(--fill)] px-3 py-2.5 text-[16px] leading-5 outline-none"
      />
    </section>
  )
}
