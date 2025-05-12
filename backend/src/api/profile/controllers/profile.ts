import { factories } from '@strapi/strapi';
import { Context } from 'koa';

const profileController = factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  async find(ctx: Context) {
    const id = ctx.params.id || ctx.state.user?.id;
    if (!id) {
      return ctx.unauthorized();
    }

    // On récupère l'utilisateur avec les relations nécessaires
    const user = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      id,
      {
        fields: ['id', 'username', 'bio'],
        populate: {
          avatar: true,
          banner: true,
          createdPosts: { fields: ['id', 'title'] },
          authoredComments: {
            fields: ['id', 'content'],
            populate: { post: { fields: ['id', 'title'] } }
          },
          communities: {
            populate: ['banner', 'creator', 'moderators']
          },
        },
      }
    );

    // On formate les communautés pour ajouter isCreator et isModerator
    const userAny = user as any;
    const communities = (userAny.communities || []).map((commu: any) => {
      const isCreator = commu.creator?.id === userAny.id;
      const isModerator = Array.isArray(commu.moderators) && commu.moderators.some((mod: any) => mod.id === userAny.id);
      return {
        id: commu.id,
        name: commu.name,
        banner: commu.banner,
        isCreator,
        isModerator,
      };
    });

    ctx.body = {
      id: userAny.id,
      username: userAny.username,
      bio: userAny.bio,
      banner: userAny.banner,
      avatar: userAny.avatar,
      createdPosts: userAny.createdPosts || [],
      communities,
      authoredComments: (userAny.authoredComments || []).map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        post: comment.post ? { id: comment.post.id, title: comment.post.title } : null,
      })),
    };
  },
}));

export default profileController; 