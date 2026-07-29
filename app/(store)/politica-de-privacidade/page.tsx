export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-7">
      <h1 className="mb-2 text-xl font-extrabold">Política de privacidade</h1>
      <p className="mb-8 text-sm text-text-muted">
        Este é um texto padrão — edite com a política real da sua loja quando quiser.
      </p>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-text-muted">
        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Quais dados coletamos</h2>
          <p>
            Coletamos os dados que você informa no cadastro e nas compras — nome, e-mail,
            telefone, endereço — além de dados de navegação usados pra melhorar sua experiência
            no site.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Como usamos seus dados</h2>
          <p>
            Usamos seus dados pra processar pedidos, calcular frete, entrar em contato sobre o
            status da compra e, quando autorizado, enviar novidades e promoções.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Cookies</h2>
          <p>
            Usamos cookies pra manter você conectado, lembrar itens do carrinho e entender como o
            site é utilizado. Você pode gerenciar cookies nas configurações do seu navegador.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Compartilhamento de dados</h2>
          <p>
            Compartilhamos dados apenas com parceiros necessários pra operação da loja — como
            transportadoras e meios de pagamento — e nunca vendemos suas informações pra
            terceiros.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Seus direitos</h2>
          <p>
            Você pode solicitar a qualquer momento a atualização, correção ou exclusão dos seus
            dados, entrando em contato com a gente pelos canais desta página.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Contato</h2>
          <p>
            Dúvidas sobre privacidade podem ser enviadas pelo e-mail ou WhatsApp indicados no
            rodapé do site.
          </p>
        </section>
      </div>
    </div>
  );
}
