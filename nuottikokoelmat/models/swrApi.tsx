import useSWR from "swr";
import { User } from "../types/user";

const fetcher = (input: RequestInfo, init: RequestInit) => fetch(input, init).then((res) => res.json());

export interface UserData {
  data: User;
  isLoading: boolean;
  isError: boolean;
}

export function useUser(id: string): TeamsData {
  const { data, error } = useSWR("/api/user/" + id, fetcher);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
}
