import './globals.css'

export const metadata = {
  title: 'Diajem Global Black News',
  description: 'International news coverage for Africa, Caribbean, Diaspora, Sports, AI & Technology, Finance, Travel, Culture, and Health & Wellbeing',
  keywords: 'Africa news, Caribbean news, Black news, Diaspora, international news',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
