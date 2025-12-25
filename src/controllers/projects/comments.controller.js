const { db } = require('../../models');

class CommentsController {
  // Get all comments for a project
  static async getComments(req, res) {
    try {
      const { projectId } = req.params;
      
      // Validate projectId
      if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
      }
      
      const comments = await db.ProjectComment.findAll({
        where: { 
          project_id: projectId,
          parent_comment_id: null // Only top-level comments
        },
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: db.ProjectComment,
            as: 'replies',
            required: false, // LEFT JOIN to include comments without replies
            include: [{
              model: db.User,
              as: 'user',
              attributes: ['id', 'first_name', 'last_name', 'email']
            }],
            order: [['created_at', 'ASC']]
          },
          {
            model: db.CommentLike,
            as: 'likes',
            include: [{
              model: db.User,
              as: 'user',
              attributes: ['id', 'first_name', 'last_name']
            }]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // Get current user's likes
      const userId = req.user?.id;
      const userLikes = userId ? await db.CommentLike.findAll({
        where: { user_id: userId },
        attributes: ['comment_id']
      }) : [];

      const likedCommentIds = new Set(userLikes.map(like => like.comment_id));

      // Format comments with like status
      const formattedComments = comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        mentions: comment.mentions || [],
        likes_count: comment.likes_count,
        is_liked: likedCommentIds.has(comment.id),
        created_at: comment.created_at ? new Date(comment.created_at).toISOString() : new Date().toISOString(),
        updated_at: comment.updated_at ? new Date(comment.updated_at).toISOString() : new Date().toISOString(),
        user: comment.user ? {
          id: comment.user.id,
          name: `${comment.user.first_name || ''} ${comment.user.last_name || ''}`.trim() || 'Unknown User',
          email: comment.user.email
        } : null,
        replies: comment.replies
          ?.filter(reply => reply.project_id === projectId) // Ensure replies belong to this project
          .map(reply => ({
            id: reply.id,
            content: reply.content,
            mentions: reply.mentions || [],
            likes_count: reply.likes_count,
            is_liked: likedCommentIds.has(reply.id),
            created_at: reply.created_at ? new Date(reply.created_at).toISOString() : new Date().toISOString(),
            user: reply.user ? {
              id: reply.user.id,
              name: `${reply.user.first_name || ''} ${reply.user.last_name || ''}`.trim() || 'Unknown User',
              email: reply.user.email
            } : null
          })) || []
      }));

      return res.json({ comments: formattedComments });
    } catch (error) {
      console.error('Get Comments Error:', error);
      return res.status(500).json({ message: 'Error fetching comments' });
    }
  }

  // Create a new comment
  static async createComment(req, res) {
    try {
      const { projectId } = req.params;
      const { content, parent_comment_id, mentions } = req.body;
      const userId = req.user?.id || 1; // Fallback for testing

      // Validate projectId
      if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Comment content is required' });
      }

      // If this is a reply, verify the parent comment belongs to the same project
      if (parent_comment_id) {
        const parentComment = await db.ProjectComment.findByPk(parent_comment_id);
        if (!parentComment) {
          return res.status(404).json({ message: 'Parent comment not found' });
        }
        if (parentComment.project_id !== projectId) {
          return res.status(403).json({ message: 'Cannot reply to comment from different project' });
        }
      }

      const comment = await db.ProjectComment.create({
        project_id: projectId,
        user_id: userId,
        content: content.trim(),
        parent_comment_id: parent_comment_id || null,
        mentions: mentions || []
      });

      // Fetch the created comment with user info
      const createdComment = await db.ProjectComment.findByPk(comment.id, {
        include: [{
          model: db.User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }]
      });

      return res.status(201).json({
        success: true,
        comment: {
          id: createdComment.id,
          content: createdComment.content,
          mentions: createdComment.mentions || [],
          likes_count: 0,
          is_liked: false,
          created_at: createdComment.created_at ? new Date(createdComment.created_at).toISOString() : new Date().toISOString(),
          user: createdComment.user ? {
            id: createdComment.user.id,
            name: `${createdComment.user.first_name || ''} ${createdComment.user.last_name || ''}`.trim() || 'Unknown User',
            email: createdComment.user.email
          } : null,
          replies: []
        }
      });
    } catch (error) {
      console.error('Create Comment Error:', error);
      return res.status(500).json({ message: 'Error creating comment' });
    }
  }

  // Toggle like on a comment
  static async toggleLike(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user?.id || 1; // Fallback for testing

      const existingLike = await db.CommentLike.findOne({
        where: { comment_id: commentId, user_id: userId }
      });

      const comment = await db.ProjectComment.findByPk(commentId);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (existingLike) {
        // Unlike
        await existingLike.destroy();
        await comment.decrement('likes_count');
        return res.json({ 
          success: true, 
          liked: false, 
          likes_count: Math.max(0, comment.likes_count - 1) 
        });
      } else {
        // Like
        await db.CommentLike.create({
          comment_id: commentId,
          user_id: userId
        });
        await comment.increment('likes_count');
        return res.json({ 
          success: true, 
          liked: true, 
          likes_count: comment.likes_count + 1 
        });
      }
    } catch (error) {
      console.error('Toggle Like Error:', error);
      return res.status(500).json({ message: 'Error toggling like' });
    }
  }

  // Get users for @mention autocomplete
  static async getMentionUsers(req, res) {
    try {
      const users = await db.User.findAll({
        where: { is_active: true },
        attributes: ['id', 'first_name', 'last_name', 'email'],
        limit: 50
      });

      const formattedUsers = users.map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User',
        email: user.email
      }));

      return res.json({ users: formattedUsers });
    } catch (error) {
      console.error('Get Mention Users Error:', error);
      return res.status(500).json({ message: 'Error fetching users' });
    }
  }
}

module.exports = CommentsController;

