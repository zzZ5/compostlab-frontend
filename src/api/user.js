import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login/',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/account/mine/',
    method: 'get'
    // params: { token }
  })
}

export function fetchList(listQuery) {
  return request({
    url: '/account/list/',
    method: 'get',
    params: listQuery
  })
}

export function update(data) {
  return request({
    url: '/account/update/',
    method: 'put',
    data
  })
}

export function getRecord(listQuery) {
  return request({
    url: '/account/record/',
    method: 'get',
    params: listQuery
  })
}

export function logout() {
  return request({
    url: '/account/logout/',
    method: 'get'
  })
}
