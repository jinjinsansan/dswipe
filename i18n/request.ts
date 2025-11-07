import {getRequestConfig} from 'next-intl/server';
import {locales} from './routing';

export default getRequestConfig(async ({locale}) => {
  const resolvedLocale = locales.includes(locale as (typeof locales)[number]) ? locale : 'ja';
  const messages = (await import(`../messages/${resolvedLocale}.json`)).default;

  return {
    messages,
  };
});
