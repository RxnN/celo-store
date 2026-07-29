import { MercadoPagoConfig, Preference } from "mercadopago";

export function isMercadoPagoConfigured() {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

export async function createMercadoPagoPreference(params: {
  orderId: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  shipping: number;
  discount?: number;
  payerEmail: string;
}) {
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  });
  const preference = new Preference(client);

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const items = params.items.map((item) => ({
    id: item.name,
    title: item.name,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    currency_id: "BRL",
  }));

  if (params.shipping > 0) {
    items.push({
      id: "frete",
      title: "Frete",
      quantity: 1,
      unit_price: params.shipping,
      currency_id: "BRL",
    });
  }

  if (params.discount && params.discount > 0) {
    items.push({
      id: "desconto",
      title: "Desconto (cupom)",
      quantity: 1,
      unit_price: -params.discount,
      currency_id: "BRL",
    });
  }

  const result = await preference.create({
    body: {
      items,
      payer: { email: params.payerEmail },
      external_reference: params.orderId,
      back_urls: {
        success: `${baseUrl}/checkout/sucesso?order=${params.orderId}`,
        pending: `${baseUrl}/checkout/sucesso?order=${params.orderId}`,
        failure: `${baseUrl}/checkout?falha=1`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/webhook/mercadopago`,
    },
  });

  return result.init_point ?? result.sandbox_init_point ?? null;
}
