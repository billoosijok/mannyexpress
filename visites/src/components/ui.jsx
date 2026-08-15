export function SectionHeader({ number, title, subtitle }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
        {number}
      </span>
      <div>
        <h2 className="text-base font-semibold leading-tight text-navy">{title}</h2>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <section
      className={`mb-5 rounded-xl border border-line bg-white p-4 shadow-card ${className}`}
    >
      {children}
    </section>
  );
}

export function Field({ label, required, hint, children }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-gold"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function TextInput({ value, onChange, ...props }) {
  return (
    <input
      className="field-input"
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      {...props}
    />
  );
}

export function TextArea({ value, onChange, rows = 3, ...props }) {
  return (
    <textarea
      className="field-input"
      rows={rows}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      {...props}
    />
  );
}

export function Spinner({ className = "h-5 w-5" }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}

export function ErrorNote({ children }) {
  if (!children) return null;
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </p>
  );
}
