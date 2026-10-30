import type { DialogState } from '@/components/dialogs';

export type Nav = {
  /** Move to a module id, or `overview`. */
  go: (moduleId: string) => void;
  /** Open a modal form. */
  open: (dialog: DialogState) => void;
};
