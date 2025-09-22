import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchDevices, fetchProperties } from "./fetch";
import useProgressiveLoad from "./useProgressiveLoad";

export default function SearchDevices() {
  const properties = useQuery(fetchProperties());

  const devices = useProgressiveLoad(
    properties.data?.map((property) => fetchDevices(property.id)) || [],
  );

  const [searchText, setSearchText] = useState("1");

  const results = useMemo(
    () =>
      devices.data.flatMap(
        (device, i) =>
          device?.data
            ?.filter((x) => x.name.includes(searchText))
            .map((device) => ({
              device,
              property: properties.data?.[i],
            })) ?? [],
      ),
    [devices.data, properties.data, searchText],
  );

  return (
    <div>
      <div>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Start searching..."
        />
      </div>
      <div>
        {properties.isLoading ? (
          <em>Loading...</em>
        ) : devices.loading ? (
          <em>
            Loading ({devices.fetched}/{devices.count})
          </em>
        ) : null}
      </div>

      <div style={{ marginTop: 10 }}>
        {!searchText ? (
          <em>Enter a search term to start searching</em>
        ) : !results.length ? (
          <em>No results</em>
        ) : (
          results.map(({ device, property }) => (
            <div key={device.id}>
              {device.name} ({property?.name ?? "..."})
            </div>
          ))
        )}
      </div>
    </div>
  );
}
