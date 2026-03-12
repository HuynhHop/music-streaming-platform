const artistService = require('../services/artistService');
const apiClient = require('../services/apiClient');

// Mock apiClient
jest.mock('../services/apiClient', () => ({
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
}));

describe('artistService', () => {
  describe('createArtist', () => {
    it('should create an artist successfully', async () => {
      apiClient.post.mockResolvedValue({ data: { fullName: 'Artist Name', desc: 'Description', isValidation: true } });

      const fullName = 'Artist Name';
      const desc = 'Description';
      const isValidation = true;

      const result = await artistService.createArtist(fullName, desc, isValidation);
      expect(result.fullName).toBe('Artist Name');
      expect(result.desc).toBe('Description');
      expect(result.isValidation).toBe(true);
    });

    it('should throw an error if creation fails', async () => {
      apiClient.post.mockRejectedValue(new Error('Failed to create artist'));

      const fullName = 'Artist Name';
      const desc = 'Description';
      const isValidation = true;

      await expect(artistService.createArtist(fullName, desc, isValidation)).rejects.toThrow('Failed to create artist');
    });
  });

  describe('updateArtist', () => {
    it('should update an artist successfully', async () => {
      apiClient.patch.mockResolvedValue({ data: { fullName: 'Updated Name', desc: 'Updated Description' } });

      const artistId = '1';
      const updatedData = { fullName: 'Updated Name', desc: 'Updated Description' };

      const result = await artistService.updateArtist(artistId, updatedData);
      expect(result.fullName).toBe('Updated Name');
      expect(result.desc).toBe('Updated Description');
    });

    it('should throw an error if update fails', async () => {
      apiClient.patch.mockRejectedValue(new Error('Failed to update artist'));

      const artistId = '1';
      const updatedData = { fullName: 'Updated Name', desc: 'Updated Description' };

      await expect(artistService.updateArtist(artistId, updatedData)).rejects.toThrow('Failed to update artist');
    });
  });

  describe('deleteArtist', () => {
    it('should delete an artist successfully', async () => {
      apiClient.delete.mockResolvedValue({ data: { message: 'Artist deleted successfully' } });

      const artistId = '1';

      const result = await artistService.deleteArtist(artistId);
      expect(result.message).toBe('Artist deleted successfully');
    });

    it('should throw an error if deletion fails', async () => {
      apiClient.delete.mockRejectedValue(new Error('Failed to delete artist'));

      const artistId = '1';

      await expect(artistService.deleteArtist(artistId)).rejects.toThrow('Failed to delete artist');
    });
  });

  describe('getArtistById', () => {
    it('should get artist data by ID successfully', async () => {
      apiClient.get.mockResolvedValue({ data: { id: '1', fullName: 'Artist Name', desc: 'Description' } });

      const artistId = '1';

      const result = await artistService.getArtistById(artistId);
      expect(result.id).toBe('1');
      expect(result.fullName).toBe('Artist Name');
      expect(result.desc).toBe('Description');
    });

    it('should throw an error if fetching artist by ID fails', async () => {
      apiClient.get.mockRejectedValue(new Error('Failed to fetch artist'));

      const artistId = '1';

      await expect(artistService.getArtistById(artistId)).rejects.toThrow('Failed to fetch artist');
    });
  });

  describe('getAllArtists', () => {
    it('should get all artists successfully', async () => {
      const mockArtists = [
        { id: '1', fullName: 'Artist One', desc: 'Description One', isValidation: true },
        { id: '2', fullName: 'Artist Two', desc: 'Description Two', isValidation: false }
      ];

      apiClient.get.mockResolvedValue({ data: mockArtists });

      const result = await artistService.getAllArtists();
      expect(result).toEqual(mockArtists);
    });

    it('should throw an error if fetching all artists fails', async () => {
      apiClient.get.mockRejectedValue(new Error('Failed to fetch artists'));

      await expect(artistService.getAllArtists()).rejects.toThrow('Failed to fetch artists');
    });
  });
});
