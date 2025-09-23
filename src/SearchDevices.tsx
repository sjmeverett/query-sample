import { useQueries, useQuery } from "@tanstack/react-query";
import { memo, useMemo, useState } from "react";
import {
  type Device,
  fetchDevices,
  fetchProperties,
  type Property,
} from "./fetch";

export default function SearchDevices() {
  const properties = useQuery(fetchProperties());

  const devices = useQueries({
    queries:
      properties.data?.map((property) => fetchDevices(property.id)) || [],
  });

  const [searchText, setSearchText] = useState("1");

  const results = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    if (!search) {
      return [];
    }

    return devices.flatMap((deviceQuery, i) => {
      const devices = deviceQuery?.data ?? [];

      return (
        devices
          .filter((x) => x.name.toLowerCase().includes(searchText))
          .map((device) => ({
            device,
            property: properties.data?.[i],
          })) ?? []
      );
    });
  }, [devices, properties.data, searchText]);

  const total = devices.length;
  const fetched = devices.filter(
    (q) => q.data !== undefined && !q.isStale,
  ).length;

  const devicesLoading =
    fetched < total || devices.some((x) => x.isFetching || x.isPending);

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
        ) : devicesLoading ? (
          <em>
            Loading ({fetched}/{total})
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
            <SearchResultItem
              key={device.id}
              device={device}
              property={property}
            />
          ))
        )}
      </div>
    </div>
  );
}

const SearchResultItem = memo(
  ({ device, property }: { device: Device; property?: Property }) => {
    return (
      <div>
        {device.name} ({property?.name ?? "..."})
      </div>
    );
  },
);
