import { createContext, useContext, useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";

interface ErrorDialogContextType {
  showError: (message: string) => void;
  hideError: () => void;
}

export const ErrorDialogContext = createContext<
  ErrorDialogContextType | undefined
>(undefined);

export const useErrorDialog = () => {
  const context = useContext(ErrorDialogContext);
  if (context === undefined) {
    throw new Error(
      "useErrorDialog must be used within an ErrorDialogProvider"
    );
  }
  return context;
};

interface ErrorDialogProviderProps {
  children: ReactNode;
}

export const ErrorDialogProvider = ({ children }: ErrorDialogProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const showError = (message: string) => {
    setErrorMessage(message);
    setIsOpen(true);
  };

  const hideError = () => {
    setIsOpen(false);
  };

  return (
    <ErrorDialogContext.Provider value={{ showError, hideError }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">エラー</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={hideError} className="w-full">
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorDialogContext.Provider>
  );
};
