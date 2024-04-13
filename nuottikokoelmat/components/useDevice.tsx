import { useEffect, useState } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | ''
const useDevice = (): DeviceType => {
	const [device, setDevice] = useState<DeviceType>('')

	useEffect(() => {
		const handleDeviceDetection = () => {
			const userAgent = navigator.userAgent.toLowerCase()
			const isMobile = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent)
			const isTablet = /(ipad|tablet|playbook|silk)|(android(?!.*mobile))/g.test(userAgent)

			if (isMobile) {
				setDevice('mobile')
			} else if (isTablet) {
				setDevice('tablet')
			} else {
				setDevice('desktop')
			}
		}

		handleDeviceDetection()
		window.addEventListener('resize', handleDeviceDetection)

		return () => {
			window.removeEventListener('resize', handleDeviceDetection)
		}
	}, [])

	return device
}

export default useDevice
