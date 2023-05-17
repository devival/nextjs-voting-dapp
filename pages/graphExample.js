import { useQuery, gql } from "@apollo/client"

const GET_ALL_ELECTIONS = gql`
    {
        electionStarts(first: 5) {
            id
            nextElectionId
            initiator
            registrationPeriod
            votingPeriod
            endingTime
        }
    }
`

export default function GraphExample() {
    const { loading, error, data } = useQuery(GET_ALL_ELECTIONS)
    console.log(data)
    return <div>hi</div>
}
