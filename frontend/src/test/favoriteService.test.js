// Import các mô-đun cần thiết
const favoriteService = require("../services/favoriteService"); // Đảm bảo đường dẫn chính xác
const apiClient = require("../services/apiClient");

// Mock apiClient
jest.mock("../services/apiClient", () => ({
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
}));

describe("favoriteService", () => {
  describe("createFavorite", () => {
    it("should create a favorite successfully", async () => {
      // Mock apiClient.post để trả về dữ liệu thành công
      apiClient.post.mockResolvedValue({
        data: {
          title: "My Favorite",
          songs: ["song1", "song2"],
          creator: "testuser",
        },
      });

      const title = "My Favorite";
      const songs = ["song1", "song2"];
      const creator = "testuser";

      const result = await favoriteService.createFavorite(
        title,
        songs,
        creator
      );
      expect(result.title).toBe("My Favorite");
      expect(result.songs).toEqual(["song1", "song2"]);
      expect(result.creator).toBe("testuser");
    });

    it("should throw an error if creation fails", async () => {
      // Mock apiClient.post để trả về lỗi
      apiClient.post.mockRejectedValue(new Error("Failed to create favorite"));

      const title = "My Favorite";
      const songs = ["song1", "song2"];
      const creator = "testuser";

      await expect(
        favoriteService.createFavorite(title, songs, creator)
      ).rejects.toThrow("Failed to create favorite");
    });
  });

  describe("updateFavorite", () => {
    it("should update a favorite successfully", async () => {
      // Mock apiClient.patch để trả về dữ liệu cập nhật thành công
      apiClient.patch.mockResolvedValue({
        data: { title: "Updated Favorite", songs: ["song1", "song3"] },
      });

      const favoriteId = "12345";
      const title = "Updated Favorite";
      const songs = ["song1", "song3"];

      const result = await favoriteService.updateFavorite(
        favoriteId,
        title,
        songs
      );
      expect(result.title).toBe("Updated Favorite");
      expect(result.songs).toEqual(["song1", "song3"]);
    });

    it("should throw an error if update fails", async () => {
      // Mock apiClient.patch để trả về lỗi
      apiClient.patch.mockRejectedValue(new Error("Failed to update favorite"));

      const favoriteId = "12345";
      const title = "Updated Favorite";
      const songs = ["song1", "song3"];

      await expect(
        favoriteService.updateFavorite(favoriteId, title, songs)
      ).rejects.toThrow("Failed to update favorite");
    });
  });

  describe("deleteFavorite", () => {
    it("should delete a favorite successfully", async () => {
      // Mock apiClient.delete để trả về thành công
      apiClient.delete.mockResolvedValue({
        data: { message: "Favorite deleted successfully" },
      });

      const favoriteId = "12345";
      const result = await favoriteService.deleteFavorite(favoriteId);
      expect(result.message).toBe("Favorite deleted successfully");
    });

    it("should throw an error if deletion fails", async () => {
      // Mock apiClient.delete để trả về lỗi
      apiClient.delete.mockRejectedValue(
        new Error("Failed to delete favorite")
      );

      const favoriteId = "12345";
      await expect(favoriteService.deleteFavorite(favoriteId)).rejects.toThrow(
        "Failed to delete favorite"
      );
    });
  });

  describe("getFavorites", () => {
    it("should get all favorites successfully", async () => {
      // Mock apiClient.get để trả về danh sách favorite
      apiClient.get.mockResolvedValue({
        data: [
          {
            title: "My Favorite",
            songs: ["song1", "song2"],
            creator: "testuser",
          },
        ],
      });

      const result = await favoriteService.getFavorites();
      expect(result).toEqual([
        {
          title: "My Favorite",
          songs: ["song1", "song2"],
          creator: "testuser",
        },
      ]);
    });

    it("should throw an error if fetching favorites fails", async () => {
      // Mock apiClient.get để trả về lỗi
      apiClient.get.mockRejectedValue(new Error("Failed to fetch favorites"));

      await expect(favoriteService.getFavorites()).rejects.toThrow(
        "Failed to fetch favorites"
      );
    });
  });

  describe("getFavoriteById", () => {
    it("should get a favorite by ID successfully", async () => {
      // Mock apiClient.get để trả về thông tin favorite
      apiClient.get.mockResolvedValue({
        data: {
          title: "My Favorite",
          songs: ["song1", "song2"],
          creator: "testuser",
        },
      });

      const favoriteId = "12345";
      const result = await favoriteService.getFavoriteById(favoriteId);
      expect(result.title).toBe("My Favorite");
      expect(result.songs).toEqual(["song1", "song2"]);
      expect(result.creator).toBe("testuser");
    });

    it("should throw an error if fetching favorite by ID fails", async () => {
      // Mock apiClient.get để trả về lỗi
      apiClient.get.mockRejectedValue(new Error("Failed to fetch favorite"));

      const favoriteId = "12345";
      await expect(favoriteService.getFavoriteById(favoriteId)).rejects.toThrow(
        "Failed to fetch favorite"
      );
    });
  });
});
