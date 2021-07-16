import request from '@/utils/request'

export function fetchList(listQuery) {
  return request({
    url: '/experiment/list/',
    method: 'get',
    params: listQuery
  })
}

export function fetchExperiment(id) {
  return request({
    url: '/experiment/' + id + '/detail/',
    method: 'get'
  })
}

export function fetchRecord(id, listQuery) {
  return request({
    url: '/experiment/' + id + '/record/',
    method: 'get',
    params: listQuery
  })
}

export function createExperiment(data) {
  return request({
    url: '/experiment/create/',
    method: 'post',
    data
  })
}

export function updateExperiment(id, data) {
  return request({
    url: '/experiment/' + id + '/update/',
    method: 'put',
    data
  })
}

export function publicCmd(id, data) {
  return request({
    url: '/experiment/' + id + '/cmd/',
    method: 'post',
    data
  })
}

export function reviewExperiment(id, data) {
  return request({
    url: '/experiment/' + id + '/review/',
    method: 'post',
    data
  })
}
