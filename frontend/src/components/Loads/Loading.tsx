import React from "react";

export type LoadingVariant = "spinner" | "dots" | "skeleton" | "bar";

interface LoadingProps {
  variant?: LoadingVariant;
  size?: number; // px for spinner size
  text?: string | null;
  className?: string;
}

/**
 * Loading - componente de carregamento flexível usando Tailwind
 * Variants:
 *  - spinner: ícone circular (SVG) com animate-spin
 *  - dots: três pontos com animação de bounce
 *  - skeleton: bloco retangular com animate-pulse (útil para cards)
 *  - bar: pequena barra de carregamento com efeito pulse
 *
 * Uso:
 * <Loading />
 * <Loading variant="dots" text="Carregando mensagens..." />
 */

const Loading: React.FC<LoadingProps> = ({
  variant = "skeleton",
  size = 32,
  text = null,
  className = "",
}) => {
  const base = "flex items-center gap-3 justify-center";

  if (variant === "spinner") {
    return (
      <div className={`${base} ${className}`} role="status" aria-live="polite">
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" strokeWidth="3" className="opacity-20 stroke-current text-gray-300" />
          <path
            d="M22 12a10 10 0 00-10-10"
            strokeWidth="3"
            strokeLinecap="round"
            className="stroke-current text-gray-700"
          />
        </svg>
        {text && <span className="text-sm text-gray-600">{text}</span>}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={`${base} ${className}`} role="status" aria-live="polite">
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
          <span className="inline-block w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
          <span className="inline-block w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
        {text && <span className="text-sm text-gray-600">{text}</span>}
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={`${base} ${className}`} role="status" aria-live="polite">
        <div className="w-full max-w-xs h-6 rounded-md bg-gray-200 animate-pulse" />
      </div>
    );
  }

  // bar
  return (
    <div className={`${base} ${className}`} role="status" aria-live="polite">
      <div className="w-40 h-2 rounded-full overflow-hidden bg-gray-200">
        <div className="h-full rounded-full bg-gray-400/60 animate-pulse" style={{ width: "40%" }} />
      </div>
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
};

export default Loading;

// ---------- Exemplos de uso ----------
// 1) Spinner padrão
// <Loading />
// 2) Spinner com texto
// <Loading text="Carregando..." />
// 3) Dots
// <Loading variant="dots" text="Buscando mensagens" />
// 4) Skeleton (usar dentro de cards/listas enquanto carrega dados)
// <Loading variant="skeleton" className="w-full" />
// 5) Barra
// <Loading variant="bar" text="Sincronizando" />

// DICA: se você usa componentes maiores, crie wrappers com tamanhos e espaçamentos
// e evite bloquear interações adicionando um overlay quando necessário.
