import Link from "next/link";

const WHATSAPP_NUMBER = "5513974083160";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const CONTACT_EMAIL = "contato@celostore.com.br";
// Localização ilustrativa (não é um endereço real da loja).
const MAP_QUERY = "Rua das Palmeiras, 100 - Centro, Santos - SP";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-text-faint">
            departamentos
          </h4>
          <ul className="flex flex-col gap-2.5 text-[13px] text-text-muted">
            <li>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan"
              >
                Entre em contato
              </a>
            </li>
            <li>
              <Link href="/rastrear" className="hover:text-cyan">
                Rastrear pedido
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-cyan">
                Nosso Instagram
              </a>
            </li>
            <li>
              <Link href="/termos-de-uso" className="hover:text-cyan">
                Termos de uso
              </Link>
            </li>
            <li>
              <Link href="/politica-de-privacidade" className="hover:text-cyan">
                Política de privacidade
              </Link>
            </li>
            <li>
              <Link href="/trocas-e-devolucoes" className="hover:text-cyan">
                Política de trocas e devoluções
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-text-faint">
            fale conosco
          </h4>
          <ul className="mb-4 flex flex-col gap-2.5 text-[13px] text-text-muted">
            <li>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan"
              >
                (13) 97408-3160
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-cyan">
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>
          <div className="overflow-hidden rounded-lg border border-line">
            <iframe
              title="Localização (ilustrativa)"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=14&output=embed`}
              className="h-40 w-full grayscale"
              loading="lazy"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-text-faint">Localização ilustrativa</p>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-text-faint">
            novidades
          </h4>
          <p className="mb-2 text-[13px] text-text-muted">
            Inscreva-se e receba promoções em primeira mão.
          </p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="cadastre seu e-mail..."
              className="h-10 flex-1 rounded-lg border border-line bg-surface-2 px-3 text-[13px] text-text placeholder:text-text-faint focus:border-cyan focus:outline-none"
            />
            <button
              type="submit"
              className="neon-interactive rounded-lg bg-cyan px-4 text-[13px] font-bold text-cyan-ink shadow-[var(--glow-cyan-sm)] hover:shadow-[var(--glow-cyan-md)]"
            >
              enviar
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-line px-5 py-6 text-[11px] text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <span className="mr-2 font-bold uppercase tracking-wide text-text-faint">
            Meios de pagamento
          </span>
          Visa · Mastercard · Elo · Hipercard · Pix · Boleto
        </div>
        <div>
          <span className="mr-2 font-bold uppercase tracking-wide text-text-faint">
            Meios de envio
          </span>
          Correios · Transportadora parceira
        </div>
      </div>

      <div className="border-t border-line px-5 py-4 text-center text-[11px] text-text-faint sm:px-7">
        © {new Date().getFullYear()} Celo Store — todos os direitos reservados
      </div>
    </footer>
  );
}
