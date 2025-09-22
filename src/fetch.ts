import { queryOptions } from "@tanstack/react-query";

const fetchDelay = 1000;

export interface QueryOptions {
  staleTime?: number;
  gcTime?: number;
}

export function fetchQueryOptions<T>(url: string, options?: QueryOptions) {
  return queryOptions<T>({
    queryKey: [url],
    queryFn: () => fakeFetch(url) as T,
    ...options,
  });
}

export interface Device {
  id: string;
  name: string;
}

export interface Property {
  id: string;
  name: string;
}

export function fetchDevices(propertyId: string) {
  return fetchQueryOptions<Device[]>(`/devices/${propertyId}`, {
    staleTime: 60_000 * 5,
    gcTime: 60_000 * 30,
  });
}

export function fetchProperties() {
  return fetchQueryOptions<Property[]>(`/properties`, {
    staleTime: 1_000,
    gcTime: 1_000,
  });
}

let promise: Promise<unknown> = Promise.resolve();

function fakeFetch(url: string) {
  promise = promise
    .catch()
    .then(() =>
      new Promise((resolve) => setTimeout(resolve, fetchDelay)).then(() =>
        data[url]
          ? Promise.resolve(data[url])
          : Promise.reject(new Error("Not found")),
      ),
    );

  return promise;
}

const data: Record<string, unknown> = {
  "/properties": [
    { id: "1", name: "Test property 1" },
    { id: "2", name: "Test property 2" },
    { id: "3", name: "Test property 3" },
    { id: "4", name: "Test property 4" },
    { id: "5", name: "Test property 5" },
  ] satisfies Property[],
  "/devices/1": [
    { id: "1", name: "Test device 1" },
    { id: "2", name: "Test device 2" },
  ] satisfies Device[],
  "/devices/2": [
    { id: "3", name: "Test device 3" },
    { id: "4", name: "Test device 4" },
    { id: "5", name: "Test device 5" },
    { id: "6", name: "Test device 6" },
  ] satisfies Device[],
  "/devices/3": [{ id: "7", name: "Test device 7" }] satisfies Device[],
  "/devices/4": [] satisfies Device[],
  "/devices/5": [
    { id: "8", name: "Test device 8" },
    { id: "9", name: "Test device 9" },
    { id: "10", name: "Test device 10" },
    { id: "11", name: "Test device 11" },
  ] satisfies Device[],
};
