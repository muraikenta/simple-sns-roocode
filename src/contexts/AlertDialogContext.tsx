import { createContext, useContext, useState, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

interface AlertDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive";
  onConfirm: () => void;
}

interface AlertDialogContextType {
  showAlert: (options: AlertDialogOptions) => void;
  hideAlert: () => void;
}

export const AlertDialogContext = createContext<
  AlertDialogContextType | undefined
>(undefined);

export const useAlertDialog = () => {
  const context = useContext(AlertDialogContext);
  if (context === undefined) {
    throw new Error(
      "useAlertDialog must be used within an AlertDialogProvider"
    );
  }
  return context;
};

interface AlertDialogProviderProps {
  children: ReactNode;
}

export const AlertDialogProvider = ({ children }: AlertDialogProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AlertDialogOptions>({
    title: "",
    description: "",
    confirmText: "確認",
    cancelText: "キャンセル",
    confirmVariant: "default",
    onConfirm: () => {},
  });

  const showAlert = (newOptions: AlertDialogOptions) => {
    setOptions({
      ...options,
      ...newOptions,
    });
    setIsOpen(true);
  };

  const hideAlert = () => {
    setIsOpen(false);
  };

  const handleConfirm = () => {
    options.onConfirm();
    hideAlert();
  };

  return (
    <AlertDialogContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {options.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{options.cancelText}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                options.confirmVariant === "destructive"
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }
            >
              {options.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
};
