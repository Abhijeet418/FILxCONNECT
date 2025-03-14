import { useEffect, useCallback } from 'react'

export const useAutoRefresh = (callback: () => void, interval: number = 30000) => {
  const refresh = useCallback(callback, [callback])

  useEffect(() => {
    refresh() // Initial fetch
    const intervalId = setInterval(refresh, interval)

    return () => clearInterval(intervalId)
  }, [refresh, interval])

  return refresh // Return the refresh function in case manual refresh is needed
}