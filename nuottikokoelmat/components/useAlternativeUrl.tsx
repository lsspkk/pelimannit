import { useAlternativeUrlResponse } from '@/models/swrApi'
import { useSongViewStore } from '@/stores/SongViewContext'
import { useEffect } from 'react'

export const useAlternativeUrl = (archiveId: string) => {
	const { data: alternativeUrl, isLoading, error } = useAlternativeUrlResponse(archiveId) || {}
	const { setAlternativeUrl } = useSongViewStore()

	// Set the alternative URL in the store when it is loaded
	useEffect(() => {
		if (!isLoading && alternativeUrl && !error) {
			setAlternativeUrl(alternativeUrl)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, alternativeUrl])
}
