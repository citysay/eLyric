// import { config } from '@/api/config.js'
import { createRequest, createWebAPIRequest } from '@/utils/util'

/**
export const api = {
  loginCellphone: config + '/login/cellphone', // 手机登陆
  userPlaylist: config + '/user/playlist', // 获取用户歌单
  playlistDetail: config + '/playlist/detail', // 获取歌单详情
  musicUrl: config + '/music/url', // 获取音乐url
  search: config + '/search', // 搜素音乐
  lyric: config + '/lyric', // 获取歌词
  comment: config + '/comment', // 获取评论
  album: config + '/album', //  获取专辑内容
  artists: config + '/artists', // 获取歌手单曲列表
  artistAlbum: config + '/artist/album', // 获取歌手专辑列表
  artistDesc: config + '/artist/desc', //  获取歌手信息
  recommendResource: '/recommend/resource', // 获取每日推荐歌单（用户级）
  recommendSongs: config + '/recommend/songs', // 获取每日推荐歌曲（用户级）
  personalFm: config + '/personal_fm', // 私人FM(用户级)
  dailySignin: config + '/daily_signin', // 签到(用户级)
  likeMusic: config + '/like', // 添加喜欢的音乐(用户级)
  fmTrash: config + '/fm_trash', // 将音乐从私人FM中移除至垃圾桶
  topPlaylist: config + '/top/playlist', //  歌单(网友精选歌单)
  newAlbum: config + '/top/albums', // 新碟上架
  topArtists: config + '/top/artists', //  热门歌手
  topList: config + '/top/list', //  音乐排行榜
  personalized: config + '/personalized', //  推荐歌单
  privatecontent: config + '/personalized/privatecontent', // 独家放送
  personalizedMv: config + '/personalized/mv' // 推荐MV
}
*/

/**
 *  搜索歌曲
 *  @param {Object}       param     参数
 *  @param {Function}     callback  返回函数
 *  @param return
 */
export default {
  search(param, callback, error) {
    const keywords = param.keywords
    const type = param.type || 1
    const limit = param.limit || 30
    const offset = param.offset || 0
    // 搜索单曲(1)，歌手(100)，专辑(10)，歌单(1000)，用户(1002) *(type)*
    const data = 's=' + keywords + '&limit=' + limit + '&type=' + type + '&offset=' + offset
    createRequest('/api/search/pc/', 'POST', data)
    .then(result => {
      callback(JSON.parse(result))
    })
    .catch(err => {
      if (error) error(err)
    })
  },

  loadUrl(param, callback, error) {
    const id = param.id
    const br = param.br || 999000
    const data = {
      'ids': [id],
      'br': br,
      'csrf_token': ''
    }
    const cookie = ''

    createWebAPIRequest(
      'music.163.com',
      '/weapi/song/enhance/player/url',
      'POST',
      data,
      cookie,
      musicReq => {
        callback(JSON.parse(musicReq))
      },
      err => {
        if (error) error(err)
      }
    )
  },

  loadLyric(param, callback, error) {
    const id = param.id
    createRequest('/api/song/lyric?os=osx&id=' + id + '&lv=-1&kv=-1&tv=-1', 'GET', null)
      .then(result => {
        callback(JSON.parse(result))
      })
      .catch(err => {
        if (error) error(err)
      })
  },

  banner(param, callback, error) {
    createRequest('/api/v2/banner/get', 'GET', null)
      .then(result => {
        callback(JSON.parse(result))
      })
      .catch(err => {
        if (error) error(err)
      })
  }
}
