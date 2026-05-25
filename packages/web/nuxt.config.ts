import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  modules: ['shadcn-nuxt', '@pinia/nuxt', '@nuxt/eslint'],

  eslint: {
    config: {
      stylistic: false,
    },
  },

  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['@freakdays/domain'],
    },
  },

  nitro: {
    externals: {
      inline: ['@freakdays/domain'],
    },
    experimental: {
      wasm: true,
    },
    noExternals: false,
  },

  // TODO: Add Content-Security-Policy once Clerk inline scripts are audited.
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      },
    },
  },

  ssr: true,

  typescript: {
    strict: true,
    typeCheck: true,
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_URL,
      clerkPublishableKey: process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'es',
      },
      script: [
        {
          innerHTML: `(function(){try{var m=localStorage.getItem('freakdays-theme')||'dark';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
          tagPosition: 'head',
        },
      ],
      title: 'FreakDays - Tu compañero definitivo para gestionar tu vida friki',
      titleTemplate: '%s | FreakDays',
      meta: [
        {
          charset: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=5',
        },
        {
          name: 'description',
          content:
            'FreakDays es una aplicación de gestión de vida cotidiana para personas frikis. Gestiona entrenamientos, colecciones de manga, animes, misiones diarias (quests), grupos (party system) y calendario de lanzamientos. Gamificación, tracking y productividad en un solo lugar.',
        },
        {
          name: 'keywords',
          content:
            'freakdays, gestión vida friki, anime, manga, quests, entrenamientos, gamificación, tracking, productividad, gestión tareas, colección manga, lista anime, party system, calendario lanzamientos',
        },
        {
          name: 'author',
          content: 'FreakDays',
        },
        {
          name: 'robots',
          content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        },
        {
          name: 'theme-color',
          content: '#0f0f23',
        },
        {
          name: 'apple-mobile-web-app-capable',
          content: 'yes',
        },
        {
          name: 'mobile-web-app-capable',
          content: 'yes',
        },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent',
        },
        {
          name: 'apple-mobile-web-app-title',
          content: 'FreakDays',
        },
        {
          name: 'format-detection',
          content: 'telephone=no',
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:title',
          content: 'FreakDays - Tu compañero definitivo para gestionar tu vida friki',
        },
        {
          property: 'og:description',
          content:
            'Gestiona entrenamientos, colecciones de manga, animes, misiones diarias (quests), grupos (party system) y calendario de lanzamientos. Gamificación, tracking y productividad en un solo lugar.',
        },
        {
          property: 'og:image',
          content: '/logo.png',
        },
        {
          property: 'og:image:width',
          content: '512',
        },
        {
          property: 'og:image:height',
          content: '512',
        },
        {
          property: 'og:image:alt',
          content: 'FreakDays Logo',
        },
        {
          property: 'og:url',
          content: 'https://freakdays.app',
        },
        {
          property: 'og:site_name',
          content: 'FreakDays',
        },
        {
          property: 'og:locale',
          content: 'es_ES',
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          name: 'twitter:title',
          content: 'FreakDays - Tu compañero definitivo para gestionar tu vida friki',
        },
        {
          name: 'twitter:description',
          content:
            'Gestiona entrenamientos, colecciones de manga, animes, misiones diarias (quests), grupos (party system) y calendario de lanzamientos.',
        },
        {
          name: 'twitter:image',
          content: '/logo.png',
        },
        {
          name: 'twitter:image:alt',
          content: 'FreakDays Logo',
        },
        {
          name: 'application-name',
          content: 'FreakDays',
        },
        {
          name: 'msapplication-TileColor',
          content: '#0f0f23',
        },
        {
          name: 'msapplication-config',
          content: '/browserconfig.xml',
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/logo.png',
        },
        {
          rel: 'apple-touch-icon',
          href: '/logo.png',
        },
        {
          rel: 'manifest',
          href: '/site.webmanifest',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Righteous&family=Inconsolata:wght@400;500;600;700&display=swap',
        },
        {
          rel: 'canonical',
          href: 'https://freakdays.app',
        },
      ],
    },
  },
});
