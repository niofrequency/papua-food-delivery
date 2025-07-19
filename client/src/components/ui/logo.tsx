import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "white";
}

export function Logo({ className, size = "md", variant = "default" }: LogoProps) {
  const sizeClass = {
    xs: "h-6",
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };

  const textColor = variant === "white" ? "text-white" : "text-neutral-900";
  const gradientClass = variant === "white" 
    ? "from-white to-white/80" 
    : "from-primary to-secondary";

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn("flex items-center", sizeClass[size])}>
        <svg 
          viewBox="0 0 40 40" 
          className={cn("h-full", variant === "white" ? "text-white" : "text-primary")}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M20 3C10.6 3 3 10.6 3 20s7.6 17 17 17 17-7.6 17-17S29.4 3 20 3zm0 30c-7.2 0-13-5.8-13-13S12.8 7 20 7s13 5.8 13 13-5.8 13-13 13z" 
            fill="currentColor"
          />
          <path 
            d="M26 14c0 1.1-.9 2-2 2H16c-1.1 0-2-.9-2-2s.9-2 2-2h8c1.1 0 2 .9 2 2z" 
            fill="currentColor"
          />
          <path 
            d="M28 19c0 1.1-.9 2-2 2H14c-1.1 0-2-.9-2-2s.9-2 2-2h12c1.1 0 2 .9 2 2z" 
            fill="currentColor"
          />
          <path 
            d="M24 24c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2s.9-2 2-2h4c1.1 0 2 .9 2 2z" 
            fill="currentColor"
          />
        </svg>
        <div className="ml-2">
          <h1 className={cn("font-bold leading-tight", textColor, {
            "text-base": size === "xs",
            "text-lg": size === "sm",
            "text-xl": size === "md", 
            "text-2xl": size === "lg" 
          })}>
            <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", gradientClass)}>
              Nasi Go
            </span>
          </h1>
          <p className={cn("font-medium", variant === "white" ? "text-white/70" : "text-neutral-500", {
            "text-[8px]": size === "xs",
            "text-[10px]": size === "sm",
            "text-xs": size === "md",
            "text-sm": size === "lg"
          })}>
            {size !== "xs" ? "Papua Food Delivery" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}