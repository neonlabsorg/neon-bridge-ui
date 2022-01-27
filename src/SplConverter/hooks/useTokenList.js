import { useState, useEffect, useMemo } from 'react'
import { useNetworkType } from '.'
export function useTokenList () {
  const { chainId } = useNetworkType()
  const [sourceList, setSourceList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    setLoading(true)
    fetch(`https://raw.githubusercontent.com/neonlabsorg/token-list/main/tokenlist.json`)
    .then((resp) => {
      if (resp.ok) {
        resp.json().then(data => {
          setSourceList(data.tokens)
        })
          .catch((err) => setError(err.message))
      }
    })
    .catch(err => {
      setError(`Failed to fetch neon transfer token list: ${err.message}`)
    }).finally(() => setLoading(false))
  }, [chainId])
  const filteringChainId = useMemo(() => {
    if (isNaN(chainId)) return 111
    else return chainId
  }, [chainId])
  const list = useMemo(() => {
    const filtered = sourceList.filter(token => {
      return token.chainId === filteringChainId
    })
    return filtered
  }, [filteringChainId, sourceList])
  return { list, error, loading }
}