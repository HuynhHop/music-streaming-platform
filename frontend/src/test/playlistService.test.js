// Import các mô-đun cần thiết
const playlistService = require("../services/playlistService"); // Đảm bảo đường dẫn chính xác
const apiClient = require("../services/apiClient");

// Mock apiClient
jest.mock("../services/apiClient", () => ({
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
}));

describe("playlistService", () => {
  describe("createPlaylist", () => {
    it("should create a playlist successfully", async () => {
      // Mock apiClient.post để trả về dữ liệu thành công
      apiClient.post.mockResolvedValue({
        data: {
          title: "My Playlist",
          songs: ["song1", "song2"],
          creator: "testuser",
        },
      });

      const title = "My Playlist";
      const songs = ["song1", "song2"];
      const creator = "testuser";

      const result = await playlistService.createPlaylist(
        title,
        songs,
        creator
      );
      expect(result.title).toBe("My Playlist");
      expect(result.songs).toEqual(["song1", "song2"]);
      expect(result.creator).toBe("testuser");
    });

    it("should throw an error if creation fails", async () => {
      // Mock apiClient.post để trả về lỗi
      apiClient.post.mockRejectedValue(new Error("Failed to create playlist"));

      const title = "My Playlist";
      const songs = ["song1", "song2"];
      const creator = "testuser";

      await expect(
        playlistService.createPlaylist(title, songs, creator)
      ).rejects.toThrow("Failed to create playlist");
    });
  });

  describe("updatePlaylist", () => {
    it("should update a playlist successfully", async () => {
      // Mock apiClient.patch để trả về dữ liệu cập nhật thành công
      apiClient.patch.mockResolvedValue({
        data: { title: "Updated Playlist", songs: ["song1", "song3"] },
      });

      const playlistId = "12345";
      const title = "Updated Playlist";
      const songs = ["song1", "song3"];

      const result = await playlistService.updatePlaylist(
        playlistId,
        title,
        songs
      );
      expect(result.title).toBe("Updated Playlist");
      expect(result.songs).toEqual(["song1", "song3"]);
    });

    it("should throw an error if update fails", async () => {
      // Mock apiClient.patch để trả về lỗi
      apiClient.patch.mockRejectedValue(new Error("Failed to update playlist"));

      const playlistId = "12345";
      const title = "Updated Playlist";
      const songs = ["song1", "song3"];

      await expect(
        playlistService.updatePlaylist(playlistId, title, songs)
      ).rejects.toThrow("Failed to update playlist");
    });
  });

  describe("deletePlaylist", () => {
    it("should delete a playlist successfully", async () => {
      // Mock apiClient.delete để trả về thành công
      apiClient.delete.mockResolvedValue({
        data: { message: "Playlist deleted successfully" },
      });

      const playlistId = "12345";
      const result = await playlistService.deletePlaylist(playlistId);
      expect(result.message).toBe("Playlist deleted successfully");
    });

    it("should throw an error if deletion fails", async () => {
      // Mock apiClient.delete để trả về lỗi
      apiClient.delete.mockRejectedValue(
        new Error("Failed to delete playlist")
      );

      const playlistId = "12345";
      await expect(playlistService.deletePlaylist(playlistId)).rejects.toThrow(
        "Failed to delete playlist"
      );
    });
  });

  describe("getPlaylists", () => {
    it("should get all playlists successfully", async () => {
      // Mock apiClient.get để trả về danh sách playlist
      apiClient.get.mockResolvedValue({
        data: [
          {
            title: "My Playlist",
            songs: ["song1", "song2"],
            creator: "testuser",
          },
        ],
      });

      const result = await playlistService.getPlaylists();
      expect(result).toEqual([
        {
          title: "My Playlist",
          songs: ["song1", "song2"],
          creator: "testuser",
        },
      ]);
    });

    it("should throw an error if fetching playlists fails", async () => {
      // Mock apiClient.get để trả về lỗi
      apiClient.get.mockRejectedValue(new Error("Failed to fetch playlists"));

      await expect(playlistService.getPlaylists()).rejects.toThrow(
        "Failed to fetch playlists"
      );
    });
  });

  describe("getPlaylistById", () => {
    it("should get a playlist by ID successfully", async () => {
      // Mock apiClient.get để trả về thông tin playlist
      apiClient.get.mockResolvedValue({
        data: {
          title: "My Playlist",
          songs: ["song1", "song2"],
          creator: "testuser",
        },
      });

      const playlistId = "12345";
      const result = await playlistService.getPlaylistById(playlistId);
      expect(result.title).toBe("My Playlist");
      expect(result.songs).toEqual(["song1", "song2"]);
      expect(result.creator).toBe("testuser");
    });

    it("should throw an error if fetching playlist by ID fails", async () => {
      // Mock apiClient.get để trả về lỗi
      apiClient.get.mockRejectedValue(new Error("Failed to fetch playlist"));

      const playlistId = "12345";
      await expect(playlistService.getPlaylistById(playlistId)).rejects.toThrow(
        "Failed to fetch playlist"
      );
    });
  });
});
