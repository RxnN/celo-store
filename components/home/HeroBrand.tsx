import Image from "next/image";
import { LinkButton } from "../ui/Button";

export function HeroBrand() {
  return (
    <div className="relative my-6 flex min-h-[220px] items-center overflow-hidden rounded-2xl border border-[#12335a] bg-black sm:min-h-[320px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(77,141,255,0.18),transparent_60%)]" />

      <div className="relative z-10 max-w-[380px] px-6 py-8 sm:px-10">
        <p className="mb-3 text-[11px] font-extrabold tracking-[3px] text-cyan">
          streetwear esportivo
        </p>
        <h1 className="mb-4 font-display text-4xl leading-none tracking-wide text-balance sm:text-5xl">
          Celo Store
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          Peças de treino e streetwear com atitude. Estilo urbano, conforto de verdade e
          caimento pra quem representa a marca na rua e na quadra.
        </p>
        <LinkButton href="/categoria/camisetas" className="neon-pulse">
          explorar coleção
        </LinkButton>
      </div>

      <div className="relative z-10 ml-auto hidden h-[300px] w-[300px] shrink-0 sm:block">
        <div
          className="h-full w-full"
          style={{
            maskImage: "linear-gradient(90deg, transparent, black 18%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, black 18%)",
          }}
        >
          <Image
            src="/images/celo-logo.jpg"
            alt="Logo Celo Store, ilustração estilo grafite em preto e azul neon"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            style={{ objectPosition: "center 20%" }}
            priority
          />
        </div>
      </div>
    </div>
  );
}
