"use client"

import { NpBackButton } from "@/components/NpBackButton"
import { NpButton } from "@/components/NpButton"
import { NpMain } from "@/components/NpMain"
import { NpSubTitle } from "@/components/NpTitle"
import { NpToast } from "@/components/NpToast"
import { useArchive, useArchiveUser } from "@/models/swrApi"
import { useRouter } from "next/navigation"
import React from "react"

export type ManagingSection = "NONE" | "LOGIN" | "MANAGE"

export default function Home({ params }: { params: { archiveId: string } }) {
	const router = useRouter()

	const { archiveId } = params || {}
	// @ts-ignore
	const { data, isLoading, error } = useArchive(archiveId) || {}
	const [section, setSection] = React.useState<ManagingSection>("NONE")
	const { data: archiveUser } = useArchiveUser(archiveId)
	const [showToast, setShowToast] = React.useState(true)

	const loadFolderStatus = () => {
		console.debug("loadFolderStatus")
	}

	return (
		<NpMain title="Arkisto">
			{isLoading && <div>Ladataan...</div>}
			{error && showToast && <NpToast onClose={() => setShowToast(false)}>{JSON.stringify(error)}</NpToast>}

			{data && (
				<React.Fragment>
					<NpBackButton onClick={() => router.push(`/archive/${archiveId}`)} />

					<div className="flex gap-4 w-full items-start justify-start flex-col">
						<div className="w-full">
							<NpSubTitle>{data.archivename}</NpSubTitle>
							<p>
								Ylläpidä arkiston kappaleita lataamalla ajantasainen tilanne tiedostolista. Lisää kappaleita näkyväksi arkiston listauksessa
								tai jätä piilotetuiksi.
							</p>
						</div>
						<div className="flex gap-4 md:gap-8 w-full">
							{section === "NONE" && <NpButton onClick={loadFolderStatus}>Lue arkiston tilanne</NpButton>}
							{section === "NONE" && (
								<NpButton
									variant="secondary"
									className="w-28"
									onClick={() => router.push(`/archive/${archiveId}/files`)}
								>
									Tiedostot
								</NpButton>
							)}
							{section === "NONE" && archiveUser?.archiveId !== archiveId && (
								<NpButton
									variant="secondary"
									className="w-28"
									onClick={() => setSection("LOGIN")}
								>
									Ylläpito
								</NpButton>
							)}
							{section === "NONE" && archiveUser?.archiveId === archiveId && (
								<NpButton className="" onClick={() => setSection("MANAGE")}>Asetukset</NpButton>
							)}
						</div>
					</div>
				</React.Fragment>
			)}
		</NpMain>
	)
}
