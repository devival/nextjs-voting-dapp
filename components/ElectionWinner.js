import { useQuery } from "@apollo/client"
import { useEffect } from "react"
import { GET_ELECTION_VOTES } from "../constants/subgraphQueries"
import ClipboardJS from "clipboard"

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

export default function ElectionWinner({ electionId }) {
    const { loading, error, data } = useQuery(GET_ELECTION_VOTES, {
        variables: { electionId: parseInt(electionId) },
    })

    useEffect(() => {
        new ClipboardJS(".copy-address")
    }, [])

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error</p>

    // Count the votes for each candidate
    const voteCounts = data.voteds.reduce((counts, vote) => {
        counts[vote.candidate] = (counts[vote.candidate] || 0) + 1
        return counts
    }, {})

    // Find the candidate with the most votes
    const winner = Object.keys(voteCounts).reduce(
        (a, b) => (voteCounts[a] > voteCounts[b] ? a : b),
        null
    )

    return winner ? (
        <p>
            Winner:
            <span className="copy-address" data-clipboard-text={winner} title="Click to copy">
                {truncateStr(winner, 15)}
            </span>
        </p>
    ) : (
        <p>No votes recorded</p>
    )
}
