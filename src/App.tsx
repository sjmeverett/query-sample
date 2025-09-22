import { useState } from "react";
import DetailedPropertyList from "./DetailedPropertyList";
import SearchDevices from "./SearchDevices";
import SimplePropertyList from "./SimplePropertyList";

export default function App() {
  const [mode, setMode] = useState<"simple" | "detailed" | "search">("search");

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
