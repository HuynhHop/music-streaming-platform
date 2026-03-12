const reportService = require('../services/reportService'); // Đảm bảo đường dẫn chính xác
const apiClient = require('../services/apiClient'); // Import apiClient để mock

// Mock apiClient
jest.mock('../services/apiClient', () => ({
  post: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  patch: jest.fn(),
}));

describe('reportService', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test to ensure clean tests
  });

  test('createReport should call apiClient.post and return data', async () => {
    const mockResponse = { data: { message: 'Report created' } };
    apiClient.post.mockResolvedValue(mockResponse); // Mock thành công của API

    const user = 'user1';
    const song = 'song1';
    const reason = 'test reason';

    const result = await reportService.createReport(user, song, reason);

    expect(apiClient.post).toHaveBeenCalledWith('/reports', { user, song, reason });
    expect(result).toEqual(mockResponse.data);
  });

  test('getReportsByUid should call apiClient.get and return data', async () => {
    const mockResponse = { data: { message: 'User reports' } };
    apiClient.get.mockResolvedValue(mockResponse); // Mock thành công của API

    const userId = 'user1';

    const result = await reportService.getReportsByUid(userId);

    expect(apiClient.get).toHaveBeenCalledWith(`/reports/user/${userId}`);
    expect(result).toEqual(mockResponse.data);
  });

  test('getReports should call apiClient.get and return data', async () => {
    const mockResponse = { data: { message: 'All reports' } };
    apiClient.get.mockResolvedValue(mockResponse); // Mock thành công của API

    const result = await reportService.getReports();

    expect(apiClient.get).toHaveBeenCalledWith('/reports');
    expect(result).toEqual(mockResponse.data);
  });

  test('getReportById should call apiClient.get and return data', async () => {
    const mockResponse = { data: { message: 'Report details' } };
    apiClient.get.mockResolvedValue(mockResponse); // Mock thành công của API

    const reportId = 'report123';

    const result = await reportService.getReportById(reportId);

    expect(apiClient.get).toHaveBeenCalledWith(`/reports/${reportId}`);
    expect(result).toEqual(mockResponse.data);
  });

  test('updateReport should call apiClient.patch and return data', async () => {
    const mockResponse = { data: { message: 'Report updated' } };
    apiClient.patch.mockResolvedValue(mockResponse); // Mock thành công của API

    const reportId = 'report123';
    const status = 'resolved';
    const feedBack = 'feedback content';

    const result = await reportService.updateReport(reportId, status, feedBack);

    expect(apiClient.patch).toHaveBeenCalledWith(`/reports/${reportId}`, { status, feedBack });
    expect(result).toEqual(mockResponse.data);
  });

  test('removeReport should call apiClient.delete and return data', async () => {
    const mockResponse = { data: { message: 'Report removed' } };
    apiClient.delete.mockResolvedValue(mockResponse); // Mock thành công của API

    const reportId = 'report123';

    const result = await reportService.removeReport(reportId);

    expect(apiClient.delete).toHaveBeenCalledWith(`/reports/${reportId}`);
    expect(result).toEqual(mockResponse.data);
  });

  // Test cho trường hợp lỗi
  test('createReport should throw error when apiClient.post fails', async () => {
    const mockError = new Error('Something went wrong');
    apiClient.post.mockRejectedValue(mockError); // Mock lỗi

    const user = 'user1';
    const song = 'song1';
    const reason = 'test reason';

    await expect(reportService.createReport(user, song, reason)).rejects.toThrow('Something went wrong');
  });
});
