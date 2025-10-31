const translations = {
  es: {
    navbar: {
      links: [
        { to: '/', label: 'Inicio' },
        { to: '/listings', label: 'Explorar' },
      ],
      listButton: 'Publica tu equipo',
      languageToggle: {
        flag: '🇨🇴',
        code: 'ES',
        toEn: 'Cambiar a inglés',
        toEs: 'Cambiar a español',
      },
    },
    hero: {
      title: 'Compra y vende equipo de kitesurf en Colombia',
      subtitle:
        'Únete a Kito, el mercado comunitario para adictos al viento. Descubre riders confiables y equipo desde las costas de La Guajira hasta Atlántico.',
      primaryCta: 'Explorar equipo',
      secondaryCta: 'Publica tu kite',
    },
    home: {
      listSection: {
        tag: 'Publica tu equipo',
        heading: 'Mantén el viento en movimiento',
        description:
          'Conecta con riders verificados. Publica tu kite, tabla o accesorios en minutos y deja que la comunidad Kito se encargue del resto.',
        bullets: [
          'Fotografías nítidas y descripciones honestas.',
          'Filtros para compradores que buscan exactamente tu equipo.',
          'Integración futura con plataformas como Firebase, Supabase o Sharetribe para pagos y verificación (ver comentario en ListingDetailPage).',
        ],
        button: 'Empieza ahora',
        cardTitle: '¿Por qué Kito?',
        cardDescription:
          'Diseñado por kitesurfers para kitesurfers. Transparencia, confianza y comunidad son la base del mercado. Prepárate para tus próximas sesiones con equipos revisados y historias compartidas.',
      },
    },
    featured: {
      tag: 'Destacados',
      heading: 'Explora el viento',
      description:
        'Equipo curado por la comunidad Kito. Kites, tablas y accesorios listos para tu próxima sesión.',
    },
    community: {
      heading: 'Confiado por riders en {spots}',
      description:
        'Conecta con vendedores verificados y encuentra equipo listo para navegar las mejores olas de Colombia. La comunidad Kito mantiene historias, spots y equipos girando como el viento.',
      cardDescription: 'Historias de viento, riders locales y equipos con confianza garantizada.',
    },
    listings: {
      tag: 'Marketplace',
      heading: 'Encuentra tu próximo kite',
      description:
        'Filtros personalizables para descubrir equipo perfecto según tus condiciones y spots favoritos.',
    },
    filters: {
      any: 'Cualquiera',
      items: [
        {
          label: 'Categoría',
          key: 'category',
          options: [
            { value: 'Kites', label: 'Kites' },
            { value: 'Boards', label: 'Tablas' },
            { value: 'Harnesses', label: 'Arneses' },
          ],
        },
        {
          label: 'Condición',
          key: 'condition',
          options: [
            { value: 'New', label: 'Nuevo' },
            { value: 'Excellent', label: 'Excelente' },
            { value: 'Good', label: 'Bueno' },
            { value: 'Fair', label: 'Regular' },
          ],
        },
        {
          label: 'Precio',
          key: 'price',
          options: [
            { value: '< $3M', label: '< $3M' },
            { value: '$3M - $6M', label: '$3M - $6M' },
            { value: '$6M+', label: '$6M+' },
          ],
        },
        {
          label: 'Ubicación',
          key: 'location',
          options: [
            { value: 'Mayapo', label: 'Mayapo' },
            { value: 'Cabo de la Vela', label: 'Cabo de la Vela' },
            { value: 'Santa Verónica', label: 'Santa Verónica' },
            { value: 'Cartagena', label: 'Cartagena' },
            { value: 'Puerto Velero', label: 'Puerto Velero' },
            { value: 'Santa Marta', label: 'Santa Marta' },
          ],
        },
      ],
    },
    listingCard: {
      viewDetails: 'Ver detalles',
      conditionLabels: {
        New: 'Nuevo',
        Excellent: 'Excelente',
        Good: 'Bueno',
        Fair: 'Regular',
      },
      currency: 'es-CO',
    },
    listingDetail: {
      notFound: 'Publicación no encontrada.',
      back: 'Volver a las publicaciones',
      location: 'Ubicación',
      brand: 'Marca',
      description:
        'Perfecto para sesiones entre 18 y 28 nudos. Reemplazo de válvulas y revisión de costuras en 2023. Listo para entregar en la costa Caribe o enviar a cualquier ciudad.',
      chat: 'Chatear en WhatsApp',
      similar: 'Publicaciones similares',
    },
    footer: {
      contact: 'Contacto',
      instagram: 'Instagram',
      whatsapp: 'WhatsApp',
    },
  },
  en: {
    navbar: {
      links: [
        { to: '/', label: 'Home' },
        { to: '/listings', label: 'Explore' },
      ],
      listButton: 'List Your Gear',
      languageToggle: {
        flag: '🇺🇸',
        code: 'EN',
        toEn: 'Switch to English',
        toEs: 'Switch to Spanish',
      },
    },
    hero: {
      title: 'Buy & Sell Kitesurf Gear in Colombia',
      subtitle:
        'Join Kito — the community marketplace for wind addicts. Discover trusted riders and equipment from the coasts of La Guajira to Atlántico.',
      primaryCta: 'Explore Gear',
      secondaryCta: 'List Your Kite',
    },
    home: {
      listSection: {
        tag: 'List Your Gear',
        heading: 'Keep the wind in motion',
        description:
          'Connect with verified riders. List your kite, board, or accessories in minutes and let the Kito community handle the rest.',
        bullets: [
          'Crisp photos and honest descriptions.',
          'Filters that help buyers find exactly what you offer.',
          'Future integration with platforms like Firebase, Supabase, or Sharetribe for payments and verification (see note in ListingDetailPage).',
        ],
        button: 'Get started',
        cardTitle: 'Why Kito?',
        cardDescription:
          'Designed by kitesurfers for kitesurfers. Transparency, trust, and community form the foundation of the marketplace. Get ready for your next sessions with vetted gear and shared stories.',
      },
    },
    featured: {
      tag: 'Featured',
      heading: 'Follow the wind',
      description:
        'Gear curated by the Kito community. Kites, boards, and accessories ready for your next session.',
    },
    community: {
      heading: 'Trusted by riders in {spots}',
      description:
        'Connect with verified sellers and find gear ready to ride the best Colombian waves. The Kito community keeps stories, spots, and equipment flowing like the wind.',
      cardDescription: 'Wind stories, local riders, and gear with guaranteed trust.',
    },
    listings: {
      tag: 'Marketplace',
      heading: 'Find your next kite',
      description:
        'Custom filters to discover the perfect gear for your favorite conditions and spots.',
    },
    filters: {
      any: 'Any',
      items: [
        {
          label: 'Category',
          key: 'category',
          options: [
            { value: 'Kites', label: 'Kites' },
            { value: 'Boards', label: 'Boards' },
            { value: 'Harnesses', label: 'Harnesses' },
          ],
        },
        {
          label: 'Condition',
          key: 'condition',
          options: [
            { value: 'New', label: 'New' },
            { value: 'Excellent', label: 'Excellent' },
            { value: 'Good', label: 'Good' },
            { value: 'Fair', label: 'Fair' },
          ],
        },
        {
          label: 'Price',
          key: 'price',
          options: [
            { value: '< $3M', label: '< $3M' },
            { value: '$3M - $6M', label: '$3M - $6M' },
            { value: '$6M+', label: '$6M+' },
          ],
        },
        {
          label: 'Location',
          key: 'location',
          options: [
            { value: 'Mayapo', label: 'Mayapo' },
            { value: 'Cabo de la Vela', label: 'Cabo de la Vela' },
            { value: 'Santa Verónica', label: 'Santa Verónica' },
            { value: 'Cartagena', label: 'Cartagena' },
            { value: 'Puerto Velero', label: 'Puerto Velero' },
            { value: 'Santa Marta', label: 'Santa Marta' },
          ],
        },
      ],
    },
    listingCard: {
      viewDetails: 'View details',
      conditionLabels: {
        New: 'New',
        Excellent: 'Excellent',
        Good: 'Good',
        Fair: 'Fair',
      },
      currency: 'en-US',
    },
    listingDetail: {
      notFound: 'Listing not found.',
      back: 'Back to listings',
      location: 'Location',
      brand: 'Brand',
      description:
        'Perfect for sessions between 18 and 28 knots. Valve replacements and seam inspection in 2023. Ready for pickup on the Caribbean coast or shipping nationwide.',
      chat: 'Chat on WhatsApp',
      similar: 'Similar listings',
    },
    footer: {
      contact: 'Contact',
      instagram: 'Instagram',
      whatsapp: 'WhatsApp',
    },
  },
};

export default translations;
