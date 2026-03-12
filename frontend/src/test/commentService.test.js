// Import các mô-đun cần thiết
const commentService = require('../services/commentService'); // Đảm bảo đường dẫn chính xác
const apiClient = require('../services/apiClient');

// Mock apiClient
jest.mock('../services/apiClient', () => ({
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
}));

describe('commentService', () => {
  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      // Mock apiClient.post để trả về một dữ liệu thành công
      apiClient.post.mockResolvedValue({ data: { user: 'testuser', song: 'testsong', content: 'Great song!' } });

      const user = { username: 'testuser' };
      const song = { title: 'Test Song' };
      const content = 'Great song!';

      const result = await commentService.createComment(user, song, content);
      expect(result.user).toBe('testuser');
      expect(result.song).toBe('testsong');
      expect(result.content).toBe('Great song!');
    });

    it('should throw an error if creation fails', async () => {
      // Mock apiClient.post để trả về lỗi
      apiClient.post.mockRejectedValue(new Error('Failed to create comment'));

      const user = { username: 'testuser' };
      const song = { title: 'Test Song' };
      const content = 'Great song!';

      await expect(commentService.createComment(user, song, content)).rejects.toThrow('Failed to create comment');
    });
  });

  describe('updateComment', () => {
    it('should update a comment successfully', async () => {
      // Mock apiClient.patch để trả về dữ liệu cập nhật thành công
      apiClient.patch.mockResolvedValue({ data: { content: 'Updated comment' } });

      const commentId = '12345';
      const newContent = 'Updated comment';

      const result = await commentService.updateComment(commentId, newContent);
      expect(result.content).toBe('Updated comment');
    });

    it('should throw an error if update fails', async () => {
      // Mock apiClient.patch để trả về lỗi
      apiClient.patch.mockRejectedValue(new Error('Failed to update comment'));

      const commentId = '12345';
      const newContent = 'Updated comment';

      await expect(commentService.updateComment(commentId, newContent)).rejects.toThrow('Failed to update comment');
    });
  });

  describe('removeComment', () => {
    it('should remove a comment successfully', async () => {
      // Mock apiClient.delete để trả về thành công
      apiClient.delete.mockResolvedValue({ data: { message: 'Comment deleted' } });

      const commentId = '12345';
      const result = await commentService.removeComment(commentId);
      expect(result.message).toBe('Comment deleted');
    });

    it('should throw an error if removal fails', async () => {
      // Mock apiClient.delete để trả về lỗi
      apiClient.delete.mockRejectedValue(new Error('Failed to delete comment'));

      const commentId = '12345';
      await expect(commentService.removeComment(commentId)).rejects.toThrow('Failed to delete comment');
    });
  });

  describe('getCommentsBySongId', () => {
    it('should get comments by songId successfully', async () => {
      // Mock apiClient.get để trả về danh sách bình luận
      apiClient.get.mockResolvedValue({ data: [{ user: 'user1', content: 'Great song!' }] });

      const songId = 'song1';
      const result = await commentService.getCommentsBySongId(songId);
      expect(result).toEqual([{ user: 'user1', content: 'Great song!' }]);
    });

    it('should throw an error if fetching comments fails', async () => {
      // Mock apiClient.get để trả về lỗi
      apiClient.get.mockRejectedValue(new Error('Failed to fetch comments'));

      const songId = 'song1';
      await expect(commentService.getCommentsBySongId(songId)).rejects.toThrow('Failed to fetch comments');
    });
  });
});
