"use client";

import { useActionState } from "react";
import { login, type AuthState } from "../actions/auth";

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <main>
      <h1>Log in</h1>
      <form action={action}>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {state.error && <p role="alert">{state.error}</p>}
        <button type="submit" disabled={pending}>
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>
    </main>
  );
}