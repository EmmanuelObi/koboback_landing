import { Link } from "react-router-dom";
export default function AuditorBrand({
  to
}: {
  to: string;
}) {
  return <Link className="aw-brand" to={to} aria-label="KoboBack auditor workspace">
    <svg width="31" height="32" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor"><path d="M3 9 10 2v21l-7 7V9Zm14-6h12L19 16l11 13H18L9 17 17 3Z" /></svg>
    <span><strong>KOBOBACK</strong><small>Auditor workspace</small></span>
  </Link>;
}
