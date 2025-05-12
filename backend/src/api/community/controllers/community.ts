/**
 * community controller
 */

import { factories } from '@strapi/strapi'

interface StrapiUser {
  id: number;
  username?: string;
  email?: string;
  provider?: string;
  password?: string;
  resetPasswordToken?: string;
  confirmationToken?: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: any;
  communities?: Array<{ id: number }>;
  moderatedCommunities?: Array<{ id: number }>;
  createdCommunities?: Array<{ id: number }>;
  createdAt?: string;
  updatedAt?: string;
}

interface StrapiCommunity {
  id: number;
  name?: string;
  description?: string;
  isPrivate?: boolean;
  creator?: {
    id: number;
    username: string;
  };
  members?: Array<{
    id: number;
    username: string;
  }>;
  moderators?: Array<{
    id: number;
    username: string;
  }>;
  posts?: Array<{
    id: number;
    title: string;
    content: string;
    media?: Array<{
      url: string;
    }>;
  }>;
  avatar?: any;
  banner?: any;
  rules?: any;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

const createCommunityController = factories.createCoreController('api::community.community', ({ strapi }) => ({
  async create(ctx) {
    try {
      const userId = ctx.state.user.id;
      
      // Nettoyer le nom de la communauté en remplaçant les espaces multiples par un seul espace
      let communityData = { ...ctx.request.body.data };
      if (communityData.name) {
        communityData.name = communityData.name.trim().replace(/\s+/g, ' ');
        
        // Créer un slug à partir du nom (remplacer les espaces par des tirets)
        communityData.slug = communityData.name.toLowerCase().replace(/\s+/g, '-');
      }
      
      // Ajout automatique du créateur comme membre et modérateur
      const data = {
        ...communityData,
        creator: userId,
        moderators: [userId],
        members: [userId]
      };

      // Création de la communauté avec le service Strapi
      const entry = await strapi.entityService.create('api::community.community', {
        data: data,
        populate: {
          creator: true,
          members: true,
          moderators: true
        }
      });

      return { data: entry };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async findByName(ctx) {
    try {
      const { name } = ctx.params;

      const entry = await strapi.entityService.findMany('api::community.community', {
        filters: {
          $or: [
            { name: { $eq: name } },
            { slug: { $eq: name } }
          ]
        },
        populate: {
          creator: {
            fields: ['id', 'username', 'email']
          },
          members: {
            fields: ['id', 'username']
          },
          moderators: {
            fields: ['id', 'username']
          },
          posts: {
            populate: {
              media: true
            }
          },
          avatar: true,
          banner: true
        }
      }) as StrapiCommunity[];

      if (!entry || entry.length === 0) {
        return ctx.notFound('Communauté non trouvée');
      }

      const community = entry[0];

      return { 
        data: {
          id: community.id,
          name: community.name,
          description: community.description,
          isPrivate: community.isPrivate,
          rules: community.rules,
          slug: community.slug,
          createdAt: community.createdAt,
          creator: community.creator,
          members: community.members,
          moderators: community.moderators,
          posts: community.posts,
          avatar: community.avatar,
          banner: community.banner
        }
      };
    } catch (error) {
      return ctx.throw(500, error);
    }
  },

  async findUserCommunities(ctx) {
    try {
      const { id } = ctx.params;
      
      // Vérifier si l'utilisateur existe
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', id, {
        populate: ['communities', 'moderatedCommunities', 'createdCommunities']
      }) as unknown as StrapiUser;

      if (!user) {
        return ctx.notFound('Utilisateur non trouvé');
      }

      // Récupérer tous les IDs uniques des communautés
      const communityIds = new Set([
        ...(user.communities?.map(c => c.id) || []),
        ...(user.moderatedCommunities?.map(c => c.id) || []),
        ...(user.createdCommunities?.map(c => c.id) || [])
      ]);

      // Récupérer les détails complets des communautés
      const communities = await strapi.entityService.findMany('api::community.community', {
        filters: {
          id: {
            $in: Array.from(communityIds)
          }
        },
        populate: {
          creator: {
            fields: ['id', 'username']
          },
          members: {
            fields: ['id', 'username']
          },
          moderators: {
            fields: ['id', 'username']
          },
          avatar: true,
          banner: true
        }
      }) as StrapiCommunity[];

      return {
        data: communities.map(community => ({
          ...community,
          userRole: {
            isCreator: community.creator?.id === parseInt(id),
            isModerator: user.moderatedCommunities?.some(c => c.id === community.id) || false,
            isMember: user.communities?.some(c => c.id === community.id) || false
          }
        }))
      };
    } catch (error) {
      return ctx.throw(500, error);
    }
  }
}));

export default createCommunityController;
