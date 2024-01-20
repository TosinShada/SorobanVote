import { FC, Fragment, ReactElement, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Contract as voteContract,
  networks as voteNetwork,
  Proposal,
} from 'votedapp-client'
import freighter from '@stellar/freighter-api'
import { useAccount } from '@/hooks'
import { useToast } from '@/components/ui/use-toast'
import { Progress } from '@/components/ui/progress'

export interface ProposalCardProps {
  key: number
  proposal: Proposal
}

export function ProposalCard(prop: ProposalCardProps) {
  const { proposal, key } = prop

  const [isLoading, setIsLoading] = useState(false)
  const account = useAccount()
  const { toast } = useToast()

  const voteClient = new voteContract({
    contractId: voteNetwork.testnet.contractId,
    networkPassphrase: voteNetwork.testnet.networkPassphrase,
    rpcUrl: 'https://soroban-testnet.stellar.org',
    wallet: freighter,
  })

  const vote = (e: any) => {
    e.preventDefault()
    setIsLoading(true)

    if (!account?.address) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Please connect your wallet.',
      })

      setIsLoading(false)
      return
    }

    const voteRequest = {
      proposal_id: proposal?.id,
      voter: account?.address,
    }

    voteClient
      .vote(voteRequest)
      .then(simulationResult => {
        simulationResult
          .signAndSend()
          .then(() => {
            toast({
              variant: 'default',
              title: 'Success!',
              description: 'Voted successfully.',
            })
          })
          .catch((error: any) => {
            console.log('error', error)
            toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: `${error?.message ?? 'Unknown error'}`,
            })
          })
          .finally(() => {
            setIsLoading(false)
          })
      })
      .catch((error: any) => {
        console.log('error', error)
        setIsLoading(false)
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: `${error?.message ?? 'Unknown error'}`,
        })
      })
  }

  const voteCount = Number(proposal?.vote_count ?? 0);
  const goal = Number(proposal?.goal ?? 0);

  return (
    <Card key={key}>
      <CardHeader>
        <CardTitle>{proposal?.name}</CardTitle>
        <CardDescription>{proposal?.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground pb-4">
            {voteCount} of {goal} votes
        </p>
        <Progress
          value={(voteCount / goal) * 100}
        />
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={vote} disabled={isLoading}>
          Vote
        </Button>
      </CardFooter>
    </Card>
  )
}
