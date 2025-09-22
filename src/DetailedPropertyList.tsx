import { useQuery } from "@tanstack/react-query";
import { fetchDevices, fetchProperties, type Property } from "./fetch";

export default function DetailedPropertyList() {
  const properties = useQuery(fetchProperties());

  return properties.isLoading || !properties.data ? (
    <div>Loading...</div>
  ) : (
    properties.data.map((property) => (
      <DetailedPropertyListItem key={property.id} property={property} />
    ))
  );
}

function DetailedPropertyListItem({ property }: { property: Property }) {
  const devices = useQuery(fetchDevices(property.id));

  return (
    <div>
      <h3>{property.name}</h3>
      {devices.isLoading || !devices.data ? (
        <em>loading...</em>
      ) : devices.data.length === 0 ? (
        <em>no devices</em>
      ) : (
        <ul>
          {devices.data.map((device) => (
            <li key={device.id}>{device.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
