import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useState } from 'react'
import { useAccount } from '@/hooks'
import {
  Contract as voteContract,
  networks as voteNetwork,
} from 'votedapp-client'
import freighter from '@stellar/freighter-api'
import { Textarea } from '../ui/textarea'

const accountFormSchema = z.object({
  name: z.string({
    required_error: 'Please enter a proposal name.',
  }),
  description: z.string({
    required_error: 'Please enter a proposal description.',
  }),
  goal: z.coerce.number({
    required_error: 'Please enter the required number of voters.',
  }),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

// This can come from your database or API.
const defaultValues: Partial<AccountFormValues> = {
  name: '',
  description: '',
  goal: 0,
}

export function CreateProposalForm() {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  })
  const account = useAccount()
  const { toast } = useToast()

  const voteClient = new voteContract({
    contractId: voteNetwork.testnet.contractId,
    networkPassphrase: voteNetwork.testnet.networkPassphrase,
    rpcUrl: 'https://soroban-testnet.stellar.org',
    wallet: freighter,
  })

  async function onSubmit(data: AccountFormValues) {
    setIsLoading(true)

    if (!account?.address) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Please connect your wallet.',
      })
      return
    }

    const createProposalRequest = {
      sender: account.address,
      name: data.name,
      description: data.description,
      goal: BigInt(data.goal),
    }

    await voteClient
      .createProposal(createProposalRequest)
      .then(simulationResult => {
        console.log('result', simulationResult.result)
        if (simulationResult.result > 0n) {
          // Sign and send the transaction
          simulationResult
            .signAndSend()
            .then(result => {
              console.log('result', result)
              toast({
                variant: 'default',
                title: 'Success!',
                description: 'Proposal created successfully.',
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
        } else {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'An error occured.',
          })
        }
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
        form.reset(defaultValues)
      })
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Create a new Proposal</CardTitle>
        <CardDescription>
          Fill the form below to create a new proposal.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="grid col-span-2 gap-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Name of the proposal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required No of Voters</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposal Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A short description of the proposal"
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              Create Proposal
            </Button>
          </form>
        </Form>
      </CardContent>
    </>
  )
}
