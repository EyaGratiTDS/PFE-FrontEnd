import { aiService, AIGenerateVCardFullRequest, AIGenerateVCardFullResponse } from './api';

/**
 * Service AI pour la génération complète de VCard
 */
class AIVCardService {
  /**
   * Générer une VCard complète (sans sauvegarde selon le backend)
   */
  async generateVCard(data: AIGenerateVCardFullRequest): Promise<AIGenerateVCardFullResponse> {
    try {
      const response = await aiService.generateVCard({
        job: data.job,
        skills: data.skills,
        userId: data.userId
      });
      
      // Le backend retourne: { success: true, data: { project, vcard, blocks }, savedToDB: false }
      const responseData = response;
      
      // Vérifier si la réponse a le bon format
      if (!responseData.success || !responseData.data) {
        throw new Error('Réponse invalide du serveur: format incorrect');
      }
      
      const result = responseData.data;
      
      // S'assurer que la structure est correcte
      if (!result.project || !result.vcard || !result.blocks) {
        throw new Error('Réponse invalide du serveur: structure incomplète');
      }
      
      // Les données viennent directement du backend (pas de dataValues car pas sauvegardées)
      const project = result.project;
      const vcard = result.vcard;
      const blocks = Array.isArray(result.blocks) ? result.blocks : [];
      
      // Valider les propriétés obligatoires
      if (!project.name || !vcard.name) {
        throw new Error('Réponse invalide du serveur: propriétés manquantes');
      }
      
      console.log('✅ VCard generated successfully (not saved):', result);
      console.log('📝 Backend savedToDB:', responseData.savedToDB);
      console.log('🎨 Background details:', {
        background_type: vcard.background_type,
        background_value: vcard.background_value
      });
      
      return {
        project: {
          id: project.id || undefined, // Pas d'ID car pas encore sauvegardé
          name: project.name || 'Projet généré',
          description: project.description || '',
          color: project.color || '#6366f1',
          status: project.status || 'active'
        },
        vcard: {
          id: vcard.id || undefined, // Pas d'ID car pas encore sauvegardé
          name: vcard.name || 'VCard générée',
          description: vcard.description || '',
          logo: vcard.logo || null,
          favicon: vcard.favicon || null,
          background_value: vcard.background_value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          background_type: vcard.background_type || 'gradient',
          font_family: vcard.font_family || 'Inter',
          font_size: vcard.font_size || 16,
          is_active: vcard.is_active !== undefined ? vcard.is_active : true,
          is_share: vcard.is_share !== undefined ? vcard.is_share : true,
          is_downloaded: vcard.is_downloaded !== undefined ? vcard.is_downloaded : false,
          url: vcard.url || '',
          qr_code: vcard.qr_code || null,
          views: vcard.views || 0,
          status: vcard.status !== undefined ? vcard.status : true,
          search_engine_visibility: vcard.search_engine_visibility !== undefined ? vcard.search_engine_visibility : true,
          remove_branding: vcard.remove_branding !== undefined ? vcard.remove_branding : false
        },
        blocks: blocks.map((block: any) => ({
          id: block.id || undefined, // Pas d'ID car pas encore sauvegardé
          name: block.name || 'Block généré',
          description: block.description || '',
          type_block: block.type_block || 'text',
          status: block.status !== undefined ? block.status : true
        }))
      };
      
    } catch (error: any) {
      console.error('Error generating VCard:', error);
      
      // Si c'est une erreur de validation, la relancer telle quelle
      if (error.message?.includes('Réponse invalide')) {
        throw error;
      }
      
      // Pour les autres erreurs, fournir un message plus clair
      if (error.response?.status === 400) {
        throw new Error('Données invalides: ' + (error.response.data?.error || 'Vérifiez vos informations'));
      } else if (error.response?.status === 401) {
        throw new Error('Non autorisé: Veuillez vous reconnecter');
      } else if (error.response?.status >= 500) {
        throw new Error('Erreur serveur: Service temporairement indisponible');
      }
      
      throw new Error('Erreur lors de la génération: ' + (error.message || 'Problème de connexion'));
    }
  }

