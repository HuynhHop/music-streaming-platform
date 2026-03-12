const notifyService = require('../services/notifyService') ; // Đảm bảo đường dẫn chính xác
const apiClient = require('../services/apiClient'); // Import apiClient để mock

// Mock apiClient
jest.mock('../services/apiClient', () => ({
  post: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  patch: jest.fn(),
}));

describe('notifyService', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test to ensure clean tests
  });

  test('createNotify should call apiClient.post and return data', async () => {
    const mockResponse = { data: { message: 'Notify created' } };
    apiClient.post.mockResolvedValue(mockResponse); // Mock thành công của API

    const user = 'user1';
    const type = 'type1';
    const song = 'song1';
    const content = 'This is a notification content';

    const result = await notifyService.createNotify(user, type, song, content);

    expect(apiClient.post).toHaveBeenCalledWith('/notifies', { user, type, song, content });
    expect(result).toEqual(mockResponse.data);
  });

  test('createNotifies should call apiClient.post and return data', async () => {
    const mockResponse = { data: { message: 'Bulk notifies created' } };
    apiClient.post.mockResolvedValue(mockResponse); // Mock thành công của API

    const users = ['user1', 'user2'];
    const type = 'type1';
    const song = 'song1';
    const content = 'This is a bulk notification content';

    const result = await notifyService.createNotifies(users, type, song, content);

    expect(apiClient.post).toHaveBeenCalledWith('/notifies/bulk', { users, type, song, content });
    expect(result).toEqual(mockResponse.data);
  });

  test('removeNotify should call apiClient.delete and return data', async () => {
    const mockResponse = { data: { message: 'Notify removed' } };
    apiClient.delete.mockResolvedValue(mockResponse); // Mock thành công của API

    const notifyId = 'notify123';

    const result = await notifyService.removeNotify(notifyId);

    expect(apiClient.delete).toHaveBeenCalledWith(`/notifies/${notifyId}`);
    expect(result).toEqual(mockResponse.data);
  });

  test('getNotifies should call apiClient.get and return data', async () => {
    const mockResponse = { data: { message: 'Notify details' } };
    apiClient.get.mockResolvedValue(mockResponse); // Mock thành công của API

    const notifyId = 'notify123';

    const result = await notifyService.getNotifies(notifyId);

    expect(apiClient.get).toHaveBeenCalledWith(`/notifies/${notifyId}`);
    expect(result).toEqual(mockResponse.data);
  });

  test('isReadNotify should call apiClient.patch and return data', async () => {
    const mockResponse = { data: { message: 'Notify marked as read' } };
    apiClient.patch.mockResolvedValue(mockResponse); // Mock thành công của API

    const notifyId = 'notify123';

    const result = await notifyService.isReadNotify(notifyId);

    expect(apiClient.patch).toHaveBeenCalledWith(`/notifies/is-read/${notifyId}`);
    expect(result).toEqual(mockResponse.data);
  });

  // Test cho trường hợp lỗi
  test('createNotify should throw error when apiClient.post fails', async () => {
    const mockError = new Error('Something went wrong');
    apiClient.post.mockRejectedValue(mockError); // Mock lỗi

    const user = 'user1';
    const type = 'type1';
    const song = 'song1';
    const content = 'This is a notification content';

    await expect(notifyService.createNotify(user, type, song, content)).rejects.toThrow('Something went wrong');
  });
});
