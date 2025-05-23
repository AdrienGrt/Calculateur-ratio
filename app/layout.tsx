

import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: "HorizonContrast | Contrast Checker",
  description: "Vérificateur de contraste pour les couleurs de texte et d'arrière-plan",
  
  keywords: "HorizonContrast, vérificateur de contraste, accessibilité, couleurs, texte, arrière-plan",
  authors: [{ name: "Perspective Horizon" }],
  creator: "Perspective Horizon",
  publisher: "Perspective Horizon",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://horizonkey.perspectivehorizon.fr/",
    title: "HorizonContrast | Contrast Checker",
    description: "Vérificateur de contraste pour les couleurs de texte et d'arrière-plan",
    siteName: "HorizonContrast",
    images: [{
      url: "../public/og-image.png",
      width: 1200,
      height: 630,
      alt: "HorizonKey Preview"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HorizonKey | Password Generator",
    description: "Générateur de mots de passe sécurisés par Perspective Horizon",
    images: ["../public/og-image.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}
      <Analytics/>
      </body>
    </html>
  )
}
