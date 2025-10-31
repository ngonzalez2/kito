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
          'Integración futura con pagos seguros y verificación comunitaria.',
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
      heading: 'Encuentra tu próximo kite',
      subheading: 'Filtra por categoría, condición o ciudad costera y descubre tu próximo set-up.',
      countLabel: '{count} publicaciones aprobadas',
      viewDetails: 'Ver detalles',
      status: {
        pending: 'Pendiente',
        approved: 'Aprobado',
        rejected: 'Rechazado',
      },
      categories: {
        kite: 'Kite',
        board: 'Tabla',
        accessories: 'Accesorios',
      },
      empty: 'No encontramos publicaciones con esos filtros. Ajusta la búsqueda o vuelve más tarde.',
      emptyCta: 'Publica un anuncio',
      report: {
        button: 'Reportar publicación',
        close: 'Cerrar reporte',
        label: 'Cuéntanos qué sucede',
        placeholder: 'Describe por qué este anuncio debería revisarse…',
        submit: 'Enviar reporte',
        submitting: 'Enviando…',
        success: 'Gracias. Nuestro equipo revisará esta publicación.',
        error: 'No pudimos enviar el reporte. Intenta de nuevo.',
        validation: 'Describe el motivo del reporte.',
      },
      detail: {
        condition: 'Condición',
        location: 'Ubicación',
        category: 'Categoría',
      },
    },
    filters: {
      any: 'Cualquiera',
      items: [
        {
          label: 'Categoría',
          key: 'category',
          options: [
            { value: 'kite', label: 'Kite' },
            { value: 'board', label: 'Tabla' },
            { value: 'accessories', label: 'Accesorios' },
          ],
        },
        {
          label: 'Condición',
          key: 'condition',
          options: [
            { value: 'new', label: 'Nuevo' },
            { value: 'excellent', label: 'Excelente' },
            { value: 'good', label: 'Bueno' },
            { value: 'used', label: 'Usado' },
          ],
        },
        {
          label: 'Ubicación',
          key: 'location',
          options: [
            { value: 'La Guajira', label: 'La Guajira' },
            { value: 'Barranquilla', label: 'Barranquilla' },
            { value: 'Cartagena', label: 'Cartagena' },
            { value: 'Medellín', label: 'Medellín' },
            { value: 'Bogotá', label: 'Bogotá' },
          ],
        },
      ],
    },
    sell: {
      heading: 'Publica tu equipo',
      subheading: 'Comparte tu gear con riders de toda Colombia. Las publicaciones pasan por moderación antes de hacerse públicas.',
      fields: {
        title: 'Título',
        description: 'Descripción',
        price: 'Precio (COP)',
        condition: 'Condición',
        location: 'Ubicación',
        category: 'Categoría',
        image: 'Fotografía del equipo',
      },
      placeholders: {
        title: 'Ej. North Reach 9m 2022',
        description: 'Incluye reparaciones, uso y accesorios incluidos…',
        price: 'Ej. 4500000',
      },
      conditionOptions: {
        new: 'Nuevo',
        excellent: 'Excelente',
        good: 'Bueno',
        used: 'Usado',
      },
      categoryOptions: {
        kite: 'Kite',
        board: 'Tabla',
        accessories: 'Accesorios',
      },
      submit: 'Enviar para revisión',
      submitting: 'Enviando…',
      successMessage: 'Tu publicación está pendiente de aprobación. Te avisaremos cuando esté en vivo.',
      previewAlt: 'Vista previa de la imagen seleccionada',
      pendingHeader: 'Tus publicaciones en moderación',
      pendingTag: 'Pendiente de moderación',
      errors: {
        imageRequired: 'Agrega al menos una imagen.',
        uploadFailed: 'No se pudo cargar la imagen.',
        submitFailed: 'No se pudo crear la publicación. Intenta de nuevo.',
      },
    },
    footer: {
      contact: 'Contacto',
      instagram: 'Instagram',
      whatsapp: 'WhatsApp',
    },
    admin: {
      title: 'Panel de moderación',
      subtitle: 'Introduce la clave administradora para revisar publicaciones pendientes.',
      placeholder: 'Clave secreta',
      verifying: 'Verificando…',
      enter: 'Ingresar',
      dashboardTitle: 'Centro de moderación',
      dashboardSubtitle: 'Aprueba, rechaza o elimina publicaciones enviadas por la comunidad.',
      empty: 'No hay publicaciones para moderar por ahora.',
      actions: {
        approve: 'Aprobar',
        reject: 'Rechazar',
        delete: 'Eliminar',
      },
      errors: {
        unauthorized: 'Clave incorrecta. Intenta nuevamente.',
        loadFailed: 'No pudimos cargar las publicaciones.',
        required: 'Ingresa la clave administradora.',
        saveFailed: 'No pudimos actualizar la publicación.',
      },
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
        toEs: 'Cambiar a español',
      },
    },
    hero: {
      title: 'Buy & sell kitesurf gear across Colombia',
      subtitle:
        'Join Kito—the community marketplace for wind addicts. Discover trusted riders and equipment from La Guajira to Atlántico.',
      primaryCta: 'Explore gear',
      secondaryCta: 'List your kite',
    },
    home: {
      listSection: {
        tag: 'List your gear',
        heading: 'Keep the wind in motion',
        description:
          'Connect with verified riders. Publish your kite, board, or accessories in minutes and let the Kito community handle the rest.',
        bullets: [
          'Crisp photos and honest descriptions.',
          'Filters that help buyers find exactly what you offer.',
          'Future-ready foundation for payments and community verification.',
        ],
        button: 'Get started',
        cardTitle: 'Why Kito?',
        cardDescription:
          'Designed by kitesurfers for kitesurfers. Transparency, trust, and community form the core of the marketplace. Gear up for your next sessions with vetted gear and shared stories.',
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
        'Connect with verified sellers and find gear ready for Colombia’s best wind. The Kito community keeps stories, spots, and equipment flowing.',
      cardDescription: 'Wind stories, local riders, and gear with guaranteed trust.',
    },
    listings: {
      heading: 'Find your next kite',
      subheading: 'Filter by category, condition, or coastal city to discover your next setup.',
      countLabel: '{count} approved listings',
      viewDetails: 'View details',
      status: {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
      },
      categories: {
        kite: 'Kite',
        board: 'Board',
        accessories: 'Accessories',
      },
      empty: 'No listings match those filters. Adjust the search or check back soon.',
      emptyCta: 'Create a listing',
      report: {
        button: 'Report listing',
        close: 'Close report',
        label: 'Tell us what happened',
        placeholder: 'Describe why this listing should be reviewed…',
        submit: 'Send report',
        submitting: 'Sending…',
        success: 'Thanks. Our team will review this listing.',
        error: 'We could not send the report. Try again.',
        validation: 'Please describe the reason for the report.',
      },
      detail: {
        condition: 'Condition',
        location: 'Location',
        category: 'Category',
      },
    },
    filters: {
      any: 'Any',
      items: [
        {
          label: 'Category',
          key: 'category',
          options: [
            { value: 'kite', label: 'Kite' },
            { value: 'board', label: 'Board' },
            { value: 'accessories', label: 'Accessories' },
          ],
        },
        {
          label: 'Condition',
          key: 'condition',
          options: [
            { value: 'new', label: 'New' },
            { value: 'excellent', label: 'Excellent' },
            { value: 'good', label: 'Good' },
            { value: 'used', label: 'Used' },
          ],
        },
        {
          label: 'Location',
          key: 'location',
          options: [
            { value: 'La Guajira', label: 'La Guajira' },
            { value: 'Barranquilla', label: 'Barranquilla' },
            { value: 'Cartagena', label: 'Cartagena' },
            { value: 'Medellín', label: 'Medellín' },
            { value: 'Bogotá', label: 'Bogotá' },
          ],
        },
      ],
    },
    sell: {
      heading: 'List your gear',
      subheading: 'Share your setup with riders across Colombia. Listings stay pending until approved by an admin.',
      fields: {
        title: 'Title',
        description: 'Description',
        price: 'Price (COP)',
        condition: 'Condition',
        location: 'Location',
        category: 'Category',
        image: 'Gear photo',
      },
      placeholders: {
        title: 'e.g. North Reach 9m 2022',
        description: 'Include maintenance, usage, and any extras…',
        price: 'e.g. 4500000',
      },
      conditionOptions: {
        new: 'New',
        excellent: 'Excellent',
        good: 'Good',
        used: 'Used',
      },
      categoryOptions: {
        kite: 'Kite',
        board: 'Board',
        accessories: 'Accessories',
      },
      submit: 'Submit for review',
      submitting: 'Submitting…',
      successMessage: 'Your listing is pending approval. We will notify you once it is live.',
      previewAlt: 'Preview of the selected image',
      pendingHeader: 'Listings awaiting moderation',
      pendingTag: 'Pending moderation',
      errors: {
        imageRequired: 'Please add an image.',
        uploadFailed: 'Image upload failed.',
        submitFailed: 'We could not create the listing. Try again.',
      },
    },
    footer: {
      contact: 'Contact',
      instagram: 'Instagram',
      whatsapp: 'WhatsApp',
    },
    admin: {
      title: 'Moderation panel',
      subtitle: 'Enter the admin key to review pending listings.',
      placeholder: 'Secret key',
      verifying: 'Verifying…',
      enter: 'Enter',
      dashboardTitle: 'Moderation center',
      dashboardSubtitle: 'Approve, reject, or delete community submissions.',
      empty: 'There are no listings to moderate right now.',
      actions: {
        approve: 'Approve',
        reject: 'Reject',
        delete: 'Delete',
      },
      errors: {
        unauthorized: 'Incorrect key. Please try again.',
        loadFailed: 'We could not load the listings.',
        required: 'Enter the admin key.',
        saveFailed: 'We could not update the listing.',
      },
    },
  },
};

export default translations;
