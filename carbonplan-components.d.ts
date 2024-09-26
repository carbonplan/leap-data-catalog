declare module '@carbonplan/components' {
  import { ReactNode } from 'react'

  export interface GuideProps {
    // Add any props that the Guide component accepts
    children?: ReactNode
    // Add other props as needed
  }

  export function Guide(props: GuideProps): JSX.Element

  // Declare other components from @carbonplan/components as needed
  // For example:
  export function Row(props: any): JSX.Element
  export function Column(props: any): JSX.Element
  export function Dimmer(props: any): JSX.Element
  export function Button(props: any): JSX.Element
  export function Link(props: any): JSX.Element
  // Add more component declarations as needed
}
