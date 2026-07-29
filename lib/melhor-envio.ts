const SANDBOX_URL = "https://sandbox.melhorenvio.com.br/api/v2";
const PRODUCTION_URL = "https://melhorenvio.com.br/api/v2";

export function isMelhorEnvioConfigured() {
  return Boolean(process.env.MELHOR_ENVIO_TOKEN && process.env.STORE_ORIGIN_ZIP);
}

const DEFAULT_PACKAGE = { weightGrams: 300, heightCm: 10, widthCm: 15, lengthCm: 20 };

export type MelhorEnvioQuoteItem = {
  productId: string;
  quantity: number;
  price: number;
  weightGrams: number | null;
  heightCm: number | null;
  widthCm: number | null;
  lengthCm: number | null;
};

type MelhorEnvioQuoteResponse = {
  id: string;
  price?: string | number;
  error?: string;
}[];

export async function quoteMelhorEnvioShipping(
  items: MelhorEnvioQuoteItem[],
  destinationZip: string
): Promise<number | null> {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  const originZip = process.env.STORE_ORIGIN_ZIP;
  if (!token || !originZip) return null;

  const baseUrl = process.env.MELHOR_ENVIO_SANDBOX === "false" ? PRODUCTION_URL : SANDBOX_URL;

  const products = items.map((item) => ({
    id: item.productId,
    width: item.widthCm ?? DEFAULT_PACKAGE.widthCm,
    height: item.heightCm ?? DEFAULT_PACKAGE.heightCm,
    length: item.lengthCm ?? DEFAULT_PACKAGE.lengthCm,
    weight: (item.weightGrams ?? DEFAULT_PACKAGE.weightGrams) / 1000,
    insurance_value: item.price,
    quantity: item.quantity,
  }));

  try {
    const res = await fetch(`${baseUrl}/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Celo Store (contato@celostore.com.br)",
      },
      body: JSON.stringify({
        from: { postal_code: originZip.replace(/\D/g, "") },
        to: { postal_code: destinationZip.replace(/\D/g, "") },
        products,
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as MelhorEnvioQuoteResponse;
    if (!Array.isArray(data)) return null;

    const valid = data.filter((q) => !q.error && q.price !== undefined);
    if (valid.length === 0) return null;

    const cheapest = valid.reduce((min, q) => (Number(q.price) < Number(min.price) ? q : min));
    return Number(cheapest.price);
  } catch (err) {
    console.error("Erro ao cotar frete no Melhor Envio:", err);
    return null;
  }
}
