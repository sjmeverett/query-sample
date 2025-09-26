import { type ReactNode, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";
import Modal from "react-bootstrap/esm/Modal";

export interface SimpleToastProps {
  title: string;
  children?: ReactNode;
  onCancel?: () => void;
  onAccept: (value: string) => void;
  show: boolean;
}

export default function PromptModal({
  title,
  onCancel,
  onAccept,
  show,
}: SimpleToastProps) {
  const [value, setValue] = useState("");

  return (
    <Modal show={show} onHide={onCancel} backdrop={onCancel ? true : "static"}>
      <Modal.Header closeButton={!!onCancel}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}

        <Button
          variant="primary"
          onClick={() => {
            onAccept(value);
          }}
        >
          Okay
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
