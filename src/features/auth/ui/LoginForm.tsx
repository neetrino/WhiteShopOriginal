"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

import { AppLink } from "@/components/ui/AppLink";
import { loginAction, type AuthActionState } from "@/features/auth/login-action";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const initialState: AuthActionState = {};

type LoginFormProps = {
  locale: Locale;
  dictionary: Dictionary["auth"];
};

export function LoginForm({ locale, dictionary }: LoginFormProps) {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const action = loginAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
        {dictionary.email}
        <input
          required
          name="email"
          type="email"
          autoComplete="email"
          className="h-10 rounded-lg border border-gray-200 px-3 text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
        {dictionary.password}
        <input
          required
          name="password"
          type="password"
          autoComplete="current-password"
          className="h-10 rounded-lg border border-gray-200 px-3 text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
        />
      </label>
      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
        >
          {state.error}
        </p>
      ) : null}
      <button
        disabled={isPending}
        className="h-10 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
      >
        {isPending ? "…" : dictionary.submitLogin}
      </button>
      <p className="text-center text-sm text-gray-600">
        <AppLink
          href={`/${locale}/register`}
          prefetchPolicy="intent"
          className="font-medium text-gray-900 underline-offset-2 hover:underline"
        >
          {dictionary.submitRegister}
        </AppLink>
      </p>
    </form>
  );
}