  /**
   * Notifier le backend de l'action de l'utilisateur avec les données complètes
   */
  async notifyUserAction(action: 'accept' | 'regenerate', userId: number, vcardData?: AIGenerateVCardFullResponse, vcardId?: number): Promise<AIGenerateVCardFullResponse | null> {
    try {
      const requestBody: any = {
        action: action,
        userId: userId
      };

      // Pour l'action "accept", envoyer toutes les données comme le backend l'attend
      if (action === 'accept' && vcardData) {
        requestBody.vcardData = vcardData.vcard;
        requestBody.projectData = vcardData.project;
        requestBody.blocksData = vcardData.blocks;
      }

      // Pour l'action "regenerate", envoyer l'ID si disponible
      if (action === 'regenerate' && vcardId) {
        requestBody.vcardId = vcardId;
      }

      console.log(`🔄 Sending ${action} action to backend:`, {
        action,
        userId,
        hasVcardData: !!requestBody.vcardData,
        hasProjectData: !!requestBody.projectData,
        blocksCount: requestBody.blocksData?.length || 0,
        vcardId: requestBody.vcardId
      });

      const response = await aiService.notifyVCardAction(requestBody);
      
      const responseData = response;
      
      if (!responseData.success) {
        throw new Error(responseData.message || `Erreur lors de l'action ${action}`);
      }

      console.log(`✅ User action "${action}" processed successfully`);

      // Si c'est une acceptation, retourner les données sauvegardées
      if (action === 'accept' && responseData.data) {
        const result = responseData.data;
        
        // Extraire les données des objets Sequelize (dataValues)
        const project = result.project.dataValues || result.project;
        const vcard = result.vcard.dataValues || result.vcard;
        const blocks = Array.isArray(result.blocks) 
          ? result.blocks.map((block: any) => block.dataValues || block)
          : [];

        return {
          project: {
            id: project.id,
            name: project.name || 'Projet généré',
            description: project.description || '',
            color: project.color || '#6366f1',
            status: project.status || 'active'
          },
          vcard: {
            id: vcard.id,
            name: vcard.name || 'VCard générée',
            description: vcard.description || '',
            logo: vcard.logo || null,
            favicon: vcard.favicon || null,
            background_value: vcard.background_value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            background_type: (vcard.background_type === 'image' ? 'custom-image' : vcard.background_type) || 'gradient',
            font_family: vcard.font_family || 'Inter',
            font_size: vcard.font_size || 16,
            is_active: vcard.is_active !== undefined ? vcard.is_active : true,
            is_share: vcard.is_share !== undefined ? vcard.is_share : true,
            is_downloaded: vcard.is_downloaded !== undefined ? vcard.is_downloaded : false,
            url: vcard.url || '',
            qr_code: vcard.qr_code || null,
            views: vcard.views || 0,
            status: vcard.status !== undefined ? vcard.status : true,
            search_engine_visibility: vcard.search_engine_visibility !== undefined ? vcard.search_engine_visibility : true,
            remove_branding: vcard.remove_branding !== undefined ? vcard.remove_branding : false
          },
          blocks: blocks.map((block: any) => ({
            id: block.id,
            name: block.name || 'Block généré',
            description: block.description || '',
            type_block: block.type_block || 'text',
            status: block.status !== undefined ? block.status : true
          }))
        };
      }

      // Pour regenerate, pas de données à retourner
      return null;
      
    } catch (error: any) {
      console.error('Error notifying user action:', error);
      
      // Pour les actions critiques (accept), relancer l'erreur
      if (action === 'accept') {
        if (error.response?.status === 400) {
          throw new Error('Données invalides pour la sauvegarde: ' + (error.response.data?.error || 'Vérifiez les données'));
        } else if (error.response?.status === 401) {
          throw new Error('Non autorisé: Veuillez vous reconnecter');
        } else if (error.response?.status >= 500) {
          throw new Error('Erreur serveur: Service temporairement indisponible');
        }
        
        throw new Error('Erreur lors de la sauvegarde: ' + (error.message || 'Problème de connexion'));
      } else {
        // Pour regenerate, juste logger l'erreur sans la relancer
        console.warn(`Failed to notify ${action} action, continuing...`);
        return null;
      }
    }
  }
}

// Instance singleton
export const aiVCardService = new AIVCardService();

// Export par défaut pour compatibilité
export default aiVCardService;