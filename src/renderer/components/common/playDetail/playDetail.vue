<template>
<div class="playDetail" :class="{ 'open' : playDetailStatus }" >
  <div class="scrollBar" ref="scroll" >
    <div class="background" :style="backgroundPic"></div>
    <div class="content">
      <div class="plays-header">
        <div class="items">
          <div class="pic">
            <img :src="audio.albumPic">
          </div>
          <div class="disc">
            <span class="name ellipsis">{{audio.name}}</span>
            <span class="singer">歌手：{{audio.singer}}</span>
            <span class="singer">专辑：{{audio.album}}</span>
          </div>
        </div>
        <div class="items">
          <div class="lyric-holder">
            <div class="lrc-inner" style="transition: -webkit-transform 0.3s ease-out; transform-origin: 0px 0px 0px;" :style="{'transform':' translate3d(0px,-'+ lrcOffset +'px, 0px)'}">
              <p v-for="(item, index) in afterLrc" :class="{ 'on' : item.time == curTmpTime || item.index ==  lrcIndex }" :id="item.time" :key="index">{{item.txt}}</p>
            </div>
          </div>
          <div class="paly-btn">
            <button type="button" class="radius-border like" name="button" @click="openSrcFile(true)"><span>制作歌词</span></button>
            <button type="button" class="radius-border download" name="button" @click="openSrcFile(false)"><span>预览歌词</span></button>
          </div>
        </div>
      </div>
      <button type="button" class="closed radius-border" name="button" @click="closed"></button>
    </div>
  </div>
</div>
</template>

<script>
import fs from 'fs'
import { remote } from 'electron'
import { mapActions, mapGetters, mapState } from 'vuex'
import { formatTime, rmBlankLines } from '@/utils/libs'

import api from '@/api/api'

