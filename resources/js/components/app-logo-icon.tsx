import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <span>
            <img src="/logo.png" alt="App Logo" />
        </span>
    );
}
