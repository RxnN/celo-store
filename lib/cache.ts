import { unstable_cache } from "next/cache";
import { logger } from "./logger";

/**
 * Wrapper sobre unstable_cache que loga hit/miss. Não é usado por nenhuma
 * página ainda — fica pronto para quando uma rota read-heavy precisar de
 * cache (ex.: listagem de produtos/categorias).
 */
export function withCache<Args extends unknown[], Result>(
  key: string,
  fn: (...args: Args) => Promise<Result>,
  options?: { tags?: string[]; revalidateSeconds?: number }
) {
  return async (...args: Args): Promise<Result> => {
    // "hit"/o cache em si são declarados dentro de cada chamada — cada uma
    // tem seu próprio estado, e a chave inclui os args, então chamadas com
    // parâmetros diferentes não colidem no mesmo slot de cache.
    let hit = true;
    const start = performance.now();

    const cached = unstable_cache(
      async (...innerArgs: Args) => {
        hit = false;
        return fn(...innerArgs);
      },
      [key, JSON.stringify(args)],
      { tags: options?.tags, revalidate: options?.revalidateSeconds }
    );

    const result = await cached(...args);
    logger.info(hit ? "cache.hit" : "cache.miss", {
      key,
      durationMs: Math.round(performance.now() - start),
    });
    return result;
  };
}