export default {
  name: 'playDetail',
  data() {
    return {
      lyric: '',
      preview_lyric: '',
      afterLrc: [],
      lrcIndex: 0,
      curTmpTime: 0,
      likeActive: false
    }
  },
  watch: {
    audio(val) {
      // console.log(val)
      this.loadLrc(val.id)
    },
    currentTime(val) {
      this.lrcBack(false)
    }
  },
  mounted() {
    this.$mousetrap.bind('enter', this.keyDown);
    this.$mousetrap.bind('up', this.keyDown);
    this.$mousetrap.bind('down', this.keyDown);
    this.$mousetrap.bind('space', this.keyDown);
    this.$mousetrap.bind('left', this.keyDown);
    this.$mousetrap.bind('right', this.keyDown);
  },
  components: {},
  created() {
    setTimeout(() => {
      console.log(this.audio)
    })
  },
  computed: {
    ...mapState([]),
    ...mapGetters({
      audio: 'getAudioStatus',
      currentTime: 'getCurrentTimeStatus',
      playDetailStatus: 'getPlayDetailStatus',
      tmpCurrentTime: 'getTmpCurrentTimeStatus'
    }),
    backgroundPic() {
      return {
        backgroundImage: 'url(' + this.audio.albumPic + ')'
      }
    },
    lrcOffset() {
      if (this.afterLrc && this.afterLrc.length > 1) {
        var current = Math.round(this.currentTime)
        const len = this.afterLrc.length
        for (var i = 1; i < len; i++) {
          const preIndex = i - 1
          const preItem = this.afterLrc[i - 1]
          const item = this.afterLrc[i]
          if (!item.time || !preItem.time) continue;
          if (i === 1 && current < preItem.time) {
            this.lrcIndex = 0
            this.curTmpTime = preItem.time
            break
          }
          if (i === (len - 1) && current >= item.time) {
            this.lrcIndex = len - 1
            this.curTmpTime = item.time
            break
          }
          if (preItem.time <= current && current < item.time) {
            this.lrcIndex = preIndex
            this.curTmpTime = preItem.time
            break
          }
        }
        console.log('lrcOffset', current, this.curTmpTime, this.lrcIndex)
        return this.lrcIndex * 30 || 0
      } else {
        return 0
      }
    },
    likeClass() {
      return {
        active: this.likeActive
      }
    }
  },
  methods: {
    ...mapGetters({
      getMakeLrc: 'getMakeLrcStatus'
    }),
    ...mapActions([
      'togglePlayDetail',
      'makeLrc',
      'togglePlay',
      'playChangeTime',
      'setMusicChange',
      'playMoveTime'
    ]),
    closed() {
      this.togglePlayDetail();
      this.$refs.scroll.scrollTop = 0
    },
    likePlay() {
      this.likeActive = !this.likeActive
    },
    getLrc() {
      if (this.lyric) {
        var lyrics = this.lyric.split('\n')
        // console.log(lyrics)
        var lrcObj = []
        /*eslint-disable */
        var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g
        /*eslint-enable */
        // 思路：1、把歌词进行处理以时间和歌词组成一个对象，放入afterLrc数组中
        // 2、在computed方法中根据当前的时间进行匹配歌词，然后查找在数据中的位置计算offset值
        for (var i = 0; i < lyrics.length; i++) {
          var lyric = lyrics[i]
          var timeRegExpArr = lyric.match(timeReg)
          if (!timeRegExpArr) {
            // 没有时间就用index
            lrcObj.push({txt: lyric, index: i})
            continue
          }
          var txt = lyric.replace(timeReg, '')
          // 处理时间
          for (var k = 0; k < timeRegExpArr.length; k++) {
            var array = {}
            var t = timeRegExpArr[k]
            /*eslint-disable */
            var min = Number(String(t.match(/\[\d*/i)).slice(1))
            var sec = Number(String(t.match(/\:\d*/i)).slice(1))
            /*eslint-enable */
            var time = min * 60 + sec
            array.time = time
            array.txt = txt
            lrcObj.push(array)
          }
        }
        this.afterLrc = lrcObj
        console.log(this.afterLrc)
      }
    },
    loadLrc(id) {
      // var self = this
      this.afterLrc = [{ 'txt': '正在加载中...' }]
      if (!id) {
        this.afterLrc = [{ 'txt': '这里显示歌词哦！' }]
        return
      }
      const param = { id, type: 'lyric' }
      const callback = (data) => {
        // console.log(data)
        // 1、先判断是否有歌词
        if (data.nolyric) {
          this.afterLrc = [{ 'txt': '暂无歌词' }]
        } else if (data.uncollected) {
          this.afterLrc = [{ 'txt': '纯音乐请您欣赏' }]
        } else {
          this.lyric = data.lrc.lyric
          this.getLrc()
        }
      }
      const error = () => {
        this.afterLrc = [{ 'txt': '加载歌词失败' }]
      }
      api.loadLyric(param, callback, error)
    },
    openSrcFile(isMake) {
      const self = this
      const dialog = remote.dialog
      dialog.showOpenDialog(function (fileNames) {
        if (fileNames === undefined) return
        const fileName = fileNames[0]
        let fileContents = fs.readFileSync(fileName, 'utf8')
        self.makeLrc(isMake)
        self.replaySong();
        const lrcs = rmBlankLines(fileContents)
        self.lyric = isMake ? '\n' + lrcs : lrcs
        self.getLrc()
      });
    },
    keyDown(e) {
      // console.log(e);
      const code = e.code
      if (code === 'Space') {
        this.togglePlay()
      }
      if (code === 'ArrowUp') {
        if (!this.getMakeLrc()) return;
        if (this.afterLrc.length < 1) return;

        if (this.afterLrc.length - 1 <= this.lrcIndex) return;
        this.lrcIndex = this.lrcIndex + 1
        var item = this.afterLrc[this.lrcIndex]
        item.lrcTime = this.currentTime
        if (this.afterLrc.length - 1 === this.lrcIndex) {
          console.log('make lrc to end')
          this.keyEnter()
        }
        console.log(this.lrcIndex, item.lrcTime)
      } else if (code === 'ArrowDown') {
      } else if (code === 'Enter') {
        this.keyEnter()
      } else if (code === 'ArrowLeft') {
        this.playMoveTime(-2)
        this.setMusicChange(true)
        this.lrcBack(true)
      } else if (code === 'ArrowRight') {
        this.playMoveTime(2)
        this.setMusicChange(true)
      }
    },
    previewLrc(lyrics) {
      if (!this.preview_lyric) return;
      this.lyric = this.preview_lyric
      this.replaySong()
      this.getLrc()
      this.makeLrc(false)
    },
    replaySong() {
      this.reSetIndex()
      this.playChangeTime(0)
      this.setMusicChange(true)
    },
    reSetIndex() {
      this.lrcIndex = 0
      this.curTmpTime = 0
    },
    keyEnter() {
      if (!this.getMakeLrc()) return;
      if (this.afterLrc.length < 1) return;

      var lyrics = ''
      this.afterLrc.forEach((item, index) => {
        if (item.lrcTime) {
          const timeStr = formatTime(parseFloat(item.lrcTime))
          const oneLine = timeStr + ' ' + item.txt + '\n'
          lyrics = lyrics + oneLine
        }
      });
      const dialog = remote.dialog
      const context = this
      this.makeLrc(false)
      dialog.showSaveDialog(function (fileName) {
        if (fileName === undefined) return
        fs.writeFileSync(fileName, lyrics, 'utf8', () => {
          console.log('lyrics write error')
        });
        context.preview_lyric = lyrics
        context.previewLrc()
      });
    },
    lrcBack(isTTime) {
      if (!this.getMakeLrc()) return;
      var minIndex
      const tTime = isTTime ? this.tmpCurrentTime : this.currentTime
      this.afterLrc.forEach((item, index) => {
        if (!item.lrcTime) return;
        const lrcTime = parseFloat(item.lrcTime)
        if (lrcTime < tTime) return;

        delete item.lrcTime
        if (!minIndex || minIndex > index) {
          minIndex = index
        }
      });
      if (!minIndex) return;
      minIndex = Math.max(0, minIndex - 1)
      minIndex = Math.min(minIndex, this.afterLrc.length)
      console.log('minIndex', tTime, minIndex);
      this.lrcIndex = minIndex
    }
  }
}
</script>

<style lang="scss">
@import "./playDetail.scss";
</style>
