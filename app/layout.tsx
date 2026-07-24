import "./global.css"

export const metadata = {
    title: "FIFA World Cup 2026 Chat GPT",
    description: "Your AI assistant for everything about the FIFA World Cup 2026",
}

const RootLayout = ({ children }) => {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    )
}

export default RootLayout