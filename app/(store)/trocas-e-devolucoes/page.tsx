export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-7">
      <h1 className="mb-2 text-xl font-extrabold">Trocas e devoluções</h1>
      <p className="mb-8 text-sm text-text-muted">
        Este é um texto padrão — edite com as regras reais da sua loja quando quiser.
      </p>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-text-muted">
        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Prazo para troca ou devolução</h2>
          <p>
            Você pode solicitar troca ou devolução em até 7 dias corridos após o recebimento do
            produto, conforme o Código de Defesa do Consumidor para compras online.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Condições do produto</h2>
          <p>
            O produto precisa estar sem uso, com etiquetas originais e na embalagem original,
            junto com a nota fiscal.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Como solicitar</h2>
          <p>
            Entre em contato pelo WhatsApp informando o número do pedido e o motivo da troca ou
            devolução. Nossa equipe vai te passar o passo a passo do envio.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Reembolso</h2>
          <p>
            Após recebermos e conferirmos o produto, o reembolso é feito no mesmo meio de
            pagamento usado na compra, em até 10 dias úteis.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Produtos com defeito</h2>
          <p>
            Se o produto chegar com defeito, entre em contato em até 30 dias para troca ou
            reembolso sem custo de frete.
          </p>
        </section>
      </div>
    </div>
  );
}
