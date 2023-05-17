import styles from "../styles/Home.module.css"
import { Form, useNotification } from "web3uikit"
import { useMoralis, useWeb3Contract } from "react-moralis"
// import { ethers } from "ethers"
import votingDappAbi from "../constants/VotingDapp.json"
import ElectionSection from "../components/ElectionSection"
import networkMapping from "../constants/networkMapping.json"
import { GET_MY_ELECTIONS } from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"

export default function Home() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const dappAddress =
        chainId && networkMapping[chainString] ? networkMapping[chainString].VotingDapp[0] : null

    const dispatch = useNotification()

    const { runContractFunction } = useWeb3Contract()
    let nextElectionId

    const {
        loading,
        error,
        data: electionsList,
    } = useQuery(GET_MY_ELECTIONS, {
        variables: {
            initiatorWallet: account,
        },
    })
    async function electionStart(data) {
        console.log("Starting an election...")
        const registrationPeriod = data.data[0].inputResult
        const votingPeriod = data.data[1].inputResult
        const endingTime = data.data[2].inputResult

        const electionStart = {
            abi: votingDappAbi,
            contractAddress: dappAddress,
            functionName: "electionStart",
            params: {
                registrationPeriod_: registrationPeriod, // period in seconds
                votingPeriod_: votingPeriod, // period in seconds
                endingTime_: endingTime, // period in seconds (has to be greater than voting + registration periods)
            },
        }
        await runContractFunction({
            params: electionStart,
            onSuccess: (tx) => handleElectionStartSuccess(tx),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function handleElectionStartSuccess(tx) {
        dispatch({
            type: "info",
            title: "Pending...",
            position: "topR",
        })
        const receipt = await tx.wait()

        const electionStartEvent = receipt.events.find((event) => event.event === "ElectionStart")
        nextElectionId = electionStartEvent.args.nextElectionId
        dispatch({
            type: "success",
            message: `Candidates can now register to your election number: ${nextElectionId}`,
            title: "Election has started.",
            position: "topR",
        })
    }

    return dappAddress ? (
        <div className={styles.container}>
            <Form
                onSubmit={electionStart}
                data={[
                    {
                        name: "Registration period in seconds",
                        type: "number",
                        value: "",
                        key: "registrationPeriod",
                    },
                    {
                        name: "Voting period in seconds",
                        type: "number",
                        value: "",
                        key: "votingPeriod",
                    },
                    {
                        name: "Ending time in seconds",
                        type: "number",
                        value: "",
                        key: "endingTime",
                    },
                ]}
                title="Start an Election"
                id="Main Form"
            />
            <div className="container mx-auto">
                <h1 className="py-4 px-4 font-bold text-2xl">Your Elections</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {isWeb3Enabled && chainId ? (
                        loading ? (
                            <div>Loading...</div>
                        ) : !electionsList || electionsList.electionStarts.length === 0 ? (
                            <div>No elections have been initiated by this account.</div>
                        ) : (
                            electionsList.electionStarts.map((arg) => {
                                const {
                                    nextElectionId,
                                    initiator,
                                    registrationPeriod,
                                    votingPeriod,
                                    endingTime,
                                } = arg
                                return dappAddress ? (
                                    <ElectionSection
                                        dappAddress={dappAddress}
                                        electionId={nextElectionId}
                                        initiator={initiator}
                                        registrationPeriod={registrationPeriod}
                                        votingPeriod={votingPeriod}
                                        endingTime={endingTime}
                                        key={`${dappAddress}${nextElectionId}`}
                                    />
                                ) : (
                                    <div>
                                        Network error, please switch to a supported network.{" "}
                                    </div>
                                )
                            })
                        )
                    ) : (
                        <div>Web3 Currently Not Enabled</div>
                    )}
                </div>
            </div>
        </div>
    ) : (
        <div>Network error, please switch to a supported network. </div>
    )
}
