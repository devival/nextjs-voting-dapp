import { gql } from "@apollo/client"

const GET_ALL_ELECTIONS = gql`
    {
        electionStarts {
            nextElectionId
            initiator
            registrationPeriod
            votingPeriod
            endingTime
        }
    }
`

const GET_VOTES = gql`
    query GetVotes($voterWallet: String!, $electionId: Int!) {
        voteds(where: { voter: $voterWallet, electionId: $electionId }) {
            voter
            electionId
            candidate
        }
    }
`

const GET_MY_ELECTIONS = gql`
    query GetMyElections($initiatorWallet: String!) {
        electionStarts(where: { initiator: $initiatorWallet }) {
            nextElectionId
            initiator
            registrationPeriod
            votingPeriod
            endingTime
        }
    }
`

const GET_CANDIDATE_ELECTIONS = gql`
    query GetMyElections($candidateWallet: String!) {
        cadidateRegistereds(where: { candidate: $candidateWallet }) {
            electionId
            candidate
        }
    }
`
const GET_ELECTIONS_FROM_ID = gql`
    query GetElections($electionId: String!) {
        electionStarts(where: { nextElectionId: $electionId }) {
            nextElectionId
            initiator
            registrationPeriod
            votingPeriod
            endingTime
        }
    }
`

const GET_ELECTION_VOTES = gql`
    query GetElectionVotes($electionId: Int!) {
        voteds(where: { electionId: $electionId }) {
            candidate
        }
    }
`

export {
    GET_ALL_ELECTIONS,
    GET_VOTES,
    GET_MY_ELECTIONS,
    GET_CANDIDATE_ELECTIONS,
    GET_ELECTIONS_FROM_ID,
    GET_ELECTION_VOTES,
}
