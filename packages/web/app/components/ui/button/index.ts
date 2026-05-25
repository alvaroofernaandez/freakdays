import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Button } from './Button.vue';

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      // Solid/outline variants wear the arcade skin (pixel font, uppercase,
      // tactile press). ghost/link stay plain sans for inline/secondary use.
      variant: {
        default:
          'btn-game font-pixel uppercase tracking-wider leading-none bg-primary text-primary-foreground hover:bg-primary/90 hover:text-white',
        destructive:
          'btn-game font-pixel uppercase tracking-wider leading-none bg-destructive text-white hover:bg-destructive/90 hover:text-white focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 dark:hover:bg-destructive/80',
        outline:
          'btn-game font-pixel uppercase tracking-wider leading-none border-2 bg-background hover:bg-accent hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/60 dark:hover:text-foreground',
        secondary:
          'btn-game font-pixel uppercase tracking-wider leading-none bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-white',
        ghost:
          'text-sm hover:bg-accent hover:text-foreground dark:hover:bg-accent/60 dark:hover:text-foreground',
        link: 'text-sm text-primary underline-offset-4 hover:underline hover:text-primary/90',
      },
      // Heights/text sized for the pixel font (it renders large; keep px small
      // and add vertical room). icon sizes keep no text.
      size: {
        default: 'h-11 px-5 text-[10px] has-[>svg]:px-4',
        sm: 'h-9 gap-1.5 px-3.5 text-[9px] has-[>svg]:px-3',
        lg: 'h-12 px-7 text-[11px] has-[>svg]:px-5',
        icon: 'size-10 text-sm',
        'icon-sm': 'size-9 text-sm',
        'icon-lg': 'size-11 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
export type ButtonVariants = VariantProps<typeof buttonVariants>;
