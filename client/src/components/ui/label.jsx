// import * as React from "react"
// import * as LabelPrimitive from "@radix-ui/react-label"

// import { cn } from "../lib/utils"

// function Label({
//   className,
//   ...props
// }) {
//   return (
//     <LabelPrimitive.Root
//       data-slot="label"
//       className={cn(
//         "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
//         className
//       )}
//       {...props}
//     />
//   )
// }

// export { Label }

// // "use client"

// // import { forwardRef } from "react"
// // import * as LabelPrimitive from "@radix-ui/react-label"
// // import { cn } from "../lib/utils"

// // const Label = forwardRef(({ className, ...props }, ref) => (
// //   <LabelPrimitive.Root
// //     ref={ref}
// //     className={cn(
// //       "text-sm font-medium text-black dark:text-white leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
// //       className,
// //     )}
// //     {...props}
// //   />
// // ))

// // export { Label }


// Label component extends from shadcnui - https://ui.shadcn.com/docs/components/label

"use client";
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "../lib/utils";

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium text-black dark:text-white leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

