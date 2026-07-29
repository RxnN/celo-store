export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-7">
      <h1 className="mb-2 text-xl font-extrabold">Termos de uso</h1>
      <p className="mb-8 text-sm text-text-muted">
        Este é um texto padrão — edite com os termos reais da sua loja quando quiser.
      </p>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-text-muted">
        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Aceitação dos termos</h2>
          <p>
            Ao acessar e usar este site, você concorda com estes termos de uso. Se não concordar
            com algum ponto, pedimos que não utilize a loja.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Cadastro e conta</h2>
          <p>
            Você é responsável por manter a confidencialidade da sua senha e por todas as
            atividades realizadas na sua conta. Informe dados verdadeiros e atualizados no
            cadastro.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Pedidos e pagamento</h2>
          <p>
            Ao finalizar uma compra, você declara que os dados informados são corretos. A
            confirmação do pedido está sujeita à disponibilidade de estoque e à aprovação do
            pagamento.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Preços e disponibilidade</h2>
          <p>
            Preços, descrições e disponibilidade de produtos podem mudar sem aviso prévio. Fazemos
            o possível para manter as informações do catálogo atualizadas.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Propriedade intelectual</h2>
          <p>
            Marca, logotipo, textos, imagens e demais conteúdos deste site pertencem à loja e não
            podem ser reproduzidos sem autorização.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Limitação de responsabilidade</h2>
          <p>
            Fazemos o possível para manter o site sempre disponível e funcionando corretamente,
            mas não garantimos operação ininterrupta ou livre de erros.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-text">Alterações</h2>
          <p>
            Estes termos podem ser atualizados periodicamente. A versão vigente é sempre a
            publicada nesta página.
          </p>
        </section>
      </div>
    </div>
  );
}
