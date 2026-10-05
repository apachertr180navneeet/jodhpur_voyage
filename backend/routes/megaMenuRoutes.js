import express from 'express';
import MegaMenu from '../models/MegaMenu.js';
import { defaultMegaMenuData } from '../seed/megaMenuData.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { isMongoConnected } from '../store.js';

const router = express.Router();

let inMemoryMegaMenu = JSON.parse(JSON.stringify(defaultMegaMenuData));

// @desc    Get active Mega Menu configuration
// @route   GET /api/mega-menu
// @access  Public
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      let config = await MegaMenu.findOne({ key: 'main_mega_menu' });
      if (!config) {
        // Seed default if not found
        config = await MegaMenu.create({
          key: 'main_mega_menu',
          ...defaultMegaMenuData
        });
      } else if (config.aboutMenu && config.aboutMenu.items) {
        // Ensure aboutMenu has exactly 4 items and links map properly
        const filteredItems = config.aboutMenu.items.filter(item => item.link !== '/commentaires');
        let updated = false;
        if (filteredItems.length !== config.aboutMenu.items.length) {
          config.aboutMenu.items = filteredItems;
          updated = true;
        }
        config.aboutMenu.items.forEach(item => {
          if (item.title === 'Notre valeur ajoutée' && (item.link === '/notre-valeur-ajoutee' || item.link === '/notre-valeur-ajoutee.html')) {
            item.link = '/qui-sommes-nous#notre-philosophie';
            updated = true;
          }
          if (item.title === 'Notre engagement responsable' && (item.link === '/notre-engagement-responsable' || item.link === '/notre-engagement-responsable.html')) {
            item.link = '/qui-sommes-nous#notre-engagement-responsable';
            updated = true;
          }
        });

        // Ensure infosMenu links point to valid anchors
        if (config.infosMenu && config.infosMenu.columns) {
          config.infosMenu.columns.forEach(col => {
            (col.links || []).forEach(lnk => {
              const p = (lnk.path || '').toLowerCase();
              const l = (lnk.label || '').toLowerCase();
              if (p.includes('climat') || p.includes('quand-partir') || l.includes('climat') || l.includes('quand partir')) {
                if (lnk.path !== '/infos-pratiques#climat-geographie') { lnk.path = '/infos-pratiques#climat-geographie'; updated = true; }
              } else if (p.includes('transport') || l.includes('transport')) {
                if (lnk.path !== '/infos-pratiques#transports-chauffeur') { lnk.path = '/infos-pratiques#transports-chauffeur'; updated = true; }
              } else if (p.includes('conseil') || p.includes('faq') || p.includes('question') || l.includes('conseil') || l.includes('faq') || l.includes('question')) {
                if (lnk.path !== '/infos-pratiques#conseils-pratiques') { lnk.path = '/infos-pratiques#conseils-pratiques'; updated = true; }
              }
            });
          });
        }

        if (updated) {
          await config.save();
        }
      }
      return res.json(config);
    }
    if (inMemoryMegaMenu && inMemoryMegaMenu.aboutMenu && inMemoryMegaMenu.aboutMenu.items) {
      inMemoryMegaMenu.aboutMenu.items = inMemoryMegaMenu.aboutMenu.items
        .filter(item => item.link !== '/commentaires')
        .map(item => {
          if (item.title === 'Notre valeur ajoutée' && (item.link === '/notre-valeur-ajoutee' || item.link === '/notre-valeur-ajoutee.html')) {
            return { ...item, link: '/qui-sommes-nous#notre-philosophie' };
          }
          if (item.title === 'Notre engagement responsable' && (item.link === '/notre-engagement-responsable' || item.link === '/notre-engagement-responsable.html')) {
            return { ...item, link: '/qui-sommes-nous#notre-engagement-responsable' };
          }
          return item;
        });
    }
    return res.json(inMemoryMegaMenu);
  } catch (err) {
    console.error('Error fetching Mega Menu config:', err);
    return res.json(inMemoryMegaMenu || defaultMegaMenuData);
  }
});

// @desc    Update Mega Menu configuration
// @route   PUT /api/mega-menu
// @access  Private/Admin
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const updateData = req.body;

    if (isMongoConnected()) {
      let config = await MegaMenu.findOneAndUpdate(
        { key: 'main_mega_menu' },
        { ...updateData, key: 'main_mega_menu' },
        { new: true, upsert: true, runValidators: true }
      );
      inMemoryMegaMenu = config.toObject();
      return res.json({ message: 'Configuration du Mega Menu mise à jour avec succès', data: config });
    }

    inMemoryMegaMenu = {
      ...inMemoryMegaMenu,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return res.json({ message: 'Configuration du Mega Menu mise à jour en mémoire', data: inMemoryMegaMenu });
  } catch (err) {
    console.error('Error updating Mega Menu config:', err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du Mega Menu', error: err.message });
  }
});

// @desc    Reset Mega Menu configuration to default
// @route   POST /api/mega-menu/reset
// @access  Private/Admin
router.post('/reset', protect, adminOnly, async (req, res) => {
  try {
    const freshDefault = JSON.parse(JSON.stringify(defaultMegaMenuData));

    if (isMongoConnected()) {
      const config = await MegaMenu.findOneAndUpdate(
        { key: 'main_mega_menu' },
        { ...freshDefault, key: 'main_mega_menu' },
        { new: true, upsert: true }
      );
      inMemoryMegaMenu = config.toObject();
      return res.json({ message: 'Mega Menu réinitialisé aux valeurs par défaut', data: config });
    }

    inMemoryMegaMenu = freshDefault;
    return res.json({ message: 'Mega Menu réinitialisé aux valeurs par défaut', data: inMemoryMegaMenu });
  } catch (err) {
    console.error('Error resetting Mega Menu config:', err);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation du Mega Menu', error: err.message });
  }
});

export default router;
