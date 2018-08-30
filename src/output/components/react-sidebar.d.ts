declare module 'react-sidebar' {
    interface SidebarProps {
        sidebar: JSX.Element,
        open: boolean,
        onSetOpen: ()=>void,
        styles: {
            sidebar: React.CSSProperties,
        },
        pullRight: boolean,
    }
    export default class Sidebar extends React.Component<SidebarProps, any>{
        constructor(props: SidebarProps)
    }
}