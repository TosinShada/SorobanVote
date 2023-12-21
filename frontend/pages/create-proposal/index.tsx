import { Metadata, NextPage } from 'next'

import { Card } from '@/components/ui/card'
import { CreateProposalForm } from '@/components/create/form'

export const metadata: Metadata = {
  title: 'Create Proposal',
  description: 'Create proposal form.',
}

const CreateProposal: NextPage = () => {

  return (
    <div className="mx-auto max-w-7xl hidden flex-col md:flex">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Proposals</h2>
        </div>

        <div className="grid gap-4">
          <Card className='grid content-center'>
            <CreateProposalForm />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CreateProposal
