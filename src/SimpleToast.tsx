import type { ReactNode } from "react";
import Toast from "react-bootstrap/Toast";

export interface SimpleToastProps {
  popupType: "success" | "error";
  children?: ReactNode;
  onClose: () => void;
  show: boolean;
}

export default function SimpleToast({
  popupType,
  children,
  onClose,
  show,
}: SimpleToastProps) {
  return (
    <Toast
      className="m-3"
      onClose={onClose}
      bg={popupType === "error" ? "danger" : "success"}
      show={show}
    >
      <Toast.Header>
        <strong className="me-auto">
          {popupType === "error" ? "Error" : "Success"}
        </strong>
      </Toast.Header>
      <Toast.Body style={{ color: "white" }}>{children}</Toast.Body>
    </Toast>
  );
}
