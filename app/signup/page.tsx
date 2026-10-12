"use client";

import { useActionState } from "react";
import { signup, type AuthState } from "../actions/auth";

const initialState: AuthState = {};

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, initialState);

  return (
    <main>
      <h1>Create account</h1>
      <form action={action}>
        <label>
          Name
          <input name="name" autoComplete="name" required maxLength={100} />
        </label>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Password (at least 12 characters)
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={72}
            required
          />
        </label>
        {state.error && <p role="alert">{state.error}</p>}
        <button type="submit" disabled={pending}>
          {pending ? "Creating account…" : "Sign up"}
        </button>
      </form>
    </main>
  );
}
