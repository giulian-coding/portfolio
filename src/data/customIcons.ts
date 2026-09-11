// Eigene Icons für Marken, die in `simple-icons` fehlen (Microsoft-Marken aus
// Markenrechtsgründen). Zwei Varianten:
//
//  - `path`: einfarbiger 24x24-Pfad, wird wie simple-icons via `fill: currentColor`
//            eingefärbt (grau → Markenfarbe `hex` beim Hover)
//  - `svg`:  komplettes, mehrfarbiges SVG (z.B. offizielle Microsoft-Icons aus den
//            "Azure Architecture Icons"), wird per Grayscale-Filter grau gehalten und
//            beim Hover farbig
//
// Offizielle Microsoft-Icons: https://learn.microsoft.com/en-us/azure/architecture/icons/
// Nutzungsbedingungen liegen dem Paket bei (Microsoft_Terms_of_Use.pdf).

import azureSvg from '../assets/icons/azure.svg?raw';
import powershellSvg from '../assets/icons/powershell.svg?raw';
import intuneSvg from '../assets/icons/intune.svg?raw';
import azureDevopsSvg from '../assets/icons/azure-devops.svg?raw';

export interface Icon {
    title: string;
    hex: string;
    path?: string;
    svg?: string;
}

export const icWindowsServer: Icon = {
    title: 'Windows Server',
    hex: '0078D4',
    // Vier Quadrate (Windows-Logo)
    path: 'M3 3h8.5v8.5H3zM12.5 3H21v8.5h-8.5zM3 12.5h8.5V21H3zM12.5 12.5H21V21h-8.5z',
};

export const icAzure: Icon = {
    title: 'Azure',
    hex: '0078D4',
    svg: azureSvg,
};

export const icAzureDevOps: Icon = {
    title: 'Azure DevOps',
    hex: '0078D4',
    svg: azureDevopsSvg,
};

export const icM365: Icon = {
    title: 'Microsoft 365',
    hex: 'D83B01',
    // Hexagon-Ring
    path: 'M12 2l8.66 5v10L12 22l-8.66-5V7zm0 4.2L6 9.7v4.6l6 3.5 6-3.5V9.7z',
};

export const icIntune: Icon = {
    title: 'Intune',
    hex: '0078D4',
    svg: intuneSvg,
};

export const icPowerShell: Icon = {
    title: 'PowerShell',
    hex: '5391FE',
    svg: powershellSvg,
};

export const icSSL: Icon = {
    title: 'SSL / TLS',
    hex: '16A34A',
    // Vorhängeschloss
    path: 'M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm0 2a3 3 0 0 1 3 3v3H9V7a3 3 0 0 1 3-3zm0 9a1.5 1.5 0 0 1 .75 2.8V18h-1.5v-2.2A1.5 1.5 0 0 1 12 13z',
};

export const icLinkedIn: Icon = {
    title: 'LinkedIn',
    hex: '0A66C2',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
};

export const icMail: Icon = {
    title: 'E-Mail',
    hex: 'FFFFFF',
    // Briefumschlag
    path: 'M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v.6l-10 6.2L2 6.1zM2 8.4l10 6.2 10-6.2v10.1a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5z',
};
