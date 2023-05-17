import { useMoralis } from "react-moralis"

import ElectionSection from "../components/ElectionSection"
import networkMapping from "../constants/networkMapping.json"
import { GET_ALL_ELECTIONS } from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"

export default function Home() {
    const { chainId, isWeb3Enabled, account } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : null
    const dappAddress =
        chainId && networkMapping[chainString] ? networkMapping[chainString].VotingDapp[0] : null

    const { loading, error, data: electionsList } = useQuery(GET_ALL_ELECTIONS)

    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">Recent Elections</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isWeb3Enabled && chainId ? (
                    loading || !electionsList ? (
                        <div>Loading...</div>
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
                                <div>Network error, please switch to a supported network. </div>
                            )
                        })
                    )
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
            </div>
        </div>
    )
}
