import { type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useSettings } from '@/providers/settings-provider';

const containerVariants = cva('w-full mx-auto px-4 lg:px-6', {
  variants: {
    width: {
      // `fixed`: capped at 1320px below the largest breakpoint, but on the largest screens
      // (2xl, >=1536px) the width follows the screen instead of a predefined cap.
      fixed: 'max-w-[1320px] 2xl:max-w-full',
      fluid: '',
    },
  },
  defaultVariants: {
    width: 'fixed',
  },
});

export interface ContainerProps extends VariantProps<typeof containerVariants> {
  children?: ReactNode;
  width?: 'fixed' | 'fluid';
  className?: string;
}

export function Container({ children, width, className = '' }: ContainerProps) {
  const { settings } = useSettings();
  const effectiveWidth = width ?? settings.container ?? 'fixed';

  return (
    <div
      data-slot="container"
      className={cn(containerVariants({ width: effectiveWidth }), className)}
    >
      {children}
    </div>
  );
}
