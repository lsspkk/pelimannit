"use client";

import { useUser } from "@/models/swrApi";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  const { data, isLoading, isError } = useUser("649889ca9b43f067ab02e000");

  console.debug({ data, isLoading, isError });
  const loadUser = async () => {
    const response = await fetch("/api/user/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: "testuser" }),
    });
    try {
      const data = await response.json();
      console.log(data);
      setUser(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    void loadUser();
  }, []);

  const saveUser = async () => {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "testuser",
        email: "tester@tester.com",
      }),
    });
    const data = await response.json();
    console.log(data);
  };

  return (
    <main className="flex flex-col items-center m-20 gap-4">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={saveUser}>
          Tallenna testikäyttäjä
        </button>
      </div>
      <div className="flex justify-between w-full">
        {user === null && <div>ei käyttäjää</div>}
        {user && <div className="pre">{JSON.stringify(user)}</div>}
      </div>

      <div className="flex-col justify-between w-full gap-2">
        {data && <div>{data._id}</div>}
        {data && <div>{data.username}</div>}
        {data && <div>{data.email}</div>}
        {data === null && <div>ei käyttäjää 649889ca9b43f067ab02e000</div>}
      </div>
    </main>
  );
}
