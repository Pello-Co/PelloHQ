import { site } from '../../content/site';

interface MetaOptions {
  title?: string | undefined;
  description?: string | undefined;
  image?: string | undefined;
  noIndex?: boolean | undefined;
}

export function buildMeta(options: MetaOptions = {}) {
  const title = options.title ?? `${site.name} — ${site.tagline}`;
  const description = options.description ?? site.description;
  const image = options.image ?? `${site.url}/og/og-default.png`;

  return { title, description, image, noIndex: options.noIndex ?? false };
}
