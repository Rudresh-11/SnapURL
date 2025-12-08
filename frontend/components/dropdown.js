"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * items = [
 *   { label: "Delete", icon: <Trash className='w-4 h-4' />, onClick: () => console.log("delete") },
 *   { label: "Edit", icon: <Pencil className='w-4 h-4' />, onClick: () => {} },
 * ]
 */

export function DropdownMenuDemo({
  trigger,
  label = "",
  items = [],
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>

      <DropdownMenuContent>

        {label && (
          <>
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            className="flex items-center gap-2 cursor-pointer"
          >
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
