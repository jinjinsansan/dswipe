import {getRequestConfig} from 'next-intl/server';
import {locales} from './routing';

export default getRequestConfig(async ({locale}) => {
  const resolvedLocale: (typeof locales)[number] = locales.includes(
    locale as (typeof locales)[number]
  )
    ? (locale as (typeof locales)[number])
    : 'ja';
  const messages = (await import(`../messages/${resolvedLocale}.json`)).default;

  return {
    locale: resolvedLocale,
    messages,
  };
});
