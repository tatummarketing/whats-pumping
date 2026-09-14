import * as React from "react";
import { clsxm } from "@/lib/utils";

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<"button">
>(({ children, disabled, className, ...rest }, ref) => {
  return (
    <button
      ref={ref}
      className={clsxm(
        "flex text-md items-center justify-center font-mono text-center min-w-[120px] min-h-[44px] border border-black rounded-md p-3 transition-colors hover:bg-white hover:text-black",
        disabled ? "bg-white text-black opacity-70" : "bg-black text-white",
        className
      )}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
