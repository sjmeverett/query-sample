import { useQuery } from "@tanstack/react-query";
import { fetchDevices, fetchProperties, type Property } from "./fetch";

export default function SimplePropertyList() {
  const properties = useQuery(fetchProperties());

  return properties.isLoading || !properties.data ? (
    <div>Loading...</div>
  ) : (
    properties.data.map((property) => (
      <SimplePropertyListItem key={property.id} property={property} />
    ))
  );
}

function SimplePropertyListItem({ property }: { property: Property }) {
  const devices = useQuery(fetchDevices(property.id));

  return (
    <div>
      {property.name} (
      {devices.isLoading || !devices.data ? "..." : devices.data.length}{" "}
      devices)
    </div>
  );
}
