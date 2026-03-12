const userService = require('../services/userService');
const apiClient = require('../services/apiClient');
const sendMail = require('../services/sendMail');

// Mock apiClient
jest.mock('../services/apiClient', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
}));

jest.mock('../services/sendMail', () => ({
  sendMail: jest.fn(), // Mock the sendMail function
}));

// Mock localStorage
global.localStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  clear: jest.fn(),
};

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
    localStorage.clear(); // Clear localStorage before each test
  });

  test('login should call apiClient.post and return accessToken and userData', async () => {
    const username = 'huynhhop';
    const password = '123';
    const mockAccessToken = 'fake-jwt-token';
    const mockUserData = { username: 'huynhhop', role: 2 };
    
    const mockResponse = {
      data: {
        success: true,
        accessToken: mockAccessToken,
        userData: mockUserData,
      },
    };

    // Mock API success response
    apiClient.post.mockResolvedValue(mockResponse);

    const result = await userService.login(username, password);

    // Check if the API was called with the correct parameters
    expect(apiClient.post).toHaveBeenCalledWith('/users/login', { username, password });
    
    // Check if the accessToken was stored in localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('token', mockAccessToken);
    
    // Check if the returned data is correct
    expect(result.accessToken).toBe(mockAccessToken);
    expect(result.userData).toEqual(mockUserData);
  });

  test('getUserFromToken should call apiClient.get and return user data', async () => {
    // Define mock response data
    const mockResponse = { data: { success: true, user: { id: '123', username: 'testuser', role: 2 } } };
    
    // Mock the success of the API
    apiClient.get.mockResolvedValue(mockResponse);

    // Call the function
    const result = await userService.getUserFromToken();

    // Check if apiClient.get was called with the correct endpoint
    expect(apiClient.get).toHaveBeenCalledWith('/users/getUserToken');
    expect(result).toEqual(mockResponse.data); // Check if the returned data matches the mock response
  });

  test('getById should call apiClient.get and return user data', async () => {
    const userId = '123';
    const mockUserData = { id: '123', username: 'testuser', role: 2 };
    const mockResponse = {
      data: {
        success: true,
        user: mockUserData,
      },
    };

    // Mock API success response
    apiClient.get.mockResolvedValue(mockResponse);

    const result = await userService.getById(userId);

    // Check if the API was called with the correct URL
    expect(apiClient.get).toHaveBeenCalledWith(`/users/${userId}`);
    
    // Check if the returned data is correct
    expect(result.user).toEqual(mockUserData);
  });

  test('getAll should call apiClient.get with query params and return users list', async () => {
    const queryParams = { page: 1, limit: 10 };
    const mockUsers = [
      { id: '123', username: 'user1', role: 1 },
      { id: '124', username: 'user2', role: 2 },
    ];
    const mockResponse = {
      data: {
        success: true,
        users: mockUsers,
        counts: 2,
      },
    };

    // Mock API success response
    apiClient.get.mockResolvedValue(mockResponse);

    const result = await userService.getAll(queryParams);

    // Check if the API was called with the correct URL and query parameters
    expect(apiClient.get).toHaveBeenCalledWith('/users', { params: queryParams });
    
    // Check if the returned data matches the mock response
    expect(result.users).toEqual(mockUsers);
    expect(result.counts).toBe(2);
  });

  // Test register functionality
  test('register should call apiClient.post and return success message', async () => {
    const mockUserData = {
      username: 'testuser',
      password: 'password123',
      fullname: 'Test User',
      email: 'testuser@example.com',
      phone: '123456789',
      birthday: '1990-01-01',
      desc: 'Test description',
    };

    const mockResponse = {
      data: {
        success: true,
        message: "Create User successful",
        data: mockUserData,
      },
    };

    apiClient.post.mockResolvedValue(mockResponse);

    const result = await userService.register(mockUserData);

    expect(apiClient.post).toHaveBeenCalledWith('/users/register', mockUserData);
    expect(result.success).toBe(true);
    expect(result.message).toBe('Create User successful');
    expect(result.data).toEqual(mockUserData);
  });

  // Test update functionality
  test('update should call apiClient.put and return updated user data', async () => {
    const mockUserData = { username: 'testuser', email: 'updated@example.com' };

    const mockResponse = {
      data: {
        success: true,
        message: 'User update successful',
        updatedUser: mockUserData,
      },
    };

    apiClient.put.mockResolvedValue(mockResponse);

    const result = await userService.update(mockUserData);

    expect(apiClient.put).toHaveBeenCalledWith('/users', mockUserData);
    expect(result.success).toBe(true);
    expect(result.message).toBe('User update successful');
    expect(result.updatedUser).toEqual(mockUserData);
  });

  // Test delete functionality
  test('delete should call apiClient.delete and return success message', async () => {
    const userId = '123';
    const mockResponse = {
      data: {
        success: true,
        message: 'User deleted successfully',
      },
    };

    apiClient.delete.mockResolvedValue(mockResponse);

    const result = await userService.delete(userId);

    expect(apiClient.delete).toHaveBeenCalledWith(`/users/${userId}`);
    expect(result.success).toBe(true);
    expect(result.message).toBe('User deleted successfully');
  });

  // Test forceDelete functionality
  test('forceDelete should call apiClient.delete with force and return success message', async () => {
    const userId = '123';
    const mockResponse = {
      data: {
        success: true,
        message: 'User force deleted successfully',
      },
    };

    apiClient.delete.mockResolvedValue(mockResponse);

    const result = await userService.forceDelete(userId);

    expect(apiClient.delete).toHaveBeenCalledWith(`/users/${userId}/force`);
    expect(result.success).toBe(true);
    expect(result.message).toBe('User force deleted successfully');
  });

  // Test restore functionality
  test('restore should call apiClient.patch and return success message', async () => {
    const userId = '123';
    const mockResponse = {
      data: {
        success: true,
        message: 'User restored successfully',
      },
    };

    apiClient.patch.mockResolvedValue(mockResponse);

    const result = await userService.restore(userId);

    expect(apiClient.patch).toHaveBeenCalledWith(`/users/${userId}/restore`);
    expect(result.success).toBe(true);
    expect(result.message).toBe('User restored successfully');
  });

  // Test updateByAdmin functionality
  test('updateByAdmin should call apiClient.put and return updated user data', async () => {
    const userId = '123';
    const mockUpdatedData = { username: 'updatedUser', role: 2 };
    const mockResponse = {
      data: {
        success: true,
        message: 'User updated by admin successfully',
        updatedUser: mockUpdatedData,
      },
    };

    apiClient.put.mockResolvedValue(mockResponse);

    const result = await userService.updateByAdmin(userId, mockUpdatedData);

    expect(apiClient.put).toHaveBeenCalledWith(`/users/${userId}`, mockUpdatedData);
    expect(result.success).toBe(true);
    expect(result.message).toBe('User updated by admin successfully');
    expect(result.updatedUser).toEqual(mockUpdatedData);
  });

  // Now you can use mockResolvedValue on sendMail in your tests
  test('sendOTP should call apiClient.post and return OTP', async () => {
    const email = 'test@example.com';
    const action = 'CreateAccount';
    const userData = { username: 'testuser', phone: '1234567890' };
    const mockResponse = {
      data: {
        success: true,
        otp_code: '123456',
        result: 'OTP sent successfully',
        action,
      },
    };

    // Mock API success response
    apiClient.post.mockResolvedValue(mockResponse);

    // Mock sendMail success
    sendMail.sendMail.mockResolvedValue('Mail sent successfully'); // Corrected mock call

    const result = await userService.sendOTP(email, action, userData);

    // Check if the API was called with the correct parameters
    expect(apiClient.post).toHaveBeenCalledWith('/sendOTP/', { ...userData, email, action });

    // Check if the result matches the mock response
    expect(result.success).toBe(true);
    expect(result.otp_code).toBe('123456');
    expect(result.action).toBe(action);
    expect(result.result).toBe('OTP sent successfully');
  });

  test('editProfileSendOTP should call apiClient.get and return OTP', async () => {
    const email = 'test@example.com';
    const action = 'EditProfile';
    const mockResponse = {
      data: {
        success: true,
        otp_code: '654321',
        result: 'OTP sent for editing profile',
        action,
      },
    };

    // Mock API success response
    apiClient.get.mockResolvedValue(mockResponse);

    // Mock sendMail success
    sendMail.sendMail.mockResolvedValue('Mail sent successfully'); // Corrected mock call

    const result = await userService.editProfileSendOTP(email, action);

    // Check if the API was called with the correct parameters
    expect(apiClient.get).toHaveBeenCalledWith('/editProfileSendOTP/', { params: { email, action } });

    // Check if the result matches the mock response
    expect(result.success).toBe(true);
    expect(result.otp_code).toBe('654321');
    expect(result.action).toBe(action);
    expect(result.result).toBe('OTP sent for editing profile');
  });

    // // Test forgotPassword functionality
    // test('forgotPassword should call apiClient.post and return success message', async () => {
    //   const email = 'testuser@example.com';
    //   const mockResponse = {
    //     data: {
    //       success: true,
    //       message: 'Password reset email sent successfully',
    //     },
    //   };
    
    //   apiClient.post.mockResolvedValue(mockResponse);
    
    //   const result = await userService.forgotPassword(email);
    
    //   // Log to check if the mock was called
    //   console.log(apiClient.post.mock.calls);
    
    //   expect(apiClient.post).toHaveBeenCalledWith('/users/forgotPassword', { email });
    //   expect(result.success).toBe(true);
    //   expect(result.message).toBe('Password reset email sent successfully');
    // });
  // Test resetPassword functionality
  test('resetPassword should call apiClient.put and return success message', async () => {
    const resetToken = 'reset-token-123';
    const newPassword = 'newpassword123';
    const mockResponse = {
      data: {
        success: true,
        message: 'Password reset successfully',
      },
    };

    apiClient.put.mockResolvedValue(mockResponse);

    const result = await userService.resetPassword(resetToken, newPassword);

    expect(apiClient.put).toHaveBeenCalledWith('/users/resetPassword', { resetToken, newPassword });
    expect(result.success).toBe(true);
    expect(result.message).toBe('Password reset successfully');
  });

 
});
