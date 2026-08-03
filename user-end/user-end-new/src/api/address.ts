import { request } from './request'
import type { AddressBook } from '@/types/api'

export const listAddressBook = () =>
  request<AddressBook[]>({ url: '/user/addressBook/list', method: 'GET' })

export const getAddressDefault = () =>
  request<AddressBook>({ url: '/user/addressBook/default', method: 'GET' })

export const getAddressById = (id: number) =>
  request<AddressBook>({ url: `/user/addressBook/${id}`, method: 'GET' })

export const addAddress = (data: AddressBook) =>
  request<void>({ url: '/user/addressBook', method: 'POST', data })

export const updateAddress = (data: AddressBook) =>
  request<void>({ url: '/user/addressBook', method: 'PUT', data })

export const deleteAddress = (id: number) =>
  request<void>({ url: '/user/addressBook', method: 'DELETE', params: { id } })

export const setDefaultAddress = (data: AddressBook) =>
  request<void>({ url: '/user/addressBook/default', method: 'PUT', data })