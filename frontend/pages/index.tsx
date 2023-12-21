import { Metadata, NextPage } from 'next'

import { useGetProposals } from '@/hooks'
import { Proposal } from 'votedapp-client'
import { ProposalCard } from '@/components/proposal-card'

export const metadata: Metadata = {
  title: 'Tasks',
  description: 'A task and issue tracker build using Tanstack Table.',
}

const Tasks: NextPage = () => {
  const { proposals, updatedAt, refresh } = useGetProposals()

  return (
    <div className="hidden mx-auto max-w-7xl h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Proposals</h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of available proposals.
          </p>
          <div className="hidden items-start justify-center gap-6 rounded-lg py-8 md:grid lg:grid-cols-2 xl:grid-cols-3">
            {proposals.length > 0 &&
              proposals.map((proposal: Proposal, index: number) => (
                <ProposalCard proposal={proposal} key={index} />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tasks
