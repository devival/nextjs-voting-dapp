import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { Card, Table, Avatar, Tag, SvgMoreVert, useNotification } from "web3uikit"
import { ethers } from "ethers"
import VoteModal from "./VoteModal"
import { GET_VOTES } from "../constants/subgraphQueries"
import ElectionWinner from "./ElectionWinner"
import { useQuery } from "@apollo/client"

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const seperatorLength = separator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    )
}

export default function ElectionSection({
    dappAddress,
    electionId,
    initiator,
    registrationPeriod,
    votingPeriod,
    endingTime,
}) {
    // formatting timestamps to dates
    const registrationEndDate = new Date(Number(registrationPeriod) * 1000)
    const votingEndDate = new Date(Number(votingPeriod) * 1000)
    const electionEndDate = new Date(Number(endingTime) * 1000)
    const now = new Date()
    // formatting dates to "month/day/year, hour:minute:second"
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }
    const registrationEnd = registrationEndDate.toLocaleString(undefined, options)
    const votingEnd = votingEndDate.toLocaleString(undefined, options)
    const electionEnd = electionEndDate.toLocaleString(undefined, options)

    let electionStatus = "Registering Candidates" // Default status
    if (now > registrationEndDate && now < votingEndDate) {
        electionStatus = "Registration Ended, Voting in Progress"
    } else if (now > votingEndDate && now < electionEndDate) {
        electionStatus = "Voting Ended, Awaiting Results"
    } else if (now > electionEndDate) {
        electionStatus = "Election Ended"
    }

    const { isWeb3Enabled, account } = useMoralis()

    const { loading, error, data } = useQuery(GET_VOTES, {
        variables: {
            voterWallet: account,
            electionId: parseInt(electionId),
        },
    })
    const hasVoted = !loading && !error && data.voteds.length > 0

    const [showModal, setShowModal] = useState(false)
    const hideModal = () => setShowModal(false)
    const dispatch = useNotification()

    const isInitiatedByUser = initiator === account || initiator === undefined
    const formattedInitiatorAddress = isInitiatedByUser ? "you" : truncateStr(initiator || "", 15)
    // const initiatorAddress = isInitiatedByUser ? "you" : initiator
    const handleCardClick = () => {
        if (electionStatus == "Election Ended") {
            dispatch({
                type: "error",
                title: "Election Ended",
                position: "topR",
            })
        } else if (electionStatus == "Voting Ended, Awaiting Results") {
            dispatch({
                type: "error",
                title: "Voting Ended, Awaiting Results",
                position: "topR",
            })
        } else if (electionStatus == "Registration Ended, Voting in Progress") {
            !hasVoted
                ? setShowModal(true) // if haven't voted
                : dispatch({
                      type: "error",
                      title: "Already Voted",
                      position: "topR",
                  })
        } else
            dispatch({
                type: "error",
                title: "Election is not active",
                position: "topR",
            })
    }

    return (
        <div>
            <div>
                {
                    <div>
                        <VoteModal
                            isVisible={showModal}
                            electionId={electionId}
                            dappAddress={dappAddress}
                            onClose={hideModal}
                        />
                        <Card
                            title={<div>Election ID: {electionId}</div>}
                            description={electionStatus}
                            isDisabled={electionStatus == "Election Ended" ? true : false}
                            onClick={handleCardClick}
                        >
                            <div className="solid text-sm">Registration: {registrationEnd}</div>
                            <div className="solid text-sm">Voting: {votingEnd}</div>
                            <div className="solid text-sm">Election: {electionEnd}</div>
                            <div className="solid text-sm">
                                Initiator: {formattedInitiatorAddress}
                            </div>

                            <div className="font-bold">
                                Voted: {loading ? "..." : hasVoted ? "Yes" : "No"}
                            </div>
                            {electionStatus === "Election Ended" && (
                                <ElectionWinner electionId={electionId} />
                            )}
                        </Card>
                    </div>
                }
            </div>
        </div>
    )
}
