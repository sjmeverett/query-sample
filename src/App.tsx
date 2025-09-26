import { useState } from "react";
import DetailedPropertyList from "./DetailedPropertyList";
import { type PopupRenderFn, usePopupContext } from "./PopupProvider";
import PromptModal from "./PromptModal";
import SearchDevices from "./SearchDevices";
import SimplePropertyList from "./SimplePropertyList";
import SimpleToast from "./SimpleToast";

export default function App() {
  const [mode, setMode] = useState<"simple" | "detailed" | "search">("search");
  const { showPopup } = usePopupContext();

  const toast: PopupRenderFn<void> = (resolve, _reject, show) => (
    <SimpleToast show={show} popupType="success" onClose={() => resolve()}>
      Hello!
    </SimpleToast>
  );

  const prompt: PopupRenderFn<string> = (resolve, reject, show) => (
    <PromptModal
      title="Enter your name"
      show={show}
      onCancel={() => {
        reject(new Error("Cancelled"));
      }}
      onAccept={resolve}
    />
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <button type="button" onClick={() => setMode("simple")}>
          simple
        </button>

        <button type="button" onClick={() => setMode("detailed")}>
          detailed
        </button>

        <button type="button" onClick={() => setMode("search")}>
          search
        </button>

        <button
          type="button"
          onClick={() => {
            showPopup<void>(toast, {
              modal: false,
              animationMs: 400,
              autoHideAfterMs: 3000,
            });
          }}
        >
          toast
        </button>

        <button
          type="button"
          onClick={async () => {
            const result = await showPopup<string>(prompt, {
              modal: true,
              animationMs: 400,
            });
            alert(`Hi, ${result}`);
          }}
        >
          prompt
        </button>
      </div>

      {mode === "simple" ? (
        <SimplePropertyList />
      ) : mode === "detailed" ? (
        <DetailedPropertyList />
      ) : mode === "search" ? (
        <SearchDevices />
      ) : null}
    </div>
  );
}
