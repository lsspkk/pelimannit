import useSWR from "swr";
import { User } from "./user";
import { Archive } from "./archive";

const fetcher = (input: RequestInfo, init: RequestInit) => fetch(input, init).then((res) => res.json());

export interface UserData {
  data: User;
  isLoading: boolean;
  isError: boolean;
}

export function useUser(id: string): UserData {
  const { data, error } = useSWR("/api/user/" + id, fetcher);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
}


export interface ArchiveData {
  data: Archive;
  isLoading: boolean;
  isError: boolean;
}

export function useArchive(id: string): ArchiveData {
  const { data, error } = useSWR("/api/archive/" + id, fetcher);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
}
