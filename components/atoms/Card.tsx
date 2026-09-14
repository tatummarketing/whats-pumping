import * as React from "react";
import { clsxm } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.ComponentPropsWithRef<"div">>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={clsxm("flex flex-col items-stretch", className)}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
