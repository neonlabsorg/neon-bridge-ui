import { useEffect, useState, useCallback } from "react"
import { useStatesContext } from "../../../contexts/states"

const ERR_CASE = {
  insufficient_funds: {
    summary: `"Insufficient funds" error can cause of low balance on your source wallet.`,
    searchPhrase: 'insufficient funds'
  }
}

export const ErrorHandler = ({className}) => {
  const [caseKey, setCaseKey] = useState('')
  const {error} = useStatesContext()
  const checkErrorOnCases = useCallback(() => {
    if (!error || !error.logs) return
    if (error.logs) {
      error.logs.forEach(log => {
        Object.keys(ERR_CASE).forEach(errCaseKey => {
          const errCase = ERR_CASE[errCaseKey]
          if (log.includes(errCase.searchPhrase)) setCaseKey(errCaseKey)
        })
      })
    }
  }, [error])
  useEffect(() => {
    checkErrorOnCases()
  }, [error, checkErrorOnCases])
  if (error === undefined) return <></>
  return <div className={className}>{caseKey ? ERR_CASE[caseKey].summary : error.message}</div>
}