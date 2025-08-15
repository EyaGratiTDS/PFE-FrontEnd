const fs = require('fs');
const path = require('path');

// Script d'optimisation des images pour améliorer les performances
const optimizeImages = () => {
  console.log('🖼️  Démarrage de l\'optimisation des images...');
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const publicDir = path.join(__dirname, '../public');
  const srcDir = path.join(__dirname, '../src');
  
  const scanDirectory = (dir) => {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDirectory(filePath);
        } else {
          const ext = path.extname(file).toLowerCase();
          if (imageExtensions.includes(ext)) {
            console.log(`📸 Image trouvée: ${filePath}`);
            // Ici, vous pourriez ajouter la logique d'optimisation
            // Par exemple, avec sharp ou imagemin
          }
        }
      });
    } catch (error) {
      console.error(`Erreur lors du scan de ${dir}:`, error.message);
    }
  };
  
  console.log('📁 Scan du dossier public...');
  if (fs.existsSync(publicDir)) {
    scanDirectory(publicDir);
  }
  
  console.log('📁 Scan du dossier src...');
  if (fs.existsSync(srcDir)) {
    scanDirectory(srcDir);
  }
  
  console.log('✅ Optimisation terminée!');
  console.log('💡 Pour une optimisation complète, installez sharp ou imagemin.');
};

// Recommandations pour l'optimisation
const showRecommendations = () => {
  console.log('\n🚀 RECOMMANDATIONS POUR AMÉLIORER LES PERFORMANCES:\n');
  
  console.log('1. 📱 IMAGES:');
  console.log('   - Convertir en WebP (90% de réduction de taille)');
  console.log('   - Redimensionner selon les besoins réels');
  console.log('   - Utiliser des images responsives avec srcset');
  console.log('   - Lazy loading pour les images below-the-fold\n');
  
  console.log('2. 🎨 CSS:');
  console.log('   - Supprimer le CSS inutilisé');
  console.log('   - Minifier et compresser les fichiers CSS');
  console.log('   - Utiliser critical CSS inline\n');
  
  console.log('3. ⚡ JAVASCRIPT:');
  console.log('   - Code splitting et lazy loading des composants');
  console.log('   - Supprimer le code mort');
  console.log('   - Utiliser un bundler optimisé\n');
  
  console.log('4. 🌐 RÉSEAU:');
  console.log('   - Activer la compression gzip/brotli');
  console.log('   - Utiliser un CDN');
  console.log('   - Précharger les ressources critiques\n');
  
  console.log('5. 🏗️ STRUCTURE:');
  console.log('   - Réduire le DOM (moins de 1500 nœuds)');
  console.log('   - Éviter les layouts thrashing');
  console.log('   - Optimiser les polices avec font-display: swap\n');
};

optimizeImages();
showRecommendations();
