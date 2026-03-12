const ETypeNotify = require('../enums/ETypeNotify');

class NotificationService {
  
    static async handleNotification(notification, navigate, objecthandle) {
      switch (notification.type) {
        case ETypeNotify.LIKE:
          return await NotificationService.handleLike(notification, navigate, objecthandle);
        case ETypeNotify.COMMENT:
          return await NotificationService.handleComment(notification, navigate, objecthandle);  
        case ETypeNotify.NEW_ALBUM:
          return await NotificationService.handleNewAlbum(notification, navigate, objecthandle);
        case ETypeNotify.NEW_PLAYLIST:
          return await NotificationService.handleNewPlayList(notification, navigate, objecthandle);
        case ETypeNotify.NEW_SONG:
            return await NotificationService.handleNewSong(notification, navigate, objecthandle);
        case ETypeNotify.FOLLOW:
          return await NotificationService.handleFollow(notification, navigate, objecthandle);
        default:
          throw new Error('Unknown notification type');
      }
    }
  
    static async handleLike(notification, navigate, getSongById) {
      console.log(`Handling LIKE notification: ${notification.content}`);
      const song = await getSongById(notification.object);  
      if (song) {
        console.log(song);
        navigate(`/song/${song._id}`, { state: { song }, replace: true });
      }
    }
  
    static async handleComment(notification, navigate, getSongById) {
      console.log(`Handling COMMENT notification: ${notification.content}`);
      const song = await getSongById(notification.object);  
      if (song) {
        console.log(song);
        navigate(`/song/${song._id}`, { state: { song }, replace: true });
      }
    }
  
    static async handleNewAlbum(notification, navigate, getAlbumById) {
      console.log(`Handling NEW_ALBUM notification: ${notification.content}`);
      const album = await getAlbumById(notification.object);  
      if (album) {
        console.log(album);
        navigate(`/album/${album._id}`, { state: { album }, replace: true });
      }
    }
  
    static async handleNewPlayList(notification, navigate, getPlaylistById) {
      console.log(`Handling NEW_PLAYLIST notification: ${notification.content}`);
      const playlist = await getPlaylistById(notification.object);  
      if (playlist) {
        console.log(playlist);
        navigate(`/playlist/${playlist._id}`, { state: { playlist }, replace: true });
      }
    }
  
    static async handleNewSong(notification, navigate, getSongById) {
      console.log(`Handling NEW_PLAYLIST notification: ${notification.content}`);
      const song = await getSongById(notification.object);  
      if (song) {
        console.log(song);
        navigate(`/song/${song._id}`, { state: { song }, replace: true });
      }
    }
  
    static async handleFollow(notification, navigate, getUserById) {
      console.log(`Handling FOLLOW notification: ${notification.content}`);
      const user = await getUserById(notification.object);  
      if (user) {
        console.log(user);
        navigate(`/user/${user._id}`, { state: { user } });
      }
    }
  }
  
  module.exports = NotificationService;
  