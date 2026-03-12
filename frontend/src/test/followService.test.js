// services/followService.test.js

const followService = require('../services/followService');  // Đảm bảo đường dẫn chính xác
const apiClient = require('../services/apiClient');  // Import apiClient để mock

// Mock apiClient
jest.mock('../services/apiClient', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

describe('followService', () => {
  afterEach(() => {
    jest.clearAllMocks();  // Clear mocks after each test to ensure clean tests
  });

  test('followUser should call apiClient.post and return data', async () => {
    const targetUserId = '67245dc12dc83f5f7efb484e';
    const mockResponse = { data: { message: 'Followed successfully' } };

    // Mock thành công của API
    apiClient.post.mockResolvedValue(mockResponse);

    const result = await followService.followUser(targetUserId);

    expect(apiClient.post).toHaveBeenCalledWith(`/follows/${targetUserId}`);
    expect(result).toEqual(mockResponse.data);
  });

  test('getFollowing should call apiClient.get and return following list', async () => {
    const mockResponse = {
      data: { following: [{ username: 'user1' }, { username: 'user2' }] },
    };

    // Mock thành công của API
    apiClient.get.mockResolvedValue(mockResponse);

    const result = await followService.getFollowing();

    expect(apiClient.get).toHaveBeenCalledWith('/follows/following');
    expect(result.following).toHaveLength(2);
    expect(result.following[0].username).toBe('user1');
  });

  test('getFollowers should call apiClient.get and return followers list', async () => {
    const mockResponse = {
      data: { followers: [{ username: 'user3' }, { username: 'user4' }] },
    };

    // Mock thành công của API
    apiClient.get.mockResolvedValue(mockResponse);

    const result = await followService.getFollowers();

    expect(apiClient.get).toHaveBeenCalledWith('/follows/followers');
    expect(result.followers).toHaveLength(2);
    expect(result.followers[0].username).toBe('user3');
  });

  // // Test cho trường hợp lỗi
  // test('followUser should throw error when apiClient.post fails', async () => {
  //   const targetUserId = '60d21b4667d0d8992e610c85';
  //   const mockError = new Error('User not found');
    
  //   // Mock lỗi của API
  //   apiClient.post.mockRejectedValue(mockError);

  //   await expect(followService.followUser(targetUserId)).rejects.toThrow('User not found');
  // });

  // test('getFollowing should throw error when apiClient.get fails', async () => {
  //   const mockError = new Error('Error fetching following');
    
  //   // Mock lỗi của API
  //   apiClient.get.mockRejectedValue(mockError);

  //   await expect(followService.getFollowing()).rejects.toThrow('Error fetching following');
  // });

  // test('getFollowers should throw error when apiClient.get fails', async () => {
  //   const mockError = new Error('Error fetching followers');
    
  //   // Mock lỗi của API
  //   apiClient.get.mockRejectedValue(mockError);

  //   await expect(followService.getFollowers()).rejects.toThrow('Error fetching followers');
  // });
});
