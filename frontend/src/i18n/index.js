import messages from './messages';

export const initReactIntl = () => {

    let locale = (navigator.languages && navigator.languages[0]) ||
            navigator.language || navigator.userLanguage || 'en';
    const localeWithoutRegionCode = locale.toLowerCase().split(/[_-]+/)[0];
    const localeMessages = messages[locale] ||
        messages[localeWithoutRegionCode] || messages['en'];

    // Determinar el locale para mensajes (puede ser 'gl' o 'gl-ES')
    const messagesLocale = localeMessages === messages['en'] ? 'en' : locale;
    
    // Determinar el locale para formateo (Intl.NumberFormat, Intl.DateTimeFormat)
    // Para gallego, usamos 'es-ES' como fallback ya que react-intl no tiene datos de locale para 'gl'
    let formatLocale = messagesLocale;
    if (messagesLocale === 'gl' || messagesLocale === 'gl-ES' || messagesLocale.startsWith('gl')) {
        formatLocale = 'es-ES'; // Usar español para formateo, pero mantener mensajes en gallego
    } else if (messagesLocale === 'es' || messagesLocale.startsWith('es')) {
        formatLocale = 'es-ES';
    } else if (messagesLocale === 'en' || messagesLocale.startsWith('en')) {
        formatLocale = 'en';
    }

    return {
        locale: formatLocale, // Locale para formateo (Intl)
        messages: localeMessages, // Mensajes traducidos
        messagesLocale: messagesLocale // Locale original para referencia
    };

}