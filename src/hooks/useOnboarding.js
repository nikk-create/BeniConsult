import { useState, useEffect } from 'react'

const KEY = 'beniconsult_onboarded'

export function useOnboarding() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem(KEY)
    if (!done) setShow(true)
  }, [])

  const finish = () => {
    localStorage.setItem(KEY, '1')
    setShow(false)
  }

  return { show, finish }
}
