import { Loader2 } from "lucide-react";
import Logo from "../../components/Logo";

export default function AuthLoadingScreen({
  message = "Loading…",
}: {
  message?: string;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-muted/40 gap-4 px-6">
      <Logo to="/" size="md" />
      <div className="flex items-center gap-2 text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin text-brand" />
        <p className="text-[13px]">{message}</p>
      </div>
    </div>
  );
}
