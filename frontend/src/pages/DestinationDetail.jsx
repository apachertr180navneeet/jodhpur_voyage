import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import { fetchTours, fetchDestinationBySlug } from '../services/api';
import SEO from '../components/SEO';

const defaultDestinationsMap = {
  ladakh: {
    name: 'Ladakh',
    slug: 'ladakh',
    heroTitle: 'Voyage au Ladakh',
    h1Title: 'Trekking au Ladakh : Randonnée, Trek et Monastères de l\'Himalaya',
    tagline: 'Le Petit Tibet – Paysages lunaires, monastères bouddhistes et cols à 5 000 m',
    image: '/images/dest-ladakh.jpg',
    satisfaction: '98% de satisfaction (112 avis)',
    shortDescription: "L'Inde peut s’enorgueillir d’avoir sur son territoire l’une des régions les plus célèbres au monde par les amateurs de treks en altitude : le Ladakh. Dans l'Himalaya, vivez une immersion bouddhiste au plus près des habitants, entre traversée du Zanskar, reliefs du Karakoram, monastères de Thiksey et Hemis et le sublime lac Pangong Tso aux eaux turquoise.",
    fullDescription: "La lenteur nécessaire à l'acclimatation progressive de ces hautes latitudes fait partie intégrante de l'esprit de votre voyage au Ladakh. Que ce soit en longeant la rivière Indus, en franchissant le col vertigineux de Khardung La à 5 359 m ou en explorant les dunes de sable d'altitude de la vallée de la Nubra, nos guides francophones experts vous accompagnent en toute sécurité.",
    highlights: [
      { icon: 'fa-place-of-worship', title: 'Monastères Perchés', desc: 'Visitez Thiksey, Hemis, Lamayuru et Likir, sanctuaires vivants du bouddhisme tibétain.' },
      { icon: 'fa-mountain', title: 'Lac Pangong & Nubra', desc: 'Admirez les eaux turquoise du lac Pangong Tso (4 350 m) et les chameaux de Bactriane à Hunder.' },
      { icon: 'fa-hiking', title: 'Trek au Zanskar & Spiti', desc: 'Circuits d’altitude d’exception à travers la chaîne du Karakoram et les vallées isolées de Spiti.' },
      { icon: 'fa-road', title: 'Cols Mythiques', desc: 'Empruntez l’une des plus hautes routes carrossables du monde via le col de Khardung La (5 359 m).' }
    ],
    region: 'ladakh'
  },
  rajasthan: {
    name: 'Rajasthan',
    slug: 'rajasthan',
    heroTitle: 'Voyage au Rajasthan',
    h1Title: 'La Terre des Maharajas : Cités Royales & Désert du Thar',
    tagline: 'Palais d’opulence, forteresses imprenables, désert d’or et havelis du Shekhawati',
    image: '/images/dest-rajasthan.jpg',
    satisfaction: '99% de satisfaction (245 avis)',
    shortDescription: "Le Rajasthan est la terre mythique des forteresses grandioses, des palais des Mille et Une Nuits et des cités colorées. De Jaïpur la rose à Jodhpur la bleue, d'Udaipur la romantique à Jaisalmer la dorée au cœur des dunes de sable du désert du Thar, découvrez une féérie architecturale unique au monde.",
    fullDescription: "Séjournez dans des palais de patrimoine restaurés, parcourez les ruelles des cités fortifiées et passez une nuit inoubliable sous les étoiles du désert. Nos chauffeurs privés et nos guides locaux vous feront vivre une expérience féérique et authentique.",
    highlights: [
      { icon: 'fa-crown', title: 'Forts & Palais Royaux', desc: 'Fort de Mehrangarh à Jodhpur, Palais des Vents à Jaipur et City Palace d\'Udaipur.' },
      { icon: 'fa-campground', title: 'Désert du Thar', desc: 'Randonnée en chameau et campement de charme sous les étoiles du désert de Jaisalmer.' },
      { icon: 'fa-hotel', title: 'Hôtels de Patrimoine', desc: 'Nuits magiques dans des anciennes demeures de Maharajas et havelis du Shekhawati.' },
      { icon: 'fa-users', title: 'Rencontres Authentiques', desc: 'Immersion rurale chez les communautés éco-responsables Bishnoi et artisans locaux.' }
    ],
    region: 'inde-du-nord'
  },
  kerala: {
    name: 'Kerala',
    slug: 'kerala',
    heroTitle: 'Voyage au Kerala',
    h1Title: 'Inde du Sud & Backwaters : Lagunes d’Émeraude & Ayurveda',
    tagline: 'Croisières en houseboat traditionnel, collines de thé et sérénité tropicale',
    image: '/images/dest-kerala.jpg',
    satisfaction: '97% de satisfaction (89 avis)',
    shortDescription: "Surnommé 'God’s Own Country', le Kerala vous transporte dans une Inde apaisante, verdoyante et tropicale. Naviguez en houseboat privé sur les canaux paisibles des backwaters d'Alleppey, parcourez les denses plantations de thé de Munnar et bénéficiez de soins ayurvédiques ancestraux.",
    fullDescription: "Assistez aux spectacles envoûtants de Kathakali à Cochin, observez les éléphants sauvages dans la réserve de Periyar et terminez votre séjour sur les plages dorées et préservées de Marari.",
    highlights: [
      { icon: 'fa-ship', title: 'Houseboat Privé', desc: 'Croisière et nuitée exclusive sur un kettuvalam traditionnel le long des backwaters.' },
      { icon: 'fa-leaf', title: 'Soins Ayurvédiques', desc: 'Massages aux huiles précieuses et cures de bien-être dans des sanctuaires authentiques.' },
      { icon: 'fa-seedling', title: 'Plantations de Munnar', desc: 'Collines verdoyantes tapissées de théiers et de jardins d’épices odorantes.' },
      { icon: 'fa-umbrella-beach', title: 'Côte Malabar', desc: 'Détente sur les plages tropicales ombragées de cocotiers à Marari et Kovalam.' }
    ],
    region: 'inde-du-sud'
  },
  nepal: {
    name: 'Népal',
    slug: 'nepal',
    heroTitle: 'Voyage au Népal',
    h1Title: 'Népal : Cités Royales de Katmandou & Sommets de l’Himalaya',
    tagline: 'Vallée sacrée, stupas bouddhistes, lacs de Pokhara et safaris à Chitwan',
    image: '/images/dest-nepal.jpg',
    satisfaction: '98% de satisfaction (74 avis)',
    shortDescription: "Le Népal est le royaume incontournable du toit du monde. Des ruelles médiévales de Bhaktapur et des stupas sacrés de Swayambhunath aux panoramas sur les Annapurnas depuis Pokhara, découvrez la richesse culturelle et naturelle de l'Himalaya.",
    fullDescription: "Combinez visites de temples séculaires et aventures en nature sauvage : safaris à dos d'éléphant pour apercevoir le rhinocéros unicorne à Chitwan et randonnées face aux sommets enneigés.",
    highlights: [
      { icon: 'fa-place-of-worship', title: 'Cités Médionales', desc: 'Katmandou, Patan et Bhaktapur, joyaux d’art et d’architecture Newar (UNESCO).' },
      { icon: 'fa-mountain', title: 'Lacs de Pokhara', desc: 'Vues splendides sur le Machapuchare et la chaîne sacrée des Annapurnas.' },
      { icon: 'fa-hippo', title: 'Parc de Chitwan', desc: 'Safaris en jungle tropicale pour observer rhinocéros unicorne et tigres du Bengale.' },
      { icon: 'fa-pray', title: 'Spiritualité Himalaya', desc: 'Rencontre avec les moines et cérémonies autour des stupas de Boudhanath.' }
    ],
    region: 'nepal'
  },
  'delhi-agra': {
    name: 'Delhi & Taj Mahal d\'Agra',
    slug: 'delhi-agra',
    heroTitle: 'Voyage Delhi & Taj Mahal',
    h1Title: 'Delhi & Agra : Merveille du Monde et Joyaux Moghouls',
    tagline: 'Du Taj Mahal à l\'aube aux marchés vibrants de Chandni Chowk',
    image: '/images/dest-tajmahal.jpg',
    satisfaction: '99% de satisfaction (180 avis)',
    shortDescription: "Découvrez le cœur battant et historique de l'Inde du Nord. Admirez la beauté féérique du Taj Mahal au lever du soleil, visitez l'imposant Fort Rouge d'Agra et explorez les monuments impériaux de Delhi.",
    highlights: [
      { icon: 'fa-heart', title: 'Taj Mahal à l\'Aube', desc: 'L\'une des 7 Merveilles du Monde illuminée par les premiers rayons du soleil.' },
      { icon: 'fa-landmark', title: 'Fort Rouge d\'Agra', desc: 'Palais en grès rouge des empereurs moghouls dominant la rivière Yamuna.' },
      { icon: 'fa-biking', title: 'Old Delhi en Rickshaw', desc: 'Traversée haut en couleurs des bazars parfumés de Chandni Chowk.' },
      { icon: 'fa-monument', title: 'Qutb Minar & Humayun', desc: 'Minaret historique du XIIIe siècle et tombeau impérial précurseur du Taj Mahal.' }
    ],
    region: 'inde-du-nord'
  },
  varanasi: {
    name: 'Varanasi',
    slug: 'varanasi',
    heroTitle: 'Voyage à Varanasi',
    h1Title: 'Varanasi (Bénarès) : Capitale Spirituelle & Gange Sacré',
    tagline: 'Ghats séculaires, cérémonies Ganga Aarti et balades spirituelles sur le fleuve',
    image: '/images/dest-varanasi.jpg',
    satisfaction: '98% de satisfaction (95 avis)',
    shortDescription: "Varanasi est la plus ancienne cité vivante d'Inde. Plongez dans l'intensité mystique des rituels sacrés, assistez à la grandiose cérémonie nocturne du Ganga Aarti et naviguez à l'aube sur le fleuve vénéré.",
    highlights: [
      { icon: 'fa-fire', title: 'Ganga Aarti', desc: 'Spectacle hypnotique de lampes à huile, de chants sacrés et d\'incantations au crépuscule.' },
      { icon: 'fa-ship', title: 'Aube sur le Gange', desc: 'Navigation matinale en barque pour observer les ablutions et la dévotion des pèlerins.' },
      { icon: 'fa-dharmachakra', title: 'Sarnath Sacré', desc: 'Le parc des daims où le Bouddha prononça son tout premier enseignement.' },
      { icon: 'fa-gopuram', title: 'Vieille Ville Mystique', desc: 'Dédale fascinant d\'ruelles anciennes, d\'échoppes d\'épices et de temples mystérieux.' }
    ],
    region: 'inde-du-nord'
  },
  gujarat: {
    name: 'Gujarat',
    slug: 'gujarat',
    heroTitle: 'Voyage au Gujarat',
    h1Title: 'Gujarat : Désert de Sel Blanc du Rann de Kutch & Lions d\'Asie',
    tagline: 'Artisanat textile tribal, temples jaïns de Palitana et nature préservée',
    image: '/images/dest-gujarat.jpg',
    satisfaction: '96% de satisfaction (52 avis)',
    shortDescription: "Le Gujarat offre une Inde authentique et méconnue. Émerveillez-vous devant l'immensité étincelante du désert de sel du Rann de Kutch, gravitiez les marches sacrées de Palitana et partez en safari à Gir.",
    highlights: [
      { icon: 'fa-sun', title: 'Grand Rann de Kutch', desc: 'Le plus grand désert de sel blanc au monde illuminé par la pleine lune.' },
      { icon: 'fa-cat', title: 'Lions de la Forêt de Gir', desc: 'Dernier refuge sur Terre des majestueux lions asiatiques sauvages.' },
      { icon: 'fa-gopuram', title: 'Temples de Palitana', desc: 'Complexe sacré de 863 temples sculptés sur les collines du mont Shatrunjaya.' },
      { icon: 'fa-tshirt', title: 'Artisanat & Broderies', desc: 'Techniques ancestrales de tissage Ikat et de broderies tribales d\'exception.' }
    ],
    region: 'gujarat'
  }
};

