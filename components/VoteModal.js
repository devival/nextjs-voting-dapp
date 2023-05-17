import { Modal, Input, useNotification } from "web3uikit"
import { useState } from "react"
import { useWeb3Contract } from "react-moralis"
import votingDappAbi from "../constants/VotingDapp.json"
// import { ethers } from "ethers"

export default function VoteModal({ isVisible, electionId, dappAddress, onClose }) {
    const dispatch = useNotification()

    const [candidate, setCandidate] = useState(0)

    const handleVoteSuccess = (candidate) => {
        dispatch({
            type: "success",
            message: "voted ",
            message: candidate,
            title: "Voted for:",
            position: "topR",
        })
        onClose && onClose()
        setCandidate("0")
    }

    const { runContractFunction: vote } = useWeb3Contract({
        abi: votingDappAbi,
        contractAddress: dappAddress,
        functionName: "vote",
        params: {
            electionId_: electionId,
            candidate_: candidate,
        },
    })

    return (
        <Modal
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={() => {
                vote({
                    onError: (error) => {
                        console.log(error)
                    },
                    onSuccess: () => handleVoteSuccess(candidate),
                })
            }}
            title="Enter the candidate's address"
        >
            <Input
                label="Candidate's address"
                placeholder="0x..."
                onChange={(event) => {
                    setCandidate(event.target.value)
                }}
            />
        </Modal>
    )
}
