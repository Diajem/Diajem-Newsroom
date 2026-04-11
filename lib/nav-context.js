'use client'
import { createContext } from 'react'
export const NavContext = createContext({ path: '/', navigate: () => {} })