const defaultPackages = [
  {
    title: 'Séjour au Rajasthan et Bénarès – Le Rajasthan et la rivière Gange',
    duration: '17 Jours / 16 Nuits',
    image: '/images/dest-rajasthan.jpg',
    location: 'Rajasthan & Bénarès',
    badge: 'Populaire',
    excerpt: 'Un voyage d\'exception alliant la féerie des palais des Maharajas et la spiritualité sacrée de Varanasi sur les bords du Gange.',
    slug: 'sejour-au-rajasthan-et-benares'
  },
  {
    title: 'Trek & Voyage d\'Exception au Ladakh – Le Petit Tibet',
    duration: '14 Jours / 13 Nuits',
    image: '/images/dest-ladakh.jpg',
    location: 'Leh, Pangong & Vallée de la Nubra',
    badge: 'Himalaya',
    excerpt: 'Une grande traversée de l\'Himalaya entre monastères bouddhistes perchés, lac Pangong Tso et franchissement du col Khardung La.',
    slug: 'trek-voyage-ladakh-petit-tibet'
  },
  {
    title: 'Voyage au Rajasthan Hors des Sentiers Battus',
    duration: '15 Jours / 14 Nuits',
    image: '/images/Voyage-Jaisalmer.jpg',
    location: 'Villages & Forts Ruraux',
    badge: 'Authentique',
    excerpt: 'Immergez-vous dans la vraie vie rurale indienne, dormez dans des havelis de charme et découvrez des palais secrets.',
    slug: 'voyage-au-rajasthan-hors-des-sentiers-battus'
  },
  {
    title: 'Joyaux du Kerala & Backwaters sur Mesure',
    duration: '12 Jours / 11 Nuits',
    image: '/images/dest-kerala.jpg',
    location: 'Cochin, Alleppey & Munnar',
    badge: 'Nature & Ayurveda',
    excerpt: 'Croisières en Houseboat privé sur les lagunes tranquilles, plantations de thé de Munnar et massages ayurvédiques.',
    slug: 'joyaux-du-kerala-backwaters'
  }
];

