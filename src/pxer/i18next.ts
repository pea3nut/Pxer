import i18n from 'i18next'

// @ts-ignore TS is so noisy:( I just want to use this module
import locize from 'i18next-locize-backend'

i18n
.use(locize)
.init({
    fallbackLng: 'en',
    whitelist: ['en','zh'],
    nonExplicitWhitelist: true,
    interpolation: {
        escapeValue: false, // not needed for react!!
    },
    backend: {
        projectId: 'f5535398-1a4b-405a-a938-3b75e2523939',
        apiKey: '11d550f9-2c7d-43fe-a968-21e59399ffd7',
        referenceLng: 'en',
    },
    react: {
        wait: true,
    },
    ns: 'pxerapp',
})

export default i18n