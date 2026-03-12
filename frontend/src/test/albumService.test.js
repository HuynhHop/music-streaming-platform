// Import necessary modules
const albumService = require('../services/albumService'); // Ensure the correct path
const apiClient = require('../services/apiClient');

// Mock apiClient
jest.mock('../services/apiClient', () => ({
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
}));

describe('albumService', () => {
  describe('createAlbum', () => {
    it('should create an album successfully', async () => {
      apiClient.post.mockResolvedValue({ data: { creator: 'testCreator', title: 'Test Album', desc: 'Test description', linkImg: 'link.jpg', songs: [] } });

      const creator = 'testCreator';
      const title = 'Test Album';
      const songs = [];
      const desc = 'Test description';
      const linkImg = 'link.jpg';

      const result = await albumService.createAlbum(creator, title, songs, desc, linkImg);
      expect(result.creator).toBe('testCreator');
      expect(result.title).toBe('Test Album');
      expect(result.desc).toBe('Test description');
      expect(result.linkImg).toBe('link.jpg');
    });

    it('should throw an error if album creation fails', async () => {
      apiClient.post.mockRejectedValue(new Error('Failed to create album'));

      const creator = 'testCreator';
      const title = 'Test Album';
      const songs = [];
      const desc = 'Test description';
      const linkImg = 'link.jpg';

      await expect(albumService.createAlbum(creator, title, songs, desc, linkImg)).rejects.toThrow('Failed to create album');
    });
  });

  describe('updateAlbum', () => {
    it('should update an album successfully', async () => {
      apiClient.patch.mockResolvedValue({ data: { title: 'Updated Album', desc: 'Updated description', linkImg: 'newLink.jpg' } });

      const albumId = '12345';
      const title = 'Updated Album';
      const songs = [];
      const desc = 'Updated description';
      const linkImg = 'newLink.jpg';

      const result = await albumService.updateAlbum(albumId, title, songs, desc, linkImg);
      expect(result.title).toBe('Updated Album');
      expect(result.desc).toBe('Updated description');
      expect(result.linkImg).toBe('newLink.jpg');
    });

    it('should throw an error if update fails', async () => {
      apiClient.patch.mockRejectedValue(new Error('Failed to update album'));

      const albumId = '12345';
      const title = 'Updated Album';
      const songs = [];
      const desc = 'Updated description';
      const linkImg = 'newLink.jpg';

      await expect(albumService.updateAlbum(albumId, title, songs, desc, linkImg)).rejects.toThrow('Failed to update album');
    });
  });

  describe('deleteAlbum', () => {
    it('should delete an album successfully', async () => {
      apiClient.delete.mockResolvedValue({ data: { message: 'Album deleted successfully' } });

      const albumId = '12345';
      const result = await albumService.deleteAlbum(albumId);
      expect(result.message).toBe('Album deleted successfully');
    });

    it('should throw an error if deletion fails', async () => {
      apiClient.delete.mockRejectedValue(new Error('Failed to delete album'));

      const albumId = '12345';
      await expect(albumService.deleteAlbum(albumId)).rejects.toThrow('Failed to delete album');
    });
  });

  describe('getAlbums', () => {
    it('should retrieve all albums successfully', async () => {
      apiClient.get.mockResolvedValue({ data: [{ title: 'Album 1' }, { title: 'Album 2' }] });

      const result = await albumService.getAlbums();
      expect(result).toEqual([{ title: 'Album 1' }, { title: 'Album 2' }]);
    });

    it('should throw an error if fetching albums fails', async () => {
      apiClient.get.mockRejectedValue(new Error('Failed to fetch albums'));

      await expect(albumService.getAlbums()).rejects.toThrow('Failed to fetch albums');
    });
  });

  describe('getAlbumById', () => {
    it('should retrieve an album by ID successfully', async () => {
      apiClient.get.mockResolvedValue({ data: { title: 'Specific Album', desc: 'Album description', linkImg: 'album.jpg' } });

      const albumId = 'album1';
      const result = await albumService.getAlbumById(albumId);
      expect(result.title).toBe('Specific Album');
      expect(result.desc).toBe('Album description');
      expect(result.linkImg).toBe('album.jpg');
    });

    it('should throw an error if fetching the album by ID fails', async () => {
      apiClient.get.mockRejectedValue(new Error('Failed to fetch album'));

      const albumId = 'album1';
      await expect(albumService.getAlbumById(albumId)).rejects.toThrow('Failed to fetch album');
    });
  });
});
