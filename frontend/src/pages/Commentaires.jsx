import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchReviews } from '../services/api';
import ReviewModal from '../components/ReviewModal';
import SEO from '../components/SEO';

const PROTOTYPE_REVIEWS = [
  {
    id: '1',
    category: 'rajasthan',
    link: '/tour-rajasthan',
    img: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/07/Voyage-Jaisalmer.jpg',
    fallbackImg: '/images/Voyage-Jaisalmer.jpg',
    tag: 'Rajasthan • 14 Jours',
    tagIcon: 'fas fa-map-marker-alt',
    title: 'Voyage au Rajasthan 14 Jours',
    rating: 5,
    excerpt: '"Bonjour Monsieur Singh, Nous tenons à vous dire à quel point nous avons été ravis par votre organisation : chauffeur exceptionnel, véhicules très confortables, choix des hôtels patrimoniaux magiques et écoute permanente tout au long de notre parcours au Rajasthan."',
    authorAvatar: 'MS',
    authorName: 'Famille & Voyageurs Francophones',
    reviewDate: 'Avis Vérifié • Organisé par Jodhpur Voyage'
  },
  {
    id: '2',
    category: 'ladakh',
    link: '/tours',
    img: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/08/voyage-au-ladakh-inde.jpg',
    fallbackImg: '/images/dest-ladakh.jpg',
    tag: 'Ladakh & Tibet • Circuit Montagne',
    tagIcon: 'fas fa-mountain',
    title: 'Séjour au Ladakh – Le petit Tibet de l\'Inde',
    rating: 5,
    excerpt: '"Le séjour au Ladakh organisé par l\'agence Jodhpur Voyage s\'est déroulé dans les meilleures conditions possibles. Notre chauffeur dans l\'Himalaya était extrêmement fiable, prudent et compétent. Nous avons découvert des monastères bouddhistes uniques et des paysages à couper le souffle."',
    authorAvatar: 'LD',
    authorName: 'Voyageurs du Ladakh',
    reviewDate: 'Avis Vérifié • Séjour sur mesure'
  },
  {
    id: '3',
    category: 'inde-du-nord',
    link: '/tours',
    img: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/05/Voyage-au-Himachal-en-Inde.jpg',
    fallbackImg: '/images/dest-himachal.jpg',
    tag: 'Punjab & Himachal Pradesh',
    tagIcon: 'fas fa-place-of-worship',
    title: 'Circuit & Séjour Punjab & Himachal Pradesh',
    rating: 5,
    excerpt: '"Bonjour M. Singh, Comme convenu je reviens vers vous pour faire un petit point sur notre magnifique voyage au Punjab et dans l\'Himachal Pradesh. Du Temple d\'Or d\'Amritsar aux vallées de Dharamsala, la prise en charge, la sécurité et la flexibilité sur le terrain étaient irréprochables."',
    authorAvatar: 'PH',
    authorName: 'Groupe d\'Amis Francophones',
    reviewDate: 'Avis Vérifié • Inde du Nord'
  },
  {
    id: '4',
    category: 'rajasthan',
    link: '/tour-rajasthan',
    img: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/05/Sejour-au-Rajasthan-avec-chauffeur.jpg',
    fallbackImg: '/images/dest-rajasthan.jpg',
    tag: 'Chauffeur Privé • Rajasthan',
    tagIcon: 'fas fa-car-side',
    title: 'Séjour au Rajasthan avec Chauffeur Privé',
    rating: 5,
    excerpt: '"Nous avons particulièrement apprécié l\'organisation impeccable, les voitures spacieuses et toujours climatisées, les chauffeurs d\'une gentillesse rare, le suivi quotidien de l\'agence et les attentions de chaque instant avec les bouteilles d\'eau fournies tous les jours dans le véhicule."',
    authorAvatar: 'CR',
    authorName: 'Chantal & Robert',
    reviewDate: 'Avis Vérifié • Circuit Privé avec Chauffeur'
  },
  {
    id: '5',
    category: 'ladakh',
    link: '/tours',
    img: 'https://www.jodhpurvoyage.com/wp-content/uploads/2022/03/voyage-ladakh.jpeg',
    fallbackImg: '/images/dest-ladakh.jpg',
    tag: 'Trek & Aventure • 8 Jours',
    tagIcon: 'fas fa-hiking',
    title: 'Voyage au Ladakh (8 Jours)',
    rating: 5,
    excerpt: '"Voici le résumé de notre voyage de 8 jours au Ladakh programmé de main de maître par l\'agence Jodhpur Voyage. Mr. Singh a su faire preuve d\'une grande réactivité avant et pendant le parcours. Chaque étape et chaque nuitée en altitude étaient parfaitement planifiées."',
    authorAvatar: 'VL',
    authorName: 'Voyageurs Aventuriers',
    reviewDate: 'Avis Vérifié • Himalaya & Ladakh'
  },
  {
    id: '6',
    category: 'rajasthan',
    link: '/tour-rajasthan',
    img: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/05/Voyage-au-Rajasthan-Hors-des-sentiers-battus-avec-Taj-Mahal.jpg',
    fallbackImg: '/images/dest-tajmahal.jpg',
    tag: 'Hors des sentiers battus • Taj Mahal',
    tagIcon: 'fas fa-compass',
    title: 'Rajasthan Hors Sentiers Battus & Taj Mahal',
    rating: 5,
    excerpt: '"Bonjour, Comme promis nous vous envoyons notre évaluation détaillée : 1. Préparation du voyage : l\'écoute de Mr Singh a permis de composer exactement le voyage personnalisé que nous espérions. 2. Le chauffeur : prévenant et très prudent sur la route. Une expérience magique hors des sentiers battus !"',
    authorAvatar: 'HB',
    authorName: 'Famille & Amis Francophones',
    reviewDate: 'Avis Vérifié • Rajasthan Authentique'
  },
  {
    id: '7',
    category: 'inde-du-nord',
    link: '/tours',
    img: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/04/Voyage-Inde-du-nord_Jodhpur-Voyage.jpg',
    fallbackImg: '/images/dest-jodhpur.jpg',
    tag: 'Guide Francophone • Inde du Nord',
    tagIcon: 'fas fa-user-tie',
    title: 'Voyage Inde du Nord avec Guide Francophone',
    rating: 5,
    excerpt: '"Bonjour M. Singh, Comme promis, voici nos impressions chaleureuses sur le voyage. Tout d\'abord merci beaucoup pour nous avoir permis de réaliser ce magnifique périple. Avoir un guide francophone passionné nous a permis de comprendre l\'histoire et les coutumes indiennes au plus près !"',
    authorAvatar: 'GF',
    authorName: 'Voyageurs Passionnés de Culture',
    reviewDate: 'Avis Vérifié • Circuit Culturel'
  },
  {
    id: '8',
    category: 'inde-du-nord',
    link: '/tour-rajasthan',
    img: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/04/Voyage-inde-du-nord-le-rajasthan-agra-benares.jpg',
    fallbackImg: '/images/dest-varanasi.jpg',
    tag: 'Rajasthan, Agra & Varanasi (Gange)',
    tagIcon: 'fas fa-om',
    title: 'Le Rajasthan & Vallée du Gange à Varanasi',
    rating: 5,
    excerpt: '"Bonjour M. Singh, Désolés pour ce message tardif après notre retour en France. Nous tenions absolument à exprimer notre profonde gratitude envers Jodhpur Voyage. De la majesté d\'Agra aux cérémonies sacrées des ghats de Varanasi, tout était orchestré à la perfection."',
    authorAvatar: 'VG',
    authorName: 'Pierre & Hélène Martin',
    reviewDate: 'Avis Vérifié • Rajasthan & Benares'
  },
  {
    id: '9',
    category: 'inde-du-sud',
    link: '/destinations',
    img: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/04/Voyage-au-Kerala.jpg',
    fallbackImg: '/images/dest-kerala.jpg',
    tag: 'Kerala & Mysore • Inde du Sud',
    tagIcon: 'fas fa-water',
    title: 'Voyage au Kerala et Palais de Mysore',
    rating: 5,
    excerpt: '"Nous revenons enchantés d\'un voyage au Kérala organisé par Jodhpur Voyage. Comme pour notre précédent voyage au Rajasthan avec cette même agence locale, l\'accueil, les péniches d\'eau douce (Houseboat) et le palais de Mysore ont comblé toutes nos attentes !"',
    authorAvatar: 'KM',
    authorName: 'Clients Fidèles (2ème Voyage)',
    reviewDate: 'Avis Vérifié • Inde du Sud & Kerala'
  },
  {
    id: '10',
    category: 'rajasthan',
    link: '/tour-rajasthan',
    img: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/04/Voyage-au-Rajasthan-et-Taj-Mahal-avec-agence-locale.jpg',
    fallbackImg: '/images/image-6.jpg',
    tag: 'Rajasthan, Agra & Varanasi',
    tagIcon: 'fas fa-monument',
    title: 'Voyage Rajasthan, Agra & Varanasi',
    rating: 5,
    excerpt: '"Nous avons vécu un magnifique voyage à travers le Rajasthan ainsi qu\'à Agra et Varanasi grâce aux conseils avisés de l\'agence Jodhpur Voyage. Un itinéraire rythmé sans aucune fatigue excessive, avec un suivi téléphonique régulier de l\'équipe locale."',
    authorAvatar: 'AV',
    authorName: 'Couple de Voyageurs Francophones',
    reviewDate: 'Avis Vérifié • Agence Locale Directe'
  },
  {
    id: '11',
    category: 'rajasthan',
    link: '/tour-rajasthan',
    img: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/03/voyage-au-rajasthan-inde.jpeg',
    fallbackImg: '/images/dest-rajasthan.jpg',
    tag: 'Circuit 14 Jours • Rajasthan',
    tagIcon: 'fas fa-calendar-alt',
    title: 'Voyage au Rajasthan 14 Jours',
    rating: 5,
    excerpt: '"Bonjour Monsieur Singh, Nous voici bien rentrés dans notre commune bien calme. Notre esprit reste rempli de souvenirs précieux et colorés du Rajasthan. Merci pour votre professionnalisme, vos conseils de visite et pour le choix méticuleux des guides dans chaque cité royale."',
    authorAvatar: 'RJ',
    authorName: 'Monique & Bernard',
    reviewDate: 'Avis Vérifié • Circuit Classique 14 Jours'
  },
  {
    id: '12',
    category: 'gujarat',
    link: '/destinations',
    img: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/03/Sejour-au-Gujarat.jpg',
    fallbackImg: '/images/dest-gujarat.jpg',
    tag: 'Gujarat • 3ème Voyage',
    tagIcon: 'fas fa-city',
    title: 'Séjour au Gujarat avec Guide Francophone',
    rating: 5,
    excerpt: '"Bonjour M. Singh, Nous sommes bien rentrées de notre tour au Gujarat. C\'est le 3ème voyage consécutif que nous confions à votre agence locale ! Comme toujours, l\'organisation était irréprochable et la découverte des tribus du Gujarat était inoubliable."',
    authorAvatar: 'GJ',
    authorName: 'Voyageuses Fidèles (3ème Séjour)',
    reviewDate: 'Avis Vérifié • Gujarat & Tribus'
  },
  {
    id: '13',
    category: 'ladakh',
    link: '/tours',
    img: 'https://www.jodhpurvoyage.com/wp-content/uploads/2025/11/zanskar.jpg',
    fallbackImg: '/images/dest-ladakh.jpg',
    tag: 'Zanskar & Ladakh • Hautes Altitudes',
    tagIcon: 'fas fa-snowflake',
    title: 'Voyage Exceptionnel Ladakh & Zanskar',
    rating: 5,
    excerpt: '"Nous étions deux amis et souhaitions faire un voyage précis au Zanskar et Ladakh. Nous avons soumis notre itinéraire exigeant à Mr. Singh qui a orchestré la logistique de chaque col de montagne, des jeeps 4x4 et des hébergements de manière fabuleuse."',
    authorAvatar: 'LZ',
    authorName: 'Deux Amis Aventuriers',
    reviewDate: 'Avis Vérifié • Expédition Zanskar'
  },
  {
    id: '14',
    category: 'rajasthan',
    link: '/voyage-sur-mesure',
    img: 'https://www.jodhpurvoyage.com/wp-content/uploads/2025/11/Voyage-en-famille-en-Inde.jpg',
    fallbackImg: '/images/image-12.jpg',
    tag: 'Voyage Famille • Rajasthan & Taj Mahal',
    tagIcon: 'fas fa-users',
    title: 'Voyage en Famille Rajasthan & Taj Mahal',
    rating: 5,
    excerpt: '"Bonjour Monsieur Singh, Nous vous remercions pour le magnifique séjour et les merveilleuses découvertes effectués avec nos trois enfants. L\'attention portée à la sécurité de la famille et le confort des véhicules minibus étaient exceptionnels !"',
    authorAvatar: 'FA',
    authorName: 'Famille Moreau (5 personnes)',
    reviewDate: 'Avis Vérifié • Séjour Famille'
  }
];

