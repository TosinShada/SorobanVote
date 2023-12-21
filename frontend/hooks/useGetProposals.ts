import { useEffect, useState } from 'react'
import {
  Contract as voteContract,
  networks as voteNetwork,
  Proposal
} from 'votedapp-client'
import freighter from '@stellar/freighter-api'
import { useAccount } from './useAccount'

const defaultState = [] as Proposal[];
export function useGetProposals() {
  const [updatedAt, setUpdatedAt] = useState(Date.now())
  const [proposals, setProposals] = useState<Proposal[]>(defaultState)
  const account = useAccount()

  useEffect(() => {
    const voteClient = new voteContract({
      contractId: voteNetwork.testnet.contractId,
      networkPassphrase: voteNetwork.testnet.networkPassphrase,
      rpcUrl: 'https://soroban-testnet.stellar.org',
      wallet: freighter,
    })

    voteClient.getProposals()
      .then((proposals) => {
        setProposals(proposals.result)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [])

  return {
    proposals,
    updatedAt,
    refresh: () => setUpdatedAt(Date.now()),
  }
}
