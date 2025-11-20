import { cn } from "@/lib/utils";

interface SelahLogoProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

export function SelahLogo({ className, ...props }: SelahLogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            fill="none"
            className={cn("h-8 w-8", className)}
            {...props}
        >
            <circle cx="32" cy="32" r="30" className="fill-primary" />
            <circle cx="32" cy="32" r="26" className="fill-background" />
            <rect x="24" y="20" width="6" height="24" rx="2" className="fill-primary" />
            <rect x="34" y="20" width="6" height="24" rx="2" className="fill-primary" />
        </svg>
    );
}