const Commentaires = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbReviews, setDbReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fetch any dynamic reviews from backend API
    fetchReviews({ category: 'all' })
      .then((res) => {
        if (res.data?.reviews && Array.isArray(res.data.reviews)) {
          // Map DB reviews to format matching prototype cards
          const mapped = res.data.reviews.map((r, i) => ({
            id: `db-${r._id || i}`,
            category: r.category || 'rajasthan',
            link: '/tour-rajasthan',
            img: '/images/image-8.jpg',
            fallbackImg: '/images/image-8.jpg',
            tag: `${r.tourTitle || 'Voyage en Inde'} • ${r.authorCity || 'Avis Client'}`,
            tagIcon: 'fas fa-check-circle',
            title: r.tourTitle || 'Expérience Exceptionnelle',
            rating: r.rating || 5,
            excerpt: `"${r.comment}"`,
            authorAvatar: r.authorName ? r.authorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'JV',
            authorName: r.authorName || 'Voyageur Francophone',
            reviewDate: `Avis Vérifié • ${r.travelDate || 'Voyage Récent'}`
          }));
          setDbReviews(mapped);
        }
      })
      .catch((err) => console.log('Notice: using prototype reviews'));
  }, []);

  // Reset to page 1 whenever category or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Combine prototype reviews with any new verified DB reviews
  const allReviews = [...PROTOTYPE_REVIEWS, ...dbReviews];

  // Filter reviews by selected category and search input
  const filteredReviews = allReviews.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;
    
    const combinedText = `${item.title} ${item.excerpt} ${item.authorName} ${item.tag} ${item.category}`.toLowerCase();
    return matchesCat && combinedText.includes(q);
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredReviews.length);
  const currentReviews = filteredReviews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      const section = document.getElementById('reviews-listing-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div>
      <SEO pageKey="commentaires" />
      {/* HERO BANNER */}
      <section className="reviews-hero-section">
        <img 
          src="https://www.jodhpurvoyage.com/wp-content/uploads/2025/08/image-8.jpg" 
          onError={(e) => { e.currentTarget.src = "/images/image-8.jpg"; }}
          alt="Reviews Banner" 
          className="reviews-hero-bg" 
        />
        <div className="container reviews-hero-content">
          <span className="hero-badge"><i className="fas fa-star"></i> Retours d'Expérience</span>
          <h1 className="reviews-hero-title">Vos Avis & Commentaires</h1>
          <p className="reviews-hero-desc">
            La confiance et la satisfaction de nos voyageurs francophones sont notre plus grande fierté.
          </p>
        </div>
      </section>

      {/* RATING SUMMARY SCORECARD & TRUST BADGES */}
      <section className="section-padding bg-white pb-0">
        <div className="container">
          <div className="scorecard-wrapper">
            {/* Rating Score */}
            <div className="score-col">
              <span className="score-badge-label">Score de Satisfaction</span>
              <div className="score-number">4.9<span>/5</span></div>
              <div className="score-stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p className="score-text">Basé sur <strong>+500 témoignages</strong> de voyageurs francophones</p>
            </div>

            {/* Satisfaction Metrics */}
            <div className="metrics-col">
              <div className="metric-card">
                <div className="metric-value">99%</div>
                <div className="metric-label">Organisation & Rigueur</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">98%</div>
                <div className="metric-label">Chauffeurs & Ponctualité</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">97%</div>
                <div className="metric-label">Hôtels & Charme Haveli</div>
              </div>
            </div>

            {/* External Verification Badges */}
            <div className="badges-col">
              <span className="badge-verify-text">Avis vérifiés indépendants</span>
              <a 
                href="https://www.tripadvisor.in/Attraction_Review-g297668-d26864310-Reviews-Jodhpur_Voyage_Pvt_Ltd-Jodhpur_Jodhpur_District_Rajasthan.html" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="badge-img-link"
              >
                <img src="/images/tripad-icon.png" alt="TripAdvisor Jodhpur Voyage" className="badge-img-tripad" />
              </a>
              <a 
                href="https://www.trustpilot.com/review/jodhpurvoyage.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="badge-img-link"
              >
                <img src="/images/trustpilot-icon.png" alt="Trustpilot Jodhpur Voyage" className="badge-img-trust" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH & FILTER BAR */}
      <section className="reviews-filter-section bg-white">
        <div className="container">
          <div className="reviews-filter-bar">
            {/* Category Filter Chips */}
            <div className="reviews-filter-chips" id="review-category-filters">
              <button 
                className={`review-filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Tous les avis (500+)
              </button>
              <button 
                className={`review-filter-chip ${selectedCategory === 'rajasthan' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('rajasthan')}
              >
                Rajasthan
              </button>
              <button 
                className={`review-filter-chip ${selectedCategory === 'inde-du-nord' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('inde-du-nord')}
              >
                Inde du Nord
              </button>
              <button 
                className={`review-filter-chip ${selectedCategory === 'ladakh' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('ladakh')}
              >
                Ladakh & Himalaya
              </button>
              <button 
                className={`review-filter-chip ${selectedCategory === 'inde-du-sud' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('inde-du-sud')}
              >
                Inde du Sud & Kerala
              </button>
              <button 
                className={`review-filter-chip ${selectedCategory === 'gujarat' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('gujarat')}
              >
                Gujarat & Népal
              </button>
            </div>

            {/* Search Input */}
            <div className="reviews-search-box">
              <i className="fas fa-search reviews-search-icon"></i>
              <input 
                type="text" 
                id="review-search-input" 
                placeholder="Rechercher un avis (ex: Chauffeur, Singh, Jaisalmer...)" 
                className="reviews-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* MAIN REVIEWS LISTING SECTION */}
      <section id="reviews-listing-section" className="section-padding bg-cream pt-0">
        <div className="container">
          {/* Header Summary */}
          {filteredReviews.length > 0 && (
            <div className="reviews-count-header">
              <div className="reviews-count-text">
                Affichage de <strong>{startIndex + 1} à {endIndex}</strong> sur <strong>{filteredReviews.length}</strong> avis voyageurs vérifiés
              </div>
              {totalPages > 1 && (
                <div className="reviews-page-indicator">
                  Page {currentPage} / {totalPages}
                </div>
              )}
            </div>
          )}

          <div id="reviews-grid">
            {filteredReviews.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px' }}>
                <i className="fas fa-comment-slash" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '16px' }}></i>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary-color)', marginBottom: '8px' }}>Aucun avis ne correspond à votre recherche</h3>
                <p style={{ color: 'var(--text-muted)' }}>Essayez un autre mot-clé ou réinitialisez les filtres.</p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                  style={{ marginTop: '16px' }}
                >
                  Voir tous les avis
                </button>
              </div>
            ) : (
              currentReviews.map((rev) => (
                <Link 
                  key={rev.id} 
                  to={rev.link} 
                  className="review-card" 
                  data-category={rev.category}
                >
                  <div className="review-card-img-wrap">
                    <img 
                      src={rev.img} 
                      onError={(e) => { e.currentTarget.src = rev.fallbackImg; }}
                      alt={rev.title} 
                      className="review-card-img" 
                    />
                    <span className="review-tag-badge">
                      <i className={rev.tagIcon}></i> {rev.tag}
                    </span>
                  </div>
                  <div className="review-card-body">
                    <div>
                      <div className="review-card-header">
                        <h3 className="review-card-heading">{rev.title}</h3>
                        <div className="review-stars">
                          {[...Array(rev.rating)].map((_, i) => (
                            <i key={i} className="fas fa-star"></i>
                          ))}
                        </div>
                      </div>
                      <p className="review-excerpt">
                        {rev.excerpt}
                      </p>
                    </div>
                    <div className="review-author-info">
                      <div className="author-avatar">{rev.authorAvatar}</div>
                      <div>
                        <span className="author-name">{rev.authorName}</span>
                        <span className="review-date"><i className="fas fa-check-circle"></i> {rev.reviewDate}</span>
                      </div>
                    </div>
                    <div className="review-card-footer-link">
                      <span>Voir le circuit &amp; les détails</span>
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Luxury Pagination Bar */}
          {totalPages > 1 && (
            <div className="luxury-pagination" aria-label="Pagination des avis">
              <button
                type="button"
                className="pagination-btn pagination-nav-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                title="Page précédente"
              >
                <i className="fas fa-chevron-left"></i>
                <span>Précédent</span>
              </button>

              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                      •••
                    </span>
                  );
                }
                return (
                  <button
                    key={`page-${page}`}
                    type="button"
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                    title={`Aller à la page ${page}`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                type="button"
                className="pagination-btn pagination-nav-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Page suivante"
              >
                <span>Suivant</span>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA INVITATION TO WRITE A REVIEW OR PLAN A TRIP */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="reviews-cta-card">
            <img 
              src="https://www.jodhpurvoyage.com/wp-content/uploads/2024/07/jaipur-travel.jpg" 
              onError={(e) => { e.currentTarget.src = "/images/jaipur-travel.jpg"; }}
              alt="Jodhpur Voyage Banner" 
              className="reviews-cta-bg" 
            />
            <div className="reviews-cta-content">
              <span className="reviews-cta-subtitle">Prêt pour votre propre aventure ?</span>
              <h2 className="reviews-cta-title">Inspiré par les témoignages de nos voyageurs ?</h2>
              <p className="reviews-cta-desc">
                Contactez notre agence réceptive locale francophone et créez un itinéraire sur mesure adapté à vos dates, votre rythme et votre budget.
              </p>
              <div className="cta-buttons">
                <Link to="/voyage-sur-mesure" className="btn btn-primary btn-lg">
                  <i className="fas fa-magic"></i> Devis Gratuit Sur Mesure
                </Link>
                <Link to="/contact" className="btn btn-outline-white btn-lg">
                  <i className="fas fa-envelope"></i> Nous Contacter
                </Link>
                <button 
                  type="button" 
                  className="btn btn-gold btn-lg" 
                  onClick={() => setIsReviewModalOpen(true)}
                >
                  <i className="fas fa-pen"></i> Laisser un Avis
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp */}
      <a href="https://wa.me/919650698669" target="_blank" rel="noopener noreferrer" className="floating-whatsapp" aria-label="Contactez-nous sur WhatsApp">
        <i className="fab fa-whatsapp"></i>
        <span className="whatsapp-tooltip">Contactez-nous sur WhatsApp</span>
      </a>

      {/* Modal for Submitting New Review */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmitted={() => {
          fetchReviews({ category: 'all' })
            .then((res) => {
              if (res.data?.reviews) {
                const mapped = res.data.reviews.map((r, i) => ({
                  id: `db-${r._id || i}`,
                  category: r.category || 'rajasthan',
                  link: '/tour-rajasthan',
                  img: '/images/image-8.jpg',
                  fallbackImg: '/images/image-8.jpg',
                  tag: `${r.tourTitle || 'Voyage en Inde'} • ${r.authorCity || 'Avis Client'}`,
                  tagIcon: 'fas fa-check-circle',
                  title: r.tourTitle || 'Expérience Exceptionnelle',
                  rating: r.rating || 5,
                  excerpt: `"${r.comment}"`,
                  authorAvatar: r.authorName ? r.authorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'JV',
                  authorName: r.authorName || 'Voyageur Francophone',
                  reviewDate: `Avis Vérifié • ${r.travelDate || 'Voyage Récent'}`
                }));
                setDbReviews(mapped);
              }
            })
            .catch(console.error);
        }}
      />
    </div>
  );
};

export default Commentaires;
