"use client"

import Image from "next/image"

import f1GPTlogo from "./assets/FIFAWorldCup2026.png"

import { useChat } from "ai/react"

import { Message } from "ai"

import Bubble from "./components/Bubble"
import LoadingBubble from "./components/LoadingBubble"
import PromptSuggestionRow from "./components/PromptSuggestionRow"

const Home = () => {
    const { append, input, isLoading, messages, handleInputChange, handleSubmit } = useChat()

    const noMessages = !messages || messages.length === 0

    const handlePrompt = (promptText) => {
        const msg: Message = {
            id: crypto.randomUUID(),
            content: promptText,
            role: "user"
        }
        append(msg)
    }
    return (
        <main>
            <Image src={f1GPTlogo} width="250" height="250" alt="F1GPT logo"></Image>
            <section className={noMessages ? "" : "populated"}>
                {noMessages ? (
                    <>
                        <p className="starter-text">
                            The Ultimate place for FIFA World Cup 2026 fans <br />
                            Ask FIFA World Cup 2026 Chat GPT anything <br />
                            and it will return with the most update to date answer <br />
                            We hope you enjoy <br />
                        </p>
                        <br />
                        {<PromptSuggestionRow onPromptClick={handlePrompt} />}

                    </>
                ) : (
                    <>
                        {messages.map((message, index) => <Bubble key={`message-${index}`} message={message} />)}
                        {isLoading && <LoadingBubble />}
                    </>
                )}

            </section>

            <form onSubmit={handleSubmit}>
                <input className="question-box" onChange={handleInputChange} value={input} placeholder="Ask me anything" />
                <input type="submit" />

            </form>
        </main>
    )
}

export default Home
