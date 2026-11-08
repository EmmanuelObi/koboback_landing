import { cloneElement, isValidElement, useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from "react";
import { X, Search, FolderOpen } from "lucide-react";
import { human } from "../helpers";
export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return <button type="button" className={`aw-button aw-button-${variant} ${className}`} {...props}>{children}</button>;
}
export function Badge({
  status,
  children
}: {
  status: string;
  children?: ReactNode;
}) {
  return <span className={`aw-badge aw-status-${status}`}>{children ?? human(status)}</span>;
}
export function Title({
  title,
  description,
  actions
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return <div className="aw-page-title"><div><h1>{title}</h1><p>{description}</p></div><div className="aw-actions">{actions}</div></div>;
}
export function Field({
  label,
  children,
  hint
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  const id = useId();
  const control = isValidElement(children) ? cloneElement(children as ReactElement<{
    id?: string;
    "aria-describedby"?: string;
  }>, {
    id,
    "aria-describedby": hint ? `${id}-hint` : undefined
  }) : children;
  return <div className="aw-field"><label htmlFor={id}>{label}</label>{control}{hint ? <small id={`${id}-hint`}>{hint}</small> : null}</div>;
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Search…"
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return <div className="aw-search"><Search size={16} /><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} /></div>;
}
export function Empty({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return <div className="aw-empty"><FolderOpen size={28} /><h3>{title}</h3><p>{description}</p>{action}</div>;
}
export function Modal({
  title,
  onClose,
  children
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog className="auditor-modal" ref={ref} aria-label={title} onCancel={e => {
    e.preventDefault();
    onClose();
  }}><div className="aw-modal-heading"><h2>{title}</h2><button type="button" aria-label="Close dialog" className="aw-icon-button" onClick={onClose}><X size={20} /></button></div>{children}</dialog>;
}
export function Metrics({
  values
}: {
  values: {
    label: string;
    value: string | number;
    warning?: boolean;
  }[];
}) {
  return <div className="aw-metrics">{values.map(metric => <div key={metric.label}><span>{metric.label}</span><strong className={metric.warning ? "aw-amber" : ""}>{metric.value}</strong></div>)}</div>;
}
