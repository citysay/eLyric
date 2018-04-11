import * as types from '../mutation-types'

const state = {
  make_lrc: false // 判断是在制作歌词
}

const getters = {
  getMakeLrcStatus: state => state.make_lrc
}

const actions = {
  makeLrc({ state, commit }, val) {
    commit(types.MAKE_LRC, val)
  }
}

const mutations = {
  [types.MAKE_LRC](state, val) {
    state.make_lrc = val
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
