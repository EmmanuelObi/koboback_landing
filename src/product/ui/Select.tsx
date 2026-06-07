import { cn, selectClass } from "./tokens";

export default function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(selectClass, className)} {...props}>
      {children}
    </select>
  );
}
