"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X, LoaderCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
export function Button({
  children,
  className,
  busy,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || busy}
      className={clsx("btn", `btn-${variant}`, className)}
    >
      {busy && <LoaderCircle size={16} className="spin" />}
      {children}
    </button>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
export function Notice({
  text,
  error = false,
}: {
  text: string;
  error?: boolean;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`notice ${error ? "notice-error" : "notice-success"}`}
    >
      {error ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
      <span>{text}</span>
    </div>
  );
}
export function Safety({ compact = false }: { compact?: boolean }) {
  return (
    <div className="safety">
      <AlertTriangle size={18} />
      <div>
        <strong>Rechercheassistenz · Technische Prüfung erforderlich</strong>
        {!compact && (
          <p>
            Treffer sind keine Kompatibilitätszusage. Originaldatenblatt,
            Einbausituation und regulatorische Anforderungen müssen durch
            Fachpersonal geprüft werden. Keine automatische Bestellung oder
            Kontaktaufnahme.
          </p>
        )}
      </div>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="modal"
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Dialog schließen"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export async function api<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers:
      options.body instanceof FormData
        ? options.headers
        : { "Content-Type": "application/json", ...options.headers },
  });
  const json = await response
    .json()
    .catch(() => ({
      error: "Der Server hat keine gültige Antwort geliefert.",
    }));
  if (!response.ok)
    throw new Error(json.error || "Die Aktion ist fehlgeschlagen.");
  return json as T;
}
export const errorText = (e: unknown) =>
  e instanceof Error ? e.message : "Ein unerwarteter Fehler ist aufgetreten.";
