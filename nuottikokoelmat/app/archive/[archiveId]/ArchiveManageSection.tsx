"use client"
import { NpButton } from "@/components/NpButton"
import { NpInput } from "@/components/NpInput"
import { NpSubTitle } from "@/components/NpTitle"
import { ArchiveRole, hasRole } from "@/models/archiveUser"
import { useArchive, useArchiveUser } from "@/models/swrApi"
import { useRouter } from "next/navigation"
import React from "react"
import { ManagingSection } from "./page"

export const ArchiveManageSection = ({ archiveId, setSection }: { archiveId: string; setSection: (section: ManagingSection) => void }) => {
	const { data: archive, mutate: mutateArchive } = useArchive(archiveId)
	const { data: archiveUser } = useArchiveUser(archiveId)
	const router = useRouter()

	const [password, setPassword] = React.useState(archive?.visitorPassword || "")
	const [error, setError] = React.useState("")

	const onUpdatePassword = async () => {
		const response = await fetch(`/api/archive/${archiveId}/manage/visitorPassword`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ visitorPassword: password }),
		})
		if (response.ok && archive) {
			mutateArchive({ ...archive, visitorPassword: password })
		} else {
			setError("Virheellinen salasana")
		}
	}
	const saveDisabled = password === archive?.visitorPassword || password.length < 4

	return (
		<div className="flex flex-col gap-4 w-full pt-12 md:pt-24">
			<NpButton className="w-28 -mt-8 self-end" onClick={() => setSection("NONE")}>Peruuta</NpButton>

			{archive && (
				<div className="flex flex-col gap-4 w-full pt-4 md:pt-14 max-w-sm justify-end self-end">
					<div>Vierailijoiden salasana</div>
					<div className="text-sm">Vanha: {archive.visitorPassword}</div>
					<div className="flex flex-row gap-4 justify-stretch">
						<div>Uusi:</div>
						<NpInput placeholder="Salasana" value={password} onChange={(e) => setPassword(e.target.value)} />
					</div>

					{hasRole(archiveUser, ArchiveRole.MANAGER) && (
						<div className="flex flex-col gap-2">
							<NpSubTitle>Ylläpito</NpSubTitle>
							<div className="flex justify-end">
								<NpButton onClick={() => router.push(`/archive/${archiveId}/manage/songs`)}>Kappaleiden hallinta</NpButton>
							</div>
						</div>
					)}

					{error && <div className="text-red-800">{error}</div>}
					<div className="flex flex-row gap-4 justify-end">
						<NpButton disabled={saveDisabled} onClick={onUpdatePassword}>Tallenna</NpButton>
					</div>
				</div>
			)}
		</div>
	)
}