const DestinationDetail = ({ overrideSlug }) => {
  const { slug: paramSlug } = useParams();
  const currentSlug = overrideSlug || paramSlug || 'rajasthan';

  const [destInfo, setDestInfo] = useState(null);
  const [packages, setPackages] = useState(defaultPackages);
  const [loading, setLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState({ title: 'Voyage sur mesure', duration: '' });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);

    // 1. Fetch destination info
    fetchDestinationBySlug(currentSlug)
      .then((res) => {
        if (res.data) {
          setDestInfo(res.data);
        } else {
          setDestInfo(getFallbackDestination(currentSlug));
        }
      })
      .catch(() => {
        setDestInfo(getFallbackDestination(currentSlug));
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Fetch tours matching this city tag / destination
    fetchTours({ city: currentSlug })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setPackages(res.data);
        } else {
          fetchTours({ region: currentSlug })
            .then((r2) => {
              if (r2.data && r2.data.length > 0) {
                setPackages(r2.data);
              } else {
                const filtered = defaultPackages.filter(p => 
                  p.location?.toLowerCase().includes(currentSlug.toLowerCase()) || 
                  p.title?.toLowerCase().includes(currentSlug.toLowerCase())
                );
                setPackages(filtered.length > 0 ? filtered : defaultPackages);
              }
            })
            .catch(() => setPackages(defaultPackages));
        }
      })
      .catch(() => {
        setPackages(defaultPackages);
      });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentSlug]);

  const getFallbackDestination = (s) => {
    if (defaultDestinationsMap[s]) {
      return defaultDestinationsMap[s];
    }
    const formattedName = s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
    return {
      name: formattedName,
      slug: s,
      heroTitle: `Voyage ${formattedName}`,
      h1Title: `Voyage & Circuit sur Mesure à ${formattedName}`,
      tagline: `Découvrez les trésors et merveilles de ${formattedName} avec nos experts locaux`,
      image: `/images/dest-${s}.jpg`,
      satisfaction: '98% de satisfaction (110 avis)',
      shortDescription: `Découvrez ${formattedName} avec Jodhpur Voyage. Laissez-vous séduire par des paysages spectaculaires, des monuments historiques d'exception et une culture authentique au cœur de l'Inde et de l'Himalaya.`,
      fullDescription: `Nos itinéraires personnalisés à ${formattedName} combinent chauffeurs privés, guides expérimentés francophones et hébergements de charme soigneusement sélectionnés.`,
      highlights: [
        { icon: 'fa-monument', title: 'Monuments Incontournables', desc: `Explorez les édifices et sanctuaires emblématiques de ${formattedName}.` },
        { icon: 'fa-camera', title: 'Paysages Grandioses', desc: 'Des panoramas uniques à couper le souffle pour des souvenirs mémorables.' },
        { icon: 'fa-users', title: 'Rencontres Locales', desc: 'Immersion culturelle chaleureuse auprès des habitants et artisans.' },
        { icon: 'fa-user-shield', title: 'Chauffeur Privé & Guide', desc: 'Un service 100% sur mesure, flexible et sécurisé tout au long du séjour.' }
      ],
      region: s
    };
  };

  const activeDest = destInfo || getFallbackDestination(currentSlug);

  const handleOpenBooking = (title, duration) => {
    setSelectedTour({ title, duration });
    setModalOpen(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCircuits = () => {
    const el = document.getElementById('circuits-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <SEO
        pageKey="destinations"
        title={activeDest.seoTitle || `Voyage ${activeDest.name} — Circuits & Séjours sur Mesure | Jodhpur Voyage`}
        description={activeDest.seoDescription || activeDest.shortDescription}
        keywords={activeDest.seoKeywords || `voyage ${activeDest.name.toLowerCase()}, circuit ${activeDest.name.toLowerCase()}, trek ${activeDest.name.toLowerCase()}`}
        ogImage={activeDest.image || '/images/dest-rajasthan.jpg'}
      />

      {/* =========================================================================
          TERRES D'AVENTURE STYLE HERO BANNER
          ========================================================================= */}
      <section 
        style={{ 
          position: 'relative', 
          minHeight: '480px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#ffffff',
          overflow: 'hidden',
          background: '#0F172A'
        }}
      >
        <img
          src={activeDest.image || '/images/dest-rajasthan.jpg'}
          alt={`Voyage ${activeDest.name}`}
          onError={(e) => { e.currentTarget.src = "/images/dest-rajasthan.jpg"; }}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            opacity: 1 
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '60px 20px', textShadow: '0 2px 10px rgba(0,0,0,0.85), 0 4px 20px rgba(0,0,0,0.95)' }}>
          <span 
            style={{ 
              background: 'var(--primary-color, #C58B39)', 
              color: '#ffffff', 
              padding: '6px 18px', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              fontWeight: '700', 
              letterSpacing: '1px', 
              textTransform: 'uppercase', 
              display: 'inline-block', 
              marginBottom: '16px' 
            }}
          >
            <i className="fas fa-compass" style={{ marginRight: '6px' }}></i>
            {activeDest.tagline || `Voyages & Circuits d'Exception`}
          </span>

          <h1 style={{ fontSize: 'clamp(1.4rem, 2.6vw, 2.1rem)', color: '#ffffff', fontWeight: '800', marginBottom: '14px', textShadow: '0 2px 10px rgba(0,0,0,0.85), 0 4px 20px rgba(0,0,0,0.95)' }}>
            {activeDest.heroTitle || `Voyage ${activeDest.name}`}
          </h1>

          {/* Satisfaction Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '0 auto 24px', fontSize: '0.95rem', color: '#FCD34D' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff' }}>
              <i className="fas fa-star" style={{ color: '#F59E0B', marginRight: '6px' }}></i>
              {activeDest.satisfaction || '98% de satisfaction (112 avis)'}
            </span>
          </div>

          <button 
            type="button" 
            className="btn btn-gold btn-lg" 
            onClick={scrollToCircuits} 
            style={{ borderRadius: '30px', padding: '14px 32px', fontSize: '1rem', fontWeight: '700', boxShadow: '0 4px 15px rgba(197, 139, 57, 0.4)' }}
          >
            Tous les voyages au {activeDest.name} <i className="fas fa-chevron-down" style={{ marginLeft: '8px' }}></i>
          </button>
        </div>
      </section>

      {/* =========================================================================
          BREADCRUMBS & INTRODUCTORY OVERVIEW
          ========================================================================= */}
      <section style={{ background: '#F8FAFC', padding: '36px 0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          {/* Breadcrumb */}
          <nav style={{ fontSize: '0.88rem', color: 'var(--text-muted, #64748B)', marginBottom: '20px' }}>
            <Link to="/" style={{ color: 'var(--text-muted, #64748B)', textDecoration: 'none' }}>Accueil</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link to="/destinations" style={{ color: 'var(--text-muted, #64748B)', textDecoration: 'none' }}>Destinations</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--primary-color, #C58B39)', fontWeight: '600' }}>{activeDest.name}</span>
          </nav>

          <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary-color, #1E293B)', fontWeight: '800', marginBottom: '16px' }}>
            {activeDest.h1Title || `Voyage & Trek au ${activeDest.name}`}
          </h2>

          <div style={{ background: '#ffffff', padding: '24px 28px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', borderLeft: '4px solid var(--primary-color, #C58B39)' }}>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#334155', margin: 0 }}>
              {activeDest.shortDescription}
            </p>

            {activeDest.fullDescription && (
              <>
                {showFullDesc && (
                  <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#334155', marginTop: '14px' }}>
                    {activeDest.fullDescription}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary-color, #C58B39)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginTop: '12px',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {showFullDesc ? 'Réduire' : 'Lire la suite'}
                  <i className={`fas fa-chevron-${showFullDesc ? 'up' : 'down'}`}></i>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          HIGHLIGHTS & EXPERIENCES SECTION
          ========================================================================= */}
      {activeDest.highlights && activeDest.highlights.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">Les Incontournables</span>
              <h2 className="section-title">Pourquoi Visiter le {activeDest.name} ?</h2>
              <p className="section-description">Des moments d'exception et des paysages uniques gravés à jamais.</p>
            </div>

            <div className="pillars-grid">
              {activeDest.highlights.map((h, i) => (
                <div key={i} className="pillar-card">
                  <div className="pillar-icon-circle">
                    <i className={`fas ${typeof h === 'object' ? h.icon || 'fa-star' : 'fa-check-circle'}`}></i>
                  </div>
                  <h3 className="pillar-title">{typeof h === 'object' ? h.title : `Points Forts ${i+1}`}</h3>
                  <p className="pillar-desc">{typeof h === 'object' ? h.desc : h}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          TOUR PACKAGES GRID
          ========================================================================= */}
      <section id="circuits-section" className="section-padding bg-cream">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Circuits & Offres Spéciales</span>
            <h2 className="section-title">Nos Offres de Voyage au {activeDest.name}</h2>
            <p className="section-description">
              Sélectionnez un circuit privatif sur mesure et découvrez son itinéraire complet avec chauffeur privé.
            </p>
          </div>

          <div className="tours-grid">
            {packages.map((pkg, idx) => (
              <div key={pkg._id || pkg.slug || idx} className="tour-card">
                <Link to={`/${pkg.slug}`} className="tour-card-image-wrap" title="Voir l'itinéraire du voyage">
                  <img src={pkg.image || activeDest.image || '/images/dest-rajasthan.jpg'} alt={pkg.title} />
                  <span className="tour-card-badge">{pkg.badge || 'Populaire'}</span>
                  <div className="tour-card-duration">
                    <i className="far fa-clock"></i> {pkg.duration}
                  </div>
                </Link>
                <div className="tour-card-body">
                  <div className="tour-card-location">
                    <i className="fas fa-map-marker-alt"></i> {pkg.location || activeDest.name}
                  </div>
                  <h3 className="tour-card-title">
                    <Link to={`/${pkg.slug}`}>{pkg.title}</Link>
                  </h3>
                  <p className="tour-card-excerpt">
                    {pkg.excerpt || pkg.subtitle || (pkg.overview ? pkg.overview.slice(0, 110) + '...' : '')}
                  </p>
                  <div className="tour-card-footer mt-auto">
                    <Link to={`/${pkg.slug}`} className="btn btn-sm btn-outline">
                      Voir l'itinéraire
                    </Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => handleOpenBooking(pkg.title, pkg.duration)}
                    >
                      <i className="fas fa-paper-plane"></i> Devis / Réserver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CTA BANNER
          ========================================================================= */}
      <section className="cta-banner-section">
        <img src={activeDest.image || "/images/image-8.jpg"} alt="CTA Background" className="cta-bg-image" />
        <div className="container cta-content">
          <h2 className="cta-title">Votre voyage 100% sur mesure au {activeDest.name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '24px', fontSize: '1.1rem' }}>
            Nos conseillers locaux organisent votre circuit privé selon vos dates, vos envies et votre rythme.
          </p>
          <Link to="/voyage-sur-mesure" className="btn btn-primary btn-lg">
            Demander un Devis Gratuit
          </Link>
        </div>
      </section>

      {/* =========================================================================
          FLOATING WIDGETS
          ========================================================================= */}
      <a
        href="https://wa.me/919650698669"
        target="_blank"
        rel="noreferrer"
        className="floating-whatsapp"
        aria-label="Contactez-nous sur WhatsApp"
      >
        <i className="fab fa-whatsapp"></i>
        <span className="whatsapp-tooltip">Contactez-nous sur WhatsApp</span>
      </a>

      {showScrollTop && (
        <button
          className="scroll-to-top show"
          onClick={scrollToTop}
          aria-label="Retour en haut de page"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <i className="fas fa-chevron-up"></i>
        </button>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tourTitle={selectedTour.title}
        tourDuration={selectedTour.duration}
      />
    </>
  );
};

export default DestinationDetail;
