import { useState, useEffect } from 'react'
export function useTokenList () {
  const [list, setList] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    fetch(`${window.location.origin}/tokens.json`)
    .then((resp) => {
      if (resp.ok) {
        resp.json().then(data => {
          setList(data.tokens)
        })
          .catch((err) => setError(err.message))
      }
    })
    .catch(err => {
      setError(`Failed to fetch neon transfer token list: ${err.message}`)
    })
  }, [])
  return { list, error }
}