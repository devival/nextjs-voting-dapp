import styles from "../styles/Home.module.css"
import { Form, useNotification } from "web3uikit"
import { useMoralis, useWeb3Contract } from "react-moralis"
// import { ethers } from "ethers"
import votingDappAbi from "../constants/VotingDapp.json"
import networkMapping from "../constants/networkMapping.json"
import { useMemo } from "react"
import { GET_CANDIDATE_ELECTIONS } from "../constants/subgraphQueries"

import { useQuery } from "@apollo/client"

export default function Home() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const dappAddress =
        chainId && networkMapping[chainString] ? networkMapping[chainString].VotingDapp[0] : null

    const { loading, error, data } = useQuery(GET_CANDIDATE_ELECTIONS, {
        variables: {
            candidateWallet: account,
        },
    })
    console.log(data)
    const candidateElections = data?.cadidateRegistereds

    const electionList = useMemo(() => {
        if (!candidateElections || candidateElections.length === 0) {
            return <div>You've never been registered as a candidate in an election</div>
        }
        return candidateElections.map((arg) => {
            const { electionId } = arg
            console.log(electionId)
            return dappAddress ? (
                <div key={electionId}>
                    Election ID: {electionId}
                    <br></br>
                </div>
            ) : (
                <div key={electionId}>Network error, please switch to a supported network. </div>
            )
        })
    }, [candidateElections, dappAddress, chainId])

    const dispatch = useNotification()

    const { runContractFunction } = useWeb3Contract()

    async function candidateReg(data) {
        console.log("Registering...")
        const electionId = data.data[0].inputResult

        const candidateRegOptions = {
            abi: votingDappAbi,
            contractAddress: dappAddress,
            functionName: "candidateReg",
            params: {
                electionId_: electionId,
            },
        }

        await runContractFunction({
            params: candidateRegOptions,
            onSuccess: (tx) => handleCandidateRegSuccess(tx, electionId),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function handleCandidateRegSuccess(tx, electionId) {
        dispatch({
            type: "info",
            title: "Registration Pending...",
            position: "topR",
        })
        await tx.wait()

        dispatch({
            type: "success",
            message: `Election ID: ${electionId}`,
            title: "Registration successful.",
            position: "topR",
        })
        console.log("Registration successful.")
    }

    return (
        <div className={styles.container}>
            <Form
                onSubmit={candidateReg}
                data={[
                    {
                        name: "Election ID",
                        type: "number",
                        value: "",
                        key: "electionId",
                    },
                ]}
                title="Candidate Registration"
                id="Main Form"
            />
            <div className="container mx-auto">
                <h1 className="py-4 px-4 font-bold text-2xl">Elections registered to:</h1>
                {isWeb3Enabled && chainId ? (
                    loading ? (
                        <div>Loading...</div>
                    ) : error ? (
                        <div>Error: {error.message}</div>
                    ) : (
                        electionList
                    )
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
            </div>
        </div>
    )
}
