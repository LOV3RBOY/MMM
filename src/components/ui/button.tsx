import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:shadow-soft-md hover:bg-primary-600 active:bg-primary-700 active:translate-y-[1px]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:shadow-soft-md hover:bg-destructive/90 active:translate-y-[1px]",
        outline:
          "border border-input bg-background shadow-soft hover:bg-accent hover:text-accent-foreground hover:border-gray-300 active:translate-y-[1px]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:shadow-soft-md hover:bg-secondary/80 active:translate-y-[1px]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        soft: "bg-primary-100 text-primary-700 hover:bg-primary-200 active:bg-primary-300 shadow-none active:translate-y-[1px]",
        subtle:
          "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 shadow-none active:translate-y-[1px]",
        success:
          "bg-success text-success-foreground shadow-soft hover:shadow-soft-md hover:opacity-90 active:translate-y-[1px]",
        warning:
          "bg-warning text-warning-foreground shadow-soft hover:shadow-soft-md hover:opacity-90 active:translate-y-[1px]",
        info: "bg-info text-info-foreground shadow-soft hover:shadow-soft-md hover:opacity-90 active:translate-y-[1px]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      rounded: {
        default: "rounded-md",
        sm: "rounded-sm",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
