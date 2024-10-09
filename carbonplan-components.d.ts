declare module '@carbonplan/components' {
  import { ReactNode } from 'react'

  export interface GuideProps {
    // Add any props that the Guide component accepts
    children?: ReactNode
    // Add other props as needed
  }

  export function Guide(props: GuideProps): JSX.Element
  export function Row(props: any): JSX.Element
  export function Column(props: any): JSX.Element
  export function Dimmer(props: any): JSX.Element
  export function Button(props: any): JSX.Element
  export function Link(props: any): JSX.Element
  export function LinkGroup(props: any): JSX.Element
  export function Avatar(props: any): JSX.Element
  export function Expander(props: any): JSX.Element
  export function Badge(props: any): JSX.Element
  export function Tooltip(props: any): JSX.Element
  export function Input(props: any): JSX.Element
  // Add more component declarations as needed
}

declare module '@carbonplan/icons' {
  export function RotatingArrow(props: any): JSX.Element
  export function Arrow(props: any): JSX.Element
  export function Check(props: any): JSX.Element
  export function Down(props: any): JSX.Element
  export function Info(props: any): JSX.Element
  export function Left(props: any): JSX.Element
  // Add more component declarations as needed
}

declare module '@carbonplan/prism' {
  export function Code(props: any): JSX.Element

  // Add more component declarations as needed
}
