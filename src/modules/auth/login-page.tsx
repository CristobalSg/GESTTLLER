import { useEffect, useMemo, useRef, useState } from "react";

import { PIN_LENGTH, getAppPin, sanitizePinInput } from "../../utils/app-pin";
import { loginWithPin } from "../../utils/auth";

export function LoginPage() {
  const [pin, setPin] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isFocused, setIsFocused] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isConfigured = useMemo(() => getAppPin() !== undefined, []);

  function handlePinChange(nextValue: string) {
    setPin(sanitizePinInput(nextValue));
    setErrorMessage(undefined);
  }

  function handleSubmit(currentPin: string) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const result = loginWithPin(currentPin);

    if (!result.success) {
      setErrorMessage(result.error);
      setPin("");
      setIsSubmitting(false);
      setIsLeaving(false);
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return;
    }

    setErrorMessage(undefined);
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isConfigured || pin.length !== PIN_LENGTH) {
      return;
    }

    setIsLeaving(true);

    const timeoutId = window.setTimeout(() => {
      handleSubmit(pin);
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isConfigured, pin]);

  return (
    <main
      className={[
        "login-screen flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_28%),linear-gradient(180deg,_#f7f4ee_0%,_#efe7dc_46%,_#e8ddd1_100%)] px-4 py-8 text-stone-900",
        isLeaving ? "login-screen-leave" : "login-screen-enter",
      ].join(" ")}
    >
      <section
        className={[
          "login-card w-full max-w-md rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_28px_80px_rgba(120,113,108,0.18)] backdrop-blur sm:p-8",
          isLeaving ? "login-card-leave" : "login-card-enter",
        ].join(" ")}
      >
        <div className="mx-auto inline-flex rounded-full border border-amber-300/40 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
          Acceso PIN
        </div>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-stone-950">Ingreso al sistema</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Ingresa el PIN numerico de 6 digitos para acceder al prototipo del taller.
        </p>

        <label
          onClick={() => inputRef.current?.focus()}
          className={[
            "mt-8 block w-full cursor-text rounded-[28px] border bg-stone-50/90 p-5 text-left transition duration-200",
            isFocused
              ? "border-amber-300 bg-amber-50/70 shadow-[0_0_0_4px_rgba(251,191,36,0.18)]"
              : "border-stone-200",
          ].join(" ")}
        >
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            enterKeyHint="done"
            value={pin}
            onChange={(event) => handlePinChange(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="pointer-events-none absolute h-0 w-0 opacity-0"
            aria-label="PIN de acceso"
          />

          <div className="flex items-center justify-center gap-3">
            {Array.from({ length: PIN_LENGTH }, (_, index) => {
              const isFilled = index < pin.length;

              return (
                <span
                  key={index}
                  className={[
                    "h-4 w-4 rounded-full border transition duration-200",
                    isFilled
                      ? isFocused
                        ? "border-amber-500 bg-amber-500"
                        : "border-stone-900 bg-stone-900"
                      : isFocused
                        ? "border-amber-300 bg-amber-100"
                        : "border-stone-300 bg-white",
                  ].join(" ")}
                  aria-hidden="true"
                />
              );
            })}
          </div>

          <p className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-stone-500">
            {pin.length}/{PIN_LENGTH} digitos
          </p>

          <p className="mt-3 text-center text-sm text-stone-500">
            Toca aqui para escribir el PIN
          </p>

          {!isConfigured ? (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              El PIN no esta configurado. Revisa `VITE_APP_PIN` en `.env`.
            </p>
          ) : null}

          {errorMessage ? (
            <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}
        </label>
      </section>
    </main>
  );
}
