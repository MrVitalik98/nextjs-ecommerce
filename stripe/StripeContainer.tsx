import React from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import CardSetupForm from './CardSetupForm'

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY)

const StripeContainer:React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <CardSetupForm />
    </Elements>
  )
}

export default StripeContainer
